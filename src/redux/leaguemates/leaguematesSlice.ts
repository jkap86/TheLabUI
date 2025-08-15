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
  column2: "Proj S Rk",
  column3: "Proj S Rk Lm",
  column4: "KTC S QB \u0394",
  leaguesColumn1: "Proj S Rk",
  leaguesColumn2: "Proj S Rk Lm",
  leaguesColumn3: "KTC S Rk",
  leaguesColumn4: "KTC S Rk Lm",
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
