import { subDays } from 'date-fns';
import { Deck, Match, Event, AppMeta } from '../domain/types';
import * as DeckRepo from './deckRepo';
import * as MatchRepo from './matchRepo';
import * as EventRepo from './eventRepo';
import { getItem, setItem, STORAGE_KEYS } from './asyncStorage';

export async function checkAndSeedIfNeeded(): Promise<void> {
  const appMeta = await getItem<AppMeta>(STORAGE_KEYS.APP_META);

  if (appMeta?.seeded) {
    return;
  }

  console.log('First run detected. Seeding data...');
  await seedData();

  await setItem<AppMeta>(STORAGE_KEYS.APP_META, {
    seeded: true,
    version: '1.0.0',
  });

  console.log('Seeding complete.');
}

async function seedData(): Promise<void> {
  const now = new Date();

  // Seed 5 decks across 3 games
  const izzet = await DeckRepo.create({
    title: 'Izzet Prowess',
    game: 'Magic: The Gathering',
    notes: 'Fast aggressive deck with cheap spells and efficient creatures.',
  });

  const golgari = await DeckRepo.create({
    title: 'Golgari Midrange',
    game: 'Magic: The Gathering',
    notes: 'Grindy midrange deck with value creatures and removal.',
  });

  const lostBox = await DeckRepo.create({
    title: 'Lost Box',
    game: 'Pokémon',
    notes: 'Control deck focused on the Lost Zone mechanic.',
  });

  const charmeleon = await DeckRepo.create({
    title: 'Charizard ex',
    game: 'Pokémon',
    notes: 'Explosive fire-type deck with energy acceleration.',
  });

  const tearlaments = await DeckRepo.create({
    title: 'Tearlaments',
    game: 'Yu-Gi-Oh!',
    notes: 'Mill-based fusion strategy.',
  });

  // Seed 6 events with variety
  const fnmModern = await EventRepo.create({
    name: 'FNM - Modern',
    game: 'Magic: The Gathering',
    date: subDays(now, 1).toISOString(),
    totalRounds: 4,
    notes: 'Friday Night Magic at local game store',
  });

  const modernRCQ = await EventRepo.create({
    name: 'Regional Championship Qualifier',
    game: 'Magic: The Gathering',
    date: subDays(now, 7).toISOString(),
    totalRounds: 6,
    notes: 'Competitive Modern tournament - Top 8 gets invite',
  });

  const pokemonPrerelease = await EventRepo.create({
    name: 'Scarlet & Violet Prerelease',
    game: 'Pokémon',
    date: subDays(now, 14).toISOString(),
    totalRounds: 3,
    notes: 'Sealed format with new set',
  });

  const pokemonLeague = await EventRepo.create({
    name: 'Pokémon League Cup',
    game: 'Pokémon',
    date: subDays(now, 5).toISOString(),
    totalRounds: 5,
    notes: 'Weekly league event - Standard format',
  });

  const yugiohLocals = await EventRepo.create({
    name: 'Yu-Gi-Oh! Locals',
    game: 'Yu-Gi-Oh!',
    date: subDays(now, 3).toISOString(),
    totalRounds: 4,
    notes: 'Casual locals tournament',
  });

  const storeChampionship = await EventRepo.create({
    name: 'Store Championship',
    game: 'Magic: The Gathering',
    date: subDays(now, 21).toISOString(),
    totalRounds: 5,
    notes: 'Quarterly championship - winner gets playmat',
  });

  // FNM - Modern (3 of 4 rounds completed)
  await MatchRepo.create({
    date: subDays(now, 1).toISOString(),
    game: 'Magic: The Gathering',
    eventId: fnmModern.id,
    roundNumber: 1,
    myDeckId: izzet.id,
    oppDeckArchetype: 'Rakdos Midrange',
    opponentName: 'Alex',
    result: 'WIN',
    score: '2-1',
    wonDieRoll: true,
    started: 'FIRST',
    notes: 'Close game 3. Drew bolt at the perfect time.',
  });

  await MatchRepo.create({
    date: subDays(now, 1).toISOString(),
    game: 'Magic: The Gathering',
    eventId: fnmModern.id,
    roundNumber: 2,
    myDeckId: izzet.id,
    oppDeckArchetype: 'Mono Green Tron',
    opponentName: 'Sam',
    result: 'LOSS',
    score: '1-2',
    wonDieRoll: false,
    started: 'SECOND',
  });

  await MatchRepo.create({
    date: subDays(now, 1).toISOString(),
    game: 'Magic: The Gathering',
    eventId: fnmModern.id,
    roundNumber: 3,
    myDeckId: izzet.id,
    oppDeckArchetype: 'Azorius Control',
    opponentName: 'Sarah',
    result: 'WIN',
    score: '2-0',
    wonDieRoll: true,
    started: 'FIRST',
    notes: 'Counterspell backup won game 2.',
  });

  // Regional Championship Qualifier (All 6 rounds completed)
  await MatchRepo.create({
    date: subDays(now, 7).toISOString(),
    game: 'Magic: The Gathering',
    eventId: modernRCQ.id,
    roundNumber: 1,
    myDeckId: golgari.id,
    oppDeckArchetype: 'Hammer Time',
    result: 'WIN',
    score: '2-0',
    wonDieRoll: true,
    started: 'FIRST',
  });

  await MatchRepo.create({
    date: subDays(now, 7).toISOString(),
    game: 'Magic: The Gathering',
    eventId: modernRCQ.id,
    roundNumber: 2,
    myDeckId: golgari.id,
    oppDeckArchetype: 'Living End',
    opponentName: 'Mike',
    result: 'WIN',
    score: '2-1',
    wonDieRoll: false,
    started: 'SECOND',
  });

  await MatchRepo.create({
    date: subDays(now, 7).toISOString(),
    game: 'Magic: The Gathering',
    eventId: modernRCQ.id,
    roundNumber: 3,
    myDeckId: golgari.id,
    oppDeckArchetype: 'Yawgmoth Combo',
    opponentName: 'Chris',
    result: 'LOSS',
    score: '1-2',
    wonDieRoll: true,
    started: 'FIRST',
  });

  await MatchRepo.create({
    date: subDays(now, 7).toISOString(),
    game: 'Magic: The Gathering',
    eventId: modernRCQ.id,
    roundNumber: 4,
    myDeckId: golgari.id,
    oppDeckArchetype: 'Izzet Murktide',
    result: 'WIN',
    score: '2-0',
    wonDieRoll: true,
    started: 'FIRST',
  });

  await MatchRepo.create({
    date: subDays(now, 7).toISOString(),
    game: 'Magic: The Gathering',
    eventId: modernRCQ.id,
    roundNumber: 5,
    myDeckId: golgari.id,
    oppDeckArchetype: 'Rhinos',
    opponentName: 'Jessica',
    result: 'WIN',
    score: '2-1',
    wonDieRoll: false,
    started: 'SECOND',
  });

  await MatchRepo.create({
    date: subDays(now, 7).toISOString(),
    game: 'Magic: The Gathering',
    eventId: modernRCQ.id,
    roundNumber: 6,
    myDeckId: golgari.id,
    oppDeckArchetype: 'Amulet Titan',
    opponentName: 'David',
    result: 'LOSS',
    score: '0-2',
    wonDieRoll: false,
    started: 'SECOND',
    notes: 'Outpaced by titan - need better sideboard plan.',
  });

  // Pokémon Prerelease (All 3 rounds completed)
  await MatchRepo.create({
    date: subDays(now, 14).toISOString(),
    game: 'Pokémon',
    eventId: pokemonPrerelease.id,
    roundNumber: 1,
    myDeckId: charmeleon.id,
    oppDeckArchetype: 'Sealed - Water/Electric',
    result: 'WIN',
    score: '2-0',
    wonDieRoll: true,
    started: 'FIRST',
  });

  await MatchRepo.create({
    date: subDays(now, 14).toISOString(),
    game: 'Pokémon',
    eventId: pokemonPrerelease.id,
    roundNumber: 2,
    myDeckId: charmeleon.id,
    oppDeckArchetype: 'Sealed - Grass/Fighting',
    result: 'WIN',
    score: '2-1',
    wonDieRoll: false,
    started: 'SECOND',
  });

  await MatchRepo.create({
    date: subDays(now, 14).toISOString(),
    game: 'Pokémon',
    eventId: pokemonPrerelease.id,
    roundNumber: 3,
    myDeckId: charmeleon.id,
    oppDeckArchetype: 'Sealed - Psychic/Dark',
    result: 'WIN',
    score: '2-0',
    wonDieRoll: true,
    started: 'FIRST',
    notes: 'Went 3-0! Pulled amazing cards.',
  });

  // Pokémon League Cup (3 of 5 rounds completed)
  await MatchRepo.create({
    date: subDays(now, 5).toISOString(),
    game: 'Pokémon',
    eventId: pokemonLeague.id,
    roundNumber: 1,
    myDeckId: lostBox.id,
    oppDeckArchetype: 'Lugia VSTAR',
    opponentName: 'Jordan',
    result: 'LOSS',
    score: '0-2',
    wonDieRoll: false,
    started: 'SECOND',
    notes: 'Bad matchup. Need to adjust strategy.',
  });

  await MatchRepo.create({
    date: subDays(now, 5).toISOString(),
    game: 'Pokémon',
    eventId: pokemonLeague.id,
    roundNumber: 2,
    myDeckId: lostBox.id,
    oppDeckArchetype: 'Mew VMAX',
    result: 'WIN',
    score: '2-0',
    wonDieRoll: true,
    started: 'FIRST',
  });

  await MatchRepo.create({
    date: subDays(now, 5).toISOString(),
    game: 'Pokémon',
    eventId: pokemonLeague.id,
    roundNumber: 3,
    myDeckId: lostBox.id,
    oppDeckArchetype: 'Gardevoir ex',
    opponentName: 'Emma',
    result: 'LOSS',
    score: '1-2',
    wonDieRoll: true,
    started: 'FIRST',
  });

  // Yu-Gi-Oh! Locals (2 of 4 rounds completed)
  await MatchRepo.create({
    date: subDays(now, 3).toISOString(),
    game: 'Yu-Gi-Oh!',
    eventId: yugiohLocals.id,
    roundNumber: 1,
    myDeckId: tearlaments.id,
    oppDeckArchetype: 'Kashtira',
    opponentName: 'Ryan',
    result: 'WIN',
    score: '2-1',
    wonDieRoll: false,
    started: 'SECOND',
  });

  await MatchRepo.create({
    date: subDays(now, 3).toISOString(),
    game: 'Yu-Gi-Oh!',
    eventId: yugiohLocals.id,
    roundNumber: 2,
    myDeckId: tearlaments.id,
    oppDeckArchetype: 'Purrely',
    result: 'WIN',
    score: '2-0',
    wonDieRoll: true,
    started: 'FIRST',
  });

  // Store Championship (All 5 rounds completed)
  await MatchRepo.create({
    date: subDays(now, 21).toISOString(),
    game: 'Magic: The Gathering',
    eventId: storeChampionship.id,
    roundNumber: 1,
    myDeckId: izzet.id,
    oppDeckArchetype: 'Jeskai Control',
    result: 'WIN',
    score: '2-1',
    wonDieRoll: true,
    started: 'FIRST',
  });

  await MatchRepo.create({
    date: subDays(now, 21).toISOString(),
    game: 'Magic: The Gathering',
    eventId: storeChampionship.id,
    roundNumber: 2,
    myDeckId: izzet.id,
    oppDeckArchetype: 'Burn',
    result: 'LOSS',
    score: '1-2',
    wonDieRoll: false,
    started: 'SECOND',
  });

  await MatchRepo.create({
    date: subDays(now, 21).toISOString(),
    game: 'Magic: The Gathering',
    eventId: storeChampionship.id,
    roundNumber: 3,
    myDeckId: izzet.id,
    oppDeckArchetype: 'Temur Footfalls',
    result: 'WIN',
    score: '2-0',
    wonDieRoll: true,
    started: 'FIRST',
  });

  await MatchRepo.create({
    date: subDays(now, 21).toISOString(),
    game: 'Magic: The Gathering',
    eventId: storeChampionship.id,
    roundNumber: 4,
    myDeckId: izzet.id,
    oppDeckArchetype: 'Grixis Death Shadow',
    result: 'WIN',
    score: '2-1',
    wonDieRoll: false,
    started: 'SECOND',
  });

  await MatchRepo.create({
    date: subDays(now, 21).toISOString(),
    game: 'Magic: The Gathering',
    eventId: storeChampionship.id,
    roundNumber: 5,
    myDeckId: izzet.id,
    oppDeckArchetype: 'Azorius Control',
    result: 'TIE',
    score: '1-1-1',
    wonDieRoll: true,
    started: 'FIRST',
    notes: 'Time called - drew into top 8.',
  });
}
