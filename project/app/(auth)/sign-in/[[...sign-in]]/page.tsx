import { SignIn } from "@clerk/nextjs"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Sign in" }
export default function SignInPage() { return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(25,133,161,.15),transparent_40%)] p-4"><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" /></main> }
