import { RedirectToSignIn, SignedIn, SignedOut, UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-white">
            <SignedIn>
                <UserProfile
                    appearance={{
                        elements: {
                            card: "shadow-none border-none bg-white",
                        },
                    }}
                />
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </main>
    );
} 