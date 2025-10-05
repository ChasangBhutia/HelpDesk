// src/components/Tickets/AddTicketForm.jsx
import React, { useState } from "react";
import { useTicketContext } from "../../context/TicketContext";

const AddTicket = () => {
  const { createTicket } = useTicketContext();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    slaHours: 24,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTicket(form);
      alert("Ticket created successfully!");
      setForm({ title: "", description: "", priority: "medium", slaHours: 24 });
    } catch {
      alert("Error creating ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full pt-20">
      <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Raise a New Ticket</h2>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter ticket title"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition h-28 resize-none"
            required
          />
        </div>

        {/* Priority & SLA */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SLA (Hours)
            </label>
            <input
              type="number"
              name="slaHours"
              value={form.slaHours}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </div>
    </div>

  );
};

export default AddTicket;
