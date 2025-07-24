"use client";
import { ChevronDown, ChevronLeft, ChevronRight, CreditCard, FileText, Folder, Plus, Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SidebarFooter({ router }: { router: ReturnType<typeof useRouter> }) {
    return (
        <div className="flex flex-col gap-3 p-3 md:p-5 w-full border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black z-10 font-sans" style={{ minHeight: '72px' }}>
            <div className="flex items-center gap-2 mb-1">
                <button
                    className="flex items-center gap-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition p-2 w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a259ff]"
                    aria-label="Profile"
                >
                    <img
                        src="https://i.pravatar.cc/40"
                        alt="Profile"
                        className="rounded-full border border-neutral-300 w-8 h-8"
                    />
                    <span className="font-medium text-sm ml-2 text-black dark:text-white">Profile</span>
                </button>
                <button
                    className="flex items-center gap-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition p-2 w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a259ff]"
                    aria-label="Settings"
                    onClick={() => router.push('/settings')}
                >
                    <Settings size={22} />
                    <span className="font-medium text-sm ml-2 text-black dark:text-white">Settings</span>
                </button>
            </div>
            <button
                className="flex items-center gap-2 rounded-lg hover:bg-[#f3eaff] dark:hover:bg-[#23232b] transition p-2 w-full text-[#a259ff] dark:text-[#c084fc] font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a259ff] border border-transparent"
                aria-label="Plans"
                onClick={() => router.push('/plans')}
                style={{ marginTop: 2 }}
            >
                <CreditCard size={18} />
                <span>Plans</span>
            </button>
        </div>
    );
}

function SidebarWorkspaces({ workspaces, expanded, setExpanded, addingWorkspace, setAddingWorkspace, newWorkspace, setNewWorkspace, setWorkspaces, router }: any) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-neutral-500">Workspaces</div>
                <button
                    className="p-1 rounded hover:bg-neutral-100"
                    onClick={() => setAddingWorkspace(true)}
                    aria-label="Add workspace"
                >
                    <Plus size={16} />
                </button>
            </div>
            {addingWorkspace ? (
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        if (newWorkspace.trim()) {
                            setWorkspaces((prev: any) => [...prev, { name: newWorkspace.trim(), notes: [] }]);
                            setNewWorkspace("");
                            setAddingWorkspace(false);
                        }
                    }}
                    className="flex gap-2 mb-2"
                >
                    <input
                        type="text"
                        value={newWorkspace}
                        onChange={e => setNewWorkspace(e.target.value)}
                        className="text-xs px-2 py-1 border border-neutral-200 rounded w-full outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Workspace name"
                        autoFocus
                    />
                    <button type="submit" className="text-[#a259ff] font-bold px-2">Add</button>
                </form>
            ) : null}
            <ul className="space-y-2 w-full">
                {workspaces.map((ws: any) => (
                    <li key={ws.name} className="w-full">
                        <button
                            className={`flex items-center gap-2 w-full text-left hover:bg-neutral-100 rounded px-2 py-1 transition`}
                            onClick={() => setExpanded((e: any) => ({ ...e, [ws.name]: !e[ws.name] }))}
                            aria-expanded={!!expanded[ws.name]}
                        >
                            {expanded[ws.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <Folder size={16} />
                            <span>{ws.name}</span>
                        </button>
                        {expanded[ws.name] && (
                            <ul className="ml-7 mt-1 space-y-1">
                                {ws.notes.map((note: string) => (
                                    <li key={note}>
                                        <button
                                            onClick={() => router.push(`/notes/${note}`)}
                                            className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded px-2 py-1 text-sm transition"
                                        >
                                            <FileText size={14} />
                                            {note}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SidebarNotes({ allNotes, addingNote, setAddingNote, newNote, setNewNote, setAllNotes, router }: any) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-neutral-500">All Notes</div>
                <button
                    className="p-1 rounded hover:bg-neutral-100"
                    onClick={() => setAddingNote(true)}
                    aria-label="Add note"
                >
                    <Plus size={16} />
                </button>
            </div>
            {addingNote ? (
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        if (newNote.trim()) {
                            setAllNotes((prev: any) => [...prev, newNote.trim()]);
                            setNewNote("");
                            setAddingNote(false);
                        }
                    }}
                    className="flex gap-2 mb-2"
                >
                    <input
                        type="text"
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        className="text-xs px-2 py-1 border border-neutral-200 rounded w-full outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Note title"
                        autoFocus
                    />
                    <button type="submit" className="text-[#a259ff] font-bold px-2">Add</button>
                </form>
            ) : null}
            <ul className="space-y-1 w-full">
                {allNotes.map((note: string) => (
                    <li key={note} className="w-full">
                        <button
                            onClick={() => router.push(`/notes/${note}`)}
                            className={`flex items-center gap-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded px-2 py-1 text-sm transition`}
                        >
                            <FileText size={14} />
                            {note}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Sidebar({ open, onClose, collapsed, onCollapseToggle }: { open: boolean; onClose: () => void; collapsed: boolean; onCollapseToggle: () => void }) {
    const [workspaces, setWorkspaces] = useState([
        { name: "Personal", notes: ["Journal", "Ideas"] },
        { name: "Work", notes: ["Meeting Notes", "Project Plan"] },
    ]);
    const [allNotes, setAllNotes] = useState(["Untitled", "Journal", "Ideas", "Meeting Notes", "Project Plan"]);
    const [newWorkspace, setNewWorkspace] = useState("");
    const [addingWorkspace, setAddingWorkspace] = useState(false);
    const [newNote, setNewNote] = useState("");
    const [addingNote, setAddingNote] = useState(false);
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
    const router = useRouter();

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                    md:hidden`}
                onClick={onClose}
                aria-hidden={!open}
            />
            <aside
                className={`fixed top-0 left-0 h-screen ${collapsed ? "w-16" : "w-72"} bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 shadow-lg z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:shadow-none flex flex-col`}
                aria-label="Sidebar"
            >
                <div className="flex items-center justify-between h-16 px-2 md:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                    <div className="flex flex-col">
                        <span className={`font-bold text-lg transition-opacity ${collapsed ? "opacity-0 pointer-events-none w-0" : "opacity-100 w-auto"}`}>AI Writing Companion</span>
                        {!collapsed && (
                            <span className="text-xs text-neutral-400 font-semibold tracking-wide mt-0.5">BY BEJANICLABS</span>
                        )}
                    </div>
                    {/* Desktop collapse/expand toggle */}
                    <button
                        className="hidden md:inline-flex p-2 rounded hover:bg-neutral-100 ml-auto"
                        onClick={onCollapseToggle}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        tabIndex={0}
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                    {/* Mobile close button */}
                    <button
                        className="md:hidden p-2 rounded hover:bg-neutral-100"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>
                {/* Only render nav/content if not collapsed */}
                {!collapsed && (
                    <nav className="flex-1 flex flex-col gap-6 p-2 md:p-6 overflow-y-auto">
                        <SidebarWorkspaces
                            workspaces={workspaces}
                            expanded={expanded}
                            setExpanded={setExpanded}
                            addingWorkspace={addingWorkspace}
                            setAddingWorkspace={setAddingWorkspace}
                            newWorkspace={newWorkspace}
                            setNewWorkspace={setNewWorkspace}
                            setWorkspaces={setWorkspaces}
                            router={router}
                        />
                        <SidebarNotes
                            allNotes={allNotes}
                            addingNote={addingNote}
                            setAddingNote={setAddingNote}
                            newNote={newNote}
                            setNewNote={setNewNote}
                            setAllNotes={setAllNotes}
                            router={router}
                        />
                    </nav>
                )}
                {/* Profile, Settings, Plans */}
                {!collapsed ? <SidebarFooter router={router} /> : (
                    <div className="flex flex-col items-center justify-end flex-1 pb-4">
                        <button
                            className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition mb-2"
                            aria-label="Settings"
                            onClick={() => router.push('/settings')}
                            title="Settings"
                        >
                            <Settings size={24} />
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
} 