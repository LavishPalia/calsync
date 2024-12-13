import React, { useState } from "react";
import { updateEvent } from "../axios/api";
import { useUserContext } from "../contexts/UserContext";
import { toast } from "react-toastify";

const EditEventModal = ({ event, isOpen, onClose }: any) => {
  const { token } = useUserContext();

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = Object.values(formData).some(
    (field) => field.trim() !== ""
  );

  const handleSave = async () => {
    if (!isFormValid) return;

    if (!token) {
      console.error("No token available for event creation");
      return;
    }

    try {
      const result = await updateEvent({ ...formData, token }, event.id);

      if (result.data.success) {
        toast.success("Event edited. Please refresh the page.");
      }

      onClose();
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-gray-100">Edit Event</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Event Name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-gray-100 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-gray-100 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-gray-100 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className={`px-4 py-2 text-sm font-medium text-gray-100 rounded ${
              isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
