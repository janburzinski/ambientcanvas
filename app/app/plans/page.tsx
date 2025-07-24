"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "/month",
        features: [
            "Basic AI writing",
            "Up to 10 notes",
            "Community support",
            "Light & dark mode",
        ],
        cta: "Get Started",
        highlight: false,
    },
    {
        name: "Pro",
        price: "$9",
        period: "/month",
        features: [
            "Unlimited notes & workspaces",
            "Priority AI processing",
            "Export to PDF/Markdown",
            "Custom themes & fonts",
            "Early access to new features",
            "Priority support",
        ],
        cta: "Upgrade Now",
        highlight: true,
    },
    {
        name: "Ultimate",
        price: "$29",
        period: "/month",
        features: [
            "Everything in Pro",
            "Team collaboration",
            "Admin dashboard",
            "Usage analytics",
            "Dedicated onboarding",
            "1:1 AI writing coach",
        ],
        cta: "Go Ultimate",
        highlight: false,
    },
];

export default function PlansPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen flex flex-col items-center justify-start bg-white dark:bg-black py-16 px-4 font-sans">
            <h1 className="text-4xl font-extrabold text-center mb-4 text-black dark:text-white tracking-tight">Choose Your Plan</h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 text-center mb-12 max-w-2xl">Unlock your writing potential. Get more AI power, unlimited notes, and exclusive features. Upgrade now and supercharge your productivity!</p>
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-stretch">
                {plans.map((plan, i) => (
                    <div
                        key={plan.name}
                        className={`flex-1 flex flex-col rounded-2xl border transition-all duration-200 p-8 bg-white dark:bg-black font-sans ${plan.highlight
                            ? "border-[#a259ff] dark:border-[#c084fc] bg-[#faf7ff] dark:bg-[#18141f] scale-105 z-10"
                            : "border-neutral-200 dark:border-neutral-800"
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {plan.highlight && (
                                <span className="px-2 py-0.5 rounded-full bg-[#a259ff]/10 text-[#a259ff] dark:bg-[#c084fc]/20 dark:text-[#c084fc] text-xs font-bold uppercase tracking-wide">Most Popular</span>
                            )}
                            <span className="text-2xl font-bold text-black dark:text-white">{plan.name}</span>
                        </div>
                        <div className="flex items-end gap-1 mb-6">
                            <span className="text-4xl font-extrabold text-[#a259ff] dark:text-[#c084fc]">{plan.price}</span>
                            <span className="text-lg text-neutral-400 font-medium">{plan.period}</span>
                        </div>
                        <ul className="flex-1 flex flex-col gap-3 mb-8">
                            {plan.features.map((f, j) => (
                                <li key={j} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[#a259ff] dark:text-[#c084fc]"><path d="M5 13l4 4L19 7" /></svg>
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${plan.highlight
                                ? "bg-[#a259ff] dark:bg-[#c084fc] text-white hover:bg-[#8b3dff] dark:hover:bg-[#a259ff]"
                                : "bg-neutral-100 dark:bg-neutral-900 text-[#a259ff] dark:text-[#c084fc] hover:bg-[#f3eaff] dark:hover:bg-[#23232b]"
                                }`}
                            variant="default"
                            size="lg"
                            onClick={() => {
                                if (plan.name === "Free") {
                                    router.push("/sign-up");
                                } else if (plan.name === "Pro") {
                                    router.push("/checkout?plan=pro");
                                } else if (plan.name === "Ultimate") {
                                    router.push("/checkout?plan=ultimate");
                                }
                            }}
                        >
                            {plan.cta}
                        </Button>
                    </div>
                ))}
            </div>
            <p className="mt-12 text-center text-neutral-400 text-sm">No credit card required. Cancel anytime. <span className="font-semibold text-[#a259ff] dark:text-[#c084fc]">Upgrade now and experience the future of writing!</span></p>
        </main>
    );
} 