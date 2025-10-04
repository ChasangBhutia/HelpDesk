const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

const timelineSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g. "created","assigned","status_updated","comment_added"
    by: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    meta: { type: Object }, // arbitrary payload e.g. { from: "open", to: "in-progress" }
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

const ticketSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: { type: String, enum: ["open", "in-progress", "resolved", "closed"], default: "open" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    slaHours: { type: Number, default: 24 },
    slaDeadline: { type: Date },
    slaBreached: { type: Boolean, default: false },
    comments: [commentSchema],
    timeline: [timelineSchema]
}, { timestamps: true, versionKey: "__v" });

// compute slaDeadline before save if new or slaHours changed
ticketSchema.pre("save", function (next) {
    if (this.isNew || this.isModified("slaHours")) {
        const deadline = new Date(Date.now() + (this.slaHours || 24) * 3600 * 1000);
        this.slaDeadline = deadline;
        this.slaBreached = false;
    }
    next();
});

module.exports = mongoose.model("ticket", ticketSchema);
