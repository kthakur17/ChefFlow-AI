# ChefFlow AI 🍳 - Intelligent Meal Planner & Cooking To-Do List

A premium, high-fidelity AI-powered single-page micro-app built from scratch for the **PromptWars India Hackathon (Warm-Up Challenge)**. 

**ChefFlow AI** helps users generate customized daily meal plans, interactive ingredient checklist guides, active kitchen timers, comprehensive grocery lists, and budget feasibility reports in a unified dark-mode dashboard.

---

## 🌟 Key Features

1. **Structured Daily Meal Planner (Breakfast / Lunch / Dinner)**
   - Curates custom meals for the day, adjusted for servings (household size), dietary restrictions (Vegetarian, Vegan, Keto, Gluten-Free, High-Protein), and cuisine preferences.
2. **Interactive Cooking To-Do List & Kitchen Timer**
   - Renders step-by-step cooking procedures as checkable checklists.
   - Highlights the active step, displays a progress bar, and starts a built-in kitchen timer.
   - Triggers clean double-chime audio alerts (synthesized natively via browser `AudioContext` to work offline) when steps complete, then auto-advances to the next step.
3. **Comprehensive Grocery List**
   - Automatically consolidates ingredients for all three meals into a shopping checklist grouped by aisle category (Produce, Dairy, Grains/Pantry).
   - Generates cost estimates per item.
   - Includes a **Copy List** function that copies a clean, formatted text summary to the clipboard for sharing.
4. **Intelligent Substitution Hub**
   - Lists swaps for ingredients based on **Budget (Cost)**, **Allergy**, or **Diet** preferences.
   - Includes an active search bar to lookup alternative ingredients instantly.
   - Clicking "Swap" on any ingredient instantly searches the hub.
5. **Budget Feasibility Dashboard**
   - Tracks estimated daily expenses against the user's custom daily target budget.
   - Features a circular SVG progress gauge that changes color based on budget health (Green = Feasible, Orange = Tight, Red = Over Budget).
   - Dynamically offers AI savings and optimization tips to lower ingredient costs.
6. **Dual API Modes (Live Gemini & High-Fidelity Demo Fallback)**
   - **Connect AI**: Direct client-side integration with **Google Gemini API** (`gemini-2.5-flash`) using a user-provided API key stored securely in `localStorage`.
   - **Demo Mode**: Built-in culinary fallback database that dynamically simulates AI generation matching the exact JSON schema based on the selected diet and cuisine, ensuring a perfect evaluator experience even without a key.

---

## 🛠️ Architecture & Tech Stack

To ensure instant loading, maximum portability, and zero deployment friction for the hackathon evaluators, **ChefFlow AI** is built as a self-contained Single Page Application (SPA):
- **Frontend**: Semantic HTML5.
- **Styling**: Vanilla CSS3 using custom properties (variables), backdrop-filter blur for modern glassmorphism, responsive grid/flexbox layouts, custom keyframe loaders, and custom scrollbars.
- **Logic**: Vanilla ES6+ Javascript (native client-side API requests, Web Audio API synthesis, local storage state caching).
- **Assets**: Inline SVGs for all icons, eliminating external HTTP requests and CDN dependencies.

---

## 🚀 How to Run & Deploy

### Quick Local Execution
Because the app has zero dependencies and no compilation/build steps, you can run it immediately:
1. Open the folder `C:\Users\Kunal\Antigravity`.
2. Double-click `index.html` to launch it directly in Google Chrome, Microsoft Edge, or any modern web browser.

### Instant GitHub Pages Deployment
This repository is optimized to be deployed to **GitHub Pages** in under 30 seconds:
1. Push this workspace folder to a **Public GitHub Repository**.
2. Go to the repository **Settings** -> **Pages**.
3. Under *Build and deployment*, set the Source to **Deploy from a branch** and select `main` (or your current branch) / root directory.
4. Click **Save**. Within moments, your app will be live on the web!

---

## 📊 Hackathon Criteria Alignment

- **Code Quality**: Structured semantic HTML, well-documented modular Javascript state manager, clean custom CSS variable structure.
- **Security**: Client-side Gemini API key input is saved only inside the user's browser `localStorage` and never transmitted to any third-party servers.
- **Efficiency**: Under 25KB footprint, no heavy framework runtimes, fast page load speeds, and inline vector graphics.
- **Accessibility**: Semantic layout headers, clear contrast text, keyboard-focusable form inputs, and responsive formatting across desktop, tablets, and phones.
