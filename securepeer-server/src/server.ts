import express, { Request, Response, RequestHandler } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { User, ConnectionRequest, ConnectionResponse, SignalingMessage } from './types';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-memory storage (replace with database in production)
const users: Map<string, User> = new Map();
const connections: Map<string, Set<string>> = new Map();

app.use(cors());
app.use(express.json());

// REST endpoints
app.post('/api/users/register', (req, res) => {
  const { username, publicKey, deviceId } = req.body;
  const userId = Math.random().toString(36).substring(7);
  
  const user: User = {
    id: userId,
    username,
    publicKey,
    deviceId
  };
  
  users.set(userId, user);
  connections.set(userId, new Set());
  
  res.json({ userId, username });
});

interface SearchQuery {
  query?: string;
}

const searchHandler: RequestHandler = (req, res) => {
  const { query } = req.query;
  
  if (!query || typeof query !== 'string') {
    res.status(400).json({ error: 'Search query is required' });
    return;
  }

  console.log('Search query:', query); // Debug log
  console.log('Current users:', Array.from(users.values())); // Debug log

  const searchQuery = query.toLowerCase();
  const results = Array.from(users.values())
    .filter(user => user.username.toLowerCase().includes(searchQuery))
    .map(({ id, username, publicKey }) => ({ id, username, publicKey }));
  
  console.log('Search results:', results); // Debug log
  res.json(results);
};

app.get('/api/users/search', searchHandler);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register', (userId: string) => {
    socket.join(userId);
  });

  socket.on('connection_request', (request: ConnectionRequest) => {
    const targetSocket = io.sockets.adapter.rooms.get(request.to);
    if (targetSocket) {
      io.to(request.to).emit('connection_request', request);
    }
  });

  socket.on('connection_response', (response: ConnectionResponse) => {
    if (response.accepted) {
      const fromConnections = connections.get(response.from) || new Set();
      const toConnections = connections.get(response.to) || new Set();
      
      fromConnections.add(response.to);
      toConnections.add(response.from);
      
      connections.set(response.from, fromConnections);
      connections.set(response.to, toConnections);
    }
    
    io.to(response.to).emit('connection_response', response);
  });

  socket.on('signaling_message', (message: SignalingMessage) => {
    const targetSocket = io.sockets.adapter.rooms.get(message.data.to);
    if (targetSocket) {
      io.to(message.data.to).emit('signaling_message', message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

httpServer.listen({
  port: PORT,
  host: HOST
}, () => {
  console.log(`Signaling server running on http://${HOST}:${PORT}`);
}); 