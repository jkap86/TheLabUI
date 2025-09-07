import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import { League, Matchup, ProjectionEdits, User } from "@/lib/types/userTypes";
import {
  fetchMatchups,
  fetchUserLeagueIds,
  syncMatchup,
} from "./lineupcheckerActions";
import { StatObj } from "@/lib/types/commonTypes";

export interface LineupcheckerState {
  isLoadingUserLeagueIds: boolean;
  user: User | null;
  errorLoadingUserLeagueIds: string | null;

  isLoadingMatchups: boolean;
  matchups: {
    [league_id: string]: {
      user_matchup: Matchup;
      opp_matchup?: Matchup;
      league_matchups: Matchup[];
      league: League;
    };
  };
  matchupsProgress: number;
  isUpdatingMatchups: boolean;
  updateMatchupsAvailable: boolean;

  schedule: { [team: string]: { kickoff: number; opp: string } };
  projections: { [player_id: string]: { [cat: string]: number } };
  edits: ProjectionEdits;
  errorMatchups: string | null;

  isSyncingMatchup: string;
  errorSyncing: string[];

  locked: boolean;

  liveStats: { [player_id: string]: StatObj };

  playersTab: string;
  playersTab2: string;
  matchupsType: string;

  playersCol1: string;
  playersCol2: string;
  playersCol3: string;

  leagueScoresTab: string;
  sortTeamsBy: {
    column: 2 | 3 | 4;
    asc: boolean;
  };
}

const initialState: LineupcheckerState = {
  isLoadingUserLeagueIds: false,
  user: null,
  errorLoadingUserLeagueIds: null,

  isLoadingMatchups: false,
  matchups: {},
  matchupsProgress: 0,
  isUpdatingMatchups: false,
  updateMatchupsAvailable: true,

  schedule: {},
  projections: {},
  edits: {},
  errorMatchups: null,
  isSyncingMatchup: "",
  errorSyncing: [],

  locked: true,

  liveStats: {},

  playersTab: "Leagues",
  playersTab2: "Start Over",
  matchupsType: "Start",

  playersCol1: "# Start Over",
  playersCol2: "Sub Avg S Proj",
  playersCol3: "Player2 Avg S",

  leagueScoresTab: "Matchups",
  sortTeamsBy: {
    column: 2,
    asc: false,
  },
};

const lineupcheckerSlice = createSlice({
  name: "lineupchecker",
  initialState,
  reducers: {
    resetLineupcheckerState() {
      return initialState;
    },
    updateLineupcheckerState<K extends keyof LineupcheckerState>(
      state: Draft<LineupcheckerState>,
      action: PayloadAction<{ key: K; value: LineupcheckerState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
    updateLineupcheckerEdits(
      state: Draft<LineupcheckerState>,
      action: PayloadAction<ProjectionEdits>
    ) {
      state.edits = action.payload;
    },
    updateLiveStats(
      state: Draft<LineupcheckerState>,
      action: PayloadAction<{ [player_id: string]: StatObj }>
    ) {
      state.liveStats = action.payload;
    },
    updateMatchups(
      state: Draft<LineupcheckerState>,
      action: PayloadAction<{
        [league_id: string]: {
          user_matchup: Matchup;
          opp_matchup?: Matchup;
          league_matchups: Matchup[];
          league: League;
        };
      }>
    ) {
      state.matchups = action.payload;
    },
    updateMatchupsProgress(
      state: Draft<LineupcheckerState>,
      action: PayloadAction<number>
    ) {
      state.matchupsProgress = action.payload;
    },
    updateSortTeamsBy(
      state: Draft<LineupcheckerState>,
      action: PayloadAction<{ column: 2 | 3 | 4; asc: boolean }>
    ) {
      state.sortTeamsBy = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLeagueIds.pending, (state) => {
        state.isLoadingUserLeagueIds = true;
        state.errorLoadingUserLeagueIds = null;
      })
      .addCase(fetchUserLeagueIds.fulfilled, (state, action) => {
        state.isLoadingUserLeagueIds = false;
        state.user = action.payload.user;
      })
      .addCase(fetchUserLeagueIds.rejected, (state, action) => {
        state.isLoadingUserLeagueIds = false;
        state.errorLoadingUserLeagueIds = action.error.message || "";
      });

    builder
      .addCase(fetchMatchups.pending, (state, action) => {
        const initial = action.meta.arg.initial;
        if (!initial) {
          state.isUpdatingMatchups = true;
          state.updateMatchupsAvailable = false;
        } else {
          state.isLoadingMatchups = true;
        }

        state.errorMatchups = null;
      })
      .addCase(fetchMatchups.fulfilled, (state, action) => {
        const initial = action.meta.arg.initial;

        state.matchups = action.payload.matchups;
        state.schedule = action.payload.schedule;
        state.projections = action.payload.projections;

        if (!initial) {
          state.isUpdatingMatchups = false;
        } else {
          state.isLoadingMatchups = false;
        }
      })
      .addCase(fetchMatchups.rejected, (state, action) => {
        const initial = action.meta.arg.initial;
        state.errorMatchups = action.error.message || "";
        if (!initial) {
          state.isUpdatingMatchups = false;
        } else {
          state.isLoadingMatchups = false;
        }
      });

    builder
      .addCase(syncMatchup.pending, (state, action) => {
        state.isSyncingMatchup = action.meta.arg.league_id;
        state.errorSyncing = state.errorSyncing.filter(
          (league_id) => league_id !== action.meta.arg.league_id
        );
      })
      .addCase(syncMatchup.fulfilled, (state, action) => {
        const league_id = action.meta.arg.league_id;
        state.isSyncingMatchup = "";
        if (action.payload.user_matchup) {
          state.matchups = {
            ...state.matchups,
            [league_id]: {
              user_matchup: action.payload.user_matchup,
              opp_matchup: action.payload.opp_matchup,
              league_matchups: action.payload.league_matchups,
              league: state.matchups[league_id].league,
            },
          };
        } else {
          state.matchups = Object.fromEntries(
            Object.entries(state.matchups).filter((m) => m[0] !== league_id)
          );
        }
      })
      .addCase(syncMatchup.rejected, (state, action) => {
        state.isLoadingMatchups = false;
        state.errorSyncing.push(action.meta.arg.league_id);
      });
  },
});

export const {
  resetLineupcheckerState,
  updateLineupcheckerState,
  updateLineupcheckerEdits,
  updateLiveStats,
  updateMatchups,
  updateSortTeamsBy,
} = lineupcheckerSlice.actions;

export default lineupcheckerSlice.reducer;
