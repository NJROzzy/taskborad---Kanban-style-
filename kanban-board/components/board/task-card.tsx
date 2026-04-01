"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import type { Task } from "@/lib/types/board";

type Props = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, columnId: string) => void;
};

function getDueDateState(dueDate?: string) {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: "Overdue", tone: "overdue" as const };
  }

  if (diffDays <= 2) {
    return { label: "Due soon", tone: "soon" as const };
  }

  return { label: dueDate, tone: "normal" as const };
}

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueState = getDueDateState(task.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-sm transition",
        isDragging && "opacity-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-white">{task.title}</h3>

          <span
            className={clsx(
              "rounded-full px-2 py-0.5 text-[11px] capitalize",
              task.priority === "high" && "bg-red-500/20 text-red-300",
              task.priority === "medium" && "bg-yellow-500/20 text-yellow-300",
              task.priority === "low" && "bg-emerald-500/20 text-emerald-300"
            )}
          >
            {task.priority}
          </span>
        </div>

        {task.description ? (
          <p className="mb-3 text-xs text-zinc-400">{task.description}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {dueState ? (
            <span
              className={clsx(
                "rounded-full px-2 py-1 text-[11px]",
                dueState.tone === "overdue" && "bg-red-500/15 text-red-300",
                dueState.tone === "soon" && "bg-yellow-500/15 text-yellow-300",
                dueState.tone === "normal" && "bg-zinc-800 text-zinc-300"
              )}
            >
              {dueState.label}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onEdit(task)}
          className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id, task.columnId)}
          className="rounded-md bg-red-500/15 px-2 py-1 text-xs text-red-300 hover:bg-red-500/25"
        >
          Delete
        </button>
      </div>
    </div>
  );
}