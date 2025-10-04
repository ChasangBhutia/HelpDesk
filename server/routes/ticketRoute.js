const express = require('express');
const { createTicket, listTickets, getTicket, patchTicket, addComment } = require('../controllers/ticketController');
const { allowRoles } = require('../middleware/roleMiddleware');
const router = express.Router();

router.post('/', createTicket);
router.get("/", listTickets);
router.get("/:id", getTicket);
router.patch("/:id", allowRoles("agent", "admin"), patchTicket);
router.post("/:id/comments", allowRoles("user", "agent", "admin"), addComment);

module.exports = router;