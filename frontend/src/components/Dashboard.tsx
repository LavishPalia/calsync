import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import UserEvents from "./UserEvents";
import CreateEventModal, { EventData } from "./createEventModal";
import { createEvent } from "../axios/api";
import { useUserContext } from "../contexts/UserContext";
import NoAvatar from "../assets/no-profile-picture-icon.png";

const Dashboard = () => {
  const { name, avatar, token } = useUserContext();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateEvent = async (eventData: EventData) => {
    if (!token) {
      console.error("No token available for event creation");
      return;
    }

    try {
      const result = await createEvent({ ...eventData, token });

      if (result.data.success) {
        toast.success("Event created. Please refresh the page");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <div className="min-h-screen px-8 pt-4 md:px-20 bg-gradient-to-br from-gray-800 to-gray-900">
      <header className="flex justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold">Calsync</h1>

        <section className="flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-lg font-medium"
          >
            Create Calendar Event
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("user-info");
              navigate("/login");
            }}
            className="text-lg font-medium"
          >
            Logout
          </button>

          <div className="flex flex-col items-center justify-center">
            <img
              src={avatar || NoAvatar}
              alt={name || "User"}
              className="object-cover object-center rounded-full size-8"
            />
            <p className="text-sm">{name || "Guest"}</p>
          </div>
        </section>
      </header>

      <UserEvents />

      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateEvent}
      />
    </div>
  );
};

export default Dashboard;
