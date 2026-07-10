/**
 * Instagram, Facebook, Messenger and TikTok open links in an embedded WebView
 * whose geolocation permission is tied to the host app rather than the browser
 * engine. Tapping "Allow" in these often does not unlock navigator.geolocation,
 * so we detect them to steer users toward their system browser instead.
 */
export function getInAppBrowser(): "instagram" | "facebook" | "tiktok" | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";

  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return "facebook";
  if (/TikTok|BytedanceWebview|Bytedance/i.test(ua)) return "tiktok";
  return null;
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
}

/**
 * Android intent link that most in-app WebViews will honor as a real
 * navigation, launching the URL directly in Chrome. No iOS equivalent
 * exists reliably from inside an embedded WebView.
 */
export function buildAndroidChromeIntentUrl(url: string): string {
  const withoutScheme = url.replace(/^https?:\/\//, "");
  return `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;end;`;
}
