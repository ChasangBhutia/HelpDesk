import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTicketContext } from "../../context/TicketContext";
import { useAuthContext } from "../../context/AuthContext";
import dayjs from "dayjs";

const TicketDetails = ({ id }) => {
  const navigate = useNavigate();
  const { tickets, fetchTickets, loading, updateTicket, addComment, fetchAgents } = useTicketContext();
  const { user } = useAuthContext();

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const updatedTicket = tickets.find((t) => t._id === id);
    if (updatedTicket) setTicket(updatedTicket);
  }, [tickets, id]);

  // Initial fetch
  useEffect(() => {
    if (!ticket) {
      fetchTickets("").then(() => {
        const t = tickets.find((t) => t._id === id);
        setTicket(t);
      });
    }

    if (user.role === "admin") {
      fetchAgents().then(setAgents);
    }
  }, [id, tickets, ticket, fetchTickets, user.role, fetchAgents]);

  if (loading || !ticket) {
    return <div className="p-6 text-center text-gray-500">Loading ticket details...</div>;
  }

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names.length === 1
      ? names[0].charAt(0).toUpperCase()
      : names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
  };

  const handleAssign = async (agentId) => {
    await updateTicket(ticket._id, { assignedTo: agentId });
  };

  const handleAssignSelf = async () => {
    await updateTicket(ticket._id, { assignedTo: user._id });
  };

  const handleStatusChange = async (status) => {
    await updateTicket(ticket._id, { status });
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await addComment(ticket._id, commentText);
    setCommentText("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        &larr; Back
      </button>

      <div className="bg-white p-6 shadow rounded-xl space-y-4">
        <h1 className="text-2xl font-semibold">{ticket.title}</h1>
        <p className="text-gray-700">{ticket.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <strong>Created By:</strong>
            {ticket.createdBy?.avatar ? (
              <img
                src={ticket.createdBy.avatar}
                alt={ticket.createdBy.fullname}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-400 text-white flex items-center justify-center text-xs font-semibold">
                {getInitials(ticket.createdBy?.fullname)}
              </div>
            )}
            {ticket.createdBy?.fullname || "Unknown"}
          </div>

          <div>
            <strong>Assignee:</strong>{" "}
            {ticket.assignedTo?.fullname || "Unassigned"}
          </div>

          <div>
            <strong>Status:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                ticket.status === "open"
                  ? "bg-green-100 text-green-700"
                  : ticket.status === "in-progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {ticket.status}
            </span>
          </div>

          <div>
            <strong>Priority:</strong> {ticket.priority}
          </div>

          <div>
            <strong>SLA / Due:</strong>{" "}
            {ticket.slaDeadline
              ? dayjs(ticket.slaDeadline).format("DD MMM YYYY, HH:mm")
              : `${ticket.slaHours}h`}
          </div>

          <div>
            <strong>Created At:</strong>{" "}
            {dayjs(ticket.createdAt).format("DD MMM YYYY, HH:mm")}
          </div>
        </div>

        {/* Assignment Section */}
        {user.role === "admin" && (
          <div className="mt-4">
            <label className="block mb-1 font-medium">Assign Agent:</label>
            <select
              className="border p-2 rounded"
              value={ticket.assignedTo?._id || ""}
              onChange={(e) => handleAssign(e.target.value)}
            >
              <option value="">Select Agent</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.fullname}
                </option>
              ))}
            </select>
          </div>
        )}

        {user.role === "agent" && !ticket.assignedTo && (
          <button
            onClick={handleAssignSelf}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Assign to Myself
          </button>
        )}

        {user.role === "agent" && ticket.assignedTo?._id === user._id && (
          <div className="mt-4">
            <label className="block mb-1 font-medium">Change Status:</label>
            <select
              className="border p-2 rounded"
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Comments</h2>
          {ticket.comments?.length === 0 ? (
            <p className="text-gray-500">No comments yet.</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-auto">
              {ticket.comments.map((comment) => (
                <li key={comment._id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    {comment.user?.avatar ? (
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.fullname}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-blue-400 text-white flex items-center justify-center text-xs font-semibold">
                        {getInitials(comment.user?.fullname)}
                      </div>
                    )}
                    <span className="text-gray-700 font-medium">
                      {comment.user?.fullname || "Unknown"}
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      {dayjs(comment.createdAt).format("DD MMM YYYY, HH:mm")}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.message}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border p-2 rounded"
            />
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
