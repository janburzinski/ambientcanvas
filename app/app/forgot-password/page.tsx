import React, { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Add real forgot password logic here
        setSent(true);
        setTimeout(() => setSent(false), 3000);
        setEmail("");
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 py-12 px-4">
            <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col gap-6">
                <h1 className="text-2xl font-bold mb-1 text-center text-neutral-900 dark:text-neutral-100">Forgot Password</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-base bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition text-base shadow-sm"
                        disabled={!email}
                    >
                        Send Reset Link
                    </button>
                    {sent && <div className="text-green-500 dark:text-green-400 text-center text-sm mt-2">If this email exists, a reset link has been sent.</div>}
                </form>
            </div>
        </main>
    );
} 