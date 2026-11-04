import { signup, verifyRequestOrigin } from "@netlify/identity";
import { jsonError } from "../lib/auth.mjs";

export default async (request) => {
  try {
    verifyRequestOrigin(request);
    const { email, password, name } = await request.json();
    if (!email || !password || password.length < 8 || !name?.trim()) return jsonError("Revisa el nombre, correo y contraseña (mínimo 8 caracteres).");
    await signup(email.trim(), password, { full_name: name.trim() });
    return Response.json({ ok: true, confirmationRequired: true });
  } catch (error) {
    return jsonError(error.message || "No se pudo crear la cuenta.", 400);
  }
};
