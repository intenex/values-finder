# Deployment Guide

This Values Compass app is designed to be self-contained and easy to deploy. It uses SQLite for data storage (stored as JSON files) and requires no external database setup.

## Features Implemented

✅ **Phase 1 & Phase 2 Visual Distinction**
- Separate progress bars for each phase
- Clear labeling: "Phase 1 - 56 rounds" and "Phase 2 - 20 final selections"
- Different background colors for phase transition

✅ **Encouraging Animations**
- Random encouragement messages every 3-6 rounds
- Animated toast notifications with progress celebration

✅ **User Guidance**
- Note on selection page about editing values later
- "Edit Values" section with clear instructions
- Confirmation dialog for "Start Over" to prevent accidental data loss

✅ **Improved UI**
- Removed "All Values Ranked" section
- Added "Back to Edit" button in rating phase
- Cleaner, more focused interface

✅ **User Authentication & Data Persistence**
- Simple email/password authentication
- All data stored in JSON files (no database setup required)
- Users can save and track their values over time
- View history of past values sessions

## Setup Instructions

1. **Clone the repository** to your server

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

4. **Set environment variables** (optional):
   ```bash
   # Data will be stored in ./data by default
   export DATA_DIR=/path/to/data/directory
   export PORT=3000
   ```

5. **Run the application**:
   ```bash
   npm start
   ```

## Data Storage

- User accounts, sessions, and values history are stored in JSON files
- Default location: `./data/` directory
- Files created:
  - `users.json` - User accounts
  - `sessions.json` - Authentication sessions
  - `values-sessions.json` - Saved values exercises

## Security Notes

- Passwords are hashed with bcrypt
- Sessions expire after 30 days
- All data is stored locally on your server

## Backup

Simply backup the `./data/` directory to preserve all user data.

## Updating

1. Pull the latest code
2. Run `npm install` to update dependencies
3. Run `npm run build` to rebuild
4. Restart the application