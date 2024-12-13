import { google } from "googleapis";
import { oAuth2Client } from "./auth.controller.js";
import { Event } from "../models/Event.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const calendar = google.calendar({
  version: "v3",
  auth: oAuth2Client,
});

// Route  POST
// Params event name, date, time and the refresh_token of the user
// Desc   Create new event in the Google Calendar
export const createEvent = asyncHandler(async (req, res) => {
  const { name, date, time, token } = req.body;

  oAuth2Client.setCredentials({ refresh_token: token });
  await oAuth2Client.getAccessToken();

  const startDateTime = new Date(`${date}T${time}`).toISOString();
  const endDateTime = new Date(`${date}T${time}`).toISOString();

  const event = {
    summary: name,
    start: { dateTime: startDateTime },
    end: { dateTime: endDateTime },
  };

  const result = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  const createdEvent = await Event.create({
    name,
    date,
    time,
    googleEventId: result.data.id,
  });

  console.log(createdEvent);

  res.status(201).json({
    success: true,
    createdEvent,
  });
});

// Route  GET
// Params refresh_token of the user
// Desc   Get all the events from the Google Calendar
export const getAllEvents = asyncHandler(async (req, res) => {
  const { token } = req.body;

  oAuth2Client.setCredentials({ refresh_token: token });
  await oAuth2Client.getAccessToken();

  const result = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  res.status(201).json({
    success: true,
    events: result.data.items,
    message: "Fetched events from Google Calendar successfully",
  });
});

// Route  PATCH
// Params Event name/date/time and refresh_token of the user
// Desc   Update an event in the Google Calendar
export const updateEvent = asyncHandler(async (req, res) => {
  const { name, date, time, token } = req.body;
  const { googleEventId } = req.params;

  oAuth2Client.setCredentials({ refresh_token: token });
  await oAuth2Client.getAccessToken();

  const event = await calendar.events.get({
    calendarId: "primary",
    eventId: googleEventId,
  });

  const updatedEvent = {
    ...event.data,
    summary: name || event.data.summary,
    start: {
      dateTime: time
        ? new Date(`${date}T${time}`).toISOString()
        : event.data.start.dateTime,
    },
    end: {
      dateTime: time
        ? new Date(`${date}T${time}`).toISOString()
        : event.data.start.dateTime,
    },
  };

  const result = await calendar.events.update({
    calendarId: "primary",
    eventId: googleEventId,
    resource: updatedEvent,
  });

  const updatedLocalEvent = await Event.findOneAndUpdate(
    { googleEventId },
    {
      name: updatedEvent.summary,
      date: date || event.data.start.dateTime.split("T")[0],
      time: time || event.data.start.dateTime.split("T")[1],
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    updatedEvent: updatedLocalEvent || updatedEvent,
  });
});

// Route  DELETE
// Params Event ID and the refresh_token of the user
// Desc   Delete an event from the Google Calendar
export const deleteEvent = asyncHandler(async (req, res) => {
  const { googleEventId } = req.params;
  const { token } = req.query;

  oAuth2Client.setCredentials({ refresh_token: token });
  await oAuth2Client.getAccessToken();

  await calendar.events.delete({
    calendarId: "primary",
    eventId: googleEventId,
  });

  res
    .status(200)
    .json({ success: true, message: "Event deleted successfully" });
});
