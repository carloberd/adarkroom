# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Run development server:**
```bash
npm start
# Serves the game at http://localhost:8080
```

**Production (Docker/nginx):**
```bash
docker build -t adarkroom .
docker run -p 80:80 adarkroom
```

**Update translation template** (requires Python + pybabel):
```bash
npm run update_pot
# Extracts translatable strings from script/ into lang/adarkroom.pot
```

There are no automated tests or a linter configured in the project. The contributing guide requests JSHint compliance for JavaScript contributions.

## Architecture

A Dark Room is a **vanilla JavaScript browser game** — no build step, no bundler. All files are served statically. `index.html` loads scripts in dependency order via `<script>` tags.

### Script load order (from `index.html`)
1. jQuery + plugins (`lib/`)
2. `lang/langs.js` + optional per-language `strings.js`
3. `script/Button.js`, `audioLibrary.js`, `audio.js`
4. `script/engine.js` — bootstraps the game, calls `Engine.init()`
5. `script/state_manager.js` — global `$SM` object; all game state flows through here
6. `script/header.js`, `notifications.js`, `events.js`
7. Game location modules: `room.js`, `outside.js`, `world.js`, `path.js`, `ship.js`, `space.js`, `fabricator.js`
8. `script/prestige.js`, `scoring.js`
9. Event data modules under `script/events/`: `global.js`, `room.js`, `outside.js`, `encounters.js`, `setpieces.js`, `marketing.js`, `executioner.js`

### Game modules (global objects)

| Object | File | Purpose |
|--------|------|---------|
| `Engine` | `script/engine.js` | Core lifecycle: init, save/load (`localStorage`), tab routing, keyboard/swipe |
| `$SM` (StateManager) | `script/state_manager.js` | Single source of truth for all game state; emits `stateUpdate` events via jQuery Dispatch |
| `Room` | `script/room.js` | First location: fire, builder, crafting recipes |
| `Outside` | `script/outside.js` | Village: workers, income timers, gather/trap actions |
| `Path` | `script/path.js` | Dusty Path tab: outfitting, embark, calls `World.init()` |
| `World` | `script/world.js` | Procedural tile map (61×61), encounters, movement logic |
| `Ship` | `script/ship.js` | Crashed ship location and repair |
| `Space` | `script/space.js` | Asteroid dodging mini-game |
| `Fabricator` | `script/fabricator.js` | Alien tech crafting |
| `Events` | `script/events.js` | Random event engine; pools from `Events.Global`, `Events.Room`, `Events.Outside`, `Events.Marketing` |
| `AudioEngine` | `script/audio.js` | Web Audio API wrapper |
| `AudioLibrary` | `script/audioLibrary.js` | Enum of audio file paths |
| `Notifications` | `script/notifications.js` | Queued notification display |
| `Header` | `script/header.js` | Tab/location navigation |

### State management pattern

All game state is stored under the global `State` object, accessed exclusively through `$SM`:

```js
$SM.get('stores.wood')       // read
$SM.set('stores.wood', 10)   // write (triggers stateUpdate event)
$SM.add('stores.wood', 5)    // increment
```

State categories: `features`, `stores`, `character`, `income`, `timers`, `game`, `playStats`, `previous`, `outfit`, `config`, `wait`, `cooldown`.

Saves are serialized to `localStorage.gameState` as JSON.

### Event system

Random events are defined as data objects in `script/events/*.js`. Each event has `scenes` with button choices that call callbacks. Events are pooled in `Events.EventPool` and scheduled on a random timer (`_EVENT_TIME_RANGE: [3, 6]` minutes). Encounters during world exploration are in `script/events/encounters.js`.

### Localization

Translatable strings are wrapped in `_('string')` (defined in `lib/translate.js`). Running `npm run update_pot` regenerates `lang/adarkroom.pot` for translators. Per-language files live in `lang/<code>/strings.js` and optionally `lang/<code>/main.css`. Language is set via `?lang=<code>` URL param or `localStorage.lang`.

### CSS

Each location has its own stylesheet (`css/room.css`, `css/outside.css`, `css/path.css`, etc.). `css/main.css` is global. `css/dark.css` is the lights-off theme.
