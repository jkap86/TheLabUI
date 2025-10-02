import { League, Matchup } from "@/lib/types/userTypes";
import TableMain from "../table-main/table-main";
import Avatar from "../common/avatar/avatar";
import { getMedian } from "@/utils/getOptimalStarters";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import LeagueScores from "../league-scores/league-scores";
import { getTrendColor_Range } from "@/utils/getTrendColor";

const LineupcheckerScores = ({
  type,
  matchups,
}: {
  matchups: {
    user_matchup: Matchup;
    opp_matchup?: Matchup;
    league_matchups: Matchup[];
    league: League;
  }[];
  type: number;
}) => {
  const { type1, type2 } = useSelector((state: RootState) => state.manager);
  const { user } = useSelector((state: RootState) => state.lineupchecker);

  const headers = [
    {
      text: "League",
      colspan: 2,
      classname: "",
    },
    {
      text: user?.username || "",
      colspan: 1,
      classname: "",
    },
    {
      text: "Opp",
      colspan: 1,
      classname: "",
    },
    {
      text: "Median",
      colspan: 1,
      classname: "",
    },
    {
      text: "Proj Result",
      colspan: 1,
      classname: "",
    },
  ];

  const data = matchups
    .filter(
      (lm) =>
        ((type1 === "All" ||
          (type1 === "Redraft" && lm.league.settings.type !== 2) ||
          (type1 === "Dynasty" && lm.league.settings.type === 2)) &&
          (type2 === "All" ||
            (type2 === "Bestball" && lm.league.settings.best_ball === 1))) ||
        (type2 === "Lineup" && lm.league.settings.best_ball !== 1)
    )
    .sort((a, b) => a.league.index - b.league.index)
    .map((matchup) => {
      const key = "live_projection_current";
      const median = matchup.league.settings.league_average_match
        ? getMedian(matchup.league_matchups, key)
        : null;

      const user_proj = matchup.user_matchup?.[key] ?? 0;
      const opp_proj = matchup.opp_matchup?.[key] ?? 0;

      const matchupVsOpp = matchup.opp_matchup
        ? user_proj > opp_proj
          ? "W"
          : user_proj < opp_proj
          ? "L"
          : "T"
        : "-";

      const matchupVsMed = median
        ? user_proj < median
          ? "L"
          : user_proj > median
          ? "W"
          : user_proj === median
          ? "T"
          : ""
        : "";

      const total_proj = user_proj + opp_proj;
      const a = (total_proj / matchup.league.roster_positions.length) * 2;
      const min = total_proj / 2 - a;
      const max = total_proj / 2 + a;

      const total_proj_median = user_proj + (median ?? 0);
      const b =
        (total_proj_median / matchup.league.roster_positions.length) * 2;
      const min_median = total_proj_median / 2 - b;
      const max_median = total_proj_median / 2 + b;

      return {
        id: matchup.league.league_id,
        search: {
          text: matchup.league.name,
          display: (
            <Avatar
              id={matchup.league.avatar}
              text={matchup.league.name}
              type="L"
            />
          ),
        },
        columns: [
          {
            text: (
              <Avatar
                id={matchup.league.avatar}
                text={matchup.league.name}
                type="L"
              />
            ),
            colspan: 2,
            classname: "",
            sort: -matchup.league.index,
          },
          {
            text: user_proj.toLocaleString("en-US", {
              maximumFractionDigits: 1,
              minimumFractionDigits: 1,
            }),
            colspan: 1,
            classname: "font-score",
            sort: user_proj,
            style: getTrendColor_Range(user_proj, min, max),
          },
          {
            text:
              opp_proj.toLocaleString("en-US", {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1,
              }) ?? "-",
            colspan: 1,
            classname: "font-score",
            sort: opp_proj,
            style: getTrendColor_Range(opp_proj, min, max),
          },
          {
            text:
              median?.toLocaleString("en-US", {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1,
              }) ?? "-",
            colspan: 1,
            classname: "font-score",
            sort: median ?? 0,
            style: median
              ? getTrendColor_Range(median, min_median, max_median, true)
              : {},
          },
          {
            text: (
              <div className="flex justify-evenly">
                <span
                  className={
                    matchupVsOpp === "W"
                      ? "green"
                      : matchupVsOpp === "L"
                      ? "red"
                      : ""
                  }
                >
                  {matchupVsOpp}
                </span>
                {matchupVsMed && (
                  <span
                    className={
                      matchupVsMed === "W"
                        ? "green"
                        : matchupVsMed === "L"
                        ? "red"
                        : ""
                    }
                  >
                    {matchupVsMed}
                  </span>
                )}
              </div>
            ),
            classname: "",
            colspan: 1,
          },
        ],
        secondary: <LeagueScores matchupsLeague={matchup} type={type + 1} />,
      };
    });

  const component = (
    <TableMain type={type} headers={headers} data={data} placeholder="League" />
  );

  return component;
};

export default LineupcheckerScores;
