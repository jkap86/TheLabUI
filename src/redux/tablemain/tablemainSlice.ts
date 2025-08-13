import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface TablemainState {
  searched: false | string;
  page: number;
  active: false | string;
  sortBy: {
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  };
}

const initialState: TablemainState = {
  searched: false,
  page: 1,
  active: false,
  sortBy: {
    column: 0,
    asc: false,
  },
};

const tablemainSlice = createSlice({
  name: "tablemain",
  initialState,
  reducers: {
    updateTablemainState<K extends keyof TablemainState>(
      state: Draft<TablemainState>,
      action: PayloadAction<{ key: K; value: TablemainState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateTablemainState } = tablemainSlice.actions;

export default tablemainSlice.reducer;
