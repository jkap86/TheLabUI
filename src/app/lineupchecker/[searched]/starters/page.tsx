"use client";

import Avatar from "@/components/avatar/avatar";
import { RootState } from "@/redux/store";
import { use, useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import "../../../../components/heading/heading.css";
import TableMain from "@/components/table-main/table-main";
import { colObj } from "@/lib/types/commonTypes";
import { getTrendColor_Range } from "@/utils/getTrendColor";
import LineupcheckerLayout from "../lineupchecker-layout";
import PlayerMatchups from "@/components/player-matchups/player-matchups";
import PlayersFilters from "@/components/players-filters/players-filters";
import { filterPlayerIds } from "@/utils/filterPlayers";
import { position_map } from "@/utils/getOptimalStarters";

const Starters = ({ params }: { params: Promise<{ searched: string }> }) => {
  const { searched } = use(params);
  const { allplayers, nflState } = useSelector(
    (state: RootState) => state.common
  );
  const { type1, type2 } = useSelector((state: RootState) => state.manager);
  const { matchups } = useSelector((state: RootState) => state.lineupchecker);
  const [sortBy, setSortBy] = useState<{
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  }>({ column: 1, asc: false });
  const [col1, setCol1] = useState("Start");
  const [col2, setCol2] = useState("Bench");
  const [col3, setCol3] = useState("Opp Start");
  const [col4, setCol4] = useState("Opp Bench");
  const [filterDraftClass, setFilterDraftClass] = useState("All");
  const [filterTeam, setFilterTeam] = useState("All");
  const [filterPosition, setFilterPosition] = useState("All");

  const filterLeagueIds = useCallback(
    (league_ids: string[]) => {
      return league_ids.filter(
        (league_id) =>
          (type1 === "All" ||
            (type1 === "Redraft" &&
              matchups[league_id].league.settings.type !== 2) ||
            (type1 === "Dynasty" &&
              matchups[league_id].league.settings.type === 2)) &&
          (type2 === "All" ||
            (type2 === "Bestball" &&
              matchups[league_id].league.settings.best_ball === 1) ||
            (type2 === "Lineup" &&
              matchups[league_id].league.settings.best_ball !== 1))
      );
    },
    [type1, type2, matchups]
  );

  const starters = useMemo(() => {
    const obj: {
      [player_id: string]: {
        start: string[];
        bench: string[];
        opp_start: string[];
        opp_bench: string[];
        started_over: {
          [player_id: string]: {
            league_id: string;
            starter_proj: number;
            bench_proj: number;
          }[];
        };
        benched_for: {
          [player_id: string]: {
            league_id: string;
            starter_proj: number;
            bench_proj: number;
          }[];
        };
      };
    } = {};

    filterLeagueIds(Object.keys(matchups)).forEach((league_id) => {
      const user_matchup = matchups[league_id].user_matchup;

      user_matchup.players.forEach((player_id) => {
        if (!obj[player_id]) {
          obj[player_id] = {
            start: [],
            bench: [],
            opp_start: [],
            opp_bench: [],
            started_over: {},
            benched_for: {},
          };
        }

        if (user_matchup.starters.includes(player_id)) {
          obj[player_id].start.push(league_id);

          const indexStarter = user_matchup.starters.indexOf(player_id);

          const cur_slot =
            matchups[league_id].league.roster_positions[indexStarter];

          const alt_slots = matchups[league_id].league.roster_positions.filter(
            (slot, indexSlot) =>
              position_map[slot]?.includes(
                allplayers?.[player_id]?.position ?? ""
              ) &&
              position_map[cur_slot].includes(
                allplayers?.[user_matchup.starters[indexSlot]]?.position ?? ""
              )
          );

          const slot_options = Array.from(
            new Set(
              [cur_slot, ...alt_slots].flatMap((slot) => {
                return user_matchup.players.filter(
                  (player_id2) =>
                    !user_matchup.starters.includes(player_id2) &&
                    position_map[slot].includes(
                      allplayers?.[player_id2].position ?? ""
                    )
                );
              })
            )
          );

          slot_options.forEach((player_id2) => {
            if (!obj[player_id].started_over[player_id2]) {
              obj[player_id].started_over[player_id2] = [];
            }

            obj[player_id].started_over[player_id2].push({
              league_id,
              starter_proj: user_matchup.values[player_id],
              bench_proj: user_matchup.values[player_id2],
            });
          });
        } else {
          obj[player_id].bench.push(league_id);

          user_matchup.starters.forEach((player_id2, index2) => {
            const slot = matchups[league_id].league.roster_positions[index2];

            if (
              position_map[slot]?.includes(
                allplayers?.[player_id].position ?? ""
              ) ||
              matchups[league_id].league.roster_positions.some(
                (slot2, slot_index) => {
                  return (
                    position_map[slot].includes(
                      allplayers?.[user_matchup.starters[slot_index]]
                        .position || ""
                    ) &&
                    position_map[slot2].includes(
                      allplayers?.[player_id2]?.position || ""
                    )
                  );
                }
              )
            ) {
              if (!obj[player_id].benched_for[player_id2]) {
                obj[player_id].benched_for[player_id2] = [];
              }

              obj[player_id].benched_for[player_id2].push({
                league_id,
                starter_proj: user_matchup.values[player_id2],
                bench_proj: user_matchup.values[player_id],
              });
            }
          });
        }
      });

      matchups[league_id].opp_matchup?.players?.forEach((player_id) => {
        if (!obj[player_id]) {
          obj[player_id] = {
            start: [],
            bench: [],
            opp_start: [],
            opp_bench: [],
            started_over: {},
            benched_for: {},
          };
        }

        if (matchups[league_id].opp_matchup?.starters.includes(player_id)) {
          obj[player_id].opp_start.push(league_id);
        } else {
          obj[player_id].opp_bench.push(league_id);
        }
      });
    });

    return obj;
  }, [matchups, filterLeagueIds, allplayers]);

  const startersObj = useMemo(() => {
    const obj: { [player_id: string]: { [col_abbrev: string]: colObj } } = {};

    Object.keys(starters).forEach((player_id) => {
      const { start, bench, opp_start, opp_bench } = starters[player_id];

      const total_filtered = filterLeagueIds(Object.keys(matchups)).length;

      const start_filtered = filterLeagueIds(start).length;
      const bench_filtered = filterLeagueIds(bench).length;
      const opp_start_filtered = filterLeagueIds(opp_start).length;
      const opp_bench_filtered = filterLeagueIds(opp_bench).length;

      obj[player_id] = {
        Start: {
          sort: start_filtered,
          text: start_filtered.toString(),
          trendColor: getTrendColor_Range(
            start_filtered,
            -total_filtered / 4,
            total_filtered / 4
          ),
          classname: "rank",
        },
        Bench: {
          sort: bench_filtered,
          text: bench_filtered.toString(),
          trendColor: getTrendColor_Range(
            -bench_filtered,
            -total_filtered / 4,
            total_filtered / 4
          ),
          classname: "rank",
        },

        "Opp Start": {
          sort: opp_start_filtered,
          text: opp_start_filtered.toString(),
          trendColor: getTrendColor_Range(
            -opp_start_filtered,
            -total_filtered / 4,
            total_filtered / 4
          ),
          classname: "rank",
        },
        "Opp Bench": {
          sort: opp_bench_filtered,
          text: opp_bench_filtered.toString(),
          trendColor: getTrendColor_Range(
            opp_bench_filtered,
            -total_filtered / 4,
            total_filtered / 4
          ),
          classname: "rank",
        },
      };
    });

    return obj;
  }, [starters, matchups, filterLeagueIds]);

  const headers = [
    {
      text: "Player",
      colspan: 2,
      classname: "",
    },
    {
      text: col1,
      colspan: 1,
      classname: "",
      update: (value: string) => {
        setCol1(value);
      },
    },
    {
      text: "Bench",
      colspan: 1,
      classname: "",
      update: (value: string) => {
        setCol2(value);
      },
    },
    {
      text: "Opp Start",
      colspan: 1,
      classname: "",
      update: (value: string) => {
        setCol3(value);
      },
    },
    {
      text: "Opp Bench",
      colspan: 1,
      classname: "",
      update: (value: string) => {
        setCol4(value);
      },
    },
  ];

  const data = filterPlayerIds({
    player_ids: Object.keys(starters),
    nflState,
    allplayers,
    filterDraftClass,
    filterTeam,
    filterPosition,
  }).map((player_id) => {
    const { start, bench, opp_start, opp_bench, started_over, benched_for } =
      starters[player_id];

    const text =
      allplayers?.[player_id]?.full_name ||
      (parseInt(player_id) ? "Inactive " + player_id : player_id);

    return {
      id: player_id,
      search: {
        text: text,
        display: <Avatar id={player_id} text={text} type="P" />,
      },
      columns: [
        {
          text: (
            <Avatar
              id={player_id}
              text={allplayers?.[player_id]?.full_name || player_id}
              type="P"
            />
          ),
          colspan: 2,
          classname: "",
          sort: allplayers?.[player_id]?.full_name || player_id,
        },
        ...[col1, col2, col3, col4].map((col) => {
          const { sort, text, trendColor, classname } = startersObj[player_id][
            col
          ] || { sort: 0, text: "-", trendColor: {}, classname: "" };

          return {
            text,
            colspan: 1,
            style: trendColor,
            classname,
            sort,
          };
        }),
      ],
      secondary: (
        <PlayerMatchups
          player_id1={player_id}
          start={filterLeagueIds(start)}
          bench={filterLeagueIds(bench)}
          opp_start={filterLeagueIds(opp_start)}
          opp_bench={filterLeagueIds(opp_bench)}
          started_over={started_over}
          benched_for={benched_for}
        />
      ),
    };
  });

  const component = (
    <>
      <PlayersFilters
        filterDraftClass={filterDraftClass}
        setFilterDraftClass={(e: { target: { value: string } }) =>
          setFilterDraftClass(e.target.value)
        }
        filterTeam={filterTeam}
        setFilterTeam={(e: { target: { value: string } }) =>
          setFilterTeam(e.target.value)
        }
        filterPosition={filterPosition}
        setFilterPosition={(e: { target: { value: string } }) =>
          setFilterPosition(e.target.value)
        }
      />
      <TableMain
        type={1}
        headers_sort={[1, 0, 2, 3, 4]}
        headers_options={[]}
        headers={headers}
        data={data}
        placeholder="Player"
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </>
  );

  return <LineupcheckerLayout searched={searched} component={component} />;
};

export default Starters;
