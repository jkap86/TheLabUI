import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import { fetchMatchups } from "./lineupcheckerActions";
import { Matchup } from "@/lib/types/userTypes";

export interface LineupcheckerState {
  isLoadingMatchups: boolean;
  matchups: {
    [league_id: string]: {
      user: Matchup;
      opp: Matchup;
      league: Matchup[];
    };
  };
  errorMatchups: string | null;
}

const initialState: LineupcheckerState = {
  isLoadingMatchups: false,
  matchups: {},
  errorMatchups: null,
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

        const matchups_obj: {
          [league_id: string]: {
            user: Matchup;
            opp: Matchup;
            league: Matchup[];
          };
        } = {};
      })
      .addCase(fetchMatchups.rejected, (state, action) => {
        state.isLoadingMatchups = false;
        state.errorMatchups = action.error.message || "";
      });
  },
});

export const { updateLineupcheckerState } = lineupcheckerSlice.actions;

export default lineupcheckerSlice.reducer;
