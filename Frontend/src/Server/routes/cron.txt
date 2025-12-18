const express = require("express");
const router = express.Router();

const runAutoOrders = require("../cron/autoOrders");

router.post("/run-subscription-cron", async (req, res) => {
  try {
    const count = await runAutoOrders();
    return res
      .status(200)
      .json({ message: `Auto-created ${count} subscription orders.` });
  } catch (error) {
    console.error("Cron job failed:", error);
    return res.status(500).json({ error: "Subscription cron job failed." });
  }
});

module.exports = router;
