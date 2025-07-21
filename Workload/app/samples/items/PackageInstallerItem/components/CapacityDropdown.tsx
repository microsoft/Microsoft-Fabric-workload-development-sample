import React, { useState, useEffect } from "react";
import { Dropdown, Option, Spinner, Text } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformAPIClient } from "../../../controller/FabricPlatformAPIClient";
import { Capacity } from "../../../controller/FabricPlatformTypes";

export interface CapacityDropdownProps {
    workloadClient: WorkloadClientAPI;
    selectedCapacityId: string;
    onCapacitySelect: (capacityId: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function CapacityDropdown({ 
    workloadClient, 
    selectedCapacityId, 
    onCapacitySelect, 
    placeholder,
    disabled = false 
}: CapacityDropdownProps) {
    const { t } = useTranslation();
    const [capacities, setCapacities] = useState<Capacity[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [filterText, setFilterText] = useState<string>("");

    useEffect(() => {
        loadCapacities();
    }, []);

    const loadCapacities = async () => {
        try {
            setIsLoading(true);
            setError("");
            const fabricAPI = new FabricPlatformAPIClient(workloadClient);
            const capacityList = await fabricAPI.capacities.getAllCapacities();
            setCapacities(capacityList);
        } catch (err) {
            setError(t('Failed to load capacities. Please try again.'));
            console.error('Error loading capacities:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter capacities based on filter text
    const filteredCapacities = capacities.filter(capacity => {
        if (!filterText) return true;
        const displayText = capacity.displayName || capacity.id || '';
        const sku = capacity.sku || '';
        return displayText.toLowerCase().includes(filterText.toLowerCase()) ||
               sku.toLowerCase().includes(filterText.toLowerCase());
    });

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Spinner size="tiny" />
                <Text>{t('Loading capacities...')}</Text>
            </div>
        );
    }

    if (error) {
        return <Text style={{ color: 'red' }}>{error}</Text>;
    }

    return (
        <Dropdown
            placeholder={placeholder || t('Select a capacity')}
            value={selectedCapacityId}
            selectedOptions={selectedCapacityId ? [selectedCapacityId] : []}
            onOptionSelect={(_, data) => onCapacitySelect(data.optionValue || "")}
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
            {filteredCapacities.map((capacity) => {
                const displayText = capacity.displayName || capacity.id;
                const fullText = capacity.sku ? `${displayText} (${capacity.sku})` : displayText;
                
                return (
                    <Option 
                        key={capacity.id} 
                        value={capacity.id}
                        text={fullText}
                    >
                        {fullText}
                    </Option>
                );
            })}
        </Dropdown>
    );
}
