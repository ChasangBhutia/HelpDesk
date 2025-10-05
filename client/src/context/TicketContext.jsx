import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import api from "../api/axios";

const TicketContext = createContext();
export const useTicketContext = () => useContext(TicketContext);

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  const [nextOffset, setNextOffset] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.BACKEND_URI, { withCredentials: true });

    newSocket.on("connect", () => console.log("Connected to socket.io"));

    newSocket.on("ticket:created", (ticket) => {
      setTickets((prev) => [ticket, ...prev]);
    });

    newSocket.on("ticket:updated", (ticket) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === ticket._id ? ticket : t))
      );
    });

    newSocket.on("ticket:comment", ({ ticketId, comment }) => {
      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId ? { ...t, comments: [...(t.comments || []), comment] } : t
        )
      );
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  const fetchTickets = useCallback(async (query = "", newOffset = 0) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/tickets?q=${query}&limit=${limit}&offset=${newOffset}`,
        { withCredentials: true }
      );
      setTickets(res.data.items);
      setOffset(newOffset);
      setNextOffset(res.data.next_offset);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  }, [limit]);


  const createTicket = async (ticketData) => {
    const key = uuidv4();
    try {
      const res = await api.post("/tickets", ticketData, {
        headers: { "Idempotency-Key": key },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      console.error("Error creating ticket", err);
      throw err;
    }
  };

  const updateTicket = async (ticketId, patch) => {
    try {
      const ticket = tickets.find((t) => t._id === ticketId);
      if (!ticket) throw new Error("Ticket not found in context");

      const headers = { "If-Match": ticket.__v };

      await api.patch(`/tickets/${ticketId}`, patch, { headers, withCredentials: true });

      const fresh = await api.get(`/tickets/${ticketId}`, { withCredentials: true });
      const updatedTicket = fresh.data.data.ticket;

      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? updatedTicket : t))
      );

      return updatedTicket;
    } catch (err) {
      console.error("Failed to update ticket", err);
      throw err;
    }
  };

  const addComment = async (ticketId, message) => {
    if (!message) return;
    try {
      const res = await api.post(
        `/tickets/${ticketId}/comments`,
        { message },
        { withCredentials: true }
      );
      const comment = res.data.data.comment;

      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId ? { ...t, comments: [...(t.comments || []), comment] } : t
        )
      );

      return comment;
    } catch (err) {
      console.error("Failed to add comment", err);
      throw err;
    }
  };

  const [agents, setAgents] = useState([]);
  const [agentOffset, setAgentOffset] = useState(0);
  const [agentLimit] = useState(10);
  const [agentNextOffset, setAgentNextOffset] = useState(null);
  const [agentsLoading, setAgentsLoading] = useState(false);


  const fetchAgents = useCallback(async (newOffset = 0) => {
    setAgentsLoading(true);
    try {
      const res = await api.get(`/tickets/agents?limit=${agentLimit}&offset=${newOffset}`, {
        withCredentials: true
      });
      if (newOffset === 0) {
        setAgents(res.data.items);
      } else {
        setAgents((prev) => [...prev, ...res.data.items]);
      }
      setAgentOffset(newOffset);
      setAgentNextOffset(res.data.next_offset);
    } catch (err) {
      console.error("Failed to fetch agents", err);
    } finally {
      setAgentsLoading(false);
    }
  }, [agentLimit]);


  const fetchNextAgentPage = () => {
    if (agentNextOffset !== null) fetchAgents(agentNextOffset);
  };



  return (
    <TicketContext.Provider
      value={{
        tickets,
        loading,
        fetchTickets,
        createTicket,
        updateTicket,
        addComment,
        socket,
        offset,
        nextOffset,
        limit,
        agents,
        fetchAgents,
        fetchNextAgentPage,
        agentsLoading
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
