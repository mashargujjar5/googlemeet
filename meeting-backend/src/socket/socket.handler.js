const Meeting = require('../models/meeting.model');

// In-memory chat per meeting (resets on server restart)
const chatHistories = {};
// Tracking join requests and approved participants
const pendingRequests = {}; // meetingId -> [ {socketId, name, userId, avatar} ]
const approvedParticipants = {}; // meetingId -> Set(userId or socketId)

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // ─── Request to Join (for Guest/Non-host) ─────────────────────
    socket.on('request-join', async ({ meetingId, name, userId, avatar }) => {
      try {
        console.log(`[request-join] ${name} (${socket.id}) requesting to join ${meetingId}`);
        const meeting = await Meeting.findOne({ meetingId });
        
        if (!meeting) {
          return socket.emit('error', { message: 'Meeting not found' });
        }

        // If user is the host, they should be able to join directly
        if (meeting.host && String(meeting.host) === String(userId)) {
          return socket.emit('join-approved', { meetingId });
        }

        if (!pendingRequests[meetingId]) pendingRequests[meetingId] = [];
        pendingRequests[meetingId].push({ socketId: socket.id, name, userId, avatar });

        // Broadcast request to everyone currently in the room
        io.to(meetingId).emit('incoming-join-request', {
          socketId: socket.id,
          name,
          userId,
          avatar
        });

        socket.emit('waiting-for-host', { message: 'The host will let you in soon.' });
      } catch (err) {
        console.error('Request join error:', err);
      }
    });

    // ─── Host Decision (Admit/Deny) ──────────────────────────────
    socket.on('accept-join-request', ({ meetingId, socketId }) => {
      console.log(`[accept-join-request] Admitting ${socketId} to ${meetingId}`);
      if (!approvedParticipants[meetingId]) approvedParticipants[meetingId] = new Set();
      approvedParticipants[meetingId].add(socketId);

      // Notify the specific requester
      io.to(socketId).emit('join-approved', { meetingId });
      
      // Remove from pending
      if (pendingRequests[meetingId]) {
        pendingRequests[meetingId] = pendingRequests[meetingId].filter(r => r.socketId !== socketId);
      }
    });

    socket.on('reject-join-request', ({ meetingId, socketId }) => {
      console.log(`[reject-join-request] Denying ${socketId} to ${meetingId}`);
      io.to(socketId).emit('join-denied', { message: 'The host has denied your request to join.' });
      
      // Remove from pending
      if (pendingRequests[meetingId]) {
        pendingRequests[meetingId] = pendingRequests[meetingId].filter(r => r.socketId !== socketId);
      }
    });

    // ─── Join Room ──────────────────────────────────────────────
    socket.on('join-room', async ({ meetingId, name, userId, avatar, isHost, isCameraOff, isMuted }) => {
      try {
        let meeting = await Meeting.findOne({ meetingId });
        
        if (!meeting) {
          return socket.emit('error', { message: 'Meeting not found. Please check your code.' });
        }

        const isActualHost = (meeting.host && String(meeting.host) === String(userId)) || isHost;
        const isApproved = approvedParticipants[meetingId] && approvedParticipants[meetingId].has(socket.id);

        if (!isActualHost && !isApproved) {
          console.warn(`[join-room] Unauthorized join attempt by ${name} to ${meetingId}`);
          return socket.emit('error', { message: 'You need host approval to join this meeting.' });
        }
        
        // Basic join logic
        socket.join(meetingId);
        console.log(`[join-room] ${name} joined ${meetingId} (cam:${!isCameraOff} mic:${!isMuted})`);

        meeting.participants = meeting.participants.filter(p => p.socketId !== socket.id);
        const participant = {
          socketId: socket.id,
          name: name || 'Guest',
          user: userId && String(userId).length === 24 ? userId : undefined,
          avatar: avatar || '',
          isMuted: !!isMuted,
          isCameraOff: !!isCameraOff
        };
        meeting.participants.push(participant);

        if ((isHost || isActualHost) && meeting.status !== 'ended') {
          meeting.status = 'active';
        }
        await meeting.save();

        if (!chatHistories[meetingId]) chatHistories[meetingId] = [];

        socket.to(meetingId).emit('participant-joined', {
          socketId: socket.id,
          name: participant.name,
          avatar: participant.avatar,
          isMuted: participant.isMuted,
          isCameraOff: participant.isCameraOff
        });

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
          status: meeting.status,
          isHost: isActualHost
        });
      } catch (err) {
        console.error('Socket join exception:', err);
        socket.emit('error', { message: 'Meeting connection failed internally: ' + err.message });
      }
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
    socket.on('send-message', ({ meetingId, message, senderName, senderId, receiverSocketId }) => {
      const msg = {
        senderId,
        senderName: senderName || 'Guest',
        message,
        timestamp: new Date(),
        isPrivate: !!receiverSocketId
      };

      if (!chatHistories[meetingId]) chatHistories[meetingId] = [];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new-message', msg);
        socket.emit('new-message', msg);
      } else {
        chatHistories[meetingId].push(msg);
        io.to(meetingId).emit('new-message', msg);
      }
    });

    // ─── Media Toggles ──────────────────────────────────────────
    socket.on('toggle-mute', async ({ meetingId, isMuted }) => {
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

            if (approvedParticipants[roomId]) {
              approvedParticipants[roomId].delete(socket.id);
            }
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
