import express from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  updateEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

router.post("/all", getAllEvents);
router.post("/create", createEvent);
router.delete("/delete/:googleEventId", deleteEvent);
router.patch("/update/:googleEventId", updateEvent);

export default router;
