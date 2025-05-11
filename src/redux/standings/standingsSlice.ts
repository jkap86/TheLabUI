import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface StandingsState {
  teamsColumn1: string;
  teamsColumn2: string;
  playersColumn1: string;
  playersColumn2: string;
  type: "D" | "R";
}

const initialState: StandingsState = {
  teamsColumn1: "D S",
  teamsColumn2: "D B T5",
  playersColumn1: "KTC D",
  playersColumn2: "KTC R",
  type: "R",
};

const standingsSlice = createSlice({
  name: "Standings",
  initialState,
  reducers: {
    updateStandingsState<K extends keyof StandingsState>(
      state: Draft<StandingsState>,
      action: PayloadAction<{ key: K; value: StandingsState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateStandingsState } = standingsSlice.actions;

export default standingsSlice.reducer;
