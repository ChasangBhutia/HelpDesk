const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        min: [3, "Fullname should have atleast 3 characters"],
        max: [30, "Fullname should not have more than 30 characters"]
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'agent', 'admin'],
        default: 'user'
    },
    ticketRaised: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ticket'
        }
    ],
    ticketAssigned: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ticket',
        }
    ],
    specialties: [
        {
            type: String,
            enum: ['IT', 'HR', 'Finance', 'Operations', 'Customer Support', 'Security', 'Facilities'],
            default: undefined
        }
    ],
    permissions: {
        type: [String],
        default: undefined
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('user', userSchema);