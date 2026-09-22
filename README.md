# 🚗 Car Out - 5-in-1 Complete 3D Parking & Traffic Puzzle Ecosystem

A full-stack multi-mode puzzle arcade inspired by **"Car Out"** (`park.master.car.parking.games` by GameLord 3D), built with **React**, **Three.js (WebGL)**, and **Node.js / Express**.

![Car Out 5-in-1](https://img.shields.io/badge/Arcade-5%20Games%20in%201-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Three.js%20%7C%20Node.js%20%7C%20TailwindCSS-blue)

---

## 🎮 The 5 Integrated Game Modes

Click the **"Games Hub"** (Gamepad icon) at the top left anytime to switch between all 5 games instantly!

### 1. 🚗 Car Out (Classic 3D Parking Jam)
* **Mechanics**: Tap vehicles to drive them out of a congested 3D parking lot. If blocked, cars bumper-recoil with screen shake and horns.
* **Features**: 25 handcrafted levels (Tutorial to Grandmaster), BFS Hint Solver, Undo stack, custom level builder.

### 2. ✏️ Park Master (Draw Path to Park)
* **Mechanics**: Draw simultaneous trajectory lines connecting each colored car (Red, Blue, Green, Yellow) to its matching colored 'P' parking bay.
* **Challenge**: Hit **"Launch Cars!"** to watch all vehicles navigate your paths at once. Avoid crossing paths at the same time or hitting central barrier obstacles!

### 3. 🚌 Bus Jam (Passenger Color Sort)
* **Mechanics**: A queue of waiting passengers must board buses of their matching color at 2 active pickup docks.
* **Challenge**: Tap unblocked buses from the holding lot to the dock. When 3 matching passengers board, the bus honks and drives away, opening its dock for the next bus. Avoid dock gridlocks!

### 4. 🚦 Traffic Escape (Highway Merge Timing)
* **Mechanics**: A busy multi-lane highway has speeding traffic cruising by. You have a queue of cars waiting at the on-ramp stop line.
* **Challenge**: Tap when you spot a gap in traffic to launch the front car. Time it right to slip through and merge safely without crashing into oncoming vehicles!

### 5. 🎯 Car Match 3D (Triple Sort Dock)
* **Mechanics**: A crowded parking lot filled with colorful vehicles. Tap cars to transfer them down into your 7-slot holding dock.
* **Challenge**: Group 3 cars of the exact same color to trigger a match pop and free up dock space. Don't let all 7 slots overflow!

---

## 💰 Unified Economy & Custom Garage Shop
* Coins earned across **any of the 5 modes** accumulate in your global player wallet!
* Visit the **Custom Garage Shop** to equip:
  - **Vehicle Fleet Skins**: Classic Fleet, Cyber Neon, Golden Luxury, Red Speedster, Police Cruiser.
  - **World Themes**: Metro Asphalt, Neon Cyberpunk, Sunny Coast, Emerald Park.

---

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd server
npm install
npm start
```
*Backend runs on `http://localhost:3001`.*

### 2. Start the Frontend Client
In a second terminal:
```bash
cd client
npm install
npm run dev
```
*Open **`http://localhost:5173`** in your browser!*

---

## 🧪 Automated Tests

Verify level solvability and multi-mode API routing:
```bash
npm run test:levels
```
