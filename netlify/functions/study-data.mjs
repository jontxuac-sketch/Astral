import { getStore } from "@netlify/blobs";
import { getDatabase } from "@netlify/database";
import { requireUser, jsonError } from "../lib/auth.mjs";

const store = () => getStore({ name: "astra-study-data", region: "eu-central-1" });
const keyFor = (user) => `accounts/${user.id}/courses.json`;

async function readCourses(user) {
  const db = getDatabase();
  const accountId = String(user.id);
  const rows = await db.sql`SELECT courses FROM account_study_data WHERE account_id = ${accountId}`;
  if (Array.isArray(rows[0]?.courses)) return rows[0].courses;

  // Import existing per-account Blob data once, without overwriting a newer concurrent save.
  const legacyCourses = await store().get(keyFor(user), { type: "json" });
  if (!Array.isArray(legacyCourses) || legacyCourses.length === 0) return [];
  await db.sql`INSERT INTO account_study_data (account_id, courses)
    VALUES (${accountId}, ${JSON.stringify(legacyCourses)}::jsonb)
    ON CONFLICT (account_id) DO NOTHING`;
  const migrated = await db.sql`SELECT courses FROM account_study_data WHERE account_id = ${accountId}`;
  return Array.isArray(migrated[0]?.courses) ? migrated[0].courses : legacyCourses;
}

async function saveCourses(user, courses) {
  const accountId = String(user.id);
  await getDatabase().sql`INSERT INTO account_study_data (account_id, courses)
    VALUES (${accountId}, ${JSON.stringify(courses)}::jsonb)
    ON CONFLICT (account_id) DO UPDATE
    SET courses = EXCLUDED.courses, updated_at = NOW()`;

  // Keep the former store current for compatibility with an older app deployment.
  try {
    await store().setJSON(keyFor(user), courses);
  } catch (error) {
    console.error("No se pudo actualizar la copia heredada de cursos.", error);
  }
}

export default async (request) => {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  if (request.method === "GET") {
    return Response.json({ courses: await readCourses(auth.user) });
  }
  if (request.method === "PUT") {
    let body;
    try { body = await request.json(); } catch { return jsonError("Los datos enviados no son válidos."); }
    const allowedLanguages = new Set(["es", "eu", "en"]);
    if (!Array.isArray(body.courses) || body.courses.some((course) => !course?.id || !Array.isArray(course.sources) || course.sources.length > 50 || !allowedLanguages.has(course.language || "es"))) {
      return jsonError("Revisa el idioma, los cursos y el límite de 50 materiales por curso.");
    }
    await saveCourses(auth.user, body.courses);
    return Response.json({ ok: true });
  }
  return new Response("Método no permitido", { status: 405, headers: { Allow: "GET, PUT" } });
};
