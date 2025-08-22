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
import RostersComparisonPage from "@/components/rosters-comparison/rosters-comparison";
import { Roster } from "@/lib/types/userTypes";
import "./leaguemate-trades.css";

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
      <div className="text-[4rem] w-[40%] m-auto">
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
      </div>
      <div className="text-[4rem] w-[40%] m-auto">
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

  const rosterIncludesPlayerPick = (id: string, roster: Roster) => {
    return id
      ? roster.players?.includes(id) ||
          roster.draftpicks.some(
            (draft_pick) => id === getDraftPickIdFromRaw(draft_pick)
          )
      : true;
  };

  const potentialTrades = useMemo(() => {
    const trades: {
      league: {
        league_id: string;
        name: string;
        avatar: string | null;
        user_roster_id: number;
      };
      lm: {
        user_id: string;
        username: string;
        avatar: string | null;
        roster_id: number;
      };
    }[] = [];

    if (leagues && give1 && receive1)
      Object.keys(leagues)
        .filter((league_id) => {
          const allowsTrading =
            !leagues[league_id].settings.disable_trades &&
            leagues[league_id].settings.trade_deadline >=
              (nflState?.leg as number);

          const userGiven1 = rosterIncludesPlayerPick(
            give1,
            leagues[league_id].user_roster
          );

          const userGiven2 = rosterIncludesPlayerPick(
            give2,
            leagues[league_id].user_roster
          );

          const lmReceive = receive1
            ? leagues[league_id].rosters.some((r) => {
                const lmReceive1 = rosterIncludesPlayerPick(receive1, r);
                const lmReceive2 = rosterIncludesPlayerPick(receive2, r);

                return lmReceive1 && lmReceive2;
              })
            : false;

          return allowsTrading && userGiven1 && userGiven2 && lmReceive;
        })
        .forEach((league_id) => {
          const rosters = leagues[league_id].rosters.filter((r) => {
            const isNotUserRoster =
              r.roster_id !== leagues[league_id].user_roster.roster_id;

            const lmReceive1 = receive1
              ? rosterIncludesPlayerPick(receive1, r)
              : false;

            const lmReceive2 = rosterIncludesPlayerPick(receive2, r);

            return isNotUserRoster && lmReceive1 && lmReceive2;
          });

          rosters.forEach((r) => {
            const {
              name,
              avatar: league_avatar,
              user_roster,
            } = leagues[league_id];
            const { user_id, username, avatar: lm_avatar, roster_id } = r;
            trades.push({
              league: {
                league_id,
                name,
                avatar: league_avatar,
                user_roster_id: user_roster.roster_id,
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
  }, [nflState, leagues, give1, give2, receive1, receive2]);

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

  const data = potentialTrades.map((pt) => {
    return {
      id: `${pt.league.league_id}__${pt.lm.roster_id}`,
      columns: [
        {
          text: <Avatar id={pt.league.avatar} text={pt.league.name} type="L" />,
          colspan: 12,
          classname: "",
        },
        {
          text: <Avatar id={pt.lm.avatar} text={pt.lm.username} type="U" />,
          colspan: 12,
          classname: "",
        },
      ],
      secondary: leagues ? (
        <RostersComparisonPage
          league={leagues[pt.league.league_id]}
          roster_id1={pt.league.user_roster_id}
          roster_id2={pt.lm.roster_id}
        />
      ) : (
        <></>
      ),
    };
  });

  const give1Text = giveOptions.find((o) => o.id === give1)?.text;
  const give2Text = giveOptions.find((o) => o.id === give2)?.text;
  const receive1Text = receiveOptions.find((o) => o.id === receive1)?.text;
  const receive2Text = receiveOptions.find((o) => o.id === receive2)?.text;

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
                className="w-full h-full text-[4rem] font-hugmate text-blue-400"
              >
                Find Trades
              </button>
              {findTrades ? (
                <div>
                  <div className="flex justify-center">
                    <div className="flex flex-col m-8 items-center text-[4rem]">
                      <label className="font-pulang bg-[var(--color2)] w-full text-center red">
                        Trade Away
                      </label>
                      <Search
                        searched={give1Text || ""}
                        setSearched={setGive1}
                        options={giveOptions.filter(
                          (o) => !selected.includes(o.id)
                        )}
                        placeholder="Player/Pick"
                      />

                      {give1 ? (
                        <Search
                          searched={give2Text || ""}
                          setSearched={setGive2}
                          options={giveOptions.filter(
                            (o) => !selected.includes(o.id)
                          )}
                          placeholder="Player/Pick"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col m-8 items-center text-[4rem]">
                      <label className="font-pulang bg-[var(--color2)] w-full text-center green">
                        Trade For
                      </label>
                      <Search
                        searched={receive1Text || ""}
                        setSearched={setReceive1}
                        options={receiveOptions.filter(
                          (o) => !selected.includes(o.id)
                        )}
                        placeholder="Player/Pick"
                      />
                      {receive1 ? (
                        <Search
                          searched={receive2Text || ""}
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
                    headers={[
                      {
                        text: give1Text || give1,
                        colspan: give2 ? 5 : 11,
                        classname: "red !text-[2.5rem]",
                      },
                      {
                        text: "+",
                        colspan: give2 ? 1 : 0,
                        classname: give2 ? "" : "hidden",
                      },
                      {
                        text: allplayers?.[give2]?.full_name || give2,
                        colspan: give2 ? 5 : 0,
                        classname: give2
                          ? "red !text-[2.5rem] leading-tight"
                          : "hidden",
                      },

                      {
                        text: "\u21D4",
                        colspan: 2,
                        classname: "text-yellow-600 text-[5rem]",
                      },
                      {
                        text: allplayers?.[receive1]?.full_name || receive1,
                        colspan: receive2 ? 5 : 11,
                        classname: "green !text-[2.5rem] leading-tight",
                      },
                      {
                        text: "+",
                        colspan: receive2 ? 1 : 0,
                        classname: receive2 ? "" : "hidden",
                      },
                      {
                        text: allplayers?.[receive2]?.full_name || receive2,
                        colspan: receive2 ? 5 : 0,
                        classname: receive2
                          ? "green !text-[2.5rem] leading-tight"
                          : "hidden",
                      },
                    ]}
                    data={
                      !give1 || !receive1
                        ? [
                            {
                              id: "-",
                              columns: [
                                {
                                  text: `Selects Players/Picks to ${
                                    give1 ? "" : "Give"
                                  }${!(give1 || receive1) ? " And " : ""}${
                                    receive1 ? "" : "Receive"
                                  }`,
                                  colspan: 24,
                                  classname: "text-yellow-600",
                                },
                              ],
                            },
                          ]
                        : data
                    }
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
