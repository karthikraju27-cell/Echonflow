import { authDestination } from "@/lib/auth-destination";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Keeps the Supabase session cookie fresh on every request, and enforces the
// provider/seeker split: a provider account should never see /seeker/*, and
// a seeker should never see /provider/*.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProviderRoute = path.startsWith("/provider");
  const isSeekerRoute = path.startsWith("/seeker");
  const isAuthRoute = path.startsWith("/auth");

  if (!user) {
    if (isProviderRoute || isSeekerRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Signed in — look up their role to route/guard correctly.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (isProviderRoute && role !== "provider") {
    const url = request.nextUrl.clone();
    url.pathname = "/seeker";
    return NextResponse.redirect(url);
  }

  if (isSeekerRoute && role !== "seeker") {
    const url = request.nextUrl.clone();
    url.pathname = "/provider";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && path !== "/auth/callback") {
    const url = request.nextUrl.clone();
    const destination = authDestination(request.nextUrl.searchParams.get("next"));
    const target = new URL(destination ?? (role === "provider" ? "/provider" : "/seeker"), request.url);
    url.pathname = target.pathname;
    url.search = target.search;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
