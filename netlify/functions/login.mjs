import { login, verifyRequestOrigin } from "@netlify/identity";
import { jsonError } from "../lib/auth.mjs";

export default async (request) => {
  try {
    verifyRequestOrigin(request);
    const { email, password } = await request.json();
    if (!email || !password) return jsonError("Escribe tu correo y contraseña.");
    await login(email.trim(), password);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error.message || "No se pudo iniciar sesión.", 401);
  }
};
