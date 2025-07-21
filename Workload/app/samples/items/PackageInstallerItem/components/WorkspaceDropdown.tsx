import React, { useState, useEffect } from "react";
import { Dropdown, Option, Spinner, Text } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformAPIClient } from "../../../controller/FabricPlatformAPIClient";
import { Workspace } from "../../../controller/FabricPlatformTypes";

export interface WorkspaceDropdownProps {
    workloadClient: WorkloadClientAPI;
    selectedWorkspaceId: string;
    onWorkspaceSelect: (workspaceId: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function WorkspaceDropdown({ 
    workloadClient, 
    selectedWorkspaceId, 
    onWorkspaceSelect, 
    placeholder,
    disabled = false 
}: WorkspaceDropdownProps) {
    const { t } = useTranslation();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [filterText, setFilterText] = useState<string>("");

    useEffect(() => {
        loadWorkspaces();
    }, []);

    const loadWorkspaces = async () => {
        try {
            setIsLoading(true);
            setError("");
            const fabricAPI = new FabricPlatformAPIClient(workloadClient);
            const workspaceList = await fabricAPI.workspaces.getAllWorkspaces();
            setWorkspaces(workspaceList);
        } catch (err) {
            setError(t('Failed to load workspaces. Please try again.'));
            console.error('Error loading workspaces:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter workspaces based on filter text
    const filteredWorkspaces = workspaces.filter(workspace => {
        if (!filterText) return true;
        const displayText = workspace.displayName || workspace.id || '';
        const description = workspace.description || '';
        return displayText.toLowerCase().includes(filterText.toLowerCase()) ||
               description.toLowerCase().includes(filterText.toLowerCase());
    });

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Spinner size="tiny" />
                <Text>{t('Loading workspaces...')}</Text>
            </div>
        );
    }

    if (error) {
        return <Text style={{ color: 'red' }}>{error}</Text>;
    }

    return (
        <Dropdown
            placeholder={placeholder || t('Select a workspace')}
            value={selectedWorkspaceId}
            selectedOptions={selectedWorkspaceId ? [selectedWorkspaceId] : []}
            onOptionSelect={(_, data) => onWorkspaceSelect(data.optionValue || "")}
            disabled={disabled}
            style={{ width: '100%' }}
            listbox={{ 
                style: { 
                    maxHeight: '200px', 
                    overflowY: 'auto' 
                } 
            }}
            onInput={(ev) => setFilterText((ev.target as HTMLInputElement).value)}
            clearable
        >
            {filteredWorkspaces.map((workspace) => {
                const displayText = workspace.displayName || workspace.id || 'Unknown Workspace';
                const fullText = workspace.description ? `${displayText} - ${workspace.description}` : displayText;
                
                return (
                    <Option 
                        key={workspace.id} 
                        value={workspace.id}
                        text={fullText}
                    >
                        {fullText}
                    </Option>
                );
            })}
        </Dropdown>
    );
}
