import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

// Next.js 16 renamed the `middleware` file convention to `proxy`; the handler
// signature is unchanged, so next-intl's middleware factory drops straight in.
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes and anything with a file extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
