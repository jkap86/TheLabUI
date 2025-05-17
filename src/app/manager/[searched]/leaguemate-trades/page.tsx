"use client";

import { AppDispatch, RootState } from "@/redux/store";
import { use } from "react";
import { useDispatch, useSelector } from "react-redux";
import ManagerLayout from "../manager-layout";
import { useFetchLmTrades } from "@/hooks/manager/useFetchLmTrades";
import TableTrades from "@/components/table-trades/table-trades";
import Search from "@/components/search/search";
import { updatedLmtradesState } from "@/redux/lmtrades/lmtradesSlice";
import Avatar from "@/components/avatar/avatar";
import { fetchLmTrades } from "@/redux/manager/managerActions";

const LeaguemateTrades = ({
  params,
}: {
  params: Promise<{ searched: string }>;
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { allplayers } = useSelector((state: RootState) => state.common);
  const { lmTrades, lmTradeSearches, playershares, leaguemates, pickshares } =
    useSelector((state: RootState) => state.manager);
  const { searched_player, searched_manager } = useSelector(
    (state: RootState) => state.lmtrades
  );

  useFetchLmTrades();

  const searches = (
    <div className="searches">
      <Search
        searched={allplayers?.[searched_player]?.full_name || searched_player}
        setSearched={(value) =>
          dispatch(updatedLmtradesState({ key: "searched_player", value }))
        }
        options={[
          ...Object.keys(playershares || {}).map((player_id) => {
            return {
              id: player_id,
              text: allplayers?.[player_id]?.full_name || player_id,
              display: (
                <Avatar
                  id={player_id}
                  text={allplayers?.[player_id]?.full_name || player_id}
                  type="P"
                />
              ),
            };
          }),
          ...Object.keys(pickshares || {}).map((pick_id) => {
            let pick_name = pick_id;

            if (pick_name.includes("null")) {
              const pick_array = pick_id.split(" ");
              const season = pick_array[0];
              const round = pick_array[1].split(".")[0];
              pick_name = `${season} Round ${round}`;
            }
            return {
              id: pick_name,
              text: pick_name,
              display: <>{pick_name}</>,
            };
          }),
        ]}
        placeholder="Player or Pick"
      />
      <Search
        searched={leaguemates[searched_manager]?.username || searched_manager}
        setSearched={(value) =>
          dispatch(updatedLmtradesState({ key: "searched_manager", value }))
        }
        options={[
          ...Object.keys(leaguemates).map((lm_user_id) => {
            return {
              id: lm_user_id,
              text: leaguemates[lm_user_id].username,
              display: (
                <Avatar
                  id={leaguemates[lm_user_id].avatar}
                  text={leaguemates[lm_user_id].username}
                  type="U"
                />
              ),
            };
          }),
        ]}
        placeholder="Manager"
      />
    </div>
  );

  const tradesDisplay =
    searched_player || searched_manager
      ? lmTradeSearches.find(
          (s) => s.manager === searched_manager && s.player === searched_player
        )?.trades || []
      : lmTrades.trades || [];

  const tradeCount =
    searched_player || searched_manager
      ? lmTradeSearches.find(
          (s) => s.manager === searched_manager && s.player === searched_player
        )?.count || 0
      : lmTrades.count;

  const component = (
    <>
      {searches}
      <TableTrades
        trades={tradesDisplay}
        tradeCount={tradeCount}
        fetchMore={() =>
          dispatch(
            fetchLmTrades({
              manager: searched_manager,
              player: searched_player,
              offset: tradesDisplay.length,
            })
          )
        }
      />
    </>
  );

  return <ManagerLayout searched={searched} component={component} />;
};

export default LeaguemateTrades;
