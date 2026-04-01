export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  columnId: string;
  dueDate?: string;
};

export type Column = {
  id: string;
  title: string;
  tasks: Task[];
};