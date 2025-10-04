const mongoose = require("mongoose");

const idempotencySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    response: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }
});

module.exports = mongoose.model("idempotencyKey", idempotencySchema);
