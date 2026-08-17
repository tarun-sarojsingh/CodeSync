Product Requirements Document (PRD)
Project Name: CodeSync (Real-Time Collaborative Code Editor)
Document Version: 1.0
Timeline: 3-4 Weeks (MVP)

1. Executive Summary
CodeSync is a web-based, real-time collaborative code editor (similar to Google Docs, but for code). It allows multiple developers to edit the same file simultaneously with zero conflicts, sub-100ms latency, and live cursor tracking. The core differentiator is the implementation of a CRDT (Conflict-free Replicated Data Type) synchronization engine, demonstrating advanced distributed systems concepts.

2. Problem Statement
Existing lightweight code collaboration tools often rely on naive "last-write-wins" synchronization. When multiple users type in the same area simultaneously, characters get overwritten, cursors jump erratically, and data is lost. Developers need a lightweight, instant collaboration tool that guarantees data consistency without the bloat of full enterprise IDEs.

3. Target Audience
Primary: Developers conducting pair-programming sessions, mock interviews, or quick bug-fix collaborations.
Secondary: Technical recruiters/hiring managers evaluating a candidate's distributed systems portfolio.
4. Goals & Non-Goals
Goals
Enable 2-5 concurrent users to edit a single document simultaneously without data loss.
Achieve sub-100ms propagation latency for text updates between peers.
Implement live cursors and user presence (who is online).
Maintain persistent document state (refreshing the page restores the code).
Non-Goals (Out of Scope for MVP)
User authentication / OAuth login (users will use temporary "Anonymous" names).
Multi-file directory structures (MVP is a single-file editor).
Code execution / running code (no backend Docker container in MVP).
Version control history (no Git-style commit logs).
5. Functional Requirements
5.1. Room Management
FR 1.1: Users can generate a unique collaboration room via a "Create Session" button.
FR 1.2: Users can join an existing room via a shareable URL (e.g., /room/abc-123).
FR 1.3: Users are assigned a random hexadecimal color and a random animal name (e.g., "Anonymous Badger") upon joining.
5.2. The Editor Environment
FR 2.1: The UI must utilize the Monaco Editor (VS Code's engine) for syntax highlighting, code folding, and basic auto-complete.
FR 2.2: Users can select the programming language for syntax highlighting from a dropdown (e.g., JavaScript, Python, Java).
FR 2.3: Users can copy their code to the clipboard via a "Copy" button.
5.3. Real-Time Synchronization (The Core)
FR 3.1: All text insertions and deletions must be synchronized across all connected clients in real-time.
FR 3.2: Concurrent edits to the exact same line/character must merge without conflicts using a CRDT algorithm (e.g., Yjs, Automerge, or custom RGA).
FR 3.3: If a user loses internet connection, the app must continue to allow local typing. Upon reconnection, the CRDT must merge the offline changes without overwriting remote changes.
5.4. Presence & Live Cursors
FR 4.1: Each user's cursor position must be visible to all other users, colored with their assigned user color.
FR 4.2: Text selections (highlights) must be visible to other users in real-time.
FR 4.3: A presence bar at the top of the UI displays avatars/names of all currently connected users.
6. Non-Functional Requirements
6.1. Performance
NFR 1.1: Text propagation latency must average < 100ms between Client A typing and Client B seeing the character (assuming standard network conditions).
NFR 1.2: The UI must remain responsive (60fps) even if the network is laggy (use optimistic UI updates).
6.2. Scalability & Architecture
NFR 2.1: The system must use WebSockets for bi-directional, low-latency communication.
NFR 2.2: The backend must use Redis to store ephemeral session state (active users, room metadata).
NFR 2.3: The system must snapshot the document state to a persistent database (e.g., PostgreSQL or Redis) periodically so new users joining a room get the full document instantly.
6.3. Tech Stack
Frontend: React, TypeScript, @monaco-editor/react, Yjs (or Automerge).
Backend: Spring Boot (Java), Java-WebSocket (or Spring WebSockets).
Data Store: Redis (for session state, presence, and Pub/Sub for horizontal scaling).
7. Technical Architecture (Data Flow)
User A types "Hello" in Monaco Editor.
Yjs (frontend) generates a CRDT update binary payload.
Frontend sends the payload via WebSocket to Spring Boot.
Spring Boot receives the payload, publishes it to Redis Pub/Sub (Channel: room:abc-123).
Spring Boot consumes the Pub/Sub message and broadcasts it via WebSocket to all other clients in that room (User B, User C).
User B & C's frontend receives the Yjs payload and applies it to their local Yjs document, which automatically updates their Monaco Editor UI.
8. Milestones & Timeline (4 Weeks)
Week 1: Foundation & Sockets
Set up React + Spring Boot boilerplate.
Implement WebSocket connection logic (connect, disconnect, message relay).
Create basic UI layout (Editor area, top presence bar, URL routing).
Week 2: The CRDT Core (The hardest week)
Integrate Yjs/Automerge into the React frontend.
Bind Yjs state to the Monaco Editor.
Implement WebSocket provider to sync Yjs updates through Spring Boot.
Test concurrent editing locally with multiple browser tabs.
Week 3: Presence, Cursors & Persistence
Implement live cursors and text selections using Yjs Awareness protocol.
Set up Redis on the backend for room presence.
Implement document snapshotting (save current state to DB every X seconds).
Week 4: Polish & Edge Cases
Handle offline/reconnect logic gracefully.
Style the UI (dark mode, modern developer aesthetic).
Write comprehensive README with architecture diagram and GIFs.
Deploy to AWS/Vercel/Render.
9. Success Metrics (For Portfolio/Resume)
Quantitative: Achieves < 100ms propagation latency across 2-5 concurrent clients.
Qualitative: Zero data loss or merge conflicts during aggressive concurrent typing tests (simulated via network throttling).