const mongoose = require('mongoose');
const idempotencyKeyModel = require("../models/idempotencyKeyModel");
const ticketModel = require("../models/ticketModel");
const userModel = require('../models/userModel');

function buildSearchFilter(q) {
    if (!q) return {};
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); // escape & case-insensitive
    return {
        $or: [
            { title: regex },
            { description: regex },
            { "comments.message": regex } // will match any comment message
        ]
    };
}

module.exports.createTicket = async (req, res) => {
    const io = req.app.get("io");
    const { title, description, priority, slaHours } = req.body;
    const idempotencyKey = req.headers["idempotency-key"];

    if (!title || !description) return res.status(400).json({
        error: {
            code: "FIELDS_REQUIRED",
            message: "Title and description are required"
        }
    })

    try {
        if (idempotencyKey) {
            const existing = await idempotencyKeyModel.findOne({ key: idempotencyKey });
            if (existing) return res.status(200).json(existing.response);
        }
        const user = await userModel.findById(req.user._id);

        if (!user) return res.status(404).json({
            error: {
                code: "USER_NOT_FOUND",
                field: "userId",
                message: "Authenticated user not found"
            }
        })

        const ticket = await ticketModel.create({
            title,
            description,
            priority,
            slaHours,
            createdBy: req.user._id
        })

        user.ticketRaised.push(ticket);
        await user.save()

        ticket.timeline.push({ action: "created", by: req.user._id, meta: { priority: ticket.priority } });
        await ticket.save();


        const response = {
            success: true,
            message: "Ticket created successfully",
            data: { ticket }
        }

        if (idempotencyKey) {
            await idempotencyKeyModel.create({ key: idempotencyKey, response });
        }

        if (io) io.emit("ticket:created", ticket);

        return res.status(201).json(response);

    } catch (err) {
        console.error(`Error creating ticket: ${err.message}`);
        return res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "Something went wrong on the server"
            }
        });
    }
}

// GET /api/tickets?limit=&offset=&q=&breached=true
// GET /api/tickets?limit=&offset=&q=&breached=true
module.exports.listTickets = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
        const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);
        const q = req.query.q;
        const breachedFilter = req.query.breached === "true";

        const filter = buildSearchFilter(q);

        // role filter: users see only their tickets
        if (req.user.role === "user") filter.createdBy = req.user._id;

        if (breachedFilter) {
            filter.slaBreached = true;
        }

        // find tickets
        let items = await ticketModel.find(filter)
            .populate("createdBy", "fullname email")
            .populate("assignedTo", "fullname email")
            .sort({
                slaBreached: -1, // breached tickets come first
                createdAt: -1    // latest tickets on top
            })
            .skip(offset)
            .limit(limit);

        const nextOffset = items.length < limit ? null : offset + items.length;

        return res.status(200).json({ success: true, items, next_offset: nextOffset });
    } catch (err) {
        console.error("listTickets", err);
        return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to list tickets" } });
    }
};


module.exports.getTicket = async (req, res) => {
    try {
        const ticket = await ticketModel.findById(req.params.id)
            .populate("createdBy", "fullname email")
            .populate("assignedTo", "fullname email")
            .populate("comments.user", "fullname email")
            .lean();

        if (!ticket) return res.status(404).json({
            error: {
                code: "NOT_FOUND",
                field: "id",
                message: "Ticket not found"
            }
        });
        if (req.user.role === "user" && String(ticket.createdBy._id) !== String(req.user._id)) {
            return res.status(403).json({
                error: {
                    code: "ACCESS_DENIED",
                    message: "Access denied"
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: { ticket }
        })
    } catch (err) {
        console.error("getTicket", err);
        return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch ticket" } });
    }

}

// PATCH /api/tickets/:id
// optimistic locking required: client must send If-Match header with the current __v

module.exports.patchTicket = async (req, res) => {
    const io = req.app.get("io");
    const ticketId = req.params.id;
    const patch = req.body; // allowed fields: status, assignedTo, priority, slaHours
    const ifMatch = req.headers["if-match"];

    // 1. If-Match header required
    if (!ifMatch) {
        return res.status(400).json({ error: { code: "IF_MATCH_REQUIRED", field: "if-match", message: "If-Match header (ticket version) required" } });
    }

    // 2. Parse expected version
    const expectedVersion = parseInt(ifMatch, 10);
    if (Number.isNaN(expectedVersion)) {
        return res.status(400).json({ error: { code: "INVALID_IF_MATCH", field: "if-match", message: "Invalid If-Match header" } });
    }

    try {
        // 3. Load current ticket
        const ticket = await ticketModel.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
        }

        // 4. Optimistic locking check
        if (ticket.__v !== expectedVersion) {
            return res.status(409).json({ error: { code: "STALE_PATCH", message: "Resource version mismatch" } });
        }

        // 5. Role-based enforcement
        if (patch.assignedTo && !["agent", "admin"].includes(req.user.role)) {
            return res.status(403).json({ error: { code: "FORBIDDEN", field: "assignedTo", message: "Only agents/admins can assign tickets" } });
        }

        // 6. Apply changes and log them
        const changes = {};

        if (patch.status && patch.status !== ticket.status) {
            changes.status = { from: ticket.status, to: patch.status };
            ticket.status = patch.status;
        }

        if (patch.assignedTo && String(patch.assignedTo) !== String(ticket.assignedTo)) {
            changes.assignedTo = { from: ticket.assignedTo, to: patch.assignedTo };
            ticket.assignedTo = patch.assignedTo;
            const agent = await userModel.findById(patch.assignedTo);
            if (!agent) return res.status(404).json({
                error: {
                    code: "USER_NOT_FOUND",
                    field: "userId",
                    message: "Authenticated user not found"
                }
            })
            agent.ticketAssigned.push(ticket._id);
            await agent.save();
        }

        if (patch.priority && patch.priority !== ticket.priority) {
            changes.priority = { from: ticket.priority, to: patch.priority };
            ticket.priority = patch.priority;
        }

        if (patch.slaHours && patch.slaHours !== ticket.slaHours) {
            changes.slaHours = { from: ticket.slaHours, to: patch.slaHours };
            ticket.slaHours = patch.slaHours;
            // slaDeadline will be recalculated in pre('save') if you implemented it
        }

        // 7. No changes provided
        if (Object.keys(changes).length === 0) {
            return res.status(400).json({ error: { code: "NO_CHANGES", message: "No updatable fields provided" } });
        }

        // 8. Push timeline entry
        ticket.timeline.push({ action: "updated", by: req.user._id, meta: changes });

        // 9. Save ticket (increments __v)
        await ticket.save();

        // 10. Emit real-time event
        if (io) io.emit("ticket:updated", ticket);

        // 11. Return success response
        return res.status(200).json({ success: true, message: "Ticket updated", data: { ticket } });

    } catch (err) {
        console.error("patchTicket", err);
        return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to update ticket" } });
    }
};


// POST /api/tickets/:id/comments
module.exports.addComment = async (req, res) => {
    const io = req.app.get("io");
    const ticketId = req.params.id;
    const { message } = req.body;

    // Validate input
    if (!message) {
        return res.status(400).json({
            error: {
                code: "FIELD_REQUIRED",
                field: "message",
                message: "Message is required"
            }
        });
    }

    try {
        // Find the ticket
        const ticket = await ticketModel.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                error: {
                    code: "NOT_FOUND",
                    field: "ticketId",
                    message: "Ticket not found"
                }
            });
        }

        // Permission check: users can only comment on their own tickets; agents/admins can comment on any
        if (req.user.role === "user" && String(ticket.createdBy) !== String(req.user._id)) {
            return res.status(403).json({
                error: {
                    code: "FORBIDDEN",
                    field: "user",
                    message: "Access denied"
                }
            });
        }

        // Add the comment
        ticket.comments.push({ user: req.user._id, message });

        // Log to timeline
        ticket.timeline.push({
            action: "comment_added",
            by: req.user._id,
            meta: { message: message.slice(0, 200) }
        });

        await ticket.save();

        const comment = ticket.comments[ticket.comments.length - 1];

        // Emit real-time event
        if (io) io.emit("ticket:comment", { ticketId: ticket._id, comment });

        return res.status(201).json({
            success: true,
            message: "Comment added",
            data: { comment }
        });

    } catch (err) {
        console.error("addComment", err);
        return res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to add comment"
            }
        });
    }
};
