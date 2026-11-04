import { logout, verifyRequestOrigin } from "@netlify/identity";

export default async (request) => {
  verifyRequestOrigin(request);
  await logout();
  return Response.json({ ok: true });
};
