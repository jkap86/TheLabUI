import { League, Matchup } from "@/lib/types/userTypes";
import { RootState } from "@/redux/store";
import { getSlotAbbrev } from "@/utils/getOptimalStarters";
import { useState } from "react";
import { useSelector } from "react-redux";
import Avatar from "../avatar/avatar";
import TableMain from "../table-main/table-main";

const LeagueScoresMatchup = ({
  matchupsLeague,
}: {
  matchupsLeague: {
    user_matchup: Matchup;
    opp_matchup?: Matchup;
    league_matchups: Matchup[];
    league: League;
  };
}) => {
  const { allplayers } = useSelector((state: RootState) => state.common);
  const [activeMatchupId, setActiveMatchupId] = useState(
    matchupsLeague.user_matchup.matchup_id
  );

  const league_matchups: { [matchup_id: number]: (number | undefined)[] } = {
    [matchupsLeague.user_matchup.matchup_id]: [
      matchupsLeague.user_matchup.roster_id,
      matchupsLeague.opp_matchup?.roster_id,
    ],
  };

  matchupsLeague.league_matchups
    .filter((m) => m.matchup_id !== matchupsLeague.user_matchup.matchup_id)
    .forEach((m) => {
      if (!league_matchups[m.matchup_id]) league_matchups[m.matchup_id] = [];

      league_matchups[m.matchup_id].push(m.roster_id);
    });

  const getTable = (matchup: Matchup | undefined) => {
    const headers = [
      {
        text: "",
        colspan: 2,
        classname: "",
      },
      {
        text: "Player",
        colspan: 6,
        classname: "",
      },
      {
        text: "Proj",
        colspan: 3,
        classname: "",
      },
      {
        text: "Pts",
        colspan: 3,
        classname: "",
      },
    ];
    const data = [
      ...(matchup?.live_projection_starters_optimal || []).map((so, index) => {
        const player_id =
          matchupsLeague.league.settings.best_ball === 1
            ? so.optimal_player_id
            : so.current_player_id;

        const percent_complete =
          matchup?.live_values?.[player_id]?.game_percent_complete;

        const classname =
          percent_complete === 1
            ? ""
            : percent_complete === 0
            ? "text-gray-400"
            : "text-yellow-400";
        return {
          id: player_id + "_" + index,
          columns: [
            {
              text: getSlotAbbrev(
                matchupsLeague.league.roster_positions[index]
              ),
              colspan: 2,
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
              colspan: 6,
              classname,
            },
            {
              text: (
                matchup?.live_values?.[player_id]?.live_proj ?? 0
              ).toLocaleString("en-US", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              }),
              colspan: 3,
              classname: classname + " italic",
            },
            {
              text: (
                matchup?.live_values?.[player_id]?.points ?? 0
              ).toLocaleString("en-US", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              }),
              colspan: 3,
              classname: classname + " font-score",
            },
          ],
        };
      }),
      ...(matchup?.players || [])
        .filter(
          (player_id) =>
            !matchup?.live_points_starters_optimal?.some(
              (so) =>
                (matchupsLeague.league.settings.best_ball === 1
                  ? so.optimal_player_id
                  : so.current_player_id) === player_id
            )
        )
        .sort((a, b) => {
          return (
            (matchup?.live_values?.[b]?.points ?? 0) -
              (matchup?.live_values?.[a]?.points ?? 0) ||
            (matchup?.live_values?.[b]?.live_proj ?? 0) -
              (matchup?.live_values?.[a]?.live_proj ?? 0)
          );
        })
        .map((player_id) => {
          const percent_complete =
            matchup?.live_values?.[player_id]?.game_percent_complete;

          const classname =
            percent_complete === 1
              ? "text-gray-400"
              : percent_complete === 0
              ? "text-gray-700"
              : "text-yellow-700";
          return {
            id: player_id,
            columns: [
              {
                text: "BN",
                colspan: 2,
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
                colspan: 6,
                classname,
              },
              {
                text: (
                  matchup?.live_values?.[player_id]?.live_proj ?? 0
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                }),
                colspan: 3,
                classname: classname + " italic",
              },
              {
                text: (
                  matchup?.live_values?.[player_id]?.points ?? 0
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                }),
                colspan: 3,
                classname: classname + " font-score",
              },
            ],
          };
        }),
    ];

    return <TableMain type={2} half={true} headers={headers} data={data} />;
  };

  const findMatchup = (matchup_id: number, index: 0 | 1) => {
    if (matchup_id === undefined) return;

    return matchupsLeague.league_matchups.find(
      (m) => m.roster_id === league_matchups[matchup_id]?.[index]
    );
  };

  const team1 = findMatchup(activeMatchupId, 0);
  const team2 = findMatchup(activeMatchupId, 1);

  const user_table = getTable(team1);
  const opp_table = getTable(team2);

  const classname_score = "flex justify-evenly items-center w-[50%] px-2";
  return (
    <>
      <div className="nav !justify-between">
        <div className={classname_score}>
          <div className="w-[50%] truncate text-center">
            {team1?.username ?? "-"}
          </div>
          &nbsp;
          <em className="text-yellow-400">
            {team1?.live_projection_current?.toLocaleString("en-US", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </em>
          &nbsp;
          <strong className="font-score text-orange-600">
            {team1?.live_points_current?.toLocaleString("en-US", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </strong>
        </div>
        <div className={classname_score}>
          <div className="w-[50%] truncate text-center">
            {team2?.username ?? "-"}
          </div>
          &nbsp;
          <em className="text-yellow-400">
            {team2?.live_projection_current?.toLocaleString("en-US", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </em>
          &nbsp;
          <strong className="font-score text-orange-600">
            {team2?.live_points_current?.toLocaleString("en-US", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </strong>
        </div>
        <select
          className="w-full absolute h-full opacity-0 text-center"
          onChange={(e) => setActiveMatchupId(parseInt(e.target.value))}
          value={activeMatchupId}
        >
          {Object.keys(league_matchups).map((matchup_id) => {
            return (
              <option key={matchup_id} value={matchup_id}>
                <>{findMatchup(parseInt(matchup_id), 0)?.username || "-"}</>
                &nbsp;&nbsp;v&nbsp;&nbsp;
                <>{findMatchup(parseInt(matchup_id), 1)?.username || "-"}</>
              </option>
            );
          })}
        </select>
      </div>
      {user_table}
      {opp_table}
    </>
  );
};

export default LeagueScoresMatchup;
