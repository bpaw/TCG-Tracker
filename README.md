# MyTCGTracker

A mobile-first TCG (Trading Card Game) match tracker built with React Native and Expo. Track your matches across multiple card games, manage decks, and analyze your performance.

## Features

- **Multi-Game Support**: Track matches for Magic: The Gathering, Pokémon, Yu-Gi-Oh!, Flesh and Blood, Lorcana, One Piece, and more
- **Deck Management**: Create, edit, and archive decks with notes
- **Match Logging**: Fast, tap-friendly form for logging matches with comprehensive details
- **Match History**: Filter and search through your match history
- **Statistics**: View win rates, overall records, and first vs second performance splits
- **Offline-First**: All data stored locally using AsyncStorage
- **Dark Mode**: Automatic light/dark theme support based on system preferences

## Tech Stack

- **Framework**: Expo + React Native (TypeScript)
- **Navigation**: React Navigation (tabs + stack)
- **State Management**: Zustand
- **Data Persistence**: AsyncStorage (with migration path to SQLite)
- **Forms**: React Hook Form + Zod validation
- **UI**: React Native core components with custom styling
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Expo CLI (will be installed with dependencies)
- iOS Simulator (for Mac) or Android Emulator, or Expo Go app on your device

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npx expo start
```

3. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go app on your device

## Usage

### First Launch

On first launch, the app will automatically seed sample data:
- 3 example decks (2 Magic: The Gathering, 1 Pokémon)
- 6 example matches spread across those decks

### Screens

#### Dashboard
- View recent matches (last 10)
- Overall win/loss record
- Win rate percentage
- First vs Second win rate comparison
- Quick access to "New Match" button

#### Log Match
Fast form for logging match results with fields for:
- Game selection
- Your deck (filtered by game)
- Opponent deck archetype
- Opponent name (optional)
- Result (Win/Loss/Tie)
- Score (2-0, 2-1, etc.)
- Die roll result
- Starting player (First/Second)
- Notes and tags

**Features**:
- "Save" - Saves and returns to previous screen
- "Save & New" - Saves and clears form for rapid entry

#### Match History
- View all matches sorted by date
- Filter by game, deck, and result
- Tap any match to view details

#### Match Detail
- View all match information
- Edit match (future enhancement)
- Duplicate match (prefills Log Match form)
- Delete match (with confirmation)

#### Decks
- View all decks grouped by game
- See deck statistics (wins, losses, win rate)
- Create new decks
- Edit existing decks
- Archive/unarchive decks
- Quick "Log Match" shortcut for each deck

## Project Structure

```
/src
  /domain         - Type definitions and domain models
  /data           - AsyncStorage wrapper and repository layer
  /stores         - Zustand state management stores
  /navigation     - React Navigation configuration
  /screens        - Screen components
  /components     - Reusable UI components
  /utils          - Utility functions (stats, date formatting)
  /validation     - Zod schemas for form validation
```

## Future Enhancements

- [ ] Migrate from AsyncStorage to SQLite for better performance
- [ ] Add charts and advanced analytics
- [ ] Event tracking (tournaments, FNM, etc.)
- [ ] Export data (CSV, JSON)
- [ ] Cloud sync and backup
- [ ] Matchup analysis (deck vs deck statistics)
- [ ] Sideboard notes per deck
- [ ] Timer and life counter integration

## Development

### Lint

```bash
npm run lint
```

### Testing

```bash
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
