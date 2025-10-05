// src/components/Tickets/TicketTable.jsx
import React, { useEffect, useState } from "react";
import { useTicketContext } from "../../context/TicketContext";
import TicketCard from "./TicketCard";

const TicketList = ({ role, section }) => {
  const { tickets, loading, fetchTickets, offset, nextOffset, limit } = useTicketContext();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);


  useEffect(() => {
    fetchTickets(query, 0);
    setPage(1);
  }, [fetchTickets, query]);

  const handleNext = () => {
    if (nextOffset !== null) {
      fetchTickets(query, nextOffset);
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    const prevOffset = Math.max(offset - limit, 0);
    fetchTickets(query, prevOffset);
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names.length === 1
      ? names[0].charAt(0).toUpperCase()
      : names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
  };


  const filteredTickets = tickets.filter((t) => t.status !== "closed");

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tickets..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">S.No</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Created By</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Assignee</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Priority</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">SLA / Due</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Created At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  Loading tickets...
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No open tickets found.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket, index) => {
                if (role === "user" && ticket.createdBy?._id !== localStorage.getItem("userId"))
                  return null;

                return (
                  <TicketCard key={ticket._id} ticket={ticket} section={section} index={index} offset={offset} getInitials={getInitials}/>
                );
              })
            )}
          </tbody>
        </table>
      </div>

  
      <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-600">Page {page}</span>
        <button
          onClick={handleNext}
          disabled={nextOffset === null}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TicketList;
