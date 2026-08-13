"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);
	return (
		<div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
			<AlertTriangle className="mx-auto text-red-600" />
			<h1 className="mt-3 text-xl font-semibold text-red-900 dark:text-red-100">
				This page could not be loaded
			</h1>
			<p className="mt-2 text-sm text-red-700 dark:text-red-300">
				Check the database and environment variables, then try again.
			</p>
			<Button className="mt-5" onClick={reset}>
				Try again
			</Button>
		</div>
	);
}
