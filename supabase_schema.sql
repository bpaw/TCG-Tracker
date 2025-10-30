-- MyTCG Tracker - Supabase Database Schema
-- Run this in your Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  game TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_rounds INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  game TEXT NOT NULL,
  my_deck_id UUID REFERENCES public.decks(id) ON DELETE SET NULL,
  opp_deck_archetype TEXT NOT NULL,
  opponent_name TEXT,
  result TEXT NOT NULL,
  score TEXT,
  won_die_roll BOOLEAN,
  started TEXT,
  on_the_play BOOLEAN,
  round_number INTEGER NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  one_piece_leader TEXT,
  one_piece_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Decks Table
CREATE TABLE IF NOT EXISTS public.decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  game TEXT NOT NULL,
  archetype TEXT,
  colors TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for better query performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_game ON public.events(game);

CREATE INDEX IF NOT EXISTS idx_matches_user_id ON public.matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_event_id ON public.matches(event_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_game ON public.matches(game);
CREATE INDEX IF NOT EXISTS idx_matches_deck_id ON public.matches(my_deck_id);

CREATE INDEX IF NOT EXISTS idx_decks_user_id ON public.decks(user_id);
CREATE INDEX IF NOT EXISTS idx_decks_game ON public.decks(game);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Users can view their own events"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON public.events FOR DELETE
  USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view their own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON public.matches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches"
  ON public.matches FOR DELETE
  USING (auth.uid() = user_id);

-- Decks policies
CREATE POLICY "Users can view their own decks"
  ON public.decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decks"
  ON public.decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks"
  ON public.decks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks"
  ON public.decks FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_decks_updated_at
  BEFORE UPDATE ON public.decks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
