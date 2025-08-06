

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const manifestDirectory = path.resolve(__dirname, "../../config/templates/");

const router = express.Router();

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
        
        if (!schemaPath) {
            return res.status(400).json({ error: 'Schema path is required' });
        }

        // Construct the full file path
        const filePath = path.join(manifestDirectory, schemaPath);
        
        // Security check: ensure the file is within the manifest directory
        const resolvedFilePath = path.resolve(filePath);
        const resolvedManifestDirectory = path.resolve(manifestDirectory);
        
        if (!resolvedFilePath.startsWith(resolvedManifestDirectory)) {
            return res.status(403).json({ error: 'Access denied: Path outside manifest directory' });
        }

        // Check if file exists and read it
        const fileContent = await fs.readFile(resolvedFilePath, 'utf8');
        
        // Set appropriate content type based on file extension
        const ext = path.extname(resolvedFilePath).toLowerCase();
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
                return res.status(415).json({ error: 'Unsupported file type. Only JSON and XML files are supported.' });
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', contentType);
        res.send(fileContent);
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Schema file not found' });
        } else {
            console.error('Error serving schema file:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

module.exports = router;