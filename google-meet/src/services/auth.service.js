import { apiRequest } from './api.service';

export const authService = {
  login: async (credentials) => {
    const response = await apiRequest('/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response;
  },

  register: async (formData) => {
    const response = await apiRequest('/user/register', {
      method: 'POST',
      body: formData, // FormData doesn't need Content-Type header manually
    });
    return response;
  },

  logout: async () => {
    return await apiRequest('/user/logout', { method: 'POST' });
  },

  getProfile: async () => {
    return await apiRequest('/user/profile');
  },

  refreshToken: async (token) => {
    return await apiRequest('/user/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: token }),
    });
  }
};
