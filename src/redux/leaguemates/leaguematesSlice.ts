import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface LeaguematesState {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
  leaguesColumn1: string;
  leaguesColumn2: string;
  leaguesColumn3: string;
  leaguesColumn4: string;
}

const initialState: LeaguematesState = {
  column1: "# Common",
  column2: "S QB D Rk",
  column3: "S QB D Rk Lm",
  column4: "S QB D Diff",
  leaguesColumn1: "D S QB Rk",
  leaguesColumn2: "D S QB Rk L",
  leaguesColumn3: "D S RB Rk",
  leaguesColumn4: "D S RB Rk L",
};

const leaguematesSlice = createSlice({
  name: "leaguemates",
  initialState,
  reducers: {
    updateLeaguematesState<K extends keyof LeaguematesState>(
      state: Draft<LeaguematesState>,
      action: PayloadAction<{ key: K; value: LeaguematesState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateLeaguematesState } = leaguematesSlice.actions;

export default leaguematesSlice.reducer;
