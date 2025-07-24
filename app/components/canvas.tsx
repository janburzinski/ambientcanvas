"use client";

import { useRef, useState } from "react";

export default function Canvas() {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [thought, setThought] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const autoTriggered = useRef(false);

    async function handleGenerateThought() {
        if (!title.trim() || !text.trim()) return;
        try {
            const res = await fetch(`/api/generate-thought?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`);
            const data = await res.json();
            setThought(data.thought || "No thought generated.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        } catch {
            setThought("Failed to generate thought.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        }
    }

    return (
        <main className="fixed inset-0 min-h-screen min-w-full bg-neutral-100 flex flex-col items-center justify-start">
            <header className="w-full flex items-center justify-center border-b border-neutral-200 bg-white/80 backdrop-blur-sm py-4 shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Ambient Canvas</h1>
            </header>

            {showToast && thought && (
                <div
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-3 rounded shadow border border-neutral-200 animate-fade-in min-w-[200px] max-w-xs break-words"
                    role="status"
                    aria-live="polite"
                >
                    {thought}
                </div>
            )}

            <section
                className="w-full max-w-3xl flex-1 flex flex-col items-center justify-start px-4 py-8"
                aria-label="Blank Canvas"
            >
                <div className="w-full bg-white rounded-xl shadow-lg border border-neutral-200 p-8 flex flex-col gap-4 min-h-[70vh]">
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={e => {
                            autoTriggered.current = false;
                            setTitle(e.target.value);
                        }}
                        className="text-3xl font-semibold bg-transparent outline-none placeholder:text-neutral-300 border-none focus:ring-0 focus:border-none mb-2 w-full"
                        aria-label="Title"
                        autoFocus
                    />
                    <textarea
                        placeholder="Start writing your thoughts..."
                        value={text}
                        onChange={e => {
                            autoTriggered.current = false;
                            setText(e.target.value);
                        }}
                        className="flex-1 w-full resize-none bg-transparent outline-none text-lg placeholder:text-neutral-300 border-none focus:ring-0 focus:border-none min-h-[40vh]"
                        aria-label="Text"
                        rows={15}
                        style={{ overflow: "auto" }}
                    />
                </div>
            </section>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px);}
                    to { opacity: 1; transform: translateY(0);}
                }
            `}</style>
        </main>
    );
}