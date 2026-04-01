"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Column from "./column";
import TaskModal from "./task-modal";
import type { Column as ColumnType, Task } from "@/lib/types/board";
import { supabase } from "@/lib/supabase/client";

const BOARD_COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
] as const;

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due.getTime() < today.getTime();
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState("todo");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    async function initAuth() {
      setLoading(true);
      setErrorMessage(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUserId(session.user.id);
        return;
      }

      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error("Anonymous sign-in failed:", error);
        setErrorMessage("Could not start guest session.");
        setLoading(false);
        return;
      }

      setUserId(data?.user?.id ?? null);
    }

    initAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function loadTasks() {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading tasks:", error);
        setErrorMessage("Failed to load tasks.");
        setLoading(false);
        return;
      }

      const mapped: Task[] = (data || []).map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description ?? "",
        priority: t.priority ?? "medium",
        dueDate: t.due_date ?? undefined,
        columnId: t.status,
      }));

      setTasks(mapped);
      setLoading(false);
    }

    loadTasks();
  }, [userId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  const columns: ColumnType[] = useMemo(() => {
    return BOARD_COLUMNS.map((column) => ({
      id: column.id,
      title: column.title,
      tasks: filteredTasks.filter((task) => task.columnId === column.id),
    }));
  }, [filteredTasks]);

  const taskMap = useMemo(
    () => Object.fromEntries(tasks.map((t) => [t.id, t])),
    [tasks]
  );

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.columnId === "done").length;
    const overdue = tasks.filter((task) => isOverdue(task.dueDate)).length;

    return { total, completed, overdue };
  }, [tasks]);

  function openCreateModal(columnId: string) {
    setSelectedColumnId(columnId);
    setEditingTask(null);
    setIsModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setSelectedColumnId(task.columnId);
    setIsModalOpen(true);
  }

  async function handleSaveTask(data: {
    id?: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    dueDate?: string;
    columnId: string;
  }) {
    if (!userId) return;

    if (data.id) {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: data.title,
          description: data.description,
          priority: data.priority,
          due_date: data.dueDate,
          status: data.columnId,
        })
        .eq("id", data.id);

      if (error) {
        console.error("Error updating task:", error);
        setErrorMessage("Failed to update task.");
        return;
      }

      setTasks((prev) =>
        prev.map((task) =>
          task.id === data.id
            ? {
                ...task,
                title: data.title,
                description: data.description,
                priority: data.priority,
                dueDate: data.dueDate,
                columnId: data.columnId,
              }
            : task
        )
      );
      return;
    }

    const { data: insertedTask, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: data.title,
          description: data.description,
          priority: data.priority,
          due_date: data.dueDate,
          status: data.columnId,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error || !insertedTask) {
      console.error("Error creating task:", error);
      setErrorMessage("Failed to create task.");
      return;
    }

    const newTask: Task = {
      id: insertedTask.id,
      title: insertedTask.title,
      description: insertedTask.description ?? "",
      priority: insertedTask.priority ?? "medium",
      dueDate: insertedTask.due_date ?? undefined,
      columnId: insertedTask.status,
    };

    setTasks((prev) => [...prev, newTask]);
  }

  async function handleDeleteTask(taskId: string, _columnId: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      setErrorMessage("Failed to delete task.");
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  function handleDragStart(event: DragStartEvent) {
    const taskId = String(event.active.id);
    setActiveTask(taskMap[taskId] ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const activeTaskItem = tasks.find((task) => task.id === activeId);
    if (!activeTaskItem) return;

    const isOverAColumn = BOARD_COLUMNS.some((col) => col.id === overId);

    let newStatus = activeTaskItem.columnId;

    if (isOverAColumn) {
      newStatus = overId;
    } else {
      const overTask = tasks.find((task) => task.id === overId);
      if (overTask) {
        newStatus = overTask.columnId;
      }
    }

    if (!newStatus || newStatus === activeTaskItem.columnId) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === activeId ? { ...task, columnId: newStatus } : task
      )
    );

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", activeId);

    if (error) {
      console.error("Error moving task:", error);
      setErrorMessage("Failed to move task.");
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
        Loading your board...
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {errorMessage ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
            <p className="text-xs text-zinc-400">Total Tasks</p>
            <p className="mt-1 text-xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
            <p className="text-xs text-zinc-400">Completed</p>
            <p className="mt-1 text-xl font-semibold text-white">{stats.completed}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
            <p className="text-xs text-zinc-400">Overdue</p>
            <p className="mt-1 text-xl font-semibold text-white">{stats.overdue}</p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-zinc-600"
          />

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-zinc-600 md:w-48"
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onAddTask={openCreateModal}
              onEditTask={openEditModal}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </DndContext>

      <DragOverlay>
        {activeTask ? (
          <div className="w-72 rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
            <h3 className="text-sm font-medium text-white">{activeTask.title}</h3>
          </div>
        ) : null}
      </DragOverlay>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        defaultColumnId={selectedColumnId}
        editingTask={editingTask}
      />
    </>
  );
}