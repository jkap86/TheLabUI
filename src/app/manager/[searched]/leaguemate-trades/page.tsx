"use client";

import { AppDispatch, RootState } from "@/redux/store";
import { use, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ManagerLayout from "../manager-layout";
import TableTrades from "@/components/table-trades/table-trades";
import Search from "@/components/search/search";
import { updatedLmtradesState } from "@/redux/lmtrades/lmtradesSlice";
import Avatar from "@/components/avatar/avatar";
import { fetchLmTrades } from "@/redux/manager/managerActions";
import LoadingIcon from "@/components/loading-icon/loading-icon";
import { convertDraftPickName, getDraftPickIdFromRaw } from "@/utils/getPickId";
import TableMain from "@/components/table-main/table-main";

const LeaguemateTrades = ({
  params,
}: {
  params: Promise<{ searched: string }>;
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { allplayers, nflState } = useSelector(
    (state: RootState) => state.common
  );
  const {
    leagues,
    lmTrades,
    isLoadingLmTrades,
    lmTradeSearches,
    playershares,
    leaguemates,
    pickshares,
  } = useSelector((state: RootState) => state.manager);
  const { searched_player, searched_manager } = useSelector(
    (state: RootState) => state.lmtrades
  );
  const [findTrades, setFindTrades] = useState(false);
  const [give1, setGive1] = useState("");
  const [receive1, setReceive1] = useState("");
  const [give2, setGive2] = useState("");
  const [receive2, setReceive2] = useState("");

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

  const potentialTrades = useMemo(() => {
    const trades: {
      league: {
        league_id: string;
        name: string;
        avatar: string | null;
      };
      lm: {
        user_id: string;
        username: string;
        avatar: string | null;
        roster_id: number;
      };
    }[] = [];

    leagues &&
      give1 &&
      receive1 &&
      Object.keys(leagues)
        .filter(
          (league_id) =>
            !leagues[league_id].settings.disable_trades &&
            leagues[league_id].settings.trade_deadline >=
              (nflState?.leg as number) &&
            (give1
              ? leagues[league_id].user_roster.players?.includes(give1) ||
                leagues[league_id].user_roster.draftpicks.some(
                  (draft_pick) => give1 === getDraftPickIdFromRaw(draft_pick)
                )
              : true) &&
            (receive1
              ? leagues[league_id].rosters.some(
                  (r) =>
                    r.players?.includes(receive1) ||
                    r.draftpicks.some(
                      (draft_pick) =>
                        receive1 === getDraftPickIdFromRaw(draft_pick)
                    )
                )
              : true)
        )
        .forEach((league_id) => {
          const rosters = leagues[league_id].rosters.filter((r) => {
            return (
              r.players?.includes(receive1) ||
              r.draftpicks.some(
                (draft_pick) => receive1 === getDraftPickIdFromRaw(draft_pick)
              )
            );
          });

          rosters.forEach((r) => {
            const { name, avatar: league_avatar } = leagues[league_id];
            const { user_id, username, avatar: lm_avatar, roster_id } = r;
            trades.push({
              league: {
                league_id,
                name,
                avatar: league_avatar,
              },
              lm: {
                user_id,
                username,
                avatar: lm_avatar,
                roster_id,
              },
            });
          });
        });

    return trades;
  }, [nflState, leagues, give1, receive1]);

  const giveOptions = [
    ...Object.keys(playershares)
      .filter((player_id) => playershares[player_id].owned.length > 0)
      .map((player_id) => {
        const text =
          allplayers?.[player_id]?.full_name ||
          (parseInt(player_id) && `Inactive Player - ${player_id}`) ||
          player_id;
        return {
          id: player_id,
          text,
          display: <Avatar id={player_id} type="P" text={text} />,
        };
      }),
    ...Object.keys(pickshares)
      .filter((pick_id) => pickshares[pick_id].owned.length > 0)
      .map((pick_id) => {
        return {
          id: pick_id,
          text: convertDraftPickName(pick_id),
          display: <>{convertDraftPickName(pick_id)}</>,
        };
      }),
  ];

  const receiveOptions = [
    ...Object.keys(playershares)
      .filter((player_id) => playershares[player_id].taken.length > 0)
      .map((player_id) => {
        const text =
          allplayers?.[player_id]?.full_name ||
          (parseInt(player_id) && `Inactive Player - ${player_id}`) ||
          player_id;
        return {
          id: player_id,
          text,
          display: <Avatar id={player_id} type="P" text={text} />,
        };
      }),
    ...Object.keys(pickshares)
      .filter((pick_id) => pickshares[pick_id].taken.length > 0)
      .map((pick_id) => {
        return {
          id: pick_id,
          text: convertDraftPickName(pick_id),
          display: <>{convertDraftPickName(pick_id)}</>,
        };
      }),
  ];

  const selected = [give1, give2, receive1, receive2].filter((x) => x);

  const component = (
    <>
      {isLoadingLmTrades ? (
        <LoadingIcon messages={[]} />
      ) : (
        <>
          <div className="nav-buttons">
            <div className="relative">
              {findTrades ? (
                <button
                  onClick={() => setFindTrades(false)}
                  className="absolute right-0 top-0 p-[1rem] bg-gray-900"
                >
                  Close
                </button>
              ) : null}
              <button
                onClick={() => setFindTrades(true)}
                className="w-full h-full"
              >
                Find Trades
              </button>
              {findTrades ? (
                <div>
                  <div className="flex justify-center">
                    <div className="flex flex-col m-8 items-center">
                      <label>Give</label>
                      <Search
                        searched={
                          giveOptions.find((o) => o.id === give1)?.text || ""
                        }
                        setSearched={setGive1}
                        options={giveOptions.filter(
                          (o) => !selected.includes(o.id)
                        )}
                        placeholder="Player/Pick"
                      />

                      {give1 ? (
                        <Search
                          searched={
                            giveOptions.find((o) => o.id === give2)?.text || ""
                          }
                          setSearched={setGive2}
                          options={giveOptions.filter(
                            (o) => !selected.includes(o.id)
                          )}
                          placeholder="Player/Pick"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col m-8 items-center">
                      <label>Receive</label>
                      <Search
                        searched={
                          receiveOptions.find((o) => o.id === receive1)?.text ||
                          ""
                        }
                        setSearched={setReceive1}
                        options={receiveOptions.filter(
                          (o) => !selected.includes(o.id)
                        )}
                        placeholder="Player/Pick"
                      />
                      {receive1 ? (
                        <Search
                          searched={
                            receiveOptions.find((o) => o.id === receive2)
                              ?.text || ""
                          }
                          setSearched={setReceive2}
                          options={receiveOptions.filter(
                            (o) => !selected.includes(o.id)
                          )}
                          placeholder="Player/Pick"
                        />
                      ) : null}
                    </div>
                  </div>
                  <TableMain
                    type={1}
                    headers={[]}
                    data={potentialTrades.map((pt) => {
                      return {
                        id: `${pt.league.league_id}__${pt.lm.roster_id}`,
                        columns: [
                          {
                            text: (
                              <Avatar
                                id={pt.league.avatar}
                                text={pt.league.name}
                                type="L"
                              />
                            ),
                            colspan: 1,
                            classname: "",
                          },
                          {
                            text: (
                              <Avatar
                                id={pt.lm.avatar}
                                text={pt.lm.username}
                                type="U"
                              />
                            ),
                            colspan: 1,
                            classname: "",
                          },
                        ],
                      };
                    })}
                    placeholder=""
                  />
                </div>
              ) : null}
            </div>
          </div>
          {findTrades ? null : (
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
          )}
        </>
      )}
    </>
  );

  return <ManagerLayout searched={searched} component={component} />;
};

export default LeaguemateTrades;
