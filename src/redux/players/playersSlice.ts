import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface PlayersState {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
  filterPosition: string;
  filterTeam: string;
  filterDraftClass: string;
  playerLeaguesTab: "O" | "T" | "A";
  OAColumn1: string;
  OAColumn2: string;
  OAColumn3: string;
  OAColumn4: string;
  TColumn1: string;
  TColumn2: string;
}

const initialState: PlayersState = {
  column1: "# Own",
  column2: "% Own",
  column3: "KTC D",
  column4: "KTC R",
  filterPosition: "All",
  filterTeam: "All",
  filterDraftClass: "All",
  playerLeaguesTab: "O",
  OAColumn1: "D S Rk",
  OAColumn2: "D B T5 Rk",
  OAColumn3: "P S Rk",
  OAColumn4: "P B T5 Rk",
  TColumn1: "P S Rk",
  TColumn2: "P S Rk Lm",
};

const playersSlice = createSlice({
  name: "Players",
  initialState,
  reducers: {
    updatePlayersState<K extends keyof PlayersState>(
      state: Draft<PlayersState>,
      action: PayloadAction<{ key: K; value: PlayersState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updatePlayersState } = playersSlice.actions;

export default playersSlice.reducer;
