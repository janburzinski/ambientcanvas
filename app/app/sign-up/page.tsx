import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-white">
            <SignUp appearance={{ elements: { card: "shadow-none border-none bg-white" } }} />
        </main>
    );
} 