// Phiz deep link utilities based on phizscheme:// spec.
// See: phizscheme_deep_link_spec_en

const PHIZ_APP_ID = process.env.NEXT_PUBLIC_PHIZ_APP_ID ?? "";

export const PHIZ_STORE_URLS = {
  android: "https://play.google.com/store/apps/details?id=live.phiz.app2",
  ios: "https://apps.apple.com/br/app/phiz-chat/id6447375837",
} as const;

/**
 * Builds a `phizscheme://` deep link for the mini-program entry.
 * Format: phizscheme://appId={appId}&path={path}&query={query}
 * Falls back to plain `phizscheme://` when no appId is configured.
 */
export function buildPhizDeepLink(
  path = "/",
  query = ""
): string {
  if (!PHIZ_APP_ID) return "phizscheme://";

  const params = new URLSearchParams();
  params.set("appId", PHIZ_APP_ID);
  params.set("path", path);
  if (query) params.set("query", query);

  return `phizscheme://${params.toString()}`;
}

type Platform = "ios" | "android" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "unknown";
}

/**
 * Attempts to open the Phiz app via deep link.
 * If the app is not installed (page remains visible after timeout),
 * redirects to the appropriate store.
 */
export function openPhizDeepLink(path = "/", query = ""): void {
  const deepLink = buildPhizDeepLink(path, query);
  const platform = detectPlatform();

  const fallbackUrl =
    platform === "ios"
      ? PHIZ_STORE_URLS.ios
      : PHIZ_STORE_URLS.android;

  const start = Date.now();

  window.location.href = deepLink;

  setTimeout(() => {
    // If more than 2s passed and the page is still visible,
    // the app likely isn't installed → redirect to store.
    if (document.visibilityState === "visible" && Date.now() - start < 4000) {
      window.location.href = fallbackUrl;
    }
  }, 2000);
}
