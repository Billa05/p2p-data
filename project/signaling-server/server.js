import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory stores
const users = new Map(); // userId -> { id, name, publicKey }
const requests = []; // { id, from, to, type, payload, timestamp }
const signals = []; // { id, from, to, type, payload, timestamp }

// Register a user
app.post('/register', (req, res) => {
  const { id, name, publicKey } = req.body;
  if (!id || !name || !publicKey) return res.status(400).json({ error: 'Missing fields' });
  users.set(id, { id, name, publicKey });
  res.json({ success: true });
});

// Get user by ID
app.get('/user/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Search users by name
app.get('/users', (req, res) => {
  const q = req.query.q?.toLowerCase() || '';
  const result = Array.from(users.values()).filter(u => u.name.toLowerCase().includes(q));
  res.json(result);
});

// Send a connection or file request
app.post('/request', (req, res) => {
  const { from, to, type, payload } = req.body;
  if (!from || !to || !type) return res.status(400).json({ error: 'Missing fields' });
  const reqObj = { id: uuidv4(), from, to, type, payload, timestamp: Date.now() };
  requests.push(reqObj);
  res.json({ success: true, request: reqObj });
});

// Poll for requests
app.get('/requests/:userId', (req, res) => {
  const userId = req.params.userId;
  const userRequests = requests.filter(r => r.to === userId);
  res.json(userRequests);
});

// Send a signaling message (offer/answer/ice/file-meta)
app.post('/signal', (req, res) => {
  const { from, to, type, payload } = req.body;
  if (!from || !to || !type) return res.status(400).json({ error: 'Missing fields' });
  const sigObj = { id: uuidv4(), from, to, type, payload, timestamp: Date.now() };
  signals.push(sigObj);
  res.json({ success: true, signal: sigObj });
});

// Poll for signaling messages
app.get('/signals/:userId', (req, res) => {
  const userId = req.params.userId;
  const userSignals = signals.filter(s => s.to === userId);
  res.json(userSignals);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
