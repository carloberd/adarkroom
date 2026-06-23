import express from 'express';
import fs from 'fs';
import path from 'path';

const PORT = 8080;
const SAVE_FILE = process.env.SAVE_FILE || '/save/gameState.json';

const app = express();
app.use(express.static('.'));
app.use(express.json({ limit: '10mb' }));

app.get('/api/save', (req, res) => {
  try {
    const data = fs.readFileSync(SAVE_FILE, 'utf8');
    if (!data.trim()) return res.sendStatus(404);
    res.json(JSON.parse(data));
  } catch {
    res.sendStatus(404);
  }
});

app.post('/api/save', (req, res) => {
  try {
    fs.mkdirSync(path.dirname(SAVE_FILE), { recursive: true });
    fs.writeFileSync(SAVE_FILE, JSON.stringify(req.body));
    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
