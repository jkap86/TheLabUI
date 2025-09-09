import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface LeaguesState {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
}

const initialState: LeaguesState = {
  column1: "Rank",
  column2: "KTC S Rk",
  column3: "Proj S Rk",
  column4: "Proj B T5 Rk",
};

const leaguesSlice = createSlice({
  name: "Leagues",
  initialState,
  reducers: {
    updateLeaguesState<K extends keyof LeaguesState>(
      state: Draft<LeaguesState>,
      action: PayloadAction<{ key: K; value: LeaguesState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateLeaguesState } = leaguesSlice.actions;

export default leaguesSlice.reducer;
