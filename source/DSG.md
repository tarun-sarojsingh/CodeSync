Design Document: CodeSync
Version: 1.0
Design Philosophy: "Calm Collaboration"

1. Design Overview & Inspiration
Taking cues from modern, minimalist app design (like the referenced Reading Tracker), CodeSync avoids the cluttered, heavy feel of traditional IDEs. The UI is designed to fade into the background so developers can focus purely on the code and the flow of collaboration. It utilizes a soft dark mode, generous whitespace (or "darkspace"), and vibrant accents strictly for presence and syntax highlighting.

2. Color Palette
We will use a sophisticated dark theme with soft contrast, avoiding pure black (#000000) to reduce eye strain.

Core Colors:

Background (App): #0F1115 (Deep slate)
Surface (Editor/Navbar): #161B22 (Elevated dark slate)
Border/Dividers: #21262D (Subtle separation)
Text Primary: #E6EDF3 (Crisp off-white)
Text Secondary: #7D8590 (Muted gray for UI labels)
Accent & Presence Colors (High Vibrancy for User Cursors):

User A: #FF7849 (Soft Orange)
User B: #3FB950 (Vibrant Green)
User C: #58A6FF (Electric Blue)
Brand/Primary Buttons: #8957E5 (Soft Purple)
3. Typography
UI Font: Inter (Sans-serif). Used for the top navigation, presence bar, buttons, and status indicators. It matches the clean, geometric look of the reference.
Code Font: JetBrains Mono or Fira Code (Monospace). Used inside the Monaco Editor. Clean, readable, and supports ligatures.
4. Layout & Information Architecture
The application uses a 3-section horizontal layout, keeping the code editor as the central focal point.

4.1. Top Navigation Bar (Height: 60px)
Left: App Logo (Minimalist, soft glow) + Room Name (e.g., "Room: Alpha-9").
Center: Language Selector dropdown (clean, rounded pill shape).
Right: Presence Avatars & Share Button.
Presence Avatars: Overlapping circular avatars with a colored ring matching their cursor color. Hovering reveals their anonymous name (e.g., "Anonymous Badger").
Share Button: Solid purple primary button with a link icon.
4.2. Main Editor Area (Flex: 1)
The Monaco Editor occupies the entire central space.
No distracting sidebars (file trees) in the MVP to maintain the "calm" aesthetic.
Live Cursors: Rendered as thin, 2px wide vertical bars with a small, rounded label flag at the top displaying the user's name and matching their assigned color.
4.3. Bottom Status Bar (Height: 32px)
Left: Connection status indicator (Green dot = Connected, Yellow dot = Reconnecting, Red dot = Offline).
Right: Sync latency (e.g., "42ms sync") to subtly highlight the technical performance of the app.
5. UI Components & States
5.1. Empty State (Landing Page)
Instead of dropping the user directly into a blank file, present a clean, centered hero section similar to modern SaaS apps.

Headline: "Code together, instantly."
Subtext: "No accounts. No setup. Just code."
Buttons:
[ Primary: "Create New Room" ] -> Generates UUID and redirects to /room/{id}
[ Secondary: "Join via Link" ] -> Text input field.
5.2. The Monaco Editor Integration
Background: Match the app background (#0F1115 or #161B22).
Line Numbers: Muted gray (#7D8590).
Active Line Highlight: Very subtle lighter shade of the background.
Selections: When User A selects text, User B sees the text highlighted with a 20% opacity version of User A's assigned color.
5.3. Share Modal
When clicking "Share", a minimal modal slides down from the top.

Clean input field with the shareable link.
"Copy" button that changes to a green checkmark for 2 seconds upon success.
6. Micro-Interactions & Animations
Cursor Smoothness: Remote cursors shouldn't jump instantly. Apply a CSS transition: left 0.1s linear, top 0.1s linear; to the remote cursor elements so they glide smoothly across the screen as network packets arrive.
Presence Avatars: When a user joins, their avatar pops into the top bar with a subtle scale-up animation (transform: scale(0) to scale(1) over 200ms). When they leave, it fades out.
Buttons: Hover states on UI buttons should slightly elevate (translateY(-1px)) and background color should lighten by 10%.
7. Accessibility (a11y)
Contrast: Ensure syntax highlighting themes meet WCAG AA contrast ratios against the dark background.
Focus States: Keyboard navigation must have clear, glowing outlines (using the brand purple #8957E5) around active elements (buttons, inputs).
Reduced Motion: Respect the prefers-reduced-motion CSS media query. If set, disable cursor gliding and avatar pop-in animations, rendering them instantly.
8. Responsive Design (Desktop-First)
Collaborative code editing is inherently a desktop activity.

Desktop (>1024px): Full layout as described.
Tablet/Mobile (<1024px): Display a graceful warning: "CodeSync is optimized for desktop screens. Please switch to a larger device for the best collaborative experience." (This avoids the nightmare of building a responsive Monaco editor for mobile).


