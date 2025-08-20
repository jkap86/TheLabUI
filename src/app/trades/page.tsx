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

const Trades = () => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers } = useSelector((state: RootState) => state.common);
  const {
    searched_player1_pc,
    searched_player2_pc,
    searched_player3_pc,
    searched_player4_pc,
    trades,
    isLoadingTrades,
  } = useSelector((state: RootState) => state.trades);
  const { user } = useSelector((state: RootState) => state.manager);

  useFetchAllplayers();
  useFetchKtcCurrent();

  const player_pick_options = [
    ...Object.keys(allplayers || {}).map((player_id) => {
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
  ];

  const searches = (
    <div className="search-box flex flex-col items-center">
      <div className="searches-wrapper">
        <div className="searches pc">
          <p>Team 1</p>
          <Search
            searched={
              allplayers?.[searched_player1_pc]?.full_name ||
              searched_player1_pc
            }
            setSearched={(value) =>
              dispatch(updateTradesState({ key: "searched_player1_pc", value }))
            }
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
          {searched_player1_pc ? (
            <Search
              searched={
                allplayers?.[searched_player2_pc]?.full_name ||
                searched_player2_pc
              }
              setSearched={(value) =>
                dispatch(
                  updateTradesState({ key: "searched_player2_pc", value })
                )
              }
              options={player_pick_options.filter(
                (o) =>
                  ![
                    searched_player1_pc,
                    searched_player3_pc,
                    searched_player4_pc,
                  ].includes(o.id)
              )}
              placeholder="Player 2"
            />
          ) : null}
        </div>
        {
          <div className="searches">
            <p>Team 2</p>
            <Search
              searched={
                allplayers?.[searched_player3_pc]?.full_name ||
                searched_player3_pc
              }
              setSearched={(value) =>
                dispatch(
                  updateTradesState({ key: "searched_player3_pc", value })
                )
              }
              options={player_pick_options.filter(
                (o) =>
                  ![
                    searched_player1_pc,
                    searched_player2_pc,
                    searched_player4_pc,
                  ].includes(o.id)
              )}
              placeholder="Player"
              disabled={searched_player1_pc ? false : true}
            />
            {searched_player3_pc ? (
              <Search
                searched={
                  allplayers?.[searched_player4_pc]?.full_name ||
                  searched_player4_pc
                }
                setSearched={(value) =>
                  dispatch(
                    updateTradesState({ key: "searched_player4_pc", value })
                  )
                }
                options={player_pick_options.filter(
                  (o) =>
                    ![
                      searched_player1_pc,
                      searched_player2_pc,
                      searched_player3_pc,
                    ].includes(o.id)
                )}
                placeholder="Player 2"
              />
            ) : null}
          </div>
        }
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
          className="text-[2.5rem] px-6 py-3 bg-blue-900"
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
    <>
      <ShNavbar />
      <div className="relative">
        <Link href={"/tools"} className="home !p-8">
          Tools
        </Link>
        {isLoadingTrades ? (
          <LoadingIcon messages={[]} />
        ) : (
          <>
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
            {searches}
            <TableTrades
              trades={tradeObj?.trades || []}
              tradeCount={tradeObj?.count || 0}
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
          </>
        )}
      </div>
    </>
  );
};

export default Trades;
