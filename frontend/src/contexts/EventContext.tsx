import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getAllEvents } from "../axios/api";

export type Event = {
  id: string;
  summary: string;
  description: string;
  location: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
};

type EventContextType = {
  events: Event[];
  refreshEvents: () => Promise<void>;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

type EventProviderProps = {
  children: ReactNode;
};

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!token) {
      console.error("Token is not available");
      return;
    }

    try {
      const response = await getAllEvents({ token });
      const extractedEvents = response.data.events.map((event: any) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
      }));
      setEvents(extractedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const refreshEvents = async () => {
    await fetchEvents();
  };

  useEffect(() => {
    const data = localStorage.getItem("user-info");
    if (data) {
      const parsedData = JSON.parse(data);
      if (parsedData.token) {
        setToken(parsedData.token);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token]);

  return (
    <EventContext.Provider value={{ events, refreshEvents }}>
      {children}
    </EventContext.Provider>
  );
};

// Custom Hook to use EventContext
export const useEventContext = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return context;
};
