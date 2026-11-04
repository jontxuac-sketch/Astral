import { getStore } from "@netlify/blobs";
import { requireUser, jsonError } from "../lib/auth.mjs";

const store = () => getStore({ name: "astra-study-files", region: "eu-central-1" });
const safePart = (value) => /^[a-zA-Z0-9_-]{1,100}$/.test(value || "");

export default async (request) => {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const url = new URL(request.url);
  const course = url.searchParams.get("course");
  const source = url.searchParams.get("source");
  if (!safePart(course) || !safePart(source)) return jsonError("Identificador de material no válido.");
  const key = `accounts/${auth.user.id}/${course}/${source}`;
  if (request.method === "PUT") {
    const file = await request.arrayBuffer();
    if (!file.byteLength || file.byteLength > 4 * 1024 * 1024) return jsonError("El bloque de archivo no es válido.", 413);
    let name = request.headers.get("x-file-name") || "material";
    try { name = decodeURIComponent(name); } catch {}
    const chunk = Number(url.searchParams.get("chunk"));
    const total = Number(url.searchParams.get("total"));
    if (!Number.isInteger(chunk) || !Number.isInteger(total) || total < 1 || total > 10000 || chunk < 0 || chunk >= total) return jsonError("El bloque de archivo no es válido.");
    const blobs = store();
    await blobs.set(`${key}/parts/${chunk}`, file);
    if (chunk === total - 1) {
      const size = Number(request.headers.get("x-file-size"));
      await blobs.setJSON(`${key}/manifest.json`, { chunks: total, name: name.slice(0, 180), type: request.headers.get("content-type") || "application/octet-stream", size });
    }
    return Response.json({ ok: true });
  }
  if (request.method === "GET") {
    const manifest = await store().get(`${key}/manifest.json`, { type: "json" });
    if (!manifest) return jsonError("No se encontró el archivo.", 404);
    const chunk = Number(url.searchParams.get("chunk"));
    if (!Number.isInteger(chunk) || chunk < 0 || chunk >= manifest.chunks) return jsonError("Número de bloque no válido.");
    const part = await store().get(`${key}/parts/${chunk}`, { type: "arrayBuffer" });
    if (!part) return jsonError("No se encontró una parte del archivo.", 404);
    return new Response(part, { headers: { "Content-Type": "application/octet-stream", "Cache-Control": "private, no-store" } });
  }
  return new Response("Método no permitido", { status: 405, headers: { Allow: "GET, PUT" } });
};
