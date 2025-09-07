import { League, Matchup } from "@/lib/types/userTypes";
import TableMain from "../table-main/table-main";
import Avatar from "../avatar/avatar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateSortTeamsBy } from "@/redux/lineupchecker/lineupcheckerSlice";
import { getMedian } from "@/utils/getOptimalStarters";
import { getTrendColor_Range } from "@/utils/getTrendColor";

const LeagueScoresTeams = ({
  type,
  matchupsLeague,
}: {
  matchupsLeague: {
    user_matchup: Matchup;
    opp_matchup?: Matchup;
    league_matchups: Matchup[];
    league: League;
  };
  type: number;
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { sortTeamsBy } = useSelector(
    (state: RootState) => state.lineupchecker
  );

  const scores_points: number[] = [];

  const scores_proj: number[] = [];

  matchupsLeague.league_matchups.forEach((m) => {
    if (typeof m.live_points_current === "number")
      scores_points.push(m.live_points_current);

    if (typeof m.live_projection_current === "number")
      scores_proj.push(m.live_projection_current);
  });

  const min_points = Math.min(...scores_points);
  const max_points = Math.max(...scores_points);

  const median_points = getMedian(
    matchupsLeague.league_matchups,
    "live_points_current"
  );

  const delta_points = Math.max(
    median_points - min_points,
    max_points - median_points
  );

  const min_proj = Math.min(...scores_proj);
  const max_proj = Math.max(...scores_proj);

  const median_proj = getMedian(
    matchupsLeague.league_matchups,
    "live_projection_current"
  );

  const delta_proj = Math.max(median_proj - min_proj, max_proj - median_proj);

  return (
    <TableMain
      type={type}
      headers_sort={[2, 3, 4]}
      sortBy={sortTeamsBy}
      setSortBy={(sortby) =>
        dispatch(
          updateSortTeamsBy(sortby as { column: 2 | 3 | 4; asc: boolean })
        )
      }
      headers={[
        { text: "Rank", colspan: 1, classname: "" },
        { text: "Manager", colspan: 5, classname: "" },
        { text: "Points", colspan: 2, classname: "" },
        { text: "Live Proj", colspan: 2, classname: "" },
        { text: "% Complete", colspan: 2, classname: "" },
      ]}
      data={matchupsLeague.league_matchups.map((matchup) => {
        const players =
          matchupsLeague.league.settings.best_ball === 1
            ? matchup.players
            : matchup.starters;

        const percent_complete =
          players.length > 0
            ? players.reduce(
                (acc, player_id) =>
                  acc +
                  (matchup.live_values?.[player_id]?.game_percent_complete ??
                    0),
                0
              ) / players.length
            : 0;

        const classname =
          matchup.roster_id === matchup.roster_id_user
            ? "shadow-[inset_0_0_5rem_green]"
            : matchup.roster_id === matchup.roster_id_opp
            ? "shadow-[inset_0_0_5rem_red]"
            : "";
        return {
          id: matchup.roster_id.toString(),
          columns: [
            {
              text: "INDEX",
              colspan: 1,
              classname: "",
            },
            {
              text: (
                <Avatar id={matchup.avatar} text={matchup.username} type="U" />
              ),
              colspan: 5,
              classname,
            },
            {
              text:
                matchup.live_points_current?.toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                }) ?? "-",
              colspan: 2,
              classname: "",
              sort: matchup.live_points_current ?? 0,
              style: getTrendColor_Range(
                matchup.live_points_current ?? 0,
                median_points - delta_points,
                median_points + delta_points
              ),
            },
            {
              text:
                matchup.live_projection_current?.toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                }) ?? "-",
              colspan: 2,
              classname: "",
              sort: matchup.live_projection_current ?? 0,
              style: getTrendColor_Range(
                matchup.live_projection_current ?? 0,
                median_proj - delta_proj,
                median_proj + delta_proj
              ),
            },
            {
              text: (percent_complete * 100).toFixed(0) + "%",
              colspan: 2,
              classname: "",
              sort: percent_complete ?? 0,
              style: getTrendColor_Range(percent_complete, 0, 1, true),
            },
          ],
        };
      })}
    />
  );
};

export default LeagueScoresTeams;
