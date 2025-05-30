import { fetchLmTrades } from "@/redux/manager/managerActions";
import { AppDispatch, RootState } from "@/redux/store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useFetchLmTrades = () => {
  const pathname = usePathname();
  const dispatch: AppDispatch = useDispatch();
  const { leaguemates, lmTrades, lmTradeSearches, isLoadingLmTrades } =
    useSelector((state: RootState) => state.manager);
  const { searched_manager, searched_player } = useSelector(
    (state: RootState) => state.lmtrades
  );

  useEffect(() => {
    console.log({ isLoadingLmTrades, lmTrades, leaguemates });
    if (
      !lmTrades.trades &&
      !isLoadingLmTrades &&
      Object.keys(leaguemates).length > 0 &&
      pathname.split("/")[3].toLowerCase().includes("trades")
    ) {
      dispatch(fetchLmTrades({ offset: 0 }));
    }
  }, [lmTrades.trades, leaguemates, isLoadingLmTrades]);

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
