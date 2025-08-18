"use client";

import Avatar from "@/components/avatar/avatar";
import LeagueMatchups from "@/components/league-matchups/league-matchups";
import LeagueTypeSwitch from "@/components/leagueTypeSwitch/leagueTypeSwitch";
import LoadingIcon from "@/components/loading-icon/loading-icon";
import TableMain from "@/components/table-main/table-main";
import useFetchMatchups from "@/hooks/lineupchecker/useFetchMatchups";
import useFetchAllplayers from "@/hooks/useFetchAllplayers";
import useFetchNflState from "@/hooks/useFetchNflState";
import { RootState } from "@/redux/store";
import { position_map } from "@/utils/getOptimalStarters";

import Link from "next/link";
import { use } from "react";
import { useSelector } from "react-redux";

const Matchups = ({ params }: { params: Promise<{ searched: string }> }) => {
  const { searched } = use(params);
  const { allplayers } = useSelector((state: RootState) => state.common);
  const { type1, type2 } = useSelector((state: RootState) => state.manager);
  const { isLoadingMatchups, matchups } = useSelector(
    (state: RootState) => state.lineupchecker
  );
  useFetchNflState();
  useFetchAllplayers();
  useFetchMatchups({ searched });

  const headers = [
    {
      text: "League",
      colspan: 2,
      classname: "",
    },
    {
      text: "Opt-Act",
      colspan: 1,
      classname: "",
    },
    {
      text: "Ordered",
      colspan: 1,
      classname: "",
    },
    {
      text: "Non QB SF",
      colspan: 1,
      classname: "",
    },
    {
      text: "Proj Result",
      colspan: 1,
      classname: "",
    },
  ];

  const data = Object.keys(matchups)
    .filter(
      (league_id) =>
        (type1 === "All" ||
          (type1 === "Redraft" && matchups[league_id].settings.type !== 2) ||
          (type1 === "Dynasty" && matchups[league_id].settings.type === 2)) &&
        (type2 === "All" ||
          (type2 === "Bestball" &&
            matchups[league_id].settings.best_ball === 1) ||
          (type2 === "Lineup" && matchups[league_id].settings.best_ball !== 1))
    )
    .sort((a, b) => matchups[a].league_index - matchups[b].league_index)
    .map((league_id) => {
      const matchup = matchups[league_id];

      const { text, classname } =
        !matchup.user_matchup.starters.some(
          (s) =>
            !matchup.user_matchup.starters_optimal?.some(
              (so) => so.optimal_player_id === s
            )
        ) &&
        !matchup.user_matchup.starters_optimal?.some(
          (so) => !matchup.user_matchup.starters.includes(so.optimal_player_id)
        )
          ? { text: <>&#10004;&#xfe0e;</>, classname: "green" }
          : {
              text: (
                matchup.user_matchup.projection_optimal -
                matchup.user_matchup.projection_current
              ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
              classname: "red",
            };

      const inOrder =
        matchup.settings.best_ball === 1 ||
        !matchup.user_matchup.starters_optimal?.some(
          (so) => so.earlyInFlex || so.lateNotInFlex
        )
          ? { text: <>&#10004;&#xfe0e;</>, colspan: 1, classname: "green" }
          : {
              text: "x",
              colspan: 1,
              classname: "red",
            };

      const nonQbInSf = matchup.user_matchup.starters
        .filter(
          (s, index) =>
            position_map[
              matchup.user_matchup.league.roster_positions[index]
            ].includes("QB") &&
            !allplayers?.[s]?.fantasy_positions?.includes("QB")
        )
        .length.toString()
        .replace("0", "\u2714\uFE0E");

      const matchupVsOpp =
        matchup.user_matchup.projection_current >
        matchup.opp_matchup.projection_current
          ? "W"
          : matchup.user_matchup.projection_current <
            matchup.opp_matchup.projection_current
          ? "L"
          : matchup.user_matchup.projection_current ===
            matchup.opp_matchup.projection_current
          ? "T"
          : "-";

      const median_current = matchup.user_matchup.league.settings
        .league_average_match
        ? matchup.league_matchups.reduce(
            (acc, cur) => acc + (cur.projection_current || 0),
            0
          ) / matchup.league_matchups.length
        : false;

      const median_optimal = matchup.user_matchup.league.settings
        .league_average_match
        ? matchup.league_matchups.reduce(
            (acc, cur) => acc + (cur.projection_optimal || 0),
            0
          ) / matchup.league_matchups.length
        : false;

      const matchupVsMed = median_current
        ? matchup.user_matchup.projection_current < median_current
          ? "L"
          : matchup.user_matchup.projection_current > median_current
          ? "W"
          : matchup.user_matchup.projection_current ===
            matchup.opp_matchup.projection_current
          ? "T"
          : ""
        : "";

      return {
        id: league_id,
        columns: [
          {
            text: (
              <Avatar
                id={matchup.league_avatar}
                text={matchup.league_name}
                type="L"
              />
            ),
            colspan: 2,
            classname: "",
            sort: -matchup.league_index,
          },
          {
            text: text,
            colspan: 1,
            classname: classname,
          },
          inOrder,
          {
            text: nonQbInSf,
            classname: parseInt(nonQbInSf) ? "red" : "green",
            colspan: 1,
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
                </span>{" "}
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
        secondary: <LeagueMatchups matchup={matchups[league_id]} />,
      };
    });

  return (
    <>
      <Link href={"/"} className="home">
        Home
      </Link>
      <LeagueTypeSwitch />
      {isLoadingMatchups ? (
        <LoadingIcon messages={[]} />
      ) : (
        <TableMain type={1} headers={headers} data={data} placeholder="" />
      )}
    </>
  );
};

export default Matchups;
