// jobs/slaChecker.js
const cron = require("node-cron");
const ticketModel = require("../models/ticketModel");

module.exports.startSlaChecker = (io) => {
  // runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // find tickets that have breached SLA
      const tickets = await ticketModel.find({
        slaBreached: false,
        slaDeadline: { $lte: now },
        status: { $ne: "resolved" }
      });

      if (tickets.length === 0) return; // nothing to do

      for (const ticket of tickets) {
        ticket.slaBreached = true;
        ticket.timeline.push({ action: "sla_breached", by: null, meta: { timestamp: now } });
        await ticket.save();

        // emit real-time event to frontend
        if (io) {
          io.emit("ticket:slaBreached", {
            ticketId: ticket._id,
            title: ticket.title,
            breachedAt: now,
          });
        }

        console.log(`SLA breached for ticket: ${ticket._id}`);
      }
    } catch (err) {
      console.error("SLA checker error", err);
    }
  });
};
