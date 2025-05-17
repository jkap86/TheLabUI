import { combineReducers } from "redux";
import commonSlice from "./commonSlice";
import managerSlice from "./manager/managerSlice";
import leaguesSlice from "./leagues/leaguesSlice";
import playersSlice from "./players/playersSlice";
import standingsSlice from "./standings/standingsSlice";
import lmtradesSlice from "./lmtrades/lmtradesSlice";
import leaguematesSlice from "./leaguemates/leaguematesSlice";
import tradesSlice from "./trades/tradesSlice";

const rootReducer = combineReducers({
  common: commonSlice,
  manager: managerSlice,
  leagues: leaguesSlice,
  players: playersSlice,
  standings: standingsSlice,
  lmtrades: lmtradesSlice,
  leaguemates: leaguematesSlice,
  trades: tradesSlice,
});

export default rootReducer;
