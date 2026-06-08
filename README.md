# 🌿 Sushruta: The Apprentice of Kashi

An interactive, visual game simulating the surgical practices, instrumentation, and clinical decision-making of the ancient Indian sage **Sushruta**, widely regarded as the "Father of Surgery". Learn ancient surgical concepts through hands-on, playful trial and consequence.

---

## 🎮 Game Overview

Step into the shoes of an observer at the ancient Kashi Gurukul. To advance to a practicing healer, you must complete three distinct stages of training:

1. **Apprentice Practice Courtyard (Level 1)**: Four mini-simulations where you train your hands and eyes on organic materials:
   * **Yard 1: Gourd Pop** — Feel material resistance by dragging needle shapes through gourds of varying thickness.
   * **Yard 2: Thread Master** — Connect stitch points across a torn gap, balancing pull tension and spacing.
   * **Yard 3: Bamboo Maze** — Guide straight, curved, or hooked probes through narrow bends while collecting lotuses.
   * **Yard 4: Wrap Race** — Bandage linen doll joints and test active movements to ensure the wrap doesn't slip.
2. **Animal Tool Match (Level 1.5)**: Explore ancient biomimicry by matching engineered surgical tools (like the *Simhamukha* forceps or *Mandalagra* scalpel) to the animal structures that inspired them (lion jaws, crane beaks, etc.).
3. **Clinical Suture Repair (Levels 2 & 3)**: Meet four patients with unique occupations (Madhava the potter, Devadatta the carpenter, Malati the dancer, Vilas the messenger). Perform intake examinations, select the appropriate needles and thread, perform the suturing, and observe their healing over a 30-day timeline.

---

## 📁 Repository Structure

The project is built entirely on zero-dependency, vanilla web technologies:

* 📄 **`index.html`** — Holds the structural layout for all game screens, prologue, tool drawers, dialogs, and the interactive Sticker Book.
* 🎨 **`style.css`** — Features a premium, customized dark theme withOutfit/Cinzel typography, cartoon-card styling, HSL color palettes, responsive flex/grid panels, and smooth micro-animations.
* 🖌️ **`canvas.js`** — Handles HTML5 canvas drawing, collision detection, stroke physics, and interactive drag-and-drop gameplay.
* ⚙️ **`game.js`** — Manages game states, event routing, patient diagnosis telemetry, sticker unlocking logic, and level transitions.

---

## 🚀 How to Run Locally

Since the project uses vanilla HTML, CSS, and JavaScript, it does not require a complex build process. You can run it locally in three simple ways:

### Method 1: Python HTTP Server (Recommended)
If you have Python installed, open your terminal in this directory and run:
```bash
python -m http.server 8000
```
Then, open your web browser and navigate to `http://localhost:8000`.

### Method 2: Node.js Dev Server
If you prefer Node.js, you can run a static server instantly using `npx`:
```bash
npx http-server -p 8000
```
Then, open your web browser and navigate to `http://localhost:8000`.

### Method 3: Direct File Execution
You can also open the `index.html` file directly by dragging and dropping it into any modern web browser. 

*Note: Some browser security policies may restrict local file (file://) protocol execution of canvas graphics. Serving files over a local server (Methods 1 or 2) is recommended for the best experience.*

---

## 📜 Educational Concepts & Gameplay Mechanics

| Stage / Yard | Core Action | Clinical Learning Objective |
| :--- | :--- | :--- |
| **Gourd Pop** | Dragging needles through rinds | Recognizing tissue density and resistance. Selecting sharp vs. triangular needles for thick materials. |
| **Thread Master** | Spacing and tensioning stitches | Preventing tissue wrinkling or tearing. Understanding the mechanics of wound approximation. |
| **Bamboo Maze** | Guiding surgical probes | Choosing probe curvature matching anatomical channels to avoid tissue damage. |
| **Wrap Race** | Joint bandaging | Balancing compression tightness to support joint mobility without slipping. |
| **Tool Match** | Associating tools with animal shapes | Understanding biomimicry and ergonomics in instrument design (e.g. *Shalaka*, *Suchi*). |
| **Intake & Repair**| Case study analysis and stitching | Selecting sutures (cotton, hemp, horsehair) and needles tailored to patient movement requirements. |
| **Time Machine** | Suture outcome observation | Visualizing the stages of wound healing (Day 0, Day 7, Day 30) and the impact of tension on scar tissue. |

---

## 🛠️ Built With

* **HTML5 Canvas** & **ES6 Javascript** for interactive simulations.
* **Vanilla CSS3** with Custom Properties (CSS variables), Flexbox, and CSS Grid.
* **Google Fonts** (*Cinzel* for ancient headings, *Outfit* and *Inter* for interface clarity).
* **Lucide Icons** for clean, crisp iconography.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
