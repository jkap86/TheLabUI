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
  column2: "KTC D",
  column3: "Age",
  column4: "Ppr Proj",
  filterPosition: "All",
  filterTeam: "All",
  filterDraftClass: "All",
  playerLeaguesTab: "O",
  OAColumn1: "KTC S Rk",
  OAColumn2: "KTC B T5 Rk",
  OAColumn3: "Proj S Rk",
  OAColumn4: "Proj B T5 Rk",
  TColumn1: "Proj S Rk",
  TColumn2: "Proj S Rk Lm",
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
