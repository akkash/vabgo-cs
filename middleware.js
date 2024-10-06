import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes:['/','/commercial/:path*']
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
};