import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
	return (
		<div className="grid min-h-[60vh] place-items-center p-6 text-center">
			<div><FileQuestion className="mx-auto text-blue_munsell-500" size={40} /><h1 className="mt-4 text-2xl font-semibold text-outer_space-900 dark:text-platinum-50">This item was not found</h1><p className="mt-2 text-sm text-paynes_gray-500 dark:text-french_gray-300">It may have been removed, or you may not have permission to view it.</p><Link href="/projects" className="mt-6 inline-block"><Button>Back to projects</Button></Link></div>
		</div>
	);
}
