import { ChangeEvent, FormEvent, useState } from "react";
import Modal from "react-modal";

export interface EventData {
  name: string;
  date: string;
  time: string;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (eventData: EventData) => void;
}

const CreateEventModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateEventModalProps) => {
  const [eventData, setEventData] = useState<EventData>({
    name: "",
    date: "",
    time: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onCreate(eventData);
    setEventData({ name: "", date: "", time: "" });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Create Event Modal"
      className="w-full max-w-lg p-6 mx-auto bg-gray-800 rounded shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center"
    >
      <h2 className="mb-6 text-2xl font-bold text-green-400">Create Event</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Event Name
          </label>
          <input
            type="text"
            name="name"
            value={eventData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Event Date
          </label>
          <input
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Event Time
          </label>
          <input
            type="time"
            name="time"
            value={eventData.time}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
            required
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-100 bg-gray-600 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-gray-100 bg-blue-600 rounded hover:bg-blue-700"
          >
            Create Event
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEventModal;
