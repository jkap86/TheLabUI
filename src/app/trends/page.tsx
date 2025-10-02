"use client";

import Avatar from "@/components/common/avatar/avatar";
import LoadingIcon from "@/components/loading-icon/loading-icon";
import PlayersFilters from "@/components/players-filters/players-filters";
import TableMain from "@/components/table-main/table-main";
import useFetchAllplayers from "@/hooks/common/useFetchAllplayers";
import useFetchNflState from "@/hooks/common/useFetchNflState";
import { RootState } from "@/redux/store";
import { filterPlayerIds } from "@/utils/filterPlayers";
import { getTrendColor_Range } from "@/utils/getTrendColor";
import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import thelablogo from "../../../public/images/thelab.png";
import Image from "next/image";

const TrendsPage = () => {
  const { allplayers, nflState } = useSelector(
    (state: RootState) => state.common
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [seasonType, setSeasonType] = useState("REG");
  const [data, setData] = useState<{
    start_date: string;
    end_date: string;
    season_type: string;
    players: {
      [player_id: string]: { [key: string]: number };
    };
  }>({ players: {}, start_date: "", end_date: "", season_type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<{
    column: 1 | 2 | 3 | 4;
    asc: boolean;
  }>({ column: 1, asc: false });
  const [col1, setCol1] = useState("pts ppr");
  const [col2, setCol2] = useState("ktc trend");
  const [col3, setCol3] = useState("ktc min");
  const [col4, setCol4] = useState("ktc max");
  const [filterDraftClass, setFilterDraftClass] = useState("All");
  const [filterTeam, setFilterTeam] = useState("All");
  const [filterPosition, setFilterPosition] = useState("All");

  useFetchNflState();
  useFetchAllplayers();

  const getUtcDate = (date: string) => {
    const date_array = date.split("-");
    const year = parseInt(date_array[0]);
    const monthIndex = parseInt(date_array[1]) - 1;
    const day = parseInt(date_array[2]);

    return (
      Date.UTC(year, monthIndex, day) +
      new Date().getTimezoneOffset() * 60 * 1000
    );
  };

  const fetchStats = async () => {
    setIsLoading(true);

    const start_date = startDate;
    const end_date = endDate;
    const season_type = seasonType;

    const stats: {
      data: ({
        player_id: string;
        stats: { [cat: string]: number };
      } & {
        [key: string]: number;
      })[];
    } = await axios.get("/api/trends", {
      params: {
        start_date: getUtcDate(start_date),
        end_date: getUtcDate(end_date),
        season_type,
      },
    });

    const dataObj = Object.fromEntries(
      stats.data
        .filter((obj) => allplayers?.[obj.player_id])
        .map((obj) => {
          return [
            obj.player_id,
            {
              ...obj,
              ...obj.stats,
            },
          ];
        })
    );

    setData({ players: dataObj, start_date, end_date, season_type });
    setIsLoading(false);
  };

  const dataLoaded =
    startDate &&
    endDate &&
    data.start_date === startDate &&
    data.end_date === endDate &&
    data.season_type === seasonType;

  const header_options_ktc: {
    abbrev: string;
    text: string;
    desc: string;
  }[] = [
    {
      abbrev: "ktc trend",
      text: "KTC Trend",
      desc: "Difference between KTC values at start and end dates",
    },
    {
      abbrev: "ktc max",
      text: "Max ktc value",
      desc: "Peak Ktc value",
    },
    {
      abbrev: "ktc min",
      text: "Min ktc value",
      desc: "Lowest Ktc value",
    },
    {
      abbrev: "ktc max date",
      text: "KTC Max Value Date",
      desc: "Date when KTC value peaked in date range.",
    },
    {
      abbrev: "ktc min date",
      text: "KTC Min Value Date",
      desc: "Date when KTC value bottomed out in date range.",
    },
    {
      abbrev: "ktc start",
      text: "KTC Value Start",
      desc: "KTC value on start date",
    },
    {
      abbrev: "ktc end",
      text: "KTC Value End",
      desc: "KTC value on end date",
    },
    {
      abbrev: "ktc position rank max",
      text: "KTC Max Position Rank",
      desc: "KTC Peak Positional Ranking",
    },
    {
      abbrev: "ktc position rank min",
      text: "KTC Min Position Rank",
      desc: "KTC Lowest Positional Ranking",
    },
  ];

  const header_options_passing = [
    {
      abbrev: "pass att",
      text: "Pass Attempts",
      desc: "Passing Attempts",
    },
    {
      abbrev: "pass cmp",
      text: "Pass Completions",
      desc: "Completions",
    },
    {
      abbrev: "pass yds",
      text: "Pass Yards",
      desc: "Passing Yards",
    },
    {
      abbrev: "pass td",
      text: "Pass TDs",
      desc: "Passing Touchdowns",
    },
    {
      abbrev: "pass int",
      text: "Pass Int",
      desc: "Interceptions",
    },
    {
      abbrev: "pass air yds comp",
      text: "Pass Air Yards Completed",
      desc: "Completed Receiving Air Yards",
    },
    {
      abbrev: "pass air yds tot",
      text: "Pass Air Yards Total",
      desc: "Completed and Unrealized Passing Air Yards",
    },
    {
      abbrev: "pass ep",
      text: "Pass Expected Points",
      desc: "Passing Expected Points",
    },
    {
      abbrev: "pass epa",
      text: "Pass Expected Points Added",
      desc: "Passing Expected Points",
    },
  ];

  const header_options_rushing = [
    {
      abbrev: "rush att",
      text: "Rush Attempts",
      desc: "Rushing Attempts/Carries",
    },
    {
      abbrev: "rush yds",
      text: "Rush Yards",
      desc: "Rushing Yards",
    },
    {
      abbrev: "rush success %",
      text: "Rush Success Rate",
      desc: "Percentage of rush attempts deemed successful",
    },
    {
      abbrev: "rush ep",
      text: "Rush Expected Points",
      desc: "Rushing Expected Points",
    },
    {
      abbrev: "rush epa",
      text: "Rush Expected Points Added",
      desc: "Rushing Expected Points",
    },
  ];

  const header_options_receiving = [
    {
      abbrev: "tgts per snap",
      text: "Rec Targets Per Snap",
      desc: "Receiving Targets Per Snap",
    },
    {
      abbrev: "rec yds/snap",
      text: "Rec Yards Per Snap",
      desc: "Receiving Yards Per Snap",
    },
    {
      abbrev: "rec tgt",
      text: "Rec Targets",
      desc: "Receiving Targets",
    },
    {
      abbrev: "rec",
      text: "Rec Catches",
      desc: "Receptions",
    },
    {
      abbrev: "rec yds",
      text: "Rec Yards",
      desc: "Receiving Yards",
    },
    {
      abbrev: "rec td",
      text: "Rec TDs",
      desc: "Receiving Touchdowns",
    },
    {
      abbrev: "rec air yds comp",
      text: "Rec Air Yards Completed",
      desc: "Completed Receiving Air Yards",
    },
    {
      abbrev: "rec air yds tot",
      text: "Rec Air Yards Total",
      desc: "Completed and Unrealized Receiving Air Yards",
    },
    {
      abbrev: "rec ep",
      text: "Rec Expected Points",
      desc: "Receiving Expected Points",
    },
    {
      abbrev: "rec epa",
      text: "Rec Expected Points Added",
      desc: "Receiving Expected Points",
    },
  ];

  const header_options = [
    ...header_options_ktc,
    ...header_options_passing,
    ...header_options_rushing,
    ...header_options_receiving,
    {
      abbrev: "gms active",
      text: "Games Active",
      desc: "Games Active",
    },
    {
      abbrev: "snp %",
      text: "Snap Percentage",
      desc: "Percent of team's offensive snaps",
    },
    {
      abbrev: "pts ppr",
      text: "Ppr points",
      desc: "Ppr points",
    },
  ];

  const scoring_cats = Array.from(
    new Set(
      Object.keys(data.players).flatMap((player_id) =>
        Object.keys(data.players[player_id])
          .filter((cat) => cat !== "player_id")
          .map((cat) => cat)
      )
    )
  ).sort((a, b) => (a > b ? 1 : -1));

  const getColumn = (col: string, player_id: string) => {
    let trendColor = {};
    let text = "-";
    let sort = 0;
    let classname = "";

    const key = col.split(" ").join("_");

    if (scoring_cats.includes(key)) {
      const v = data.players[player_id]?.[key] ?? 0;

      text = v.toString();
      trendColor = getTrendColor_Range(
        v,
        Math.min(
          ...Object.keys(data.players).map(
            (player_id) => data.players[player_id]?.[key] ?? 0
          )
        ),
        Math.max(
          ...Object.keys(data.players).map(
            (player_id) => data.players[player_id]?.[key] ?? 0
          )
        ),
        key.includes("rank")
      );
      sort = v;
      classname =
        col.includes("rank") || col.startsWith("ktc")
          ? "font-pulang"
          : "font-score";
    } else {
      let v = 0;
      switch (col) {
        case "ktc trend":
          const all_trends = Object.keys(data.players).map(
            (player_id) =>
              (data.players[player_id].ktc_end ?? 0) -
              (data.players[player_id].ktc_start ?? 0)
          );

          v =
            data.players[player_id].ktc_end - data.players[player_id].ktc_start;

          text = v.toString();
          trendColor = getTrendColor_Range(
            v,
            Math.min(...all_trends),
            Math.max(...all_trends)
          );
          sort = v;
          classname = "font-pulang";
          break;
        case "tgts per snap":
          v =
            data.players[player_id].off_snp > 0
              ? (data.players[player_id]?.rec_tgt ?? 0) /
                data.players[player_id].off_snp
              : 0;

          text = v.toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          trendColor = getTrendColor_Range(v, 0.05, 0.25);
          sort = v;
          classname = "font-score";
          break;
        case "rec yds/snap":
          v =
            data.players[player_id].off_snp > 0
              ? (data.players[player_id]?.rec_yds ?? 0) /
                data.players[player_id].off_snp
              : 0;

          text = v.toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          trendColor = getTrendColor_Range(v, 0.5, 2);
          sort = v;
          classname = "font-score";
          break;
        case "snp %":
          v =
            data.players[player_id].team_plays > 0
              ? (data.players[player_id]?.off_snp ?? 0) /
                data.players[player_id].team_plays
              : 0;

          text = Math.round(v * 100) + "%";
          trendColor = getTrendColor_Range(v, 0, 1);
          sort = v;
          classname = "font-score";
          break;
        case "rush success %":
          v =
            data.players[player_id].rush_att > 0
              ? (data.players[player_id]?.rush_successes ?? 0) /
                data.players[player_id].rush_att
              : 0;

          text = Math.round(v * 100) + "%";
          trendColor = getTrendColor_Range(v, 0, 1);
          sort = v;
          classname = "font-score";
          break;
        default:
          break;
      }
    }

    return { text, trendColor, classname, sort };
  };

  return (
    <>
      <div className="flex justify-center items-center p-8 w-fit m-auto relative">
        <Image
          src={thelablogo}
          alt="logo"
          className="w-[25rem] m-8 opacity-[.35] drop-shadow-[0_0_1rem_white]"
        />
        <h1 className="absolute !text-[15rem] font-metal !text-[var(--color7)] ![text-shadow:0_0_.5rem_red] drop-shadow-[0_0_1rem_black]">
          Trends
        </h1>
      </div>
      <div className="flex flex-col items-center text-[3rem]">
        <div className="flex justify-center">
          <div className="flex flex-col items-center m-8">
            <label>Season Type</label>
            <select
              value={seasonType}
              onChange={(e) => setSeasonType(e.target.value)}
              className="bg-[lightslategray] text-[gold] font-hugmate h-full"
            >
              {["REG", "POST"].map((st) => {
                return <option key={st}>{st}</option>;
              })}
            </select>
          </div>
          {[
            { label: "Start Date", date: startDate, setDate: setStartDate },
            { label: "End Date", date: endDate, setDate: setEndDate },
          ].map((obj) => {
            return (
              <div key={obj.label} className="flex flex-col items-center m-8">
                <label>{obj.label}</label>
                <input
                  type="date"
                  value={obj.date}
                  onChange={(e) => obj.setDate(e.target.value)}
                  placeholder={obj.label}
                  className="p-2"
                />
              </div>
            );
          })}
        </div>
        <button
          onClick={fetchStats}
          disabled={dataLoaded || !startDate || !endDate}
          className="font-metal text-red-600 bg-blue-900 p-2 rounded"
        >
          Get Players
        </button>
      </div>
      {dataLoaded ? (
        <>
          <PlayersFilters
            filterDraftClass={filterDraftClass}
            setFilterDraftClass={(e) => setFilterDraftClass(e.target.value)}
            filterTeam={filterTeam}
            setFilterTeam={(e) => setFilterTeam(e.target.value)}
            filterPosition={filterPosition}
            setFilterPosition={(e) => setFilterPosition(e.target.value)}
          />
          <TableMain
            type={1}
            headers_options={header_options}
            headers_sort={[1, 2, 3, 4]}
            headers={[
              { text: "Player", colspan: 2 },
              { text: col1, colspan: 1, update: setCol1 },
              { text: col2, colspan: 1, update: setCol2 },
              { text: col3, colspan: 1, update: setCol3 },
              { text: col4, colspan: 1, update: setCol4 },
            ]}
            data={filterPlayerIds({
              player_ids: Object.keys(data.players),
              allplayers,
              nflState,
              filterDraftClass,
              filterPosition,
              filterTeam,
            }).map((player_id) => {
              const player_name =
                allplayers?.[player_id]?.full_name ?? player_id;
              return {
                id: player_id,
                search: {
                  id: player_id,
                  text: player_name,
                  display: (
                    <Avatar id={player_id} text={player_name} type="P" />
                  ),
                },
                columns: [
                  {
                    text: (
                      <Avatar
                        id={player_id}
                        text={allplayers?.[player_id]?.full_name ?? player_id}
                        type="P"
                      />
                    ),
                    colspan: 2,
                    classname: "",
                  },
                  ...[col1, col2, col3, col4].map((col) => {
                    const { text, trendColor, classname, sort } = getColumn(
                      col,
                      player_id
                    );

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
            })}
            sortBy={sortBy}
            setSortBy={({ column, asc }) =>
              setSortBy({ column, asc } as {
                column: 1 | 2 | 3 | 4;
                asc: boolean;
              })
            }
            placeholder="Player"
          />
        </>
      ) : isLoading ? (
        <LoadingIcon messages={[]} />
      ) : null}
    </>
  );
};

export default TrendsPage;
