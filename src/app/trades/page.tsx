"use client";

import Avatar from "@/components/avatar/avatar";
import LoadingIcon from "@/components/loading-icon/loading-icon";
import Search from "@/components/search/search";
import TableTrades from "@/components/table-trades/table-trades";
import useFetchAllplayers from "@/hooks/useFetchAllplayers";
import useFetchKtcCurrent from "@/hooks/useFetchKtcCurrent";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchTrades } from "@/redux/trades/tradesActions";
import { updateTradesState } from "@/redux/trades/tradesSlice";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import thelablogo from "../../../public/images/thelab.png";
import ShNavbar from "@/components/sh-navbar/sh-navbar";
import { useCallback, useMemo } from "react";
import useFetchNflState from "@/hooks/useFetchNflState";

const Trades = () => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers, nflState, isLoadingCommon } = useSelector(
    (state: RootState) => state.common
  );
  const {
    searched_player1_pc,
    searched_player2_pc,
    searched_player3_pc,
    searched_player4_pc,
    trades,
    isLoadingTrades,
  } = useSelector((state: RootState) => state.trades);
  const { user } = useSelector((state: RootState) => state.manager);

  useFetchNflState();
  useFetchAllplayers();
  useFetchKtcCurrent();

  const setSearchedPlayer1 = useCallback(
    (value: string) => {
      if (!value) {
        dispatch(
          updateTradesState({
            key: "searched_player1_pc",
            value: searched_player3_pc,
          })
        );

        dispatch(updateTradesState({ key: "searched_player3_pc", value: "" }));
      } else {
        dispatch(updateTradesState({ key: "searched_player1_pc", value }));
      }
    },
    [dispatch, searched_player3_pc]
  );

  const setSearchedPlayer2 = useCallback(
    (value: string) => {
      if (!value) {
        dispatch(
          updateTradesState({
            key: "searched_player2_pc",
            value: searched_player4_pc,
          })
        );

        dispatch(updateTradesState({ key: "searched_player4_pc", value: "" }));
      } else {
        dispatch(updateTradesState({ key: "searched_player2_pc", value }));
      }
    },
    [dispatch, searched_player4_pc]
  );

  const player_pick_options = useMemo(() => {
    const pick_seasons =
      (nflState?.season &&
        Array.from(Array(4).keys()).map(
          (key) => parseInt(nflState.season as string) + key
        )) ||
      [];

    const pick_rounds = Array.from(Array(4).keys()).map((key) => key + 1);

    const pick_orders = Array.from(Array(12).keys()).map((key) => key + 1);

    const current_season_picks = pick_rounds.flatMap((round) => {
      const season = nflState?.season as string;
      return pick_orders.map((order) => {
        const order_formatted = order.toString().padStart(2, "0");
        const pick = `${season} ${round}.${order_formatted}`;
        return {
          id: pick,
          text: pick,
          display: <div>{pick}</div>,
        };
      });
    });

    const pick_options = [
      ...pick_seasons.flatMap((season) => {
        return pick_rounds.map((round) => {
          return {
            id: `${season} ${round}.null`,
            text: `${season} Round ${round}`,
            display: (
              <div>
                {season} Round {round}
              </div>
            ),
          };
        });
      }),
      ...current_season_picks,
    ];

    return [
      ...Object.keys(allplayers || {}).map((player_id) => {
        return {
          id: player_id,
          text:
            allplayers?.[player_id]?.full_name ||
            (parseInt(player_id) ? "Inactive - " + player_id : player_id),
          display: (
            <Avatar
              id={player_id}
              text={allplayers?.[player_id]?.full_name || player_id}
              type="P"
            />
          ),
        };
      }),
      ...pick_options,
    ];
  }, [allplayers, nflState]);

  const searches = (
    <div className="flex-1 search-box flex flex-col">
      <div className=" searches-wrapper my-8">
        <div className="searches">
          <div className="text-[4rem] w-[100%] m-auto">
            <Search
              searched={
                player_pick_options.find((o) => o.id === searched_player1_pc)
                  ?.text || ""
              }
              setSearched={(value) => setSearchedPlayer1(value)}
              options={player_pick_options.filter(
                (o) =>
                  ![
                    searched_player2_pc,
                    searched_player3_pc,
                    searched_player4_pc,
                  ].includes(o.id)
              )}
              placeholder="Player"
            />
          </div>
          {searched_player1_pc ? (
            <div className="text-[4rem] w-[100%] m-auto">
              <Search
                searched={
                  player_pick_options.find((o) => o.id === searched_player3_pc)
                    ?.text || ""
                }
                setSearched={(value) =>
                  dispatch(
                    updateTradesState({ key: "searched_player3_pc", value })
                  )
                }
                options={[
                  {
                    id: "Price Check",
                    text: "$$ Price Check",
                    display: <>$$ Price Check</>,
                  },
                  ...player_pick_options.filter(
                    (o) =>
                      ![
                        searched_player1_pc,
                        searched_player2_pc,
                        searched_player4_pc,
                      ].includes(o.id)
                  ),
                ]}
                placeholder="Player 2"
              />
            </div>
          ) : null}
        </div>

        <div className="searches">
          <div className="text-[4rem] w-[100%] m-auto">
            <Search
              searched={
                player_pick_options.find((o) => o.id === searched_player2_pc)
                  ?.text || ""
              }
              setSearched={(value) => setSearchedPlayer2(value)}
              options={player_pick_options.filter(
                (o) =>
                  ![
                    searched_player1_pc,
                    searched_player3_pc,
                    searched_player4_pc,
                  ].includes(o.id)
              )}
              placeholder="Player"
              disabled={searched_player1_pc ? false : true}
            />
          </div>
          {searched_player2_pc ? (
            <div className="text-[4rem] w-[100%] m-auto">
              <Search
                searched={
                  player_pick_options.find((o) => o.id === searched_player4_pc)
                    ?.text || ""
                }
                setSearched={(value) =>
                  dispatch(
                    updateTradesState({ key: "searched_player4_pc", value })
                  )
                }
                options={[
                  {
                    id: "Price Check",
                    text: "**Price Check**",
                    display: <>**Price Check**</>,
                  },
                  ...player_pick_options.filter(
                    (o) =>
                      ![
                        searched_player1_pc,
                        searched_player2_pc,
                        searched_player3_pc,
                      ].includes(o.id)
                  ),
                ]}
                placeholder="Player 2"
              />
            </div>
          ) : null}
        </div>
      </div>
      {isLoadingTrades ||
      trades.some(
        (t) =>
          t.player_id1 === searched_player1_pc &&
          t.player_id2 === searched_player2_pc &&
          t.player_id3 === searched_player3_pc &&
          t.player_id4 === searched_player4_pc
      ) ? null : (
        <button
          className="text-[2.5rem] px-6 py-3 bg-blue-900 w-fit mx-auto my-8"
          onClick={() =>
            dispatch(
              fetchTrades({
                player_id1: searched_player1_pc,
                player_id2: searched_player2_pc,
                player_id3: searched_player3_pc,
                player_id4: searched_player4_pc,
                offset: tradeObj?.trades?.length || 0,
                limit: 125,
              })
            )
          }
        >
          Search
        </button>
      )}
    </div>
  );

  const tradeObj = trades.find(
    (t) =>
      t.player_id1 === searched_player1_pc &&
      t.player_id2 === searched_player2_pc &&
      t.player_id3 === searched_player3_pc &&
      t.player_id4 === searched_player4_pc
  );

  return (
    <div className="h-[100dvh] flex flex-col justify-between">
      <ShNavbar />
      <div className="flex-1 flex flex-col justify-between relative ">
        <Link href={"/tools"} className="home !p-8">
          Tools
        </Link>

        <div className="flex justify-center text-[2.5rem] !p-8 text-orange-600 font-score absolute right-0">
          <Link
            href={
              user?.user_id
                ? `/manager/${user?.username}/leaguemate-trades`
                : "/manager"
            }
            onClick={() => localStorage.setItem("tab", "leaguemate-trades")}
          >
            Leaguemate Trades
          </Link>
        </div>

        <div className="flex justify-center items-center p-8 w-fit m-auto relative">
          <Image
            src={thelablogo}
            alt="logo"
            className="w-[25rem] m-8 opacity-[.35] drop-shadow-[0_0_1rem_white]"
          />
          <h1 className="absolute !text-[15rem] font-metal !text-[var(--color7)] ![text-shadow:0_0_.5rem_red] drop-shadow-[0_0_1rem_black]">
            Trades
          </h1>
        </div>
        {isLoadingCommon.length > 0 ? null : (
          <div className="flex flex-col ">{searches}</div>
        )}
        {isLoadingTrades ? (
          <div className="flex-1 flex">
            <LoadingIcon messages={[]} />
          </div>
        ) : (
          <div className="flex-1">
            <TableTrades
              trades={tradeObj?.trades || []}
              tradeCount={tradeObj?.count}
              fetchMore={() =>
                dispatch(
                  fetchTrades({
                    player_id1: searched_player1_pc,
                    player_id2: searched_player2_pc,
                    player_id3: searched_player3_pc,
                    player_id4: searched_player4_pc,
                    offset: tradeObj?.trades?.length || 0,
                    limit: 125,
                  })
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Trades;
