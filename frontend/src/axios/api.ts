import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/",
});

interface GoogleAuthResponse {
  success: boolean;
  data: {
    user: {
      name: string;
      email: string;
      avatar: string;
    };
    token: string;
  };
}

export interface CreateEventInput {
  name: string;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:mm
  token: string;
}

interface CreateEventResponse {
  data: {
    name: string;
    date: string;
    time: string;
    googleEventId: string;
    success: boolean;
  };
}

export const googleAuth = (code: string): Promise<GoogleAuthResponse> =>
  api.get(`/auth/google?code=${code}`);

export const createEvent = (
  eventData: CreateEventInput
): Promise<CreateEventResponse> => api.post(`/events/create`, eventData);

export const getAllEvents = (token: { token: string }) =>
  api.post(`/events/all`, token);

export const deleteEvent = (eventId: string, { token }: { token: string }) =>
  api.delete(`/events/delete/${eventId}?token=${token}`);

export const updateEvent = (
  eventData: CreateEventInput,
  googleEventId: string
) => api.patch(`/events/update/${googleEventId}`, eventData);
