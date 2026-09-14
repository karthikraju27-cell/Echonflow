/** Only known internal destinations may survive an authentication redirect. */
export function authDestination(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, "https://echonflow.com");
    if (url.origin !== "https://echonflow.com" || !value.startsWith("/") || value.startsWith("//")) return undefined;
    if (url.pathname === "/provider") return "/provider";
    if (url.pathname === "/seeker") return "/seeker";
    if (url.pathname === "/provider/onboarding") return "/provider/onboarding";
    if (url.pathname === "/varta") return "/varta";
    if (url.pathname === "/admin/crm") return "/admin/crm";
    if (url.pathname === "/era") {
      const org = url.searchParams.get("org");
      return org ? "/era?org=" + encodeURIComponent(org) : "/era";
    }
    if (url.pathname === "/auth/reset-password") {
      const destination = authDestination(url.searchParams.get("next"));
      return destination
        ? "/auth/reset-password?next=" + encodeURIComponent(destination)
        : "/auth/reset-password";
    }
  } catch { return undefined; }
  return undefined;
}
