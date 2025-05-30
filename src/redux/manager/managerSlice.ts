import {
  League,
  Playershare,
  Leaguemate,
  User,
  Trade,
} from "@/lib/types/userTypes";
import { Draft, PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  fetchUser,
  fetchLeagues,
  syncLeague,
  fetchLmTrades,
} from "./managerActions";
import { colObj } from "@/lib/types/commonTypes";

export interface ManagerState {
  user: User | null;
  isLoadingUser: boolean;
  errorUser: string | null;

  leagues: { [league_id: string]: League } | null;
  isLoadingLeagues: boolean;
  errorLeagues: string | null;
  leaguesProgress: number;

  isSyncingLeague: false | string;
  errorSyncingLeague: string | null;

  playershares: {
    [player_id: string]: Playershare;
  };
  pickshares: {
    [pick_id: string]: Playershare;
  };
  leaguemates: {
    [lm_user_id: string]: Leaguemate;
  };
  leaguesValuesObj: {
    [league_id: string]: {
      [col_abbrev: string]: colObj;
    };
  };
  isLoadingLmTrades: boolean;
  lmTrades: {
    count: number;
    trades: Trade[] | null;
  };
  lmTradeSearches: {
    manager: string | undefined;
    player: string | undefined;
    count: number;
    trades: Trade[];
  }[];
  errorLmTrades: string | null;

  type1: "Redraft" | "All" | "Dynasty";
  type2: "Bestball" | "All" | "Lineup";
}

const initialState: ManagerState = {
  user: null,
  isLoadingUser: false,
  errorUser: null,

  leagues: null,
  isLoadingLeagues: false,
  errorLeagues: null,
  leaguesProgress: 0,

  isSyncingLeague: false,
  errorSyncingLeague: null,

  playershares: {},
  pickshares: {},
  leaguemates: {},

  leaguesValuesObj: {},

  isLoadingLmTrades: false,
  lmTrades: {
    count: 0,
    trades: null,
  },
  lmTradeSearches: [],
  errorLmTrades: null,

  type1: "All",
  type2: "All",
};

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    updateLeagueType1(
      state: Draft<ManagerState>,
      action: PayloadAction<"Redraft" | "All" | "Dynasty">
    ) {
      state.type1 = action.payload;
    },

    updateLeagueType2(
      state: Draft<ManagerState>,
      action: PayloadAction<"Bestball" | "All" | "Lineup">
    ) {
      state.type2 = action.payload;
    },

    updateLeaguesProgress(
      state: Draft<ManagerState>,
      action: PayloadAction<number>
    ) {
      state.leaguesProgress = action.payload;
    },

    resetState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoadingUser = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoadingUser = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoadingUser = false;

        if (action.error.code === "ERR_BAD_REQUEST") {
          state.errorUser = "Username not found";
        } else {
          state.errorUser = action.error.message || "";
        }
      });

    builder
      .addCase(fetchLeagues.pending, (state) => {
        state.isLoadingLeagues = true;
      })
      .addCase(fetchLeagues.fulfilled, (state, action) => {
        state.isLoadingLeagues = false;

        const {
          leaguesState,
          playershares,
          pickshares,
          leaguemates,
          leaguesValuesObj,
        } = action.payload;

        state.leagues = leaguesState;
        state.playershares = playershares;
        state.pickshares = pickshares;
        state.leaguemates = leaguemates;
        state.leaguesValuesObj = leaguesValuesObj;
      })
      .addCase(fetchLeagues.rejected, (state, action) => {
        state.isLoadingLeagues = false;
        state.errorLeagues = action.error.message || "";
      });

    builder
      .addCase(syncLeague.pending, (state, action) => {
        state.isSyncingLeague = action.meta.arg.league_id;
        state.errorSyncingLeague = null;
      })
      .addCase(syncLeague.fulfilled, (state, action) => {
        state.isSyncingLeague = false;

        state.leagues = {
          ...state.leagues,
          [action.payload.league_id]: action.payload,
        };
      })
      .addCase(syncLeague.rejected, (state, action) => {
        state.isSyncingLeague = false;
        state.errorLeagues = action.error.message || "";
      });

    builder
      .addCase(fetchLmTrades.pending, (state) => {
        state.isLoadingLmTrades = true;
      })
      .addCase(fetchLmTrades.fulfilled, (state, action) => {
        state.isLoadingLmTrades = false;

        const existing =
          state.lmTradeSearches.find(
            (s) =>
              s.manager === action.payload.manager &&
              s.player === action.payload.player
          )?.trades || [];

        if (action.payload.manager || action.payload.player) {
          state.lmTradeSearches = [
            ...state.lmTradeSearches.filter(
              (s) =>
                !(
                  s.manager === action.payload.manager &&
                  s.player === action.payload.player
                )
            ),
            {
              manager: action.payload.manager,
              player: action.payload.player,
              trades: [
                ...existing,
                ...action.payload.trades.filter(
                  (t: Trade) =>
                    !existing.some((e) => e.transaction_id === t.transaction_id)
                ),
              ],
              count: action.payload.count,
            },
          ];
        } else {
          state.lmTrades = {
            count: action.payload.count,
            trades: [
              ...(state.lmTrades.trades || []),
              ...action.payload.trades.filter(
                (t: Trade) =>
                  !state.lmTrades.trades?.some(
                    (t2) => t.transaction_id === t2.transaction_id
                  )
              ),
            ],
          };
        }
      });
  },
});

export const {
  updateLeagueType1,
  updateLeagueType2,
  updateLeaguesProgress,
  resetState,
} = managerSlice.actions;

export default managerSlice.reducer;
