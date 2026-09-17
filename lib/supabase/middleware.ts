import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes the session cookie and gates every route behind /login. */
export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: don't remove — refreshes the auth token via a real
  // server round-trip. getSession() alone doesn't validate the JWT.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login gate temporarily disabled — re-enable once magic link auth is in place.
  // const isLoginRoute = request.nextUrl.pathname === "/login";
  //
  // if (!user && !isLoginRoute) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   url.searchParams.set("next", request.nextUrl.pathname);
  //   return NextResponse.redirect(url);
  // }
  //
  // if (user && isLoginRoute) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/";
  //   url.searchParams.delete("next");
  //   return NextResponse.redirect(url);
  // }

  return response;
}
