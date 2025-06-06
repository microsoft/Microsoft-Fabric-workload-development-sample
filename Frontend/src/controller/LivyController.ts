/** import { GenericItem } from "src/models/SampleWorkloadModel";
import { EnvironmentConstants, livyScope } from "../constants";
import { callAuthAcquireFrontendAccessToken } from "./SampleWorkloadController";
import { AccessToken, WorkloadClientAPI } from "@ms-fabric/workload-client";



export async function startLiveySession(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string
): Promise<String> {
    const directory = `${lakehouseId}/Files/`;
    const oneLakeContainer = await getPathList(workloadClient, workspaceId, directory, true);
    const files = (oneLakeContainer.paths || []).map(path => {
        const pathName = path.name;
        const parts = pathName.split('/');

        // Path structure: <lakehouseId>/Files/...<Subdirectories>.../<fileName>
        const fileName = parts[parts.length - 1];

        // Remove the prefix (lakehouseId/Files/) from the path
        const relativePath = pathName.length > directory.length ? pathName.substring(directory.length) : "";

        return {
            name: fileName,
            path: relativePath,
            isDirectory: path.isDirectory
        } as FileMetadata;
    });

    return files;
}


/**
 * Retrieves a list of paths available in the selected directory using the provided bearer token.

export async function writetoTable(
    workloadClient: WorkloadClientAPI,
    sessionId: string,
    tableName: string, data: any
): Promise<OneLakePathContainer> {
    const url = `${EnvironmentConstants.LivyApiBaseUrl}/${workspaceId}/?recursive=${recursive}&resource=filesystem&directory=${encodeURIComponent(directory)}&getShortcutMetadata=true`;
    const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);

    try {
      const payload = {
        kind: 'spark',
        code: `
          import org.apache.spark.sql.SparkSession
          val spark = SparkSession.builder().getOrCreate()
          val data = spark.read.json(Seq(${JSON.stringify(data)}).toDS)
          data.write.format("delta").mode("overwrite").saveAsTable("${tableName}")
        `,
      };

      const response = await fetch(url, {
            method: "PUT",
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken.token}` 
            },
            body: JSON.stringify(payload),
        });

      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error submitting job to Livy:', error);
      throw error;
    }
}


  /**
   * Starts a new Livy session.

  export startSession(): Promise<any> {
    try {
      const payload = {
        kind: 'spark',
      };

      const response = await axios.post(`${this.livyEndpoint}/sessions`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await callAuthAcquireFrontendAccessToken(oneLakeScope)}`,
        },
      });

      console.log('Livy session started successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error starting Livy session:', error);
      throw error;
    }
  }

  /**
   * Stops an existing Livy session.
   * @param sessionId - The ID of the session to stop.

  async stopSession(sessionId: string): Promise<void> {
    try {
      const response = await axios.delete(`${this.livyEndpoint}/sessions/${sessionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await callAuthAcquireFrontendAccessToken(oneLakeScope)}`,
        },
      });

      console.log('Livy session stopped successfully:', response.data);
    } catch (error) {
      console.error('Error stopping Livy session:', error);
      throw error;
    }
  }

  /**
   * Submits a Spark job to write data into a lakehouse table.
   * @param tableName - The name of the lakehouse table.
   * @param data - The data to be written into the table.

  export writeToTable(tableName: string, data: any): Promise<void> {	
    try {
      const payload = {
        kind: 'spark',
        code: `
          import org.apache.spark.sql.SparkSession
          val spark = SparkSession.builder().getOrCreate()
          val data = spark.read.json(Seq(${JSON.stringify(data)}).toDS)
          data.write.format("delta").mode("overwrite").saveAsTable("${tableName}")
        `,
      };

      const response = await axios.post(`${this.livyEndpoint}/batches`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await callAuthAcquireFrontendAccessToken(oneLakeScope)}`,
        },
      });

      console.log('Job submitted successfully:', response.data);
    } catch (error) {
      console.error('Error submitting job to Livy:', error);
      throw error;
    }
  }*/

