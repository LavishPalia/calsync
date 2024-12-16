import express from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  updateEvent,
  handleGoogleNotification,
} from "../controllers/event.controller.js";

const router = express.Router();

router.post("/all", getAllEvents);
router.post("/create", createEvent);
router.delete("/delete/:eventId", deleteEvent);
router.patch("/update/:googleEventId", updateEvent);

router.post("/notifications", handleGoogleNotification);

export default router;
