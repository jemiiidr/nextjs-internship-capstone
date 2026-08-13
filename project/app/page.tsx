import { ArrowRight, Database, Layers3, LockKeyhole } from "lucide-react"
import Link from "next/link"
import { Features } from "@/components/features"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Button } from "@/components/ui/button"

export default function HomePage() {
	return 
	<div className="min-h-screen">
		<Header />
		<main>
			<Hero />
			<Features /><section id="workflow" className="px-4 py-20 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center"><div><p className="text-sm font-semibold uppercase tracking-wider text-blue_munsell-500">One connected workflow</p><h2 className="mt-3 text-3xl font-bold text-outer_space-900 dark:text-platinum-50">From authenticated user to persisted task.</h2><p className="mt-4 leading-7 text-paynes_gray-500 dark:text-french_gray-400">Every action is validated with Zod, authorized on the server, and stored in PostgreSQL through Drizzle. Zustand and React optimistic updates keep the board responsive while data is being saved.</p><Link href="/sign-up" className="mt-7 inline-block"><Button>Try the complete workflow <ArrowRight size={17} /></Button></Link></div><div className="grid gap-4 sm:grid-cols-3">{[{ icon: LockKeyhole, title: "Authenticate", copy: "Clerk protects routes and synchronizes users through a verified webhook." }, { icon: Layers3, title: "Collaborate", copy: "Members create, assign, move, discuss, and filter work." }, { icon: Database, title: "Persist", copy: "Neon Postgres stores projects, ordered lists, tasks, comments, and activity." }].map((step, index) => <article key={step.title} className="rounded-2xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-400 dark:bg-outer_space-500"><span className="text-xs font-semibold text-blue_munsell-500">0{index + 1}</span><step.icon className="mt-4 text-blue_munsell-500" /><h3 className="mt-4 font-semibold text-outer_space-900 dark:text-platinum-50">{step.title}</h3><p className="mt-2 text-sm leading-6 text-paynes_gray-500 dark:text-french_gray-400">{step.copy}</p></article>)}</div></div></section><section id="security" className="px-4 pb-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl rounded-3xl bg-blue_munsell-500 px-6 py-12 text-white sm:px-12"><h2 className="text-3xl font-bold">Ready to run a complete project workspace?</h2><p className="mt-3 max-w-2xl text-blue_munsell-50">Create an account, connect the required environment variables, run the migration, and start managing persisted projects.</p><Link href="/sign-up" className="mt-7 inline-block"><Button className="bg-white text-blue_munsell-700 hover:bg-blue_munsell-50">Create account <ArrowRight size={17} /></Button></Link></div></section></main><Footer /></div>
}
