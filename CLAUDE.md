# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A turn-based dungeon crawler card game (地下城探索卡牌游戏) with roguelike elements. Players explore a randomly generated 10x10 map, fight enemies using cards, manage resources (HP, Energy, Food), and progress through floors.

## Running the Game

Open `index.html` directly in a browser - no build step required. The game uses vanilla JavaScript with Canvas rendering.

## Architecture

### State Management

- **`GameState`** (state.js): Finite state machine managing game flow
  - States: `start` → `exploring` ↔ `battle` / `reward` / `danger` → `level_complete` → `exploring` → `game_over`
  - Use `GameState.setState()` for valid transitions, `GameState.forceSet()` to bypass checks

- **`Game.state`** (game.js): Central game state object containing player stats, map data, deck/hand/discard piles, enemy data, and status effects

### Module Responsibilities

| File | Purpose |
|------|---------|
| `game.js` | Core game logic, state checks (`canMove()`, `canUseCard()`, etc.), event handlers, combat system |
| `state.js` | State machine definition and transitions |
| `renderer.js` | Canvas rendering for map tiles, player character (with dynamic hair color based on gold), enemies, and icons |
| `data.js` | Static game data: `CARDS`, `ENEMIES`, `POSITIVE_EVENTS`, `NEGATIVE_EVENTS`, `LEVEL_REWARDS` |
| `index.html` | Entry point, DOM structure, event bindings |

### Game Flow

1. Player starts at (0,0), must reach exit at (9,9)
2. Moving costs 5 Food (or 10 HP if starving)
3. Each floor has enemy tiles, reward tiles, and danger tiles randomly placed
4. Combat is turn-based: draw cards, play attack/defense/skill cards using Energy, enemy attacks back
5. Completing a floor generates a new random map and grants a reward

### Combat System

- Energy: 3 max, refreshes each turn
- Cards: attack (damage), defense (shield), skill (draw cards)
- Shield absorbs damage before HP
- Status effects: `poisoned` (damage per turn), `weakened` (halved damage), `enemyStunned` (enemy skips attack)

### Key Implementation Details

- Player hair color changes dynamically based on gold amount (lines 208-209 in renderer.js)
- Map uses fog of war: only explored tiles are revealed
- Adjacent explored tiles are highlighted with gold border
- Card/player's "杀马特" style spiky hair is drawn procedurally on Canvas

### Data Structures

- `gs.map[y][x]` = tile object with `{ type, revealed, enemy? }`
- `gs.explored[y][x]` = boolean for fog of war
- Cards use spread `{...CARDS[i]}` to create copies, preventing mutation
