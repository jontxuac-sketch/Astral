import { getStore } from "@netlify/blobs";
import { requireUser, jsonError } from "../lib/auth.mjs";

const store = () => getStore({ name: "astra-study-data", region: "eu-central-1" });
const keyFor = (user) => `accounts/${user.id}/courses.json`;

export default async (request) => {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const key = keyFor(auth.user);
  if (request.method === "GET") {
    const courses = await store().get(key, { type: "json" });
    return Response.json({ courses: Array.isArray(courses) ? courses : [] });
  }
  if (request.method === "PUT") {
    let body;
    try { body = await request.json(); } catch { return jsonError("Los datos enviados no son válidos."); }
    const allowedLanguages = new Set(["es", "eu", "en"]);
    if (!Array.isArray(body.courses) || body.courses.some((course) => !course?.id || !Array.isArray(course.sources) || course.sources.length > 50 || !allowedLanguages.has(course.language || "es"))) {
      return jsonError("Revisa el idioma, los cursos y el límite de 50 materiales por curso.");
    }
    await store().setJSON(key, body.courses);
    return Response.json({ ok: true });
  }
  return new Response("Método no permitido", { status: 405, headers: { Allow: "GET, PUT" } });
};
