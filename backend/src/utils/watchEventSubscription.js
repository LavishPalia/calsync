import { User } from "../models/User.model.js";
import { oAuth2Client, calendar } from "./oAuthConfig.js";

export const subscribeToWatchEventsLogic = async (
  token,
  webhookUrl,
  oldChannelId
) => {
  oAuth2Client.setCredentials({ refresh_token: token });
  await oAuth2Client.getAccessToken();

  if (oldChannelId) {
    try {
      await calendar.channels.stop({
        resource: {
          id: oldChannelId,
        },
      });
    } catch (error) {
      console.error("Failed to stop the old channel:", error.message);
    }
  }

  const response = await calendar.events.watch({
    calendarId: "primary",
    resource: {
      id: `channel-${Date.now()}`,
      type: "web_hook",
      address: webhookUrl,
    },
  });

  console.log("Subscription created:", response.data);

  const { id: channelId, resourceId } = response.data;

  await User.updateOne(
    { refresh_token: token },
    {
      $set: {
        channelId,
        resourceId,
      },
    }
  );

  return response.data;
};
