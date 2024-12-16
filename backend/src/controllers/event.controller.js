import { oAuth2Client, calendar } from "../utils/oAuthConfig.js";
import { Event } from "../models/Event.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { subscribeToWatchEventsLogic } from "../utils/watchEventSubscription.js";
import { User } from "../models/User.model.js";

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

  console.log(result.data);

  const createdEvent = await Event.create({
    name,
    date,
    time,
    googleEventId: result.data.id,
    etag: result.data.etag,
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
  // const { token } = req.body;

  // oAuth2Client.setCredentials({ refresh_token: token });
  // await oAuth2Client.getAccessToken();

  // const result = await calendar.events.list({
  //   calendarId: "primary",
  //   timeMin: new Date().toISOString(),
  //   maxResults: 10,
  //   singleEvents: true,
  //   orderBy: "startTime",
  // });

  // fetch events from Local database
  const events = await Event.find();

  res.status(201).json({
    success: true,
    events,
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
  const { eventId } = req.params;
  const { token } = req.query;

  console.log("131 eventId", eventId);

  oAuth2Client.setCredentials({ refresh_token: token });
  await oAuth2Client.getAccessToken();

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  await calendar.events.delete({
    calendarId: "primary",
    eventId: event.googleEventId,
  });

  await event.deleteOne();

  res
    .status(200)
    .json({ success: true, message: "Event deleted successfully" });
});

export const handleGoogleNotification = asyncHandler(async (req, res) => {
  const channelId = req.headers["x-goog-channel-id"];
  const resourceId = req.headers["x-goog-resource-id"];
  const resourceState = req.headers["x-goog-resource-state"];

  console.log("Notification Received:", {
    channelId,
    resourceId,
    resourceState,
  });

  const user = await User.findOne({ $or: [{ channelId }, { resourceId }] });

  if (!user) {
    console.error("No user found for the notification");
    return res.status(404).send("User not found");
  }

  const { refresh_token, syncToken } = user;
  oAuth2Client.setCredentials({ refresh_token });
  await oAuth2Client.getAccessToken();

  try {
    if (resourceState === "sync") {
      console.log("Sync state received. No specific actions required.");
    } else if (resourceState === "exists") {
      const params = {
        calendarId: "primary",
        singleEvents: true,
      };

      if (syncToken) {
        params.syncToken = syncToken;
      } else {
        params.updatedMin = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        params.orderBy = "updated";
        params.maxResults = 50;
      }

      const events = await calendar.events.list(params);
      const updatedEvents = events.data.items;
      if (events.data.nextSyncToken) {
        user.syncToken = events.data.nextSyncToken;
        await user.save();
      }

      if (!updatedEvents || updatedEvents.length === 0) {
        console.log("No updated events found.");
        return res.status(200).send("No updated events found.");
      }

      console.log("Updated events list:", events.data.items);

      const lastUpdatedEvent = updatedEvents[updatedEvents.length - 1];
      console.log("Last Updated Event:", lastUpdatedEvent);

      if (lastUpdatedEvent && lastUpdatedEvent.status === "cancelled") {
        // deletion
        console.log(`Event with resourceId ${resourceId} has been deleted.`);

        console.log("etag of event to be deleted -> ", lastUpdatedEvent.etag);

        const deletedEvent = await Event.findOneAndDelete({
          etag: lastUpdatedEvent.etag,
        });

        console.log("217 deletedEvent", deletedEvent);

        if (deletedEvent) {
          console.log(`Deleted Local Event:`, deletedEvent);
        } else {
          console.warn(
            `No local event found with resourceId ${resourceId} to delete.`
          );
        }
      } else if (lastUpdatedEvent) {
        const existingEvent = await Event.findOne({
          etag: lastUpdatedEvent.etag,
        });

        console.log("363 existing Event Details -> ", existingEvent);

        if (existingEvent) {
          // Update local event if it exists
          const updatedLocalEvent = await Event.findOneAndUpdate(
            { googleEventId: lastUpdatedEvent.id },
            {
              name: lastUpdatedEvent.summary,
              date: lastUpdatedEvent.start.dateTime.split("T")[0],
              time: lastUpdatedEvent.start.dateTime.split("T")[1],
              etag: lastUpdatedEvent.etag,
            },
            { new: true }
          );
          console.log("Updated Local Event:", updatedLocalEvent);
        } else {
          // Create new event locally if it doesn't exist
          const newEvent = await Event.create({
            googleEventId: lastUpdatedEvent.id,
            name: lastUpdatedEvent.summary,
            date: lastUpdatedEvent.start.dateTime.split("T")[0],
            time: lastUpdatedEvent.start.dateTime.split("T")[1],
            etag: lastUpdatedEvent.etag,
          });
          console.log("Created New Local Event:", newEvent);
        }
      }
    }
  } catch (error) {
    if (error.code === 410) {
      console.error("Sync token expired. Reinitializing sync.");
      user.syncToken = null; // Clear expired syncToken
      await user.save();
    } else {
      console.error("Error processing notification:", error.message);
    }
  }

  res.status(200).send("Notification processed");
});
