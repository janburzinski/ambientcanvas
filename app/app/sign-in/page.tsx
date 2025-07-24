import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-white">
            <SignIn appearance={{ elements: { card: "shadow-none border-none bg-white" } }} />
        </main>
    );
} 