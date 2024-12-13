import { google } from "googleapis";
import axios from "axios";

import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

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
    });
  }

  return res.status(200).json({
    success: true,
    user,
    token: tokens.refresh_token,
  });
});
