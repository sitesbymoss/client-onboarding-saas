# Frontend Functional Specification: SwiftBoard 

## 1. Frontend Architecture & Tech Stack
**Objective:** Build a responsive, accessible, and fast user interface for a multi-tenant client onboarding portal. The application must be purely standard UI/UX with zero AI integrations.

* **Framework:** Next.js (App Router preferred)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Component Library:** shadcn/ui (Radix UI primitives)
* **State Management:** React Hooks (useState, useReducer) + Server Components where applicable.
* **Form Handling:** React Hook Form + Zod (for validation).
* **Iconography:** Lucide React.

---

## 2. Core User Interfaces (Views)

### View A: Admin Dashboard (`/admin/dashboard`)
* **Layout:** Sidebar navigation (Projects, Templates, Settings), Topbar (User profile, Org Name).
* **Overview Metric Cards:** "Active Projects", "Pending Client Uploads", "Completed Projects".
* **Data Table:** A list of all projects with columns: Client Name, Project Name, Status, Progress Bar, Last Updated. (Use shadcn/ui Data Table).

### View B: Template Builder (`/admin/templates/[id]`)
* **Purpose:** Interface for admins to create reusable onboarding checklists.
* **Components:**
  * Title/Description input fields.
  * **Task List:** A vertical list of tasks.
  * **Task Creator:** A form to add a new task. Select type (`FILE_UPLOAD`, `TEXT_INPUT`, `CHECKBOX`).
  * **Reordering:** Simple up/down arrow buttons (or drag-and-drop if using `dnd-kit`) to adjust the `order_index` of tasks.

### View C: Project Detail View (`/admin/projects/[id]`)
* **Purpose:** Where the admin monitors a specific client's progress.
* **Components:**
  * **Progress Indicator:** Large visual progress bar `(completed / total tasks)`.
  * **Task Status List:** Read-only view of tasks. If a task is a `FILE_UPLOAD` and is completed, render a "Download File" button pointing to the storage URL.
  * **Resend Link Button:** Triggers backend action to resend the magic link to the client.

### View D: Client "Magic" Portal (`/portal/[magic_token]`)
* **Purpose:** The public-facing page the client sees. Must be highly optimized for mobile (so clients can take photos of documents).
* **Branding:** * Header must fetch and display the Organization's `logo_url`.
  * Primary buttons and active states must use the Organization's `primary_color`.
* **Components:**
  * **Welcome Header:** "Welcome back, [Client Name]".
  * **Interactive Checklist:** A visually appealing list of tasks.
  * **Upload Component:** When a `FILE_UPLOAD` task is clicked, open a native file picker. Show an uploading spinner state, then a success checkmark upon completion.

---

## 3. Execution Prompts for Frontend AI Agent

**Phase 1: Shell & Routing**
> "Review the Frontend Architecture. Initialize a Next.js App Router project with Tailwind CSS and shadcn/ui. Create the core folder structure and layout files for the Admin application (`/admin/layout.tsx`) including a responsive sidebar, and a blank layout for the public Client Portal (`/portal/layout.tsx`)."

**Phase 2: Admin Dashboard & Template Builder**
> "Build the UI components for View A and View B. Use standard mock data arrays to populate the tables and lists for now. For the Template Builder, implement the React state logic to add a new task object to an array and reorder items in that array."

**Phase 3: The Client Portal (Mobile-First)**
> "Build View D. This must be heavily optimized for mobile devices. Create a visually satisfying checklist component. Build a mock File Upload component that simulates an upload delay with a progress spinner, then marks the checklist item as complete."

**Phase 4: Data Hookup (Preparation)**
> "Refactor the mock data components to accept their data via props or via custom hooks, so they are ready to be wired up to the backend API/Server Actions in the next stage."