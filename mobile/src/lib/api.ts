export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const API = {
  base: API_URL,
  register: `${API_URL}/auth/register`,
  login: `${API_URL}/auth/login`,
  rooms: `${API_URL}/api/rooms`,
  room: (code: string) => `${API_URL}/api/rooms/${code}`,
  joinRoom: (code: string) => `${API_URL}/api/rooms/${code}/join`,
  startRoom: (code: string) => `${API_URL}/api/rooms/${code}/start`,
  playRoom: (code: string) => `${API_URL}/api/rooms/${code}/play`,
};