import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Input,
  Text,
  Divider,
  makeStyles,
  tokens,
  shorthands,
  Tooltip,
} from '@fluentui/react-components';
import { Send24Regular } from '@fluentui/react-icons';
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import {
  SessionState,
  SessionRequest,
  SessionResponse,
  StatementRequest,
  StatementResponse
} from '../../../implementation/clients/FabricPlatformTypes';
import {
  createSession,
  submitStatement,
  getSession,
  getStatement,
  cancelSession
} from '../../../implementation/clients/SparkLivyClient';
import { callDatahubOpen } from '../../../implementation/controller/DataHubController';
import { Item } from '../../../implementation/clients/FabricPlatformTypes';

// Define interface for component props
export interface SampleSparkTerminalProps {
  workloadClient: WorkloadClientAPI;
  workspaceId?: string;
  lakehouseId?: string;
}

// Define interface for a terminal entry (command or response)
interface TerminalEntry {
  type: 'command' | 'response' | 'error' | 'system';
  content: string | React.ReactNode;
  timestamp: Date;
}

// Create styles for the component
const useStyles = makeStyles({
  terminalContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '500px',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius('4px'),
    ...shorthands.overflow('hidden')
  },
  terminalHeader: {
    backgroundColor: tokens.colorNeutralBackground3,
    padding: '8px 12px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  terminalBody: {
    flexGrow: 1,
    ...shorthands.padding('12px'),
    ...shorthands.overflow('auto'),
    fontFamily: 'Consolas, monospace',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    lineHeight: '20px'
  },
  terminalInput: {
    display: 'flex',
    ...shorthands.padding('8px', '12px'),
    backgroundColor: tokens.colorNeutralBackground2,
    alignItems: 'center'
  },
  commandInput: {
    flexGrow: 1,
    marginRight: '8px',
    fontFamily: 'Consolas, monospace'
  },
  promptSymbol: {
    color: tokens.colorPaletteLightGreenForeground1,
    marginRight: '8px',
    fontWeight: 'bold',
    fontFamily: 'Consolas, monospace'
  },
  command: {
    color: tokens.colorNeutralForeground1,
    fontWeight: 'bold'
  },
  response: {
    color: tokens.colorNeutralForeground2
  },
  error: {
    color: tokens.colorPaletteRedForeground1
  },
  system: {
    color: tokens.colorPaletteYellowForeground1,
    fontStyle: 'italic'
  },
  timestamp: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
    marginRight: '8px'
  },
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px'
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    ...shorthands.borderRadius('50%'),
    marginRight: '6px'
  },
  statusConnected: {
    backgroundColor: tokens.colorPaletteGreenForeground1
  },
  statusDisconnected: {
    backgroundColor: tokens.colorPaletteRedForeground1
  },
  statusConnecting: {
    backgroundColor: tokens.colorPaletteYellowForeground1
  }
});

export const SampleSparkTerminal: React.FC<SampleSparkTerminalProps> = ({
  workloadClient,
  workspaceId: initialWorkspaceId,
  lakehouseId: initialLakehouseId
}) => {
  const styles = useStyles();
  const [command, setCommand] = useState<string>('');
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  
  // State for selected lakehouse
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | undefined>(initialWorkspaceId);
  const [currentLakehouseId, setCurrentLakehouseId] = useState<string | undefined>(initialLakehouseId);

  // Auto-scroll to the bottom when new entries are added
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [entries]);

  // Check session status every 5 seconds if we have an active session
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (sessionId) {
      intervalId = setInterval(() => {
        checkSessionStatus();
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [sessionId]);

  // Handle datahub selection
  async function onDatahubClicked() {
    const result = await callDatahubOpen(
      workloadClient,
      ["Lakehouse"],
      "Select a lakehouse to use for Spark Livy Terminal",
      false
    );

    if (!result) {
      return;
    }
    
    setSelectedItem(result);
    setCurrentWorkspaceId(result.workspaceId);
    setCurrentLakehouseId(result.id);
    
    // If there's an active session, we should close it and inform the user
    if (sessionId) {
      addSystemMessage("Lakehouse changed. You'll need to start a new session with the selected lakehouse.");
      setSessionId(null);
      setSessionState(null);
    }
  }

  // Add a system message
  const addSystemMessage = (message: string) => {
    setEntries(prev => [
      ...prev, 
      { 
        type: 'system', 
        content: message, 
        timestamp: new Date() 
      }
    ]);
  };

  // Format a timestamp for display
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  // Initialize a new session
  const initializeSession = async () => {
    setIsConnecting(true);
    addSystemMessage('Initializing Spark session...');

    try {
      // Check if we have a selected lakehouse
      if (!currentWorkspaceId || !currentLakehouseId) {
        addSystemMessage("Please select a lakehouse first.");
        setIsConnecting(false);
        return;
      }

      // Create a session request
      const sessionRequest: SessionRequest = {
        name: `Terminal Session ${new Date().toISOString()}`,
        kind: 'python',
        conf: {
          "spark.submit.deployMode": "cluster"
          //"spark.fabric.environmentDetails" : "{\"id\" : \""EnvironmentID""}"}
        }
      };

      // Create the session
      const response: SessionResponse = await createSession(
        workloadClient,
        currentWorkspaceId,
        currentLakehouseId,
        sessionRequest
      );

      setSessionId(response.id);
      setSessionState(response.state as SessionState);
      
      addSystemMessage(`Session created with ID: ${response.id}`);
      addSystemMessage('Session is initializing. Please wait...');
      
      // Start checking the status until the session is ready
      await waitForSessionReady(response.id);

    } catch (error: any) {
      console.error('Error initializing session:', error);
      addSystemMessage(`Failed to initialize session: ${error.message}`);
      setEntries(prev => [
        ...prev, 
        { 
          type: 'error', 
          content: `Error: ${error.message}`, 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setIsConnecting(false);
    }
  };

  // Wait for a session to be ready
  const waitForSessionReady = async (sid: string) => {
    let attempts = 0;
    const maxAttempts = 300;  // Maximum number of attempts (30 * 2 seconds = 60 seconds timeout)
    
    while (attempts < maxAttempts) {
      try {
        if (!currentWorkspaceId || !currentLakehouseId) {
          addSystemMessage("Lakehouse selection changed. Please start a new session.");
          return false;
        }
        
        const sessionInfo = await getSession(workloadClient, currentWorkspaceId, currentLakehouseId, sid);
        setSessionState(sessionInfo.state as SessionState);
        
        if (sessionInfo.state === SessionState.IDLE) {
          addSystemMessage('Session is ready! You can now execute Spark code.');
          return true;
        } else if (
          sessionInfo.state === SessionState.ERROR || 
          sessionInfo.state === SessionState.DEAD || 
          sessionInfo.state === SessionState.KILLED
        ) {
          addSystemMessage(`Session failed to initialize with state: ${sessionInfo.state}`);
          return false;
        }
        
        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error: any) {
        console.error('Error checking session status:', error);
        addSystemMessage(`Failed to check session status: ${error.message}`);
        return false;
      }
    }
    
    addSystemMessage('Session initialization timed out. Please try again.');
    return false;
  };

  // Cancel the current session
  const cancelCurrentSession = async () => {
    if (!sessionId || !currentWorkspaceId || !currentLakehouseId) return;
    
    try {
      setIsCancelling(true);
      addSystemMessage(`Cancelling session ${sessionId}...`);
      
      const response = await cancelSession(
        workloadClient,
        currentWorkspaceId,
        currentLakehouseId,
        sessionId
      );
      console.log('Session cancelled:', response);
      addSystemMessage(`Session ${sessionId} cancelled successfully.`);
      setSessionId(null);
      setSessionState(null);
    } catch (error: any) {
      console.error('Error cancelling session:', error);
      addSystemMessage(`Failed to cancel session: ${error.message}`);
      setEntries(prev => [
        ...prev,
        {
          type: 'error',
          content: `Error: ${error.message}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsCancelling(false);
    }
  };

  // Check the status of the current session
  const checkSessionStatus = async () => {
    if (!sessionId || !currentWorkspaceId || !currentLakehouseId) return;
    
    try {
      const sessionInfo = await getSession(workloadClient, currentWorkspaceId, currentLakehouseId, sessionId);
      setSessionState(sessionInfo.state as SessionState);
    } catch (error: any) {
      console.error('Error checking session status:', error);
      // Don't show error messages for routine checks
    }
  };

  // Execute a command in the session
  const executeCommand = async () => {
    if (!command.trim()) return;
    
    // Add the command to the entries
    setEntries(prev => [
      ...prev, 
      { 
        type: 'command', 
        content: command, 
        timestamp: new Date() 
      }
    ]);

    // Clear the input field
    setCommand('');

    // Handle special commands
    if (command.toLowerCase() === 'clear') {
      setEntries([]);
      return;
    }

    // Check if we have an active session, if not create one
    if (!sessionId) {
      addSystemMessage('No active session. Initializing a new session...');
      await initializeSession();
      
      // If we still don't have a session, return
      if (!sessionId) {
        addSystemMessage('Failed to create a session. Cannot execute command.');
        return;
      }
    }

    // Execute the command
    try {
      const statementRequest: StatementRequest = {
        code: command,
        kind: 'python',
      };

      // Submit the statement
      const response = await submitStatement(
        workloadClient,
        currentWorkspaceId,
        currentLakehouseId,
        sessionId,
        statementRequest
      );

      // Check for the statement status until it completes
      await waitForStatementResult(response);
      

    } catch (error: any) {
      console.error('Error executing command:', error);
      setEntries(prev => [
        ...prev, 
        { 
          type: 'error', 
          content: `Error: ${error.message}`, 
          timestamp: new Date() 
        }
      ]);
    }
  };

  // Wait for a statement result
  const waitForStatementResult = async (statement: StatementResponse) => {
    let statementId = statement.id;
    let attempts = 0;
    const maxAttempts = 60;  // Maximum number of attempts (60 * 1 second = 60 seconds timeout)
    
    // Poll until the statement completes
    while (attempts < maxAttempts) {
      try {
        const statementInfo = await checkStatementStatus(statementId);
        
        if (statementInfo.state === 'available') {
          // Format and display the result
          let output = '';
          
          if (statementInfo.output && statementInfo.output.data) {
            // Handle different output formats
            if (statementInfo.output.data['text/plain']) {
              output = statementInfo.output.data['text/plain'];
            } else if (statementInfo.output.data['application/json']) {
              output = JSON.stringify(statementInfo.output.data['application/json'], null, 2);
            } else {
              output = JSON.stringify(statementInfo.output.data, null, 2);
            }
          }
          
          setEntries(prev => [
            ...prev, 
            { 
              type: 'response', 
              content: output || 'Command executed successfully with no output', 
              timestamp: new Date() 
            }
          ]);
          
          return;
        } else if (statementInfo.state === 'error') {
          let errorMessage = 'Statement execution failed';
          
          if (statementInfo.output && statementInfo.output.data && statementInfo.output.data['text/plain']) {
            errorMessage = statementInfo.output.data['text/plain'];
          }
          
          setEntries(prev => [
            ...prev, 
            { 
              type: 'error', 
              content: errorMessage, 
              timestamp: new Date() 
            }
          ]);
          
          return;
        }
        
        // Wait a second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      } catch (error: any) {
        console.error('Error checking statement status:', error);
        setEntries(prev => [
          ...prev, 
          { 
            type: 'error', 
            content: `Error checking statement status: ${error.message}`, 
            timestamp: new Date() 
          }
        ]);
        return;
      }
    }
    
    setEntries(prev => [
      ...prev, 
      { 
        type: 'error', 
        content: 'Statement execution timed out', 
        timestamp: new Date() 
      }
    ]);
  };

  // Check the status of a statement
  const checkStatementStatus = async (statementId: number): Promise<StatementResponse> => {
    // This would be implemented with getStatement
    try {
      return await getStatement(workloadClient, currentWorkspaceId, currentLakehouseId, sessionId, statementId.toString());
    } catch (error) {
      console.error('Error checking statement status:', error);
      throw error;
    }
  };

  // Handle submit on pressing Enter
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      executeCommand();
    }
  };

  // Determine the connection status color
  const getConnectionStatusClass = () => {
    if (!sessionId) {
      return styles.statusDisconnected;
    }
    if (isConnecting || sessionState === SessionState.STARTING) {
      return styles.statusConnecting;
    }
    if (isCancelling) {
      return styles.statusConnecting;
    }
    if (sessionState === SessionState.IDLE || sessionState === SessionState.RUNNING) {
      return styles.statusConnected;
    }
    return styles.statusDisconnected;
  };

  // Determine the connection status text
  const getConnectionStatusText = () => {
    if (!sessionId) {
      return 'Not Connected';
    }
    if (isConnecting) {
      return 'Connecting...';
    }
    if (isCancelling) {
      return 'Cancelling...';
    }
    if (sessionState) {
      return `Session ${sessionId} (${sessionState})`;
    }
    return 'Unknown Status';
  };

  return (
    <div className={styles.terminalContainer}>
      <div className={styles.terminalHeader}>
        <Text weight="semibold">Spark Terminal</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            {selectedItem ? (
              <Text size={200}>Lakehouse: {selectedItem.displayName}</Text>
            ) : (
              <Text size={200} italic>No lakehouse selected</Text>
            )}
          </div>
          <Tooltip content={"Select a Lakehouse"} relationship="label">
            <Button
              size="small"
              onClick={onDatahubClicked}
              appearance="subtle"
            >
              {selectedItem ? "Change Lakehouse" : "Select Lakehouse"}
            </Button>
          </Tooltip>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className={styles.connectionStatus}>
              <div className={`${styles.statusIndicator} ${getConnectionStatusClass()}`} />
              <Text>{getConnectionStatusText()}</Text>
            </div>
            {sessionId && !isCancelling && (
              <Tooltip content="Cancel Session" relationship="label">
                <Button
                  size="small"
                  appearance="subtle"
                  onClick={cancelCurrentSession}
                  disabled={isCancelling || isConnecting}
                >
                  Cancel Session
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.terminalBody} ref={terminalBodyRef}>
        {entries.length === 0 ? (
          <div className={styles.system}>
            Welcome to Spark Terminal. Type commands to interact with Spark.
            <br />
            Type 'clear' to clear the terminal.
            {!selectedItem && (
              <React.Fragment>
                <br /><br />
                Please select a lakehouse using the button at the top.
              </React.Fragment>
            )}
            {selectedItem && !sessionId && (
              <React.Fragment>
                <br /><br />
                Type any Spark/SQL command to automatically start a session.
              </React.Fragment>
            )}
          </div>
        ) : (
          entries.map((entry, index) => (
            <div key={index}>
              <span className={styles.timestamp}>[{formatTimestamp(entry.timestamp)}]</span>
              {entry.type === 'command' ? (
                <React.Fragment>
                  <span className={styles.promptSymbol}>{'>'}</span>
                  <span className={styles.command}>{entry.content}</span>
                </React.Fragment>
              ) : (
                <span className={styles[entry.type]}>{entry.content}</span>
              )}
            </div>
          ))
        )}
      </div>
      
      <Divider />
      
      <div className={styles.terminalInput}>
        <span className={styles.promptSymbol}>{'>'}</span>
        <Input
          className={styles.commandInput}
          value={command}
          onChange={(e, data) => setCommand(data.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter Spark/SQL command..."
        />
        <Button
          icon={<Send24Regular />}
          onClick={executeCommand}
          disabled={isConnecting || isCancelling}
        />
      </div>
    </div>
  );
};

export default SampleSparkTerminal;