import React from 'react'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

const TicketCard = ({ getInitials, ticket, index, offset, section }) => {

  const getStatusClasses = (status) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      case "closed":
        return "bg-red-100 text-red-700";
      case "resolved":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-200 text-gray-600";
    }
  }

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-4 py-3 text-sm text-gray-700">{offset + index + 1}</td>
      <td className="px-4 py-3 text-sm font-medium text-blue-600 hover:underline">
        <Link to={`/${section}/${ticket._id}`}>
          {ticket.title}
        </Link>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
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
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{ticket.assignedTo?.fullname || "Unassigned"}</td>
      
      {/* Status as badge */}
      <td className="px-4 py-3 text-sm">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(ticket.status)}`}>
          {ticket.status}
        </span>
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">{ticket.priority}</td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {ticket.slaDeadline
          ? dayjs(ticket.slaDeadline).format("DD MMM YYYY, HH:mm")
          : `${ticket.slaHours}h`}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {dayjs(ticket.updatedAt).format("DD MMM YYYY, HH:mm")}
      </td>
    </tr>
  )
}

export default TicketCard
