import { useDispatch, useSelector } from "react-redux";
import Avatar from "../common/avatar/avatar";
import TableMain from "../table-main/table-main";
import { AppDispatch, RootState } from "@/redux/store";
import { useCallback, useState } from "react";
import { updateLineupcheckerState } from "@/redux/lineupchecker/lineupcheckerSlice";

const LineupcheckerStartBenchOver = ({
  player_id1,
  started_over,
  benched_for,
}: {
  player_id1: string;
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
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers } = useSelector((state: RootState) => state.common);
  const { matchups, playersCol1, playersCol2, playersCol3 } = useSelector(
    (state: RootState) => state.lineupchecker
  );
  const [playerType, setPlayerType] = useState("Started Over");
  const [sortBy, setSortBy] = useState<{
    column: 1 | 2 | 3;
    asc: boolean;
  }>({ column: 1, asc: false });

  const player_ids = Array.from(
    new Set([...Object.keys(started_over), ...Object.keys(benched_for)])
  );

  const player_name =
    allplayers?.[player_id1].full_name ||
    (parseInt(player_id1) && "Inactive " + player_id1) ||
    player_id1;

  const columnOptions = [
    {
      abbrev: "# Start Over",
      text: "# Start Over",
      desc: "# Start Over",
    },
    {
      abbrev: "Sub Avg S Proj",
      text: "Sub Avg S Proj",
      desc: "Sub Avg S Proj",
    },
    {
      abbrev: `${player_name} Avg S`,
      text: `${player_name} Avg S`,
      desc: `${player_name} Avg S`,
    },

    {
      abbrev: "# Bench For",
      text: "# Bench For",
      desc: "# Bench For",
    },
    {
      abbrev: "Sub Avg B Proj",
      text: "Sub Avg B Proj",
      desc: "Sub Avg B Proj",
    },
    {
      abbrev: `${player_name} Avg B`,
      text: `${player_name} Avg B`,
      desc: `${player_name} Avg B`,
    },
  ];

  const getCell = useCallback(
    (player_id2: string, column: string) => {
      let sort: number = 0;
      let text: string = "-";
      let trendColor: { [color: string]: string } = {};
      let classname: string = "";

      switch (column) {
        case "# Start Over":
          sort = started_over[player_id2]?.length ?? 0;
          text = sort.toString();
          trendColor = {};
          classname = "";
          break;
        case "Sub Avg S Proj":
          sort =
            (started_over[player_id2]?.length > 0 &&
              started_over[player_id2].reduce(
                (acc, cur) => acc + cur.bench_proj,
                0
              ) / started_over[player_id2].length) ||
            0;
          text = sort.toFixed(1);
          trendColor = {};
          classname = "";
          break;
        case `${player_name} Avg S`:
          sort =
            (started_over[player_id2]?.length > 0 &&
              started_over[player_id2].reduce(
                (acc, cur) => acc + cur.starter_proj,
                0
              ) / started_over[player_id2].length) ||
            0;
          text = sort.toFixed(1);
          trendColor = {};
          classname = "";
          break;

        case "# Bench For":
          sort = benched_for[player_id2]?.length ?? 0;
          text = sort.toString();
          trendColor = {};
          classname = "";
          break;
        case "Sub Avg B Proj":
          sort =
            (benched_for[player_id2]?.length > 0 &&
              benched_for[player_id2].reduce(
                (acc, cur) => acc + cur.starter_proj,
                0
              ) / benched_for[player_id2].length) ||
            0;
          text = sort.toFixed(1);
          trendColor = {};
          classname = "";
          break;
        case `${player_name} Avg B`:
          sort =
            (benched_for[player_id2]?.length > 0 &&
              benched_for[player_id2].reduce(
                (acc, cur) => acc + cur.bench_proj,
                0
              ) / benched_for[player_id2].length) ||
            0;
          text = sort.toFixed(1);
          trendColor = {};
          classname = "";
          break;

        default:
          break;
      }

      return { sort, text, trendColor, classname };
    },
    [started_over, benched_for, player_name]
  );

  return (
    <TableMain
      type={2}
      headers_sort={[1, 2, 3]}
      headers_options={columnOptions}
      headers={[
        { text: "Player", colspan: 2, classname: "" },
        {
          text: playersCol1.replace("Player2", player_name),
          colspan: 1,
          classname: "",
          update: (value) => {
            dispatch(updateLineupcheckerState({ key: "playersCol1", value }));
          },
        },
        {
          text: playersCol2.replace("Player2", player_name),
          colspan: 1,
          classname: "",
          update: (value) => {
            dispatch(updateLineupcheckerState({ key: "playersCol2", value }));
          },
        },
        {
          text: playersCol3.replace("Player2", player_name),
          colspan: 1,
          classname: "",
          update: (value) => {
            dispatch(updateLineupcheckerState({ key: "playersCol3", value }));
          },
        },
      ]}
      data={player_ids.map((player_id) => {
        return {
          id: player_id,
          search: {
            text: allplayers?.[player_id]?.full_name ?? player_id,
            display: (
              <Avatar
                id={player_id}
                text={allplayers?.[player_id]?.full_name ?? player_id}
                type="P"
              />
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
            { ...getCell(player_id, playersCol1), colspan: 1 },
            { ...getCell(player_id, playersCol2), colspan: 1 },
            {
              ...getCell(
                player_id,
                playersCol3.replace("Player2", player_name)
              ),
              colspan: 1,
            },
          ],
          secondary: (
            <>
              <div className="nav">
                {["Started Over", "Benched For"].map((label) => {
                  return (
                    <button
                      key={label}
                      value={playerType}
                      onClick={() => setPlayerType(label)}
                      className={playerType === label ? "active" : ""}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <TableMain
                type={3}
                headers={[
                  { text: "League", colspan: 2, classname: "" },
                  {
                    text: allplayers?.[player_id]?.full_name || player_id,
                    colspan: 1,
                    classname: "",
                  },
                  {
                    text: allplayers?.[player_id1]?.full_name || player_id1,
                    colspan: 1,
                    classname: "",
                  },
                ]}
                data={(
                  (playerType === "Started Over"
                    ? started_over[player_id]
                    : benched_for[player_id]) ?? []
                ).map((sub) => {
                  return {
                    id: sub.league_id,
                    columns: [
                      {
                        text: (
                          <Avatar
                            id={sub.league_id}
                            text={matchups[sub.league_id].league.name}
                            type="L"
                          />
                        ),
                        colspan: 2,
                        classname: "",
                      },
                      {
                        text: (playerType === "Started Over"
                          ? sub.bench_proj
                          : sub.starter_proj
                        ).toFixed(1),
                        colspan: 1,
                        classname: "",
                      },
                      {
                        text: (playerType === "Started Over"
                          ? sub.starter_proj
                          : sub.bench_proj
                        ).toFixed(1),
                        colspan: 1,
                        classname: "",
                      },
                    ],
                  };
                })}
              />
            </>
          ),
        };
      })}
      placeholder="Player"
      sortBy={sortBy}
      setSortBy={(value) =>
        setSortBy({
          column: value.column as 1 | 2 | 3,
          asc: value.asc,
        })
      }
    />
  );
};

export default LineupcheckerStartBenchOver;
