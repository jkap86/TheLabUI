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
  OAColumn1: "KTC D S Rk",
  OAColumn2: "KTC D B 5 Rk",
  OAColumn3: "KTC R S Rk",
  OAColumn4: "KTC R B 5 Rk",
  TColumn1: "KTC R S Rk",
  TColumn2: "KTC R S Rk L",
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
