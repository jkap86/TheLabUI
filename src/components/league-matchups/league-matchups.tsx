"use client";

import { Matchup } from "@/lib/types/userTypes";
import TableMain from "../table-main/table-main";
import Avatar from "../avatar/avatar";
import {
  getPlayerTotal,
  getSlotAbbrev,
  position_map,
} from "@/utils/getOptimalStarters";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { syncMatchup } from "@/redux/lineupchecker/lineupcheckerActions";
import "./league-matchups.css";

const LeagueMatchups = ({
  matchup,
}: {
  matchup: {
    user_matchup: Matchup;
    opp_matchup: Matchup;
    league_matchups: Matchup[];
    league_index: number;
    league_name: string;
    league_avatar: string | null;
  };
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers } = useSelector((state: RootState) => state.common);
  const { schedule, projections, isSyncingMatchup } = useSelector(
    (state: RootState) => state.lineupchecker
  );
  const [activeIndexUser, setActiveIndexUser] = useState<string | false>(false);
  const [activeIndexOpp, setActiveIndexOpp] = useState<string | false>(false);
  const [table1, setTable1] = useState(`Lineup`);
  const [table2, setTable2] = useState(`Lineup`);

  useEffect(() => {}, [table1]);

  useEffect(() => {}, [table2]);

  useEffect(() => {
    if (activeIndexUser) {
      setTable2("Options");
    } else {
      setTable2("Lineup");
    }
  }, [activeIndexUser]);

  useEffect(() => {
    if (activeIndexOpp) {
      setTable1("Options");
    } else {
      setTable1("Lineup");
    }
  }, [activeIndexOpp]);

  const median_current = matchup.user_matchup.league.settings
    .league_average_match
    ? (
        matchup.league_matchups.reduce(
          (acc, cur) => acc + (cur.projection_current || 0),
          0
        ) / matchup.league_matchups.length
      ).toLocaleString("en-US", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      })
    : false;

  const median_optimal = matchup.user_matchup.league.settings
    .league_average_match
    ? (
        matchup.league_matchups.reduce(
          (acc, cur) => acc + (cur.projection_optimal || 0),
          0
        ) / matchup.league_matchups.length
      ).toLocaleString("en-US", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      })
    : false;

  const getLineupTable = (matchupLocal: Matchup) => {
    const data = matchupLocal.starters.map((player_id, index) => {
      const so = matchupLocal.starters_optimal?.find(
        (so) => so.index === index
      );
      const classname = `${
        matchupLocal.starters_optimal?.some(
          (os) => os.optimal_player_id === player_id
        )
          ? "green"
          : "red"
      } ${
        (so?.earlyInFlex || so?.lateNotInFlex) &&
        matchup.user_matchup.league.settings.best_ball !== 1
          ? "yellowb"
          : ""
      }`;
      return {
        id: index.toString(),
        columns: [
          {
            text: getSlotAbbrev(matchupLocal.league.roster_positions[index]),
            colspan: 1,
            classname,
          },
          {
            text:
              player_id === "0" ? (
                "-"
              ) : (
                <Avatar
                  id={player_id}
                  text={allplayers?.[player_id]?.full_name || player_id}
                  type="P"
                />
              ),
            colspan: 5,
            classname,
          },
          {
            text: schedule[allplayers?.[player_id]?.team || ""]?.opp || "-",
            colspan: 2,
            classname,
          },
          {
            text: getPlayerTotal(
              matchupLocal.league.scoring_settings,
              projections[player_id] || {}
            ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
            colspan: 2,
            classname,
          },
        ],
      };
    });

    let total_cols;

    if (
      matchupLocal.user_id === matchup.opp_matchup.user_id &&
      median_current
    ) {
      total_cols = [
        {
          text: matchupLocal[`projection_current`].toFixed(1),
          colspan: 2,
          classname: "highlight",
        },
        {
          text: median_current,
          colspan: 2,
          classname: "italic highlight",
        },
      ];
    } else {
      total_cols = [
        {
          text: matchupLocal[`projection_current`].toFixed(1),
          colspan: 4,
          classname: "highlight",
        },
      ];
    }

    return (
      <TableMain
        key={`Lineup__${matchupLocal.user_id}`}
        type={2}
        half={true}
        headers={[
          {
            text: matchupLocal.username,
            colspan: 6,
            classname: "highlight",
          },
          ...total_cols,
        ]}
        data={data}
        placeholder=""
        sendActive={(active: string | false) => {
          matchupLocal.user_id === matchup.opp_matchup.user_id
            ? active !== activeIndexOpp && setActiveIndexOpp(active)
            : active !== activeIndexUser && setActiveIndexUser(active);
        }}
      />
    );
  };

  const getOptimalTable = (matchupLocal: Matchup) => {
    const total_cols = [
      {
        text: matchupLocal.projection_optimal.toFixed(1),
        colspan:
          matchupLocal.user_id === matchup.opp_matchup.user_id && median_optimal
            ? 2
            : 4,
        classname: "highlight",
      },
    ];

    if (
      matchupLocal.user_id === matchup.opp_matchup.user_id &&
      median_optimal
    ) {
      total_cols.push({
        text: median_optimal,
        colspan: 2,
        classname: "italic highlight",
      });
    }
    return (
      <TableMain
        key={`Optimal__${matchupLocal.user_id}`}
        type={2}
        half={true}
        headers={[
          { text: matchupLocal.username, colspan: 6, classname: "highlight" },
          ...total_cols,
        ]}
        data={(matchupLocal.starters_optimal || []).map((so, index) => {
          const player_id = so.optimal_player_id;

          const classname = `green`;
          return {
            id: index.toString(),
            columns: [
              {
                text: getSlotAbbrev(
                  matchupLocal.league.roster_positions[index]
                ),
                colspan: 1,
                classname,
              },
              {
                text: (
                  <Avatar
                    id={player_id}
                    text={allplayers?.[player_id]?.full_name || player_id}
                    type="P"
                  />
                ),
                colspan: 5,
                classname,
              },
              {
                text: schedule[allplayers?.[player_id]?.team || ""]?.opp || "-",
                colspan: 2,
                classname,
              },
              {
                text: getPlayerTotal(
                  matchupLocal.league.scoring_settings,
                  projections[player_id] || {}
                ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
                colspan: 2,
                classname,
              },
            ],
          };
        })}
        placeholder=""
      />
    );
  };

  const getSlotOptionsTable = (matchupLocal: Matchup) => {
    const activeIndex =
      matchupLocal.user_id === matchup.opp_matchup.user_id
        ? activeIndexOpp
        : activeIndexUser;
    const slot_options =
      (activeIndex &&
        matchupLocal.players.filter(
          (player_id) =>
            !matchupLocal.starters.includes(player_id) &&
            position_map[
              matchupLocal.league.roster_positions[parseInt(activeIndex)]
            ]?.includes(allplayers?.[player_id]?.position || "")
        )) ||
      [];

    return (
      <TableMain
        key={`Options__${matchupLocal.user_id}`}
        type={2}
        half={true}
        headers={[]}
        data={slot_options
          .sort(
            (a, b) =>
              getPlayerTotal(
                matchupLocal.league.scoring_settings,
                projections[b] || {}
              ) -
              getPlayerTotal(
                matchupLocal.league.scoring_settings,
                projections[a] || {}
              )
          )
          .map((so) => {
            const classname = matchupLocal.starters_optimal?.some(
              (so2) => so2.optimal_player_id === so
            )
              ? "green"
              : getPlayerTotal(
                  matchupLocal.league.scoring_settings,
                  projections[so]
                ) >
                getPlayerTotal(
                  matchupLocal.league.scoring_settings,
                  projections[
                    matchupLocal.starters[
                      (activeIndex && parseInt(activeIndex)) || 0
                    ]
                  ]
                )
              ? "yellow"
              : "red";
            return {
              id: so,
              columns: [
                {
                  text: allplayers?.[so]?.position || "-",
                  classname,
                  colspan: 1,
                },
                {
                  text: (
                    <Avatar
                      id={so}
                      text={allplayers?.[so].full_name || so}
                      type="P"
                    />
                  ),
                  colspan: 5,
                  classname,
                },
                {
                  text: schedule[allplayers?.[so]?.team || ""]?.opp || "-",
                  colspan: 2,
                  classname,
                },
                {
                  text: getPlayerTotal(
                    matchupLocal.league.scoring_settings,
                    projections[so] || {}
                  ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
                  colspan: 2,
                  classname,
                },
              ],
            };
          })}
        placeholder=""
      />
    );
  };

  const tableOptions = [`Lineup`, `Optimal`];

  const getTableComponent = (table: string, num: 1 | 2) => {
    const m = num === 1 ? matchup.user_matchup : matchup.opp_matchup;
    const opp =
      m.user_id === matchup.user_matchup.user_id
        ? matchup.opp_matchup
        : matchup.user_matchup;

    return table.includes("Lineup")
      ? getLineupTable(m)
      : table.includes("Optimal")
      ? getOptimalTable(m)
      : getSlotOptionsTable(opp);
  };

  const table1Component = getTableComponent(table1, 1);

  const table2Component = getTableComponent(table2, 2);

  const select_classname = `h-full w-fit bg-yellow-900 text-center`;

  return (
    <>
      <div className="nav">
        <div className="flex justify-evenly w-[50%]">
          {table1 === "Options" ? (
            <button className="active">Options</button>
          ) : (
            tableOptions.map((option) => {
              return (
                <button
                  key={option}
                  className={table1 === option ? "active" : "opacity-[.5]"}
                  onClick={() => setTable1(option)}
                >
                  {option}
                </button>
              );
            })
          )}
          {/* 
          <select
            value={table1}
            className={select_classname}
            onChange={(e) => setTable1(e.target.value)}
          >
            {tableOptions.map((to) => {
              return (
                <option
                  key={to}
                  value={to}
                  disabled={to === "Options" && !activeIndexOpp}
                >
                  {to}
                </option>
              );
            })}
          </select>
          */}
        </div>
        <div className="sync">
          <i
            className={
              "fa-solid fa-arrows-rotate " +
              (isSyncingMatchup === matchup.user_matchup.league_id
                ? "rotate"
                : "")
            }
            onClick={() =>
              dispatch(
                syncMatchup({
                  league_id: matchup.user_matchup.league_id,
                  user_id: matchup.user_matchup.user_id,
                  index: matchup.user_matchup.league.index,
                })
              )
            }
          ></i>
        </div>
        <div className="flex justify-evenly w-[50%]">
          {table2 === "Options" ? (
            <button className="active">Options</button>
          ) : (
            tableOptions.map((option) => {
              return (
                <button
                  key={option}
                  className={table2 === option ? "active" : "opacity-[.5]"}
                  onClick={() => setTable2(option)}
                >
                  {option}
                </button>
              );
            })
          )}
          {/* 
          <select
            value={table2}
            className={select_classname}
            onChange={(e) => setTable2(e.target.value)}
          >
            {tableOptions.map((to) => {
              return (
                <option
                  key={to}
                  value={to}
                  disabled={to === "Options" && !activeIndexUser}
                >
                  {to}
                </option>
              );
            })}
          </select>
            */}
        </div>
      </div>
      <div className="relative z-0">
        {table1Component}

        {table2Component}
      </div>
    </>
  );
};

export default LeagueMatchups;
