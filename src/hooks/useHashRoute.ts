import { useEffect, useRef, useState } from "react";

export type Route =
  | { page: "home" }
  | { page: "libraries" }
  | { page: "set"; setId: string; category?: string; query?: string };

function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, "");
  const pathname = path.split("?")[0];
  if (pathname === "/libraries" || pathname === "/libraries/") return { page: "libraries" };
  const match = pathname.match(/^\/set\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?\/?$/i);
  if (match) {
    const params = new URLSearchParams(path.split("?")[1] ?? "");
    return {
      page: "set",
      setId: match[1],
      category: match[2] ? decodeURIComponent(match[2]) : undefined,
      query: params.get("q") ?? undefined,
    };
  }
  return { page: "home" };
}

function routeKey(route: Route): string {
  if (route.page === "set") return `set:${route.setId}:${route.category ?? "all"}:${route.query ?? ""}`;
  return route.page;
}

/** Minimal hash router: home, library index, and set/category detail routes. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const previous = useRef(routeKey(route));

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash(window.location.hash);
      const key = routeKey(next);
      setRoute(next);
      // Only reset scroll when the view actually changes so in-page anchors work.
      if (key !== previous.current) {
        previous.current = key;
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}
