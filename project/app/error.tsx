"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RootError({
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
		<html lang="en">
			<body className="bg-white dark:bg-outer_space-600">
				<main className="grid min-h-screen place-items-center p-6">
					<div className="max-w-md text-center">
						<AlertTriangle className="mx-auto text-red-600" size={40} />
						<h1 className="mt-4 text-2xl font-semibold text-outer_space-900 dark:text-platinum-50">
							Kanvas hit an unexpected error
						</h1>
						<p className="mt-2 text-sm text-paynes_gray-500 dark:text-french_gray-300">
							Your data is safe. Try loading the page again.
						</p>
						<Button className="mt-6" onClick={reset}>
							Try again
						</Button>
					</div>
				</main>
			</body>
		</html>
	);
}
