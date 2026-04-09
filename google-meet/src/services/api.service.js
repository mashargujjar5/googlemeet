import { API_BASE_URL } from '../config';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    ...getHeaders(),
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle token expiration or other errors
    if (response.status === 401 && !url.includes('/user/login')) {
      // Potentially refresh token or logout
      console.warn('Unauthorized access, checking for token refresh...');
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
