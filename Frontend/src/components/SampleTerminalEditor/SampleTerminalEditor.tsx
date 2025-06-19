import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Stack } from "@fluentui/react";
import {
  makeStyles,
  tokens,
  shorthands,
  TabValue,
} from "@fluentui/react-components";
import { ContextProps, PageProps } from "src/App";
import { SampleSparkTerminal } from "../SampleSparkTerminal/SampleSparkTerminal";
import { Ribbon } from "../SampleWorkloadRibbon/SampleWorkloadRibbon";

import "./../../styles.scss";

// Create styles for the component layout
const useStyles = makeStyles({
  terminalContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: 'calc(100vh - 120px)',
  },
  terminalPanel: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('10px'),
  },
  terminalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.margin('0', '0', '10px', '0'),
  },
  terminalTitle: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: 0,
  },
  infoText: {
    color: tokens.colorNeutralForeground2,
    fontSize: '14px',
    ...shorthands.margin('10px', '0'),
  },
  noLakehouseMessage: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '4px',
    color: tokens.colorNeutralForeground2,
    textAlign: 'center',
  }
});

export function SampleTerminalEditor(props: PageProps) {
  const { workloadClient } = props;
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const styles = useStyles();

  // React state
  const [selectedTab, setSelectedTab] = useState<TabValue>("home");
  const [isDirty, setDirty] = useState<boolean>(false);

  
  useEffect(() => {
    // Register for navigation events
    const registerNavigationCallbacks = async () => {
      try {
        // Handle navigation events (if needed)
      } catch (error) {
        console.error("Error registering navigation callbacks:", error);
      }
    };

    registerNavigationCallbacks();
  }, []);

  useEffect(() => {
    // If there's a lakehouse ID in the context, we could load it here
    if (pageContext.itemObjectId) {
      // This would be where you'd load the lakehouse from the item if needed
    }
  }, [pageContext, pathname]);


  // Mock functions required by the Ribbon component
  async function saveItem() {
    // This would save the lakehouse selection or other state if needed
    setDirty(false);
    return Promise.resolve();
  }

  async function openSettings() {
    // Handle settings if needed
    return Promise.resolve();
  }

  return (
    <Stack className="editor" data-testid="sample-terminal-editor">
      <Ribbon
        {...props}
        isSaveButtonEnabled={isDirty}
        saveItemCallback={saveItem}
        openSettingsCallback={openSettings}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      <Stack className="main">
        {["home"].includes(selectedTab as string) && (
          <div className={styles.terminalContainer}>
            <div className={styles.terminalPanel}>
              <SampleSparkTerminal workloadClient={workloadClient} />
            </div>
          </div>
        )}
      </Stack>
    </Stack>
  );
}