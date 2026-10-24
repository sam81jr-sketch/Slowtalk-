const express = require('express');
const http = require('http');
const crypto = require('crypto');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e6 });
const PORT = process.env.PORT || 3000;
const rooms = new Map();
app.use(express.static('public'));
app.get('/health', (_req, res) => res.json({ ok: true }));
function newId() { return crypto.randomBytes(9).toString('base64url'); }
io.on('connection', socket => {
  socket.on('create-room', cb => { let id; do { id = newId(); } while (rooms.has(id)); if (typeof cb === 'function') cb({ ok: true, roomId: id }); });
  socket.on('join-room', (value, cb) => {
    const id = String(value || '').trim();
    if (!/^[A-Za-z0-9_-]{6,40}$/.test(id)) return typeof cb === 'function' && cb({ ok: false, error: 'Invalid room link or code.' });
    let members = rooms.get(id); if (!members) { members = new Set(); rooms.set(id, members); }
    if (!members.has(socket.id) && members.size >= 2) return typeof cb === 'function' && cb({ ok: false, error: 'This room already has two people.' });
    members.add(socket.id); socket.join(id); socket.data.roomId = id;
    const info = { roomId: id, peerCount: members.size, message: members.size === 2 ? 'Your friend is here. Start a call or send a message.' : 'Waiting for your friend to join…' };
    if (typeof cb === 'function') cb({ ok: true, ...info });
    io.to(id).emit('room-status', info); socket.to(id).emit('peer-joined');
  });
  socket.on('chat-message', data => { const id = socket.data.roomId; if (!id || typeof data?.text !== 'string') return; const text = data.text.trim().slice(0, 2000); if (text) io.to(id).emit('chat-message', { id: crypto.randomUUID(), text, sender: String(data.sender || 'Friend').slice(0, 40), time: new Date().toISOString() }); });
  socket.on('signal', data => { if (socket.data.roomId && data && typeof data === 'object') socket.to(socket.data.roomId).emit('signal', data); });
  socket.on('leave-room', () => leave(socket)); socket.on('disconnect', () => leave(socket));
});
function leave(socket) { const id = socket.data.roomId; if (!id) return; const members = rooms.get(id); if (members) { members.delete(socket.id); if (!members.size) rooms.delete(id); else io.to(id).emit('room-status', { roomId: id, peerCount: members.size, message: 'Your friend disconnected.' }); } socket.leave(id); delete socket.data.roomId; }
server.listen(PORT, '0.0.0.0', () => console.log(`SlowTalk running on http://localhost:${PORT}`));
