import { getUser } from "@netlify/identity";

export async function requireUser() {
  const user = await getUser();
  if (!user) return { response: Response.json({ error: "Inicia sesión para continuar." }, { status: 401 }) };
  return { user };
}

export function jsonError(error, status = 400) {
  return Response.json({ error }, { status });
}
