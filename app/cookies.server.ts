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
