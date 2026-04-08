const Meeting = require('../models/meeting.model');

// In-memory chat per meeting (resets on server restart)
const chatHistories = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // ─── Join Room ──────────────────────────────────────────────
    socket.on('join-room', async ({ meetingId, name, userId, avatar, isHost, isCameraOff, isMuted }) => {
      socket.join(meetingId);
      console.log(`[join-room] ${name} joined ${meetingId} (cam:${!isCameraOff} mic:${!isMuted})`);

      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) {
        return socket.emit('error', { message: 'Meeting not found' });
      }

      // Remove any stale entry for this user (reconnect scenario)
      meeting.participants = meeting.participants.filter(p => p.socketId !== socket.id);

      const participant = {
        socketId: socket.id,
        name: name || 'Guest',
        user: userId,
        avatar: avatar || '',
        isMuted: !!isMuted,
        isCameraOff: !!isCameraOff
      };

      meeting.participants.push(participant);

      if (isHost || String(meeting.host) === String(userId)) {
        meeting.status = 'active';
      }
      await meeting.save();

      // Init chat history bucket
      if (!chatHistories[meetingId]) chatHistories[meetingId] = [];

      // Tell everyone else about the new participant
      socket.to(meetingId).emit('participant-joined', {
        socketId: socket.id,
        name: participant.name,
        avatar: participant.avatar,
        isMuted: participant.isMuted,
        isCameraOff: participant.isCameraOff
      });

      // Send current state to the new user
      socket.emit('room-joined', {
        meetingId,
        participantId: socket.id,
        participants: meeting.participants.map(p => ({
          socketId: p.socketId,
          name: p.name,
          avatar: p.avatar || '',
          isMuted: p.isMuted,
          isCameraOff: p.isCameraOff,
          isMe: p.socketId === socket.id
        })),
        chatHistory: chatHistories[meetingId] || [],
        status: meeting.status
      });
    });

    // ─── WebRTC Signaling ───────────────────────────────────────
    socket.on('offer', ({ targetSocketId, offer, meetingId }) => {
      io.to(targetSocketId).emit('offer', { offer, fromSocketId: socket.id, meetingId });
    });

    socket.on('answer', ({ targetSocketId, answer, meetingId }) => {
      io.to(targetSocketId).emit('answer', { answer, fromSocketId: socket.id, meetingId });
    });

    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', { candidate, fromSocketId: socket.id });
    });

    // ─── Chat ───────────────────────────────────────────────────
    socket.on('send-message', ({ meetingId, message, senderName, senderId }) => {
      const msg = {
        senderId,
        senderName: senderName || 'Guest',
        message,
        timestamp: new Date()
      };
      if (!chatHistories[meetingId]) chatHistories[meetingId] = [];
      chatHistories[meetingId].push(msg);

      // Broadcast to all in room (including sender)
      io.to(meetingId).emit('new-message', msg);
    });

    // ─── Media Toggles ──────────────────────────────────────────
    socket.on('toggle-mute', async ({ meetingId, isMuted }) => {
      // Persist to DB
      await Meeting.findOneAndUpdate(
        { meetingId, 'participants.socketId': socket.id },
        { $set: { 'participants.$.isMuted': isMuted } }
      );
      socket.to(meetingId).emit('participant-muted', { socketId: socket.id, isMuted });
    });

    socket.on('toggle-camera', async ({ meetingId, isCameraOff }) => {
      await Meeting.findOneAndUpdate(
        { meetingId, 'participants.socketId': socket.id },
        { $set: { 'participants.$.isCameraOff': isCameraOff } }
      );
      socket.to(meetingId).emit('participant-camera-toggled', { socketId: socket.id, isCameraOff });
    });

    // ─── Disconnect ─────────────────────────────────────────────
    socket.on('disconnecting', async () => {
      const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
      for (const roomId of rooms) {
        try {
          const meeting = await Meeting.findOne({ meetingId: roomId });
          if (meeting) {
            meeting.participants = meeting.participants.filter(p => p.socketId !== socket.id);
            await meeting.save();
            socket.to(roomId).emit('participant-left', { socketId: socket.id });
          }
        } catch (err) {
          console.error('Error on disconnect cleanup:', err);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
