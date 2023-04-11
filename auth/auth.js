import { OAuth2Client } from 'google-auth-library';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function authenticateUser(req) {
  // Get token from request
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader) {
    token = authHeader.split(' ')[1];
  }

  // Verify token
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  // Return email from payload
  const payload = ticket.getPayload();
  return payload.email;
}

export { authenticateUser };
