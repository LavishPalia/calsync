import { useState } from "react";
import EditEventModal from "./EditEventModal";
import { useUserContext } from "../contexts/UserContext";
import { Event, useEventContext } from "../contexts/EventContext";
import { deleteEvent } from "../axios/api";
import { toast } from "react-toastify";

const UserEvents = () => {
  const { token } = useUserContext();
  const { events } = useEventContext();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    const result = await deleteEvent(eventId, { token: token! });

    console.log(result);

    if (result.data.success) {
      toast.success("Event deleted. Please refresh the page");
    }
  };

  return (
    <>
      <div className="flex flex-col flex-wrap gap-4 p-4 md:flex-row">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="w-full p-6 rounded-lg shadow-lg md:w-1/4 bg-gradient-to-bl from-slate-800 to-gray-950 hover:shadow-xl"
            >
              <h2 className="text-lg font-semibold text-gray-100">
                {event.summary || "Untitled Event"}
              </h2>
              <p className="mt-1 text-sm text-gray-300">
                {event.location || "Google Meet"}
              </p>
              <div className="flex justify-between mt-4 text-sm text-gray-400">
                <div>
                  <span className="font-medium text-gray-200">Start: </span>
                  {event.start?.dateTime
                    ? new Date(event.start.dateTime).toLocaleString()
                    : "N/A"}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => handleEdit(event)}
                  className="px-3 py-1 text-sm font-medium text-gray-100 bg-blue-600 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="px-3 py-1 text-sm font-medium text-gray-100 bg-red-600 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-400 border border-gray-700 rounded-lg shadow-lg bg-slate-800">
            No events to display
          </div>
        )}
      </div>
      <EditEventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default UserEvents;
