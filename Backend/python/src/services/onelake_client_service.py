import json
import logging
import urllib.parse
from typing import Dict, Any, List, Optional
from uuid import UUID
import requests

from constants.environment_constants import EnvironmentConstants
from models.onelake_folder import GetFoldersResult, OneLakeFolder

class OneLakeClientService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._http_client_service = None
    
    @property
    def http_client_service(self):
        """Lazy load HTTP client service."""
        if self._http_client_service is None:
            from services.http_client import get_http_client_service
            self._http_client_service = get_http_client_service()
        return self._http_client_service
    
    async def dispose_async(self):
        """Cleanup method for service registry."""
        # No cleanup needed as HTTP client is managed by registry
        self.logger.debug("OneLakeClientService disposed")
    
    async def check_if_file_exists(self, token: str, file_path: str) -> bool:
        """
        Checks if a file exists in OneLake storage.
        """
        url = f"{EnvironmentConstants.ONELAKE_DFS_BASE_URL}/{file_path}"
        
        try:
            response = await self.http_client_service.head(url, token)
            
            if response.status_code == 200:
                return True
            elif response.status_code == 404:
                return False
            else:
                self.logger.warning(f"check_if_file_exists received unexpected status code: {response.status_code}")
                return False
        except Exception as ex:
            self.logger.error(f"check_if_file_exists failed for filePath: {file_path}. Error: {str(ex)}")
            return False
    
    async def get_onelake_folder_names(self, token: str, workspace_id: UUID, item_id: UUID) -> Optional[List[str]]:
        """
        Returns the names of the folders under the item's root folder in OneLake, if exists.
        """
        url = f"{EnvironmentConstants.ONELAKE_DFS_BASE_URL}/{workspace_id}"
        append_query = self._build_get_onelake_folders_query_parameters(item_id)
        append_url = f"{url}?{append_query}"
        
        try:
            response = await self.http_client_service.get(append_url, token)
            
            if response.status_code == 200:
                get_folders_result_str = response.text
                get_folders_result_obj = json.loads(get_folders_result_str)
                paths = get_folders_result_obj.get("paths", [])
                return [f["name"] for f in paths if f.get("isDirectory", False)]
            elif response.status_code == 404:
                return None
            else:
                self.logger.warning(f"get_onelake_folder_names received unexpected status code: {response.status_code}")
                return None
        except Exception as ex:
            self.logger.error(f"get_onelake_folder_names failed for workspaceId: {workspace_id}, itemId: {item_id}. Error: {str(ex)}")
            return None
    
    async def write_to_onelake_file(self, token: str, file_path: str, content: str):
        """
        Writes content to a OneLake file, overwriting any existing data.
        """
        url = f"{EnvironmentConstants.ONELAKE_DFS_BASE_URL}/{file_path}?resource=file"
        
        try:
            # Create a new file or overwrite existing
            response = await self.http_client_service.put(url, "", token)
            if response.status_code < 200 or response.status_code > 299:
                self.logger.error(f"write_to_onelake_file Creating a new file failed for filePath: {file_path}. Status: {response.status_code}")
                return
            
            self.logger.info(f"write_to_onelake_file Creating a new file succeeded for filePath: {file_path}")
        except Exception as ex:
            self.logger.error(f"write_to_onelake_file Creating a new file failed for filePath: {file_path}. Error: {str(ex)}")
            return
        
        # Append content to the file
        await self._append_to_onelake_file(token, file_path, content)
    
    async def get_onelake_file(self, token: str, source: str) -> str:
        """
        Retrieves the content of a file from OneLake.
        """
        url = f"{EnvironmentConstants.ONELAKE_DFS_BASE_URL}/{source}"
        
        try:
            response = await self.http_client_service.get(url, token)
            if response.status_code < 200 or response.status_code > 299:
                self.logger.error(f"get_onelake_file failed for source: {source}. Status: {response.status_code}")
                return ""
            
            content = response.text
            self.logger.info(f"get_onelake_file succeeded for source: {source}")
            return content
        except Exception as ex:
            self.logger.error(f"get_onelake_file failed for source: {source}. Error: {str(ex)}")
            return ""
    
    async def delete_onelake_file(self, token: str, file_path: str):
        """
        Deletes a file from OneLake.
        """
        url = f"{EnvironmentConstants.ONELAKE_DFS_BASE_URL}/{file_path}?recursive=true"
        
        try:
            response = await self.http_client_service.delete(url, token)
            if response.status_code < 200 or response.status_code > 299:
                self.logger.error(f"delete_onelake_file failed for filePath: {file_path}. Status: {response.status_code}")
                return
            
            self.logger.info(f"delete_onelake_file succeeded for filePath: {file_path}")
        except Exception as ex:
            self.logger.error(f"delete_onelake_file failed for filePath: {file_path}. Error: {str(ex)}")
    
    def get_onelake_file_path(self, workspace_id: str, item_id: str, filename: str) -> str:
        """
        Returns the path to a file in OneLake storage.
        """
        return f"{workspace_id}/{item_id}/Files/{filename}"
    
    async def _append_to_onelake_file(self, token: str, file_path: str, content: str):
        """
        Appends content to an OneLake file and flushes the changes.
        """
        url = f"{EnvironmentConstants.ONELAKE_DFS_BASE_URL}/{file_path}"
        append_query = self._build_append_query_parameters()
        append_url = f"{url}?{append_query}"
        
        try:
            # Perform the append action
            encoded_content = content.encode('utf-8')
            response = await self.http_client_service.patch(append_url, encoded_content, token)
            if response.status_code < 200 or response.status_code > 299:
                self.logger.error(f"_append_to_onelake_file failed for filePath: {file_path}. Status: {response.status_code}")
                return
            
            # Calculate the length of the content that was appended
            content_length = len(encoded_content)
            
            # Update the flush URL with the correct position
            flush_query = self._build_flush_query_parameters(content_length)
            flush_url = f"{url}?{flush_query}"
            
            # Perform a flush to finalize the changes
            flush_response = await self.http_client_service.patch(flush_url, None, token)
            if flush_response.status_code < 200 or flush_response.status_code > 299:
                self.logger.error(f"_append_to_onelake_file flush failed for filePath: {file_path}. Status: {flush_response.status_code}")
                return
            
            self.logger.info(f"_append_to_onelake_file succeeded for filePath: {file_path}")
        except Exception as ex:
            self.logger.error(f"_append_to_onelake_file failed for filePath: {file_path}. Error: {str(ex)}")
    
    def _build_append_query_parameters(self) -> str:
        """
        Builds query parameters for appending to a file.
        """
        query_parameters = [
            "position=0",
            "action=append"
        ]
        return "&".join(query_parameters)
    
    def _build_flush_query_parameters(self, content_length: int) -> str:
        """
        Builds query parameters for flushing a file.
        """
        query_parameters = [
            f"position={content_length}",
            "action=flush"
        ]
        return "&".join(query_parameters)
    
    def _build_get_onelake_folders_query_parameters(self, item_id: UUID) -> str:
        """
        Builds query parameters for getting OneLake folders.
        """
        query_parameters = [
            f"directory={item_id}",
            "resource=filesystem",
            "recursive=false"
        ]
        return "&".join(query_parameters)

def get_onelake_client_service() -> OneLakeClientService:
    """Get the singleton OneLakeClientService instance."""
    from core.service_registry import get_service_registry
    registry = get_service_registry()
    
    if not registry.has(OneLakeClientService):
        if not hasattr(get_onelake_client_service, "instance"):
            get_onelake_client_service.instance = OneLakeClientService()
        return get_onelake_client_service.instance
    
    return registry.get(OneLakeClientService)