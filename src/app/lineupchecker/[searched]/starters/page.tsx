"use client";

import Avatar from "@/components/avatar/avatar";
import { RootState } from "@/redux/store";
import { use, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import "../../../../components/heading/heading.css";
import TableMain from "@/components/table-main/table-main";
import { colObj } from "@/lib/types/commonTypes";
import { getTrendColor_Range } from "@/utils/getTrendColor";
import LineupcheckerLayout from "../lineupchecker-layout";

const Starters = ({ params }: { params: Promise<{ searched: string }> }) => {
  const { searched } = use(params);
  const { allplayers } = useSelector((state: RootState) => state.common);
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

  const filterLeagueIds = (league_ids: string[]) => {
    return league_ids.filter(
      (league_id) =>
        (type1 === "All" ||
          (type1 === "Redraft" && matchups[league_id].settings.type !== 2) ||
          (type1 === "Dynasty" && matchups[league_id].settings.type === 2)) &&
        (type2 === "All" ||
          (type2 === "Bestball" &&
            matchups[league_id].settings.best_ball === 1) ||
          (type2 === "Lineup" && matchups[league_id].settings.best_ball !== 1))
    );
  };

  const starters = useMemo(() => {
    const obj: {
      [player_id: string]: {
        start: string[];
        bench: string[];
        opp_start: string[];
        opp_bench: string[];
      };
    } = {};

    Object.keys(matchups).forEach((league_id) => {
      matchups[league_id].user_matchup.players.forEach((player_id) => {
        if (!obj[player_id]) {
          obj[player_id] = {
            start: [],
            bench: [],
            opp_start: [],
            opp_bench: [],
          };
        }

        if (matchups[league_id].user_matchup.starters.includes(player_id)) {
          obj[player_id].start.push(league_id);
        } else {
          obj[player_id].bench.push(league_id);
        }
      });

      matchups[league_id].opp_matchup.players.forEach((player_id) => {
        if (!obj[player_id]) {
          obj[player_id] = {
            start: [],
            bench: [],
            opp_start: [],
            opp_bench: [],
          };
        }

        if (matchups[league_id].opp_matchup.starters.includes(player_id)) {
          obj[player_id].opp_start.push(league_id);
        } else {
          obj[player_id].opp_bench.push(league_id);
        }
      });
    });

    return obj;
  }, [matchups]);

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
  }, [starters, matchups, type1, type2]);

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

  const data = Object.keys(starters).map((player_id) => {
    return {
      id: player_id,
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
        ...[col1, col2, col3, col4].map((col, index) => {
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
    };
  });

  const component = (
    <TableMain
      type={1}
      headers_sort={[1, 0, 2, 3, 4]}
      headers_options={[]}
      headers={headers}
      data={data}
      placeholder=""
      sortBy={sortBy}
      setSortBy={setSortBy}
    />
  );

  return <LineupcheckerLayout searched={searched} component={component} />;
};

export default Starters;
