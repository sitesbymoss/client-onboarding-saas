# Backend Functional Specification: SwiftBoard 

## 1. Backend Architecture & Tech Stack
**Objective:** Build a secure, relational database backend with file storage and transactional email capabilities to support a multi-tenant SaaS. No AI models or vector databases are to be used.

* **API Layer:** Next.js Route Handlers (`/api/*`) or Next.js Server Actions.
* **Database & Auth:** Supabase (PostgreSQL backend).
* **ORM / Query Builder:** Supabase JS Client (or Prisma if preferred).
* **Storage:** Supabase Storage (S3-compatible bucket named `client-vault`).
* **Transactional Email:** Resend API or Postmark.

---

## 2. Database Schema (PostgreSQL)

*Ensure Row Level Security (RLS) is enabled on all tables so an Admin can only query rows where `org_id` matches their own organization.*

* **`organizations`**: `id` (UUID, PK), `name` (Text), `logo_url` (Text), `primary_color` (Text).
* **`users` (Admins)**: `id` (UUID, PK, matches auth.uid), `org_id` (UUID, FK), `email` (Text), `full_name` (Text).
* **`clients`**: `id` (UUID, PK), `org_id` (UUID, FK), `email` (Text), `full_name` (Text).
* **`templates`**: `id` (UUID, PK), `org_id` (UUID, FK), `name` (Text).
* **`template_tasks`**: `id` (UUID, PK), `template_id` (UUID, FK), `title` (Text), `type` (Enum: `FILE_UPLOAD`, `TEXT_INPUT`, `CHECKBOX`), `order_index` (Int).
* **`projects`**: `id` (UUID, PK), `org_id` (UUID, FK), `client_id` (UUID, FK), `status` (Enum: `ACTIVE`, `COMPLETED`), `magic_token` (Text, Unique Index).
* **`project_tasks`**: `id` (UUID, PK), `project_id` (UUID, FK), `title` (Text), `type` (Enum), `is_completed` (Boolean, default false), `response_data` (Text, nullable - holds file URL or text input).

---

## 3. Core API Endpoints & Server Actions

### Endpoint 1: Project Instantiation (`POST /api/projects`)
* **Payload:** `client_id`, `template_id`, `org_id`.
* **Logic:**
  1. Generate a secure random string for `magic_token` (e.g., using `crypto.randomBytes`).
  2. Insert new row into `projects`.
  3. Query all `template_tasks` where `template_id` matches payload.
  4. Perform a bulk insert into `project_tasks`, copying the task data and linking to the new `project_id`.
  5. **Trigger Email:** Call the Resend API to email the Client. Include the URL: `https://[domain]/portal/[magic_token]`.

### Endpoint 2: Portal Data Fetch (`GET /api/portal/[magic_token]`)
* **Logic:**
  1. Query `projects` where `magic_token` matches. If null, return 404.
  2. Fetch associated `client` data.
  3. Fetch associated `organizations` data (for branding).
  4. Fetch all `project_tasks` ordered by `order_index`.
  5. Return aggregate JSON payload to the frontend.

### Endpoint 3: Task Completion & File Upload (Supabase Storage)
* **Process:**
  1. Frontend uploads file directly to Supabase Storage bucket `client-vault` at path `/[org_id]/[project_id]/[uuid-filename]`.
  2. Frontend sends `POST /api/tasks/[task_id]/complete` with the returned Storage URL.
  3. **Logic:** Update `project_tasks` row -> set `is_completed = true`, set `response_data = [Storage URL]`.
  4. **Progress Check:** Query database to check if `COUNT(completed tasks) == COUNT(total tasks)` for that project. If true, trigger a "Project Complete" email to the Admin.

---

## 4. Execution Prompts for Backend AI Agent

**Phase 1: Database Setup & RLS**
> "Review the Backend Architecture and Schema. Write the raw SQL scripts (or Prisma schema) to generate the tables, enums, and foreign key relationships. Explicitly write the Row Level Security (RLS) policies for Supabase ensuring that users can only read/write data associated with their `org_id`."

**Phase 2: Core Data Mutations (Server Actions)**
> "Implement the backend logic for Template and Task creation. Write Next.js Server Actions (or API routes) that allow an admin to insert a new Template, and bulk-insert an array of Template Tasks. Ensure input validation using Zod."

**Phase 3: The Instantiation Engine & Email**
> "Implement Endpoint 1 (Project Instantiation). Write the logic that duplicates template tasks into project tasks when a new project is created. Integrate the Resend API SDK to send a basic text email to the client containing their generated magic token URL."

**Phase 4: Portal Read & Storage Write**
> "Implement Endpoint 2 to securely fetch project data via the `magic_token` without requiring standard authentication. Then, write the backend logic to handle the Storage URL saving and progress-checking (Endpoint 3). Ensure the backend calculates if the project has reached 100% completion upon every task update."