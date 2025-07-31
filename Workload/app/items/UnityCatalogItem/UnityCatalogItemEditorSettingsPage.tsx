import React from 'react';
import { PageProps } from '../../App';


export interface UnityCatalogItemEditorSettingsPageProps extends PageProps {

}

export function UnityCatalogItemEditorSettingsPage(props: UnityCatalogItemEditorSettingsPageProps) {
    return (
      <div>
        This is a custom item settings page for the Unity Catalog Item Editor.
        <br />
        You can use this page to provide additional settings or configurations for the item editor.       
      </div>
    );
  }


// Wrapper component to handle URL parameters for UnityCatalogItemEditorSettingsPage
export function UnityCatalogItemEditorSettingsPageWrapper({ workloadClient }: PageProps) {

    const props: UnityCatalogItemEditorSettingsPageProps = {
        workloadClient,
    };

    return <UnityCatalogItemEditorSettingsPage {...props} />;
}

export default UnityCatalogItemEditorSettingsPage;