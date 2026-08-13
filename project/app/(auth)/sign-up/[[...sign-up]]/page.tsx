import { SignUp } from "@clerk/nextjs"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Create account" }
export default function SignUpPage() { return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(25,133,161,.15),transparent_40%)] p-4"><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" /></main> }
