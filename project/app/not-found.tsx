import { FileQuestion } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() { return <main className="grid min-h-screen place-items-center p-6"><div className="text-center"><FileQuestion className="mx-auto text-blue_munsell-500" size={42} /><h1 className="mt-4 text-3xl font-bold text-outer_space-900 dark:text-platinum-50">Page not found</h1><p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">The page may have moved, or you may not have access.</p><Link href="/dashboard" className="mt-6 inline-block"><Button>Return to dashboard</Button></Link></div></main> }
