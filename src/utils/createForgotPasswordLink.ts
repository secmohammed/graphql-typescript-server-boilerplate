import { v4 } from "uuid";
import { redis } from "../redis";

export const createForgotPasswordLink = async (url: string, userId: string) => {
    const token = v4();
    await redis.set(token, userId, "ex", 60 * 20); // 20 mins
    return `${url}/change-password/${token}`;
};
