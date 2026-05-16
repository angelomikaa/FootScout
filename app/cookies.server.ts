import { createCookie } from "react-router";

export const scoutCookie = createCookie("scout-id", {
  maxAge: 604_800, // 7 days (OpenCode's discretion - D-13)
  path: "/",
  sameSite: "lax",
});

export async function getScoutIdFromCookie(
  request: Request
): Promise<string | null> {
  const cookieHeader = request.headers.get("Cookie");
  const value = (await scoutCookie.parse(cookieHeader)) || null;
  return value;
}

export async function setScoutIdCookie(scoutId: string): Promise<string> {
  return await scoutCookie.serialize(scoutId);
}

export const divisionUserCookie = createCookie("division-user-id", {
  maxAge: 604_800, // 7 days
  path: "/",
  sameSite: "lax",
});

export async function getDivisionUserIdFromCookie(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("Cookie");
  const value = (await divisionUserCookie.parse(cookieHeader)) || null;
  return value;
}

export async function setDivisionUserIdCookie(userId: string): Promise<string> {
  return await divisionUserCookie.serialize(userId);
}
