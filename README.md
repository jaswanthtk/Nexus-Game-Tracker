# Nexus - Game Tracker 🎮

Hey there! Welcome to Nexus. This is a university web project I built to help track and manage gaming libraries. 

If you're anything like me, you probably have a ton of games spread across Steam, PlayStation, Xbox, and maybe even a few retro consoles. It gets pretty hard to keep track of what you've played, what's sitting in your backlog, and what you're waiting to release. That's exactly why I built this.

## What is it?
Nexus is a fully static, client-side web application built with Vanilla HTML, CSS, and JavaScript. It uses your browser's local storage to save your game library data, meaning everything is super fast and you don't need to spin up a backend database just to use it.

## Features
* **Personal Vault (Logbook)**: A kanban-style board where you can drag and drop games between "Played", "Backlog", and "Upcoming".
* **RAWG API Integration**: You can search for games directly through the RAWG API and add them to your library with one click.
* **Admin Dashboard**: If you login as an admin, you get access to a full dashboard with analytics, telemetry, and a data table to manage all the games and users registered on the system.
* **Dynamic Profile**: The client profile calculates your total playtime and your most played genres automatically based on what's in your logbook.

## How to run it
Since there's no backend, running this is as easy as it gets:
1. Clone the repo.
2. Open `index.html` in your browser, or run a simple local server (like `python3 -m http.server`).
3. You can log in using `admin` / `admin123` to check out the command dashboard.

## Tech Stack
* **HTML5** 
* **CSS3** (Custom styling with a dark cyberpunk/neon aesthetic, no heavy frameworks)
* **Vanilla JavaScript** (DOM manipulation, LocalStorage, RAWG API fetching)

Hope you enjoy checking it out! Let me know if you run into any bugs.
