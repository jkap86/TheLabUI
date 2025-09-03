import { LeagueDb } from "./dbTypes";

export type User = {
  user_id: string;
  username: string;
  avatar: string;
};

export type League = {
  index: number;
  league_id: string;
  name: string;
  avatar: string;
  season: string;
  settings: LeagueSettings;
  status: string;
  scoring_settings: { [key: string]: number };
  roster_positions: string[];
  rosters: Roster[];
  user_roster: Roster;
  lm_roster_id?: number;
  updatedat?: Date;
};

export type LeagueSettings = {
  taxi_slots: number;
  reserve_slots: number;
  best_ball: number;
  type: number;
  reserve_allow_na: number;
  reserve_allow_doubtful: number;
  league_average_match: number;
  draft_rounds: number;
  playoff_week_start: number;
  trade_deadline: number;
  disable_trades: number;
  daily_waivers: number;
};

export type Roster = {
  roster_id: number;
  username: string;
  user_id: string;
  avatar: string | null;
  players: string[] | null;
  draftpicks: Draftpick[];
  starters: string[];
  taxi: string[];
  reserve: string[];
  wins: number;
  losses: number;
  ties: number;
  fp: number;
  fpa: number;
  rank?: number;
  starters_optimal_dynasty?: string[];
  starters_optimal_ppg?: string[];
  bench_ppg?: string[];
  bench_dynasty?: string[];
  ktc_dynasty__starters?: number;
  ktc_dynasty__bench_top_5?: number;
  ktc_dynasty__starter_qb?: number;
  ktc_dynasty__bench_top_qb?: number;
  ktc_dynasty__bench_top5_flex?: number;
  ktc_dynasty__starter_rb?: number;
  ktc_dynasty__starter_wr?: number;

  ros_projections__starters?: number;
  ros_projections__bench_top_5?: number;
  ros_projections__starter_qb?: number;
  ros_projections__bench_top_qb?: number;
  ros_projections__bench_top5_flex?: number;
  ros_projections__starter_rb?: number;
  ros_projections__starter_wr?: number;
};

export type Draftpick = {
  season: number;
  round: number;
  roster_id: number;
  original_user: {
    avatar: string;
    user_id: string;
    username: string;
  };
  order?: number | null;
};

export type Playershare = {
  owned: string[];
  taken: {
    lm_roster_id: number;
    lm: User;
    league_id: string;
  }[];
  available: string[];
};

export type Leaguemate = {
  user_id: string;
  username: string;
  avatar: string | null;
  leagues: string[];
};

type OptimalStarter = {
  index: number;
  slot__index: string;
  optimal_player_id: string;
  optimal_player_position: string;
  optimal_player_value: number;
  optimal_player_kickoff: number;
  current_player_id: string;
  current_player_position: string;
  current_player_value: number;
  current_player_kickoff: number;
  earlyInFlex: boolean;
  lateNotInFlex: boolean;
};

export type Matchup = {
  roster_id: number;
  matchup_id: number;
  league_id: string;
  players: string[];
  starters: string[];
  starters_optimal: OptimalStarter[];
  week?: number;
  updated_at?: Date;
  roster_id_user: number;
  roster_id_opp: number | undefined;
  username: string;
  avatar: string | null;
  user_id: string;
  values: { [player_id: string]: number };
  projection_current: number;
  projection_optimal: number;

  starters_optimal_locked: OptimalStarter[];
  projection_current_locked: number;
  projection_optimal_locked: number;

  live_values?: {
    [player_id: string]: {
      points: number;
      game_percent_complete: number;
    };
  };
  live_projection_current?: number;
  live_projection_optimal?: number;
  live_starters_optimal?: OptimalStarter[];
};

export type Trade = {
  transaction_id: string;
  status_updated: string;
  adds: { [key: string]: string };
  drops: { [key: string]: string };
  draft_picks: {
    season: string;
    round: number;
    order: number | null;
    original: string;
    old: string;
    new: string;
  }[];
  league: LeagueDb;
  managers: string[];
  rosters: Roster[];
  league_id: string;
  price_check: string[];
  players: string[];
  tips?: {
    for: { league_id: string; leaguemate_id: string; player_id: string }[];
    away: { league_id: string; leaguemate_id: string; player_id: string }[];
  };
};

export type PlayerProjection = {
  player_id: string;
  kickoff: number;
  stats: { [cat: string]: number };
  injury_status: string;
  game_id: string;
};

export type PlayerStat = {
  date: string;
  stats: { [cat: string]: number };
};

export type ProjectionEdits = {
  [player_id: string]: {
    [cat: string]: { update: number | ""; sleeper_value: number };
  };
};
