import * as jwt from "jsonwebtoken";

export const APP_SECRET = "3l!h!rm@s3cr3t3";

export interface AuthTokenPayload {
  userId: number;
}

export function decodeAuthHeader(
  authHeader: String
): AuthTokenPayload | string {
  try {
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Error("No token found");
    }
    return jwt.verify(token, APP_SECRET) as AuthTokenPayload;
  } catch (error) {
    console.log(error);
    return "Something went  wrong";
  }
}
