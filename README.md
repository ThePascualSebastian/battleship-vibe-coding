# Battleship V2+ (In-Class Project)

**Course:** CPSC 3750  
**Assignment:** Battleship V2 (Vibe Coding Iterations)

## Overview

This project is a web-based implementation of the Battleship game using **HTML, CSS, JavaScript, and PHP**. The game is played between a human player and a computer opponent and focuses on **state management**, **client/server separation**, and **persistent data**.

---

## Major Iterations Implemented

### Iteration 1 — Player Ship Placement with Server Validation
- Player places ships interactively on a labeled A–J / 1–10 grid.
- Ships can be rotated before placement.
- Server-side validation ensures ships:
  - Stay within bounds
  - Do not overlap
- Computer ship placement is generated randomly and persists for the entire game.

---

### Iteration 2 — Persistent Game State and Turn-Based Logic
- Game state persists across browser refreshes.
- Scores, turns, and hits are tracked explicitly.
- Turn timers continue from their previous value after refresh.
- The game ends when all ships of one side are sunk.
- A winner message and restart option are displayed at game completion.

---

## Architecture Snapshot

### Client Responsibilities (JavaScript)
- Render the game boards and UI
- Handle user input (ship placement, rotation, firing)
- Manage timers and turn flow
- Persist active game state using `localStorage`
- Communicate with the server for validation and logging

### Server Responsibilities (PHP)
- Validate ship placement
- Log turn-by-turn statistics
- Persist historical game data in `stats.json`

### Game State Location
- **Active game state:** Browser `localStorage`
- **Historical statistics:** Server-side `stats.json`

## Known Limitations
- Computer AI uses random targeting.
- Persistent storage uses JSON instead of a database.
- Multiplayer is local only (player vs computer).
- Cannot see which rotation the ship is on before placing
## DEMO
https://www.loom.com/share/c242467d77b04dd79c46be9d19ceb474
