⸻

🚀 Kanban Task Board (Next.js + Supabase)

A modern, full-stack Kanban board built with Next.js, Supabase, and dnd-kit, supporting real-time task management with drag-and-drop, user isolation, and filtering.

⸻

✨ Features

🧩 Core Features
	•	Create, edit, and delete tasks
	•	Drag & drop tasks across columns
	•	Four workflow stages:
	•	To Do
	•	In Progress
	•	In Review
	•	Done
	•	Persistent storage with Supabase

⸻

🔐 Authentication & Security
	•	Anonymous guest authentication using Supabase Auth
	•	Each user gets a unique session
	•	Row Level Security (RLS) ensures:
	•	Users only see their own tasks
	•	Full data isolation across sessions

⸻

🔍 Search & Filtering
	•	Search tasks by title
	•	Filter by priority (Low, Medium, High)

⸻

📅 Smart UI Enhancements
	•	Due date indicators:
	•	🔴 Overdue
	•	🟡 Due soon
	•	⚪ Normal
	•	Empty state UI for columns
	•	Board summary:
	•	Total tasks
	•	Completed tasks
	•	Overdue tasks

⸻

🛠 Tech Stack
	•	Frontend: Next.js (App Router), React, TypeScript
	•	Drag & Drop: dnd-kit
	•	Backend & DB: Supabase (PostgreSQL)
	•	Auth: Supabase Anonymous Auth
	•	Styling: Tailwind CSS

⸻

🧠 Architecture Overview
	•	Tasks are stored in Supabase with:
	•	status → column mapping
	•	user_id → user isolation
	•	Frontend maps status → Kanban columns
	•	RLS policies enforce secure access:

auth.uid() = user_id



⸻

⚙️ Setup Instructions

1. Clone the repo

git clone https://github.com/NJROzzy/taskborad---Kanban-style-.git
cd kanban-board


⸻

2. Install dependencies

npm install


⸻

3. Create environment variables

Create a .env.local file:

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key


⸻

4. Run locally

npm run dev

Open:
👉 http://localhost:3000

⸻

🗄 Supabase Setup

Tasks Table

Columns required:
	•	id
	•	title
	•	description
	•	priority
	•	due_date
	•	status
	•	user_id
	•	created_at

⸻

Enable RLS

alter table tasks enable row level security;


⸻

Policies

create policy "Users can view their own tasks"
on tasks for select
using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
on tasks for insert
with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
on tasks for update
using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
on tasks for delete
using (auth.uid() = user_id);


⸻

🚀 Deployment

Recommended: Vercel
	1.	Push repo to GitHub
	2.	Import project in Vercel
	3.	Add environment variables
	4.	Deploy

⸻

🎯 Demo Behavior
	•	User A (browser 1) sees only their tasks
	•	User B (incognito / different browser) sees only theirs
	•	Data is fully isolated via RLS

⸻

📌 Future Improvements
	•	Task comments & activity log
	•	Team members & assignees
	•	Labels / tags system
	•	Real-time collaboration
	•	Notifications

⸻

💡 Author

Nitish John Rawat

⸻

⭐ Notes

This project was built as a full-stack assessment demonstrating:
	•	system design
	•	frontend architecture
	•	backend integration
	•	secure multi-user handling

⸻

🔥 If you want, I can also:
	•	add badges (Vercel, build, etc.)
	•	make it look like a top-tier open-source repo
	•	or write your submission email using this project
