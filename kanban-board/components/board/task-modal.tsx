"use client";

import { useEffect, useState } from "react";
import type { Priority, Task } from "@/lib/types/board";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    description: string;
    priority: Priority;
    dueDate?: string;
    columnId: string;
  }) => void;
  defaultColumnId: string;
  editingTask?: Task | null;
};

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  defaultColumnId,
  editingTask,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [columnId, setColumnId] = useState(defaultColumnId);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate ?? "");
      setColumnId(editingTask.columnId);
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setColumnId(defaultColumnId);
    }
  }, [editingTask, defaultColumnId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">
          {editingTask ? "Edit Task" : "Create Task"}
        </h2>

        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={4}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!title.trim()) return;

              onSave({
                id: editingTask?.id,
                title: title.trim(),
                description: description.trim(),
                priority,
                dueDate: dueDate || undefined,
                columnId,
              });
              onClose();
            }}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}