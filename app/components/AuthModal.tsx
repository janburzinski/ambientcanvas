"use client";
import { SignIn, SignUp } from "@clerk/nextjs";
import { X } from "lucide-react";
import { useState } from "react";

export default function AuthModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [tab, setTab] = useState<'login' | 'signup'>('login');

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            aria-modal="true"
            role="dialog"
            tabIndex={-1}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-3 right-3 p-2 rounded hover:bg-neutral-100"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>
                <div className="flex gap-2 mb-6">
                    <button
                        className={`flex-1 py-2 rounded ${tab === 'login' ? 'bg-neutral-100 font-semibold' : ''}`}
                        onClick={() => setTab('login')}
                        aria-selected={tab === 'login'}
                    >
                        Login
                    </button>
                    <button
                        className={`flex-1 py-2 rounded ${tab === 'signup' ? 'bg-neutral-100 font-semibold' : ''}`}
                        onClick={() => setTab('signup')}
                        aria-selected={tab === 'signup'}
                    >
                        Sign Up
                    </button>
                </div>
                <div className="flex flex-col gap-4">
                    {tab === 'login' ? (
                        <SignIn
                            appearance={{ elements: { card: "shadow-none border-none bg-white" } }}
                            afterSignInUrl="/"
                            afterSignUpUrl="/"
                            signUpUrl="#"
                            routing="virtual"
                            onSignedIn={onClose}
                        />
                    ) : (
                        <SignUp
                            appearance={{ elements: { card: "shadow-none border-none bg-white" } }}
                            afterSignUpUrl="/"
                            signInUrl="#"
                            routing="virtual"
                            onSignedUp={onClose}
                        />
                    )}
                </div>
            </div>
        </div>
    );
} 