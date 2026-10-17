import type { EnvName } from "./env";

export interface SiteUrls {
  webUrl: string;
  apiUrl: string;
}

// Web and API base per environment, each a full URL: the API may sit on the web host under a path, on another port,
// or on another domain. Leave an env out when the site does not exist there.
const URLS: Partial<Record<EnvName, SiteUrls>> = {
  dev: { webUrl: "http://localhost:5273", apiUrl: "http://localhost:5273" },
  prd: { webUrl: "https://levananhduc.github.io/web-game-duck-defense", apiUrl: "https://levananhduc.github.io/web-game-duck-defense" },
};

// undefined when the site has no URL for this env; playwright.config uses it so loading the config never throws.
export function findUrls(env: EnvName): SiteUrls | undefined {
  return URLS[env];
}

export function getUrls(env: EnvName): SiteUrls {
  const urls = findUrls(env);
  if (!urls) throw new Error(`Duck Defense has no URL for ENV=${env}`);
  return urls;
}
