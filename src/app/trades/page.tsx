"use client";

import Avatar from "@/components/avatar/avatar";
import Search from "@/components/search/search";
import TableTrades from "@/components/table-trades/table-trades";
import useFetchAllplayers from "@/hooks/useFetchAllplayers";
import useFetchKtcCurrent from "@/hooks/useFetchKtcCurrent";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchTrades } from "@/redux/trades/tradesActions";
import { updateTradesState } from "@/redux/trades/tradesSlice";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

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

  useFetchAllplayers();
  useFetchKtcCurrent();

  const player_pick_options = [
    ...Object.keys(allplayers || {})
      .filter(
        (player_id) =>
          allplayers?.[player_id]?.active &&
          ["QB", "RB", "WR", "TE"].includes(allplayers?.[player_id]?.position)
      )
      .map((player_id) => {
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
    <div className="search-box">
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
        {searched_player1_pc ? (
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
        ) : null}
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
      <Link href={"/"} className="home">
        Home
      </Link>
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
  );
};

export default Trades;
