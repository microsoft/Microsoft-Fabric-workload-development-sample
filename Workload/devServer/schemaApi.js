

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const manifestDirectory = path.resolve(__dirname, "../../build/Manifest/temp/items");

const router = express.Router();

// Helper function to read WORKLOAD_NAME from .env.dev file
async function getWorkloadNameFromEnv() {
    const envFile = path.resolve(__dirname, '../.env.dev');
    
    try {
        const content = await fs.readFile(envFile, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
            const match = line.match(/^WORKLOAD_NAME=(.+)$/);
            if (match) {
                const workloadName = match[1].trim();
                console.log(`[Schema Server] Found WORKLOAD_NAME in .env.dev: ${workloadName}`);
                return workloadName;
            }
        }
    } catch (error) {
        console.warn(`[Schema Server] Could not read .env.dev file: ${error.message}`);
    }
    
    // Fallback to default if not found
    const defaultName = 'Org.MyWorkloadSample';
    console.log(`[Schema Server] Using fallback WORKLOAD_NAME: ${defaultName}`);
    return defaultName;
}

router.options('/schemas/*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

router.get('/schemas/*', async (req, res) => {
    try {
        // Extract the path after /schemas/
        const schemaPath = req.params[0];
        console.log(`[Schema Server] Received request for schema path: ${schemaPath}`);
        
        if (!schemaPath) {
            console.error(`[Schema Server] Error: Schema path is required`);
            return res.status(400).json({ error: 'Schema path is required' });
        }

        // Parse the schema path: {WORKLOAD_NAME}.{ItemName}/definition/1.0.0/schema.json
        const pathParts = schemaPath.split('/');
        console.log(`[Schema Server] Path parts: ${JSON.stringify(pathParts)}`);
        
        if (pathParts.length < 4) {
            console.error(`[Schema Server] Error: Invalid schema path format. Got ${pathParts.length} parts, expected at least 4`);
            return res.status(400).json({ error: 'Invalid schema path format. Expected: {WORKLOAD_NAME}.{ItemName}/definition/1.0.0/schema.json' });
        }

        // Extract workload name and item name from the first part
        const workloadItemPart = pathParts[0]; // e.g., "Org.MyWorkload.HelloWorld"
        console.log(`[Schema Server] Parsing workload.item part: ${workloadItemPart}`);
        
        const workloadItemMatch = workloadItemPart.match(/^(.+)\.([^.]+)$/);
        
        if (!workloadItemMatch) {
            console.error(`[Schema Server] Error: Invalid workload.item format in path: ${workloadItemPart}`);
            return res.status(400).json({ error: 'Invalid workload.item format in path' });
        }

        const workloadName = workloadItemMatch[1]; // e.g., "Org.MyWorkload"
        const itemName = workloadItemMatch[2]; // e.g., "HelloWorld"
        console.log(`[Schema Server] Extracted - Workload: ${workloadName}, Item: ${itemName}`);

        // Read workload name from environment or config to validate
        const expectedWorkloadName = process.env.WORKLOAD_NAME || await getWorkloadNameFromEnv();
        console.log(`[Schema Server] Validating workload name - Expected: ${expectedWorkloadName}, Received: ${workloadName}`);
        
        if (workloadName !== expectedWorkloadName) {
            console.error(`[Schema Server] Error: Workload name mismatch - Expected: ${expectedWorkloadName}, Got: ${workloadName}`);
            return res.status(403).json({ 
                error: `Invalid workload name. Expected: ${expectedWorkloadName}, Got: ${workloadName}` 
            });
        }

        // Construct the local file path based on the remaining path
        // Remove only the workload name from the first part, keep the item name
        const itemNamePart = workloadItemMatch[2]; // e.g., "HelloWorld"
        const remainingPath = pathParts.slice(1).join('/'); // e.g., "definition/1.0.0/schema.json"
        const relativePath = path.join(itemNamePart, remainingPath); // e.g., "HelloWorld/definition/1.0.0/schema.json"
        const localFilePath = path.join(manifestDirectory, relativePath);
        const filePath = path.resolve(localFilePath);
        console.log(`[Schema Server] Resolved file path: ${filePath}`);
        
        // Security check: ensure the file is within the manifest directory
        const resolvedManifestDirectory = path.resolve(manifestDirectory);
        
        if (!filePath.startsWith(resolvedManifestDirectory)) {
            console.error(`[Schema Server] Security error: Path outside manifest directory - File: ${filePath}, Manifest: ${resolvedManifestDirectory}`);
            return res.status(403).json({ error: 'Access denied: Path outside manifest directory' });
        }

        // Check if file exists and read it
        console.log(`[Schema Server] Attempting to read file: ${filePath}`);
        const fileContent = await fs.readFile(filePath, 'utf8');
        
        // Set appropriate content type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType;
        
        switch (ext) {
            case '.json':
                contentType = 'application/json';
                break;
            case '.xml':
            case '.xsd':
                contentType = 'application/xml';
                break;
            default:
                console.error(`[Schema Server] Error: Unsupported file type: ${ext}`);
                return res.status(415).json({ error: 'Unsupported file type. Only JSON and XML files are supported.' });
        }

        console.log(`[Schema Server] ✅ Serving file with content type: ${contentType}`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', contentType);
        res.send(fileContent);
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`[Schema Server] File not found: ${error.path || 'unknown'}`);
            res.status(404).json({ error: 'Schema file not found' });
        } else {
            console.error(`[Schema Server] Internal error serving schema file:`, error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

module.exports = router;