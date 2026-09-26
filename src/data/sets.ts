import summariesJson from "./summaries.json";
import type { IconManifest, SetSummary } from "../types";

export const summaries = summariesJson as unknown as SetSummary[];

const cache = new Map<string, IconManifest>();
const inflight = new Map<string, Promise<IconManifest>>();

export function findSummary(id: string): SetSummary | undefined {
  return summaries.find((s) => s.id === id);
}

/** Lazily fetch a set manifest (each is its own static file in /manifests). */
export function loadManifest(id: string): Promise<IconManifest> {
  const known = findSummary(id);
  if (!known) return Promise.reject(new Error(`Unknown icon set "${id}".`));

  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);

  const pending = inflight.get(id);
  if (pending) return pending;

  const request = fetch(`${import.meta.env.BASE_URL}manifests/${id}.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`Could not load ${known.name} (HTTP ${res.status}).`);
      return res.json() as Promise<IconManifest>;
    })
    .then((manifest) => {
      cache.set(id, manifest);
      inflight.delete(id);
      return manifest;
    })
    .catch((err) => {
      inflight.delete(id);
      throw err;
    });

  inflight.set(id, request);
  return request;
}
