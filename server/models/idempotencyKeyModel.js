const mongoose = require("mongoose");


const idempotencySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    response: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 }
});

module.exports = mongoose.model("idempotencyKey", idempotencySchema);
