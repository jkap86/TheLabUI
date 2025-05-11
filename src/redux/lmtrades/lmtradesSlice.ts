import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface LmtradesState {
  searched_player: string;
  searched_manager: string;
  detail_tab: "League" | "Tips";
}

const initialState: LmtradesState = {
  searched_player: "",
  searched_manager: "",
  detail_tab: "League",
};

const lmtradesSlice = createSlice({
  name: "lmtrades",
  initialState,
  reducers: {
    updatedLmtradesState<K extends keyof LmtradesState>(
      state: Draft<LmtradesState>,
      action: PayloadAction<{ key: K; value: LmtradesState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updatedLmtradesState } = lmtradesSlice.actions;

export default lmtradesSlice.reducer;
