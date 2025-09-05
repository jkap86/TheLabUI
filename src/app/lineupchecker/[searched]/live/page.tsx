"use client";

import { use } from "react";
import LineupcheckerLayout from "../lineupchecker-layout";
import TableMain from "@/components/table-main/table-main";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Avatar from "@/components/avatar/avatar";
import { getMedian } from "@/utils/getOptimalStarters";
//import LeagueScores from "@/components/league-scores/league-scores";

const LivePage = ({ params }: { params: Promise<{ searched: string }> }) => {
  const { searched } = use(params);
  const { type1, type2 } = useSelector((state: RootState) => state.manager);
  const { user, matchups } = useSelector(
    (state: RootState) => state.lineupchecker
  );

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

  const data = Object.values(matchups)
    .filter(
      (lm) =>
        (type1 === "All" ||
          (type1 === "Redraft" && lm.league.settings.type !== 2) ||
          (type1 === "Dynasty" && lm.league.settings.type === 2)) &&
        (type2 === "All" ||
          (type2 === "Bestball" &&
            type1 === "Redraft" &&
            lm.league.settings.type !== 2) ||
          lm.league.settings.best_ball === 1 ||
          (type2 === "Lineup" && lm.league.settings.best_ball !== 1))
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
            text:
              matchup.user_matchup.live_projection_current?.toLocaleString(
                "en-US",
                { maximumFractionDigits: 1, minimumFractionDigits: 1 }
              ) ?? "-",
            colspan: 1,
            classname: "",
            sort: matchup.user_matchup.live_projection_current ?? 0,
          },
          {
            text:
              matchup.opp_matchup?.live_projection_current?.toLocaleString(
                "en-US",
                { maximumFractionDigits: 1, minimumFractionDigits: 1 }
              ) ?? "-",
            colspan: 1,
            classname: "",
            sort: matchup.opp_matchup?.live_projection_current ?? 0,
          },
          {
            text:
              median?.toLocaleString("en-US", {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1,
              }) ?? "-",
            colspan: 1,
            classname: "",
            sort: median ?? 0,
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
      };
    });

  const component = <TableMain type={1} headers={headers} data={data} />;

  return <LineupcheckerLayout searched={searched} component={component} />;
};

export default LivePage;
