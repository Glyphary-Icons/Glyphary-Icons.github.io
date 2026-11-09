/**
 * Freebuff Sites entrypoint for Glyphary.
 *
 * The app is client-rendered and uses hash routes, so every request is served
 * straight from the static asset binding — no server rendering or API routes.
 */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
