import { Trade } from "@/lib/types/userTypes";
import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import { fetchTrades } from "./tradesActions";

export interface TradesState {
  isLoadingTrades: boolean;
  trades: {
    player_id1: string | undefined;
    player_id2: string | undefined;
    player_id3: string | undefined;
    player_id4: string | undefined;
    league_type1: string;
    count: number;
    trades: Trade[];
  }[];
  errorTrades: string | null;

  searched_player1_pc: string;
  searched_player2_pc: string;
  searched_player3_pc: string;
  searched_player4_pc: string;
  league_type1: string;
}

const initialState: TradesState = {
  isLoadingTrades: false,
  trades: [],
  errorTrades: null,

  searched_player1_pc: "",
  searched_player2_pc: "",
  searched_player3_pc: "",
  searched_player4_pc: "",
  league_type1: "Any",
};

const tradesSlice = createSlice({
  name: "trades",
  initialState,
  reducers: {
    updateTradesState<K extends keyof TradesState>(
      state: Draft<TradesState>,
      action: PayloadAction<{ key: K; value: TradesState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrades.pending, (state) => {
        state.isLoadingTrades = true;
      })
      .addCase(fetchTrades.fulfilled, (state, action) => {
        state.isLoadingTrades = false;

        const existing =
          state.trades.find(
            (t) =>
              t.player_id1 === action.payload.player_id1 &&
              t.player_id2 === action.payload.player_id2 &&
              t.player_id3 === action.payload.player_id3 &&
              t.player_id4 === action.payload.player_id4 &&
              t.league_type1 === action.payload.league_type1
          )?.trades || [];

        state.trades = [
          ...state.trades.filter(
            (t) =>
              !(
                t.player_id1 === action.payload.player_id1 &&
                t.player_id2 === action.payload.player_id2 &&
                t.player_id3 === action.payload.player_id3 &&
                t.player_id4 === action.payload.player_id4 &&
                t.league_type1 === action.payload.league_type1
              )
          ),
          {
            player_id1: action.payload.player_id1,
            player_id2: action.payload.player_id2,
            player_id3: action.payload.player_id3,
            player_id4: action.payload.player_id4,
            league_type1: action.payload.league_type1,
            count: action.payload.count,
            trades: [
              ...existing,
              ...action.payload.trades.filter(
                (t: Trade) =>
                  !existing.some((e) => e.transaction_id === t.transaction_id)
              ),
            ],
          },
        ];
      })
      .addCase(fetchTrades.rejected, (state, action) => {
        state.isLoadingTrades = false;
        state.errorTrades = action.error.message || "";
      });
  },
});

export const { updateTradesState } = tradesSlice.actions;

export default tradesSlice.reducer;
