import { gunzipSync, strFromU8 } from "fflate";
import summariesJson from "./summaries.json";
import type { IconEntry, IconManifest, SetSummary } from "../types";

export const summaries = summariesJson as unknown as SetSummary[];

/**
 * Focused collections that general-purpose icon libraries don't cover.
 * The order here drives every custom-collections row on the site.
 */
export const CUSTOM_SET_IDS = [
  "pride-flags",
  "flag-icons",
  "circle-flags",
  "skill-icons",
  "devicon",
] as const;

const CUSTOM_ID_SET = new Set<string>(CUSTOM_SET_IDS);

export const customSets = CUSTOM_SET_IDS.map((id) =>
  summaries.find((set) => set.id === id),
).filter((set): set is SetSummary => Boolean(set));

export const librarySets = summaries.filter((set) => !CUSTOM_ID_SET.has(set.id));

export const customIconCount = customSets.reduce((sum, set) => sum + set.count, 0);
export const totalIconCount = summaries.reduce((sum, set) => sum + set.count, 0);

/** Deep link that opens a set on the view that best represents it. */
export function setHref(set: SetSummary): string {
  if (set.id === "devicon") return `#/set/${set.id}/skills`;
  if (set.id === "flag-icons") return `#/set/${set.id}/country-flags`;
  if (set.id === "circle-flags") return `#/set/${set.id}/circle-flags`;
  if (set.id === "skill-icons") return `#/set/${set.id}/skill-icons`;
  return `#/set/${set.id}`;
}

/**
 * Manifest index written by the build: metadata plus the count of gzip parts that
 * hold the icons (static hosts reject the multi-megabyte unsplit files).
 */
type ManifestIndex = Omit<IconManifest, "icons"> & {
  icons?: IconEntry[];
  parts?: number;
};

const cache = new Map<string, IconManifest>();
const inflight = new Map<string, Promise<IconManifest>>();

async function fetchJson<T>(url: string, label: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${label} (HTTP ${res.status}).`);
  return res.json() as Promise<T>;
}

async function fetchBytes(url: string, label: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${label} (HTTP ${res.status}).`);
  return new Uint8Array(await res.arrayBuffer());
}

/** Join the compressed parts and inflate them back into the full manifest. */
async function readParts(base: string, count: number, label: string): Promise<IconManifest> {
  const parts = await Promise.all(
    Array.from({ length: count }, (_, index) =>
      fetchBytes(`${base}/${index}.bin`, `${label} part ${index}`),
    ),
  );
  const merged = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }
  return JSON.parse(strFromU8(gunzipSync(merged))) as IconManifest;
}

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

  const base = `${import.meta.env.BASE_URL}manifests/${id}`;
  const request = fetchJson<ManifestIndex>(`${base}.json`, known.name)
    .then((index): IconManifest | Promise<IconManifest> => {
      if (index.parts) return readParts(base, index.parts, known.name);
      if (!index.icons) throw new Error(`Could not load ${known.name}: manifest has no icons.`);
      return { ...index, icons: index.icons };
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
