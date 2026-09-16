export function validateApplication(data) {
  if (!data || typeof data !== "object") return null;
  const fields = [
    "name",
    "email",
    "discipline",
    "frequency",
    "message",
    "website",
    "consent",
  ];
  if (
    fields.some(
      (key) => data[key] !== undefined && typeof data[key] !== "string",
    )
  )
    return null;
  const {
    name = "",
    email = "",
    discipline = "",
    frequency = "",
    message = "",
    website = "",
    consent,
  } = data;
  if (website) return null;
  if (
    name.length > 100 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  )
    return null;
  if (
    ![
      "",
      "Brand design",
      "Graphic design",
      "Video editing",
      "Social media",
      "Web design",
      "Development",
      "Copywriting",
      "Photography",
      "Other creative work",
    ].includes(discipline)
  )
    return null;
  if (
    !["", "Rarely", "Sometimes", "Often", "Almost every project"].includes(
      frequency,
    ) ||
    consent !== "on" ||
    message.length > 2000
  )
    return null;
  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    discipline,
    frequency,
    message: message.trim(),
    consent: "beta-contact-v2",
    createdAt: new Date().toISOString(),
  };
}
const json = (body, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/pilot") return env.ASSETS.fetch(request);
    if (request.method !== "POST")
      return json({ error: "Method not allowed" }, 405);
    if (
      request.headers.get("origin") &&
      request.headers.get("origin") !== url.origin
    )
      return json({ error: "Origin not allowed" }, 403);
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return json({ error: "JSON required" }, 415);
    if (Number(request.headers.get("content-length")) > 8192)
      return json({ error: "Request too large" }, 413);
    try {
      const text = await request.text();
      if (text.length > 8192) return json({ error: "Request too large" }, 413);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      const application = validateApplication(data);
      if (!application)
        return json({ error: "Please check your details" }, 400);
      if (!env.DB) return json({ error: "Signup storage unavailable" }, 503);
      const result = await env.DB.prepare(
        `INSERT INTO pilot_applications
        (email, name, discipline, frequency, message, consent, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        ON CONFLICT(email) DO UPDATE SET
        name=COALESCE(NULLIF(excluded.name, ''), pilot_applications.name),
        discipline=COALESCE(NULLIF(excluded.discipline, ''), pilot_applications.discipline),
        frequency=COALESCE(NULLIF(excluded.frequency, ''), pilot_applications.frequency),
        message=COALESCE(NULLIF(excluded.message, ''), pilot_applications.message),
        consent=excluded.consent`,
      )
        .bind(
          application.email,
          application.name,
          application.discipline,
          application.frequency,
          application.message,
          application.consent,
          application.createdAt,
        )
        .run();
      if (!result.success) throw new Error("Storage failed");
      return json({ ok: true }, 201);
    } catch {
      return json({ error: "Unable to save application" }, 503);
    }
  },
};
