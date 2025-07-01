#!/usr/bin/env python
# CognitiveSample-Analysis.py - Sentiment Analysis Script
# This script performs sentiment analysis on text data in a Lakehouse table
# and writes the results back to the same table with all original columns preserved.
import json
import sys
from datetime import datetime

import sempy.fabric as fabric
#import synapse.ml.services
#from synapse.ml.services.language import AnalyzeText
#from pyspark.sql.functions import col
#from pyspark.sql import SparkSession
#from pyspark.conf import SparkConf

from azure.identity import DefaultAzureCredential
from azure.storage.filedatalake import DataLakeServiceClient
import base64
import requests


#######################################################
# Setup
#######################################################


# Spark session builder
spark_session = (SparkSession
    .builder
    .appName("Spark Cognitive Sample Analysis")
    .getOrCreate())
#Instantiate the client
fabricClient = fabric.FabricRestClient()

spark_context = spark_session.sparkContext
spark_context.setLogLevel("DEBUG")  

item_id = spark_context.getConf().get("spark.deploymentConfig")
item_workspace_id = spark_context.getConf().get("spark.workspaceId")
soltuion_type = spark_context.getConf().get("spark.soltuionType")
soltuion_deployment_Configuration = spark_context.getConf().get("spark.deploymentConfiguration")

#######################################################
# Configuration
#######################################################
print(f"Configuration:")
print(f"  - Item id: {item_id}")
print(f"  - Workspace id: {item_workspace_id}")
print(f"  - Solution type: {soltuion_type}")

print(f"Solution deployment started:")

deployment_config = json.loads(soltuion_deployment_Configuration)
print(f"Deployment config: {deployment_config}")

soltuion_id = deployment_config['soltuionId']
print(f"Soltuion Id: {soltuion_id}")

tartetWorkspaceId = deployment_config['targetWorkspaceId']
print(f"Target workspace Id: {tartetWorkspaceId}")

targetSubfolderId = deployment_config.get('targetSubfolderId', "")  
print(f"Target subfolder Id: {targetSubfolderId}")

#######################################################
# Creating the items
#######################################################

createdItems = []
print(f"Starting to create items:")
for item in deployment_config["items"]:
    item_name = item["name"]
    item_description = item["description"]
    item_type = item["itemType"]

    print(f"  Item name: {item_name}")
    print(f"  Item Description: {item_description}")
    print(f"  Item Type: {item_type}")

    itemParts = []
    # getting all defintionParts that are needed for the creation
    for definitionPart in item["defintionParts"]:
        path = definitionPart["path"]
        payload = definitionPart["payload"]
        payloadType = definitionPart["payloadType"]
        print(f"    DefinitionPart")
        print(f"       Path: {path}")
        print(f"       Payload: {payload}")
        print(f"       PayLoadType: {payloadType}")

        newPayload = ""
        match payloadType:
            case "OneLake":
                account_url = "https://onelake.dfs.fabric.microsoft.com"
                file_system_name = "d93a1ddb-3f94-4a2f-9b43-0afe4cdb9f17"
                file_path = "89e7075b-599f-47f2-951b-b8de03fe2e88/Files/Solutions/HelloWorld/definitions/HelloWorldItem.json"
 
                credential = DefaultAzureCredential()
                service_client = DataLakeServiceClient(account_url=account_url,credential=credential)

                file_system_client = service_client.get_file_system_client(file_system_name)
                file_client = file_system_client.get_file_client(file_path)
                download = file_client.download_file()
                newPayload = base64.b64encode(file_content).decode('utf-8')
            case "Link":
                response = requests.get(payload)
                if response.status_code == 200:
                    # Step 2: Encode the file content in Base64
                    file_content = response.content
                    newPayload = base64.b64encode(file_content).decode('utf-8')
                else:
                    raise ValueError('Couldn not get {payload}!')
            case "InlineBase64":
                newPayload = payload
            case _:
                raise ValueError('Payload Type {payloadType} is not supported')

        itemParts.append(
            {
                "path": path, 
                "payload": newPayload,
                "payloadType": "InlineBase64"
            })

    itemDefintion = {

        "parts": itemParts
    }

    itemCreateRequest = {   
        "displayName": item_name, 
        "description": item_description, 
        "type": item_type, 
        "folderId": targetSubfolderId,
        "definition": itemDefintion
    }

    print("Items created request:")
    print(itemCreateRequest)

    response = fabricClient.post(f"v1/workspaces/{tartetWorkspaceId}/items", json= itemCreateRequest)
    createdItems.append(response.json())


print("Items created successfully")
print(createdItems)

print(f"Solution deployment finished:")


