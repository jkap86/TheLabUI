import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import { fetchMatchups, syncMatchup } from "./lineupcheckerActions";
import { Matchup } from "@/lib/types/userTypes";

export interface LineupcheckerState {
  isLoadingMatchups: boolean;
  matchups: {
    [league_id: string]: {
      user_matchup: Matchup;
      opp_matchup: Matchup;
      league_matchups: Matchup[];
      league_index: number;
      league_name: string;
      league_avatar: string | null;
      settings: {
        best_ball: number;
        type: number;
      };
    };
  };
  schedule: { [team: string]: { kickoff: number; opp: string } };
  projections: { [player_id: string]: { [cat: string]: number } };
  errorMatchups: string | null;

  isSyncingMatchup: string;
}

const initialState: LineupcheckerState = {
  isLoadingMatchups: false,
  matchups: {},
  schedule: {},
  projections: {},
  errorMatchups: null,
  isSyncingMatchup: "",
};

const lineupcheckerSlice = createSlice({
  name: "lineupchecker",
  initialState,
  reducers: {
    updateLineupcheckerState<K extends keyof LineupcheckerState>(
      state: Draft<LineupcheckerState>,
      action: PayloadAction<{ key: K; value: LineupcheckerState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchups.pending, (state) => {
        state.isLoadingMatchups = true;
      })
      .addCase(fetchMatchups.fulfilled, (state, action) => {
        state.isLoadingMatchups = false;
        state.matchups = action.payload.matchups;
        state.schedule = action.payload.schedule;
        state.projections = action.payload.projections;
      })
      .addCase(fetchMatchups.rejected, (state, action) => {
        state.isLoadingMatchups = false;
        state.errorMatchups = action.error.message || "";
      });

    builder
      .addCase(syncMatchup.pending, (state, action) => {
        state.isSyncingMatchup = action.meta.arg.league_id;
      })
      .addCase(syncMatchup.fulfilled, (state, action) => {
        const league_id = action.meta.arg.league_id;
        state.isSyncingMatchup = "";
        if (action.payload) {
          state.matchups = {
            ...state.matchups,
            [league_id]: action.payload,
          };
        } else {
          state.matchups = Object.fromEntries(
            Object.entries(state.matchups).filter((m) => m[0] !== league_id)
          );
        }
      });
  },
});

export const { updateLineupcheckerState } = lineupcheckerSlice.actions;

export default lineupcheckerSlice.reducer;
