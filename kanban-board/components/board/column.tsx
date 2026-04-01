"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./task-card";
import type { Column as ColumnType, Task } from "@/lib/types/board";

type Props = {
  column: ColumnType;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string, columnId: string) => void;
};

export default function Column({
  column,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <section className="w-80 shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">{column.title}</h2>
          <p className="text-xs text-zinc-400">
            {column.tasks.length} {column.tasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        <button
          onClick={() => onAddTask(column.id)}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
        >
          + Add
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[120px] rounded-xl p-2 transition ${
          isOver ? "bg-zinc-800/60" : "bg-transparent"
        }`}
      >
        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {column.tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-700 p-4 text-center text-sm text-zinc-500">
                No tasks yet
              </div>
            ) : (
              column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </section>
  );
}