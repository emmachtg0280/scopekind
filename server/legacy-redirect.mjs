// Keep the original pilot API and its database; move browser visits to Sestet.
import legacy from "../src/worker.js";
export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/"))
      return legacy.fetch(request, env, ctx);
    return new Response(null, {
      status: 307,
      headers: {
        Location: "https://sestet.emmachataigner.workers.dev/" + url.search,
        "Cache-Control": "no-store",
      },
    });
  },
};
