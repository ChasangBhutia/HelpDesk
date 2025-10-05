// src/components/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useTicketContext } from "../context/TicketContext";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

const Dashboard = ({ role }) => {
  const { tickets, fetchTickets, loading } = useTicketContext();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress:0,
    resolved: 0,
    assigned: 0,
  });

  const userId = localStorage.getItem("userId");


  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets(); // fetch all tickets initially
  }, [fetchTickets]);

  useEffect(() => {
    // Calculate stats based on role
    const filteredTickets = tickets.filter((ticket) => {
      if (role === "user") return ticket.createdBy?._id === userId;
      if (role === "agent") return ticket.assignedTo?._id === userId;
      return true; // admin sees all tickets
    });

    const total = filteredTickets.length;
    const open = filteredTickets.filter((t) => t.status === "open").length;
    const inProgress = filteredTickets.filter((t) => t.status === "in-progress").length;
    const resolved = filteredTickets.filter((t) => t.status === "closed").length;
    const assigned =
      role === "agent"
        ? filteredTickets.filter((t) => t.assignedTo?._id === userId).length
        : 0;

    setStats({ total, open,inProgress, resolved, assigned });
  }, [tickets, role, userId]);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Total Tickets</h3>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Open Tickets</h3>
          <p className="text-2xl font-semibold">{stats.open}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Progress Tickets</h3>
          <p className="text-2xl font-semibold">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Resolved Tickets</h3>
          <p className="text-2xl font-semibold">{stats.resolved}</p>
        </div>
        {role === "agent" && (
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Tickets Assigned</h3>
            <p className="text-2xl font-semibold">{stats.assigned}</p>
          </div>
        )}
      </div>

      {/* Recent Tickets Table */}
      <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Recent Tickets</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">S.No</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Title</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Priority</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Created At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets
                .filter((ticket) => {
                  if (role === "user") return ticket.createdBy?._id === userId;
                  if (role === "agent") return ticket.assignedTo?._id === userId;
                  return true;
                })
                .slice(0, 5) // show top 5 recent tickets
                .map((ticket, idx) => (
                  <tr key={ticket._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm font-medium text-blue-600">
                      <Link to={`/ticket-lists/${ticket._id}`} className="hover:underline">
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ticket.status === "open"
                            ? "bg-green-100 text-green-700"
                            : ticket.status === "closed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{ticket.priority}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {dayjs(ticket.createdAt).format("DD MMM YYYY, HH:mm")}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
