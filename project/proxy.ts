import { clerkMiddleware } from "@clerk/nextjs/server";

function isPublicPath(pathname: string) {
	const matchesSegment = (segment: string) =>
		pathname === segment || pathname.startsWith(`${segment}/`);
	return (
		pathname === "/" ||
		matchesSegment("/sign-in") ||
		matchesSegment("/sign-up") ||
		matchesSegment("/invitations/accept") ||
		pathname === "/api/webhooks/clerk"
	);
}

export default clerkMiddleware(async (auth, request) => {
	if (!isPublicPath(request.nextUrl.pathname)) {
		await auth.protect();
	}
});

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
		"/__clerk/(.*)",
	],
};
