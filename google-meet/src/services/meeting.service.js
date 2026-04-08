import { apiRequest } from './api.service';

export const meetingService = {
  createMeeting: async (title) => {
    return await apiRequest('/meetings/create', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  getMyMeetings: async (page = 1, limit = 10) => {
    return await apiRequest(`/meetings/my-meetings?page=${page}&limit=${limit}`);
  },

  getMeetingInfo: async (meetingId) => {
    return await apiRequest(`/meetings/${meetingId}/info`);
  },

  joinMeeting: async (meetingId, name) => {
    return await apiRequest(`/meetings/${meetingId}/join`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  getParticipants: async (meetingId) => {
    return await apiRequest(`/meetings/${meetingId}/participants`);
  },

  getChatHistory: async (meetingId, page = 1, limit = 50) => {
    return await apiRequest(`/meetings/${meetingId}/chat?page=${page}&limit=${limit}`);
  }
};
