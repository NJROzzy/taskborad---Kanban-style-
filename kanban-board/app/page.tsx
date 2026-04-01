import KanbanBoard from "@/components/board/kanban-board";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
          <p className="text-sm text-zinc-400">
            Create, organize, drag, and manage your work visually.
          </p>
        </div>

        <KanbanBoard />
      </div>
    </main>
  );
}

