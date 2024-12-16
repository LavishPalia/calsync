import axios from "axios";

import { oAuth2Client } from "../utils/oAuthConfig.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { subscribeToWatchEventsLogic } from "../utils/watchEventSubscription.js";

export const googleLogin = asyncHandler(async (req, res) => {
  const { tokens } = await oAuth2Client.getToken(req.query.code);
  oAuth2Client.setCredentials(tokens);

  const userResponse = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
  );

  const { email, name, picture } = userResponse.data;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      avatar: picture,
      refresh_token: tokens.refresh_token,
      channelId: "",
      resourceId: "",
    });
  }

  console.log(user);
  console.log(user.channelId);

  const oldChannelId = user.channelId !== "" ? user.channelId : null;

  console.log(oldChannelId);

  console.log(user.channelId);

  if (user.refresh_token) {
    const webhookUrl =
      "https://9f35-2409-40d4-34-6a6f-b50a-39de-20e2-ef86.ngrok-free.app/events/notifications";

    try {
      await subscribeToWatchEventsLogic(
        user.refresh_token,
        webhookUrl,
        oldChannelId
      );
    } catch (error) {
      console.error("Failed to subscribe to watch events:", error.message);
    }
  }

  return res.status(200).json({
    success: true,
    user,
    token: tokens.refresh_token,
  });
});
