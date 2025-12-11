"use client";

import { League, Matchup } from "@/lib/types/userTypes";
import { RootState } from "@/redux/store";
import { getMedian, position_map } from "@/utils/getOptimalStarters";
import { useSelector } from "react-redux";
import Avatar from "../common/avatar/avatar";
import LeagueMatchups from "../league-matchups/league-matchups";
import TableMain from "../table-main/table-main";
import { filterMatchups } from "@/utils/filterLeagues";

const LineupcheckerMatchups = ({
  league_matchups,
  type,
}: {
  type: number;
  league_matchups: {
    user_matchup: Matchup;
    opp_matchup?: Matchup;
    league_matchups: Matchup[];
    league: League;
  }[];
}) => {
  const { allplayers } = useSelector((state: RootState) => state.common);
  const { type1, type2 } = useSelector((state: RootState) => state.manager);
  const { locked } = useSelector((state: RootState) => state.lineupchecker);

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

  const projection_current_key = locked
    ? "projection_current_locked"
    : "projection_current";

  const projection_optimal_key = locked
    ? "projection_optimal_locked"
    : "projection_optimal";

  const starters_optimal_key = locked
    ? "starters_optimal_locked"
    : "starters_optimal";

  const data = filterMatchups(league_matchups, { type1, type2 })
    .sort((a, b) => a.league.index - b.league.index)
    .map((matchup) => {
      const starters_optimal = locked
        ? matchup.user_matchup.starters_optimal_locked
        : matchup.user_matchup.starters_optimal;

      const delta = locked
        ? matchup.user_matchup.projection_optimal_locked -
          matchup.user_matchup.projection_current_locked
        : matchup.user_matchup.projection_optimal -
          matchup.user_matchup.projection_current;

      const { text, classname } =
        !matchup.user_matchup.starters.some(
          (s) => !starters_optimal?.some((so) => so.optimal_player_id === s)
        ) &&
        !starters_optimal?.some(
          (so) => !matchup.user_matchup.starters.includes(so.optimal_player_id)
        )
          ? { text: <>&#10004;&#xfe0e;</>, classname: "green" }
          : {
              text: delta.toLocaleString("en-US", {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1,
              }),
              classname: "red",
            };

      const inOrder =
        matchup.league.settings.best_ball === 1 ||
        !starters_optimal?.some((so) => so.earlyInFlex || so.lateNotInFlex)
          ? { text: <>&#10004;&#xfe0e;</>, colspan: 1, classname: "green" }
          : {
              text: "\u2716\uFE0E",
              colspan: 1,
              classname: "red",
            };

      const nonQbInSf = matchup.user_matchup.starters
        .filter(
          (s, index) =>
            position_map[matchup.league.roster_positions[index]]?.includes(
              "QB"
            ) && !allplayers?.[s]?.fantasy_positions?.includes("QB")
        )
        .length.toString()
        .replace("0", "\u2714\uFE0E");

      const matchupVsOpp = matchup.opp_matchup
        ? matchup.user_matchup[projection_current_key] >
          matchup.opp_matchup[projection_current_key]
          ? "W"
          : matchup.user_matchup[projection_current_key] <
            matchup.opp_matchup[projection_current_key]
          ? "L"
          : "T"
        : "-";

      const median_current = matchup.league.settings.league_average_match
        ? getMedian(matchup.league_matchups, projection_current_key)
        : false;

      const matchupVsMed = median_current
        ? matchup.user_matchup[projection_current_key] < median_current
          ? "L"
          : matchup.user_matchup[projection_current_key] > median_current
          ? "W"
          : matchup.user_matchup[projection_current_key] === median_current
          ? "T"
          : ""
        : "";
      const alive = matchup.league.alive?.includes(
        matchup.user_matchup.roster_id
      );

      const bye = matchup.league.byes?.includes(matchup.user_matchup.roster_id);

      const projResult = (
        <div className="flex justify-evenly">
          <span
            className={
              matchupVsOpp === "W" ? "green" : matchupVsOpp === "L" ? "red" : ""
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
      );

      return {
        id: matchup.league.league_id,
        classname: (alive ? "alive " : " ") + (bye ? "bye " : " "),
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
            text: bye ? "BYE" : projResult,
            classname: bye ? "yellowb" : "",
            colspan: 1,
          },
        ],
        secondary: (
          <LeagueMatchups
            matchup={matchup}
            median_current={median_current}
            starters_optimal_key={starters_optimal_key}
            projection_current_key={projection_current_key}
            projection_optimal_key={projection_optimal_key}
          />
        ),
      };
    });

  const component = (
    <TableMain type={type} headers={headers} data={data} placeholder="League" />
  );

  return component;
};

export default LineupcheckerMatchups;
