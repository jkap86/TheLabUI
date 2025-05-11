import { fetchLmTrades } from "@/redux/manager/managerActions";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useFetchLmTrades = () => {
  const dispatch: AppDispatch = useDispatch();
  const { leaguemates, lmTrades, lmTradeSearches } = useSelector(
    (state: RootState) => state.manager
  );
  const { searched_manager, searched_player } = useSelector(
    (state: RootState) => state.lmtrades
  );

  useEffect(() => {
    if (!lmTrades.trades && Object.keys(leaguemates).length > 0) {
      dispatch(fetchLmTrades({ offset: 0 }));
    }
  }, [lmTrades, leaguemates]);

  useEffect(() => {
    if (
      (searched_player || searched_manager) &&
      !lmTradeSearches.some(
        (s) => s.manager === searched_manager && s.player === searched_player
      )
    ) {
      dispatch(
        fetchLmTrades({
          manager: searched_manager,
          player: searched_player,
          offset: 0,
        })
      );
    }
  }, [searched_manager, searched_player]);
};
