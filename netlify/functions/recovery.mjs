import { requestPasswordRecovery, verifyRequestOrigin } from "@netlify/identity";
import { jsonError } from "../lib/auth.mjs";

export default async (request) => {
  try {
    verifyRequestOrigin(request);
    const { email } = await request.json();
    if (!email) return jsonError("Escribe tu correo electrónico.");
    await requestPasswordRecovery(email.trim());
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error.message || "No se pudo enviar el correo de recuperación.", 400);
  }
};
