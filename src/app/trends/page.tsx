"use client";

import Avatar from "@/components/avatar/avatar";
import LoadingIcon from "@/components/loading-icon/loading-icon";
import TableMain from "@/components/table-main/table-main";
import useFetchAllplayers from "@/hooks/useFetchAllplayers";
import { RootState } from "@/redux/store";
import { getTrendColor_Range } from "@/utils/getTrendColor";
import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";

const TrendsPage = () => {
  const { allplayers } = useSelector((state: RootState) => state.common);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [data, setData] = useState<{
    start_date: string;
    end_date: string;
    players: {
      [player_id: string]: { [key: string]: number };
    };
  }>({ players: {}, start_date: "", end_date: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<{
    column: 1 | 2 | 3 | 4;
    asc: boolean;
  }>({ column: 1, asc: false });
  const [col1, setCol1] = useState("gms active");
  const [col2, setCol2] = useState("ktc trend");
  const [col3, setCol3] = useState("value min");
  const [col4, setCol4] = useState("value max");

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

    const stats: {
      data: ({
        player_id: string;
        stats: { [cat: string]: number };
      } & {
        [key: string]: number;
      })[];
    } = await axios.get("/api/trends", {
      params: {
        start_date: getUtcDate(startDate),
        end_date: getUtcDate(endDate),
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

    setData({ players: dataObj, start_date: startDate, end_date: endDate });
    setIsLoading(false);
  };

  const dataLoaded =
    startDate &&
    endDate &&
    data.start_date === startDate &&
    data.end_date === endDate;

  const header_options = [
    {
      abbrev: "ktc trend",
      text: "ktc trend",
      desc: "ktc trend",
    },
    {
      abbrev: "rush att",
      text: "Rushing Attempts",
      desc: "Rushing Attempts/Carries",
    },
    {
      abbrev: "rush yd",
      text: "Rushing Yards",
      desc: "Rushing Yards",
    },
    {
      abbrev: "tgts per snap",
      text: "Targets Per Snap",
      desc: "Targets Per Snap",
    },
    {
      abbrev: "rec tgt",
      text: "Targets",
      desc: "Receiving Targets",
    },
    {
      abbrev: "value max",
      text: "Max ktc value",
      desc: "Peak Ktc value",
    },
    {
      abbrev: "value min",
      text: "Min ktc value",
      desc: "Lowest Ktc value",
    },
    {
      abbrev: "value max date",
      text: "Max ktc value",
      desc: "Peak Ktc value",
    },
    {
      abbrev: "value min date",
      text: "date of Min ktc value",
      desc: "date of lowest Ktc value",
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
  );

  console.log({ scoring_cats });

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
        )
      );
      sort = v;
      classname = col.startsWith("value") ? "font-pulang" : "font-score";
    } else {
      let v = 0;
      switch (col) {
        case "ktc trend":
          const all_trends = Object.keys(data.players).map(
            (player_id) =>
              (data.players[player_id].value_at_end ?? 0) -
              (data.players[player_id].value_at_start ?? 0)
          );

          v =
            data.players[player_id].value_at_end -
            data.players[player_id].value_at_start;

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
        default:
          break;
      }
    }

    return { text, trendColor, classname, sort };
  };

  return (
    <>
      <h1>Trends</h1>
      <div className="flex flex-col items-center">
        <div className="flex justify-center">
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
                />
              </div>
            );
          })}
        </div>
        <button
          onClick={fetchStats}
          disabled={dataLoaded || !startDate || !endDate}
        >
          Submit
        </button>
      </div>
      {dataLoaded ? (
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
          data={Object.keys(data.players).map((player_id) => {
            return {
              id: player_id,
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
        />
      ) : isLoading ? (
        <LoadingIcon messages={[]} />
      ) : null}
    </>
  );
};

export default TrendsPage;
