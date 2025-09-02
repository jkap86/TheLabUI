"use client";

import { League, Matchup } from "@/lib/types/userTypes";
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
    opp_matchup?: Matchup;
    league_matchups: Matchup[];
    league: League;
  };
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers, nflState } = useSelector(
    (state: RootState) => state.common
  );
  const { schedule, projections, isSyncingMatchup, edits } = useSelector(
    (state: RootState) => state.lineupchecker
  );
  const [activeIndexUser, setActiveIndexUser] = useState<string | false>(false);
  const [activeIndexOpp, setActiveIndexOpp] = useState<string | false>(false);
  const [table1, setTable1] = useState(`Lineup`);
  const [table2, setTable2] = useState(`Lineup`);

  console.log({ matchup });
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

  const median_current = matchup.league.settings.league_average_match
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

  const median_optimal = matchup.league.settings.league_average_match
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

  const getLineupTable = (matchupLocal?: Matchup) => {
    const data = (matchupLocal?.starters || []).map((player_id, index) => {
      const so = matchupLocal?.starters_optimal?.find(
        (so) => so.index === index
      );
      const classname = `${
        matchupLocal?.starters_optimal?.some(
          (os) => os.optimal_player_id === player_id
        )
          ? "green"
          : "red"
      } ${
        (so?.earlyInFlex || so?.lateNotInFlex) &&
        matchup.league.settings.best_ball !== 1
          ? "yellowb"
          : ""
      }`;

      return {
        id: index.toString(),
        columns: [
          {
            text: getSlotAbbrev(matchup.league.roster_positions[index]),
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
            text: (matchupLocal?.values[player_id] ?? 0).toFixed(1),
            colspan: 2,
            classname: Object.keys(edits[player_id] || {}).some(
              (cat) =>
                edits[player_id][cat].sleeper_value !==
                edits[player_id][cat].update
            )
              ? "text-yellow-600"
              : classname,
          },
        ],
      };
    });

    let total_cols;

    if (
      matchupLocal?.user_id === matchup.opp_matchup?.user_id &&
      median_current
    ) {
      total_cols = [
        {
          text: matchupLocal?.[`projection_current`].toFixed(1) || "-",
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
          text: matchupLocal?.[`projection_current`]?.toFixed(1) || "-",
          colspan: 4,
          classname: "highlight",
        },
      ];
    }

    return (
      <TableMain
        key={`Lineup__${matchupLocal?.user_id}`}
        type={2}
        half={true}
        headers={[
          {
            text: matchupLocal?.username || "No Opp",
            colspan: 6,
            classname: "highlight",
          },
          ...total_cols,
        ]}
        data={data}
        placeholder=""
        sendActive={(active: string | false) => {
          if (matchupLocal?.user_id === matchup.opp_matchup?.user_id) {
            if (active !== activeIndexOpp) {
              setActiveIndexOpp(active);
            }
          } else {
            if (active !== activeIndexUser) {
              setActiveIndexUser(active);
            }
          }
        }}
      />
    );
  };

  const getOptimalTable = (matchupLocal?: Matchup) => {
    const total_cols = [
      {
        text: matchupLocal?.projection_optimal.toFixed(1) || "-",
        colspan:
          matchupLocal?.user_id === matchup.opp_matchup?.user_id &&
          median_optimal
            ? 2
            : 4,
        classname: "highlight",
      },
    ];

    if (
      matchupLocal?.user_id === matchup.opp_matchup?.user_id &&
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
        key={`Optimal__${matchupLocal?.user_id}`}
        type={2}
        half={true}
        headers={[
          {
            text: matchupLocal?.username || "-",
            colspan: 6,
            classname: "highlight",
          },
          ...total_cols,
        ]}
        data={(matchupLocal?.starters_optimal || []).map((so, index) => {
          const player_id = so.optimal_player_id;

          const classname = `green`;
          return {
            id: index.toString(),
            columns: [
              {
                text: getSlotAbbrev(matchup.league.roster_positions[index]),
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
                text: (matchupLocal?.values[player_id] ?? 0).toFixed(1),
                colspan: 2,
                classname: Object.keys(edits[player_id] || {}).some(
                  (cat) =>
                    edits[player_id][cat].sleeper_value !==
                    edits[player_id][cat].update
                )
                  ? "text-yellow-600"
                  : classname,
              },
            ],
          };
        })}
        placeholder=""
      />
    );
  };

  const getSlotOptionsTable = (matchupLocal?: Matchup) => {
    const activeIndex =
      matchupLocal?.user_id === matchup.opp_matchup?.user_id
        ? activeIndexOpp
        : activeIndexUser;
    const slot_options =
      (activeIndex &&
        matchupLocal?.players.filter(
          (player_id) =>
            !matchupLocal.starters.includes(player_id) &&
            position_map[
              matchup.league.roster_positions[parseInt(activeIndex)]
            ]?.includes(allplayers?.[player_id]?.position || "")
        )) ||
      [];

    return (
      <TableMain
        key={`Options__${matchupLocal?.user_id}`}
        type={2}
        half={true}
        headers={[]}
        data={slot_options
          .sort(
            (a, b) =>
              getPlayerTotal(matchup.league.scoring_settings, {
                ...(projections[b] || {}),
                ...Object.fromEntries(
                  Object.keys(edits[b] || {}).map((cat) => {
                    return [cat, Number(edits[b][cat].update)];
                  })
                ),
              }) -
              getPlayerTotal(matchup.league.scoring_settings, {
                ...(projections[a] || {}),
                ...Object.fromEntries(
                  Object.keys(edits[a] || {}).map((cat) => {
                    return [cat, Number(edits[a][cat].update)];
                  })
                ),
              })
          )
          .map((so) => {
            const current_player_id =
              matchupLocal?.starters[
                (activeIndex && parseInt(activeIndex)) || 0
              ];
            const classname = matchupLocal?.starters_optimal?.some(
              (so2) => so2.optimal_player_id === so
            )
              ? "green"
              : getPlayerTotal(matchup.league.scoring_settings, {
                  ...projections[so],
                  ...Object.fromEntries(
                    Object.keys(edits[so] || {}).map((cat) => {
                      return [cat, Number(edits[so][cat].update)];
                    })
                  ),
                }) >
                (current_player_id
                  ? getPlayerTotal(matchup.league.scoring_settings, {
                      ...projections[current_player_id],
                      ...Object.fromEntries(
                        Object.keys(edits[current_player_id] || {}).map(
                          (cat) => {
                            return [
                              cat,
                              Number(edits[current_player_id][cat].update),
                            ];
                          }
                        )
                      ),
                    })
                  : 0)
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
                  text: (matchupLocal?.values?.[so] ?? 0).toFixed(1),
                  colspan: 2,
                  classname: Object.keys(edits[so] || {}).some(
                    (cat) =>
                      edits[so][cat].sleeper_value !== edits[so][cat].update
                  )
                    ? "text-yellow-600"
                    : classname,
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
      m?.user_id === matchup.user_matchup.user_id
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
                  index: matchup.league.index,
                  week: Math.max(1, nflState?.leg as number),
                  best_ball: matchup.league.settings.best_ball,
                  edits,
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
