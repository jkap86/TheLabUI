import { League, Matchup } from "@/lib/types/userTypes";
import type { RootState } from "@/redux/store";

type ManagerSlice = Pick<RootState["manager"], "type1" | "type2" | "leagues">;

export const filterLeagueIds = (
  league_ids: string[],
  { type1, type2, leagues }: ManagerSlice
) => {
  return league_ids.filter((league_id) => {
    const condition1 =
      type1 === "All" ||
      (type1 === "Redraft" && leagues?.[league_id].settings.type !== 2) ||
      (type1 === "Dynasty" && leagues?.[league_id].settings.type === 2);

    const condition2 =
      type2 === "All" ||
      (type2 === "Bestball" && leagues?.[league_id].settings.best_ball === 1) ||
      (type2 === "Lineup" && leagues?.[league_id].settings.best_ball !== 1);

    return condition1 && condition2;
  });
};

export const filterMatchups = (
  league_matchups: {
    user_matchup: Matchup;
    opp_matchup?: Matchup;
    league_matchups: Matchup[];
    league: League;
  }[],
  { type1, type2 }: Pick<RootState["manager"], "type1" | "type2">,
  playoffsFilter: "Playoffs" | "Alive" | "Bye" | "All"
) => {
  return league_matchups.filter((lm) => {
    const condition1 =
      type1 === "All" ||
      (type1 === "Redraft" && lm.league.settings.type !== 2) ||
      (type1 === "Dynasty" && lm.league.settings.type === 2);

    const condition2 =
      type2 === "All" ||
      (type2 === "Bestball" && lm.league.settings.best_ball === 1) ||
      (type2 === "Lineup" && lm.league.settings.best_ball !== 1);

    const condition3 =
      playoffsFilter === "All" ||
      (playoffsFilter === "Playoffs" &&
        lm.league.playoffs?.includes(lm.user_matchup.roster_id)) ||
      (playoffsFilter === "Alive" &&
        lm.league.alive?.includes(lm.user_matchup.roster_id) &&
        !lm.league.byes?.includes(lm.user_matchup.roster_id)) ||
      (playoffsFilter === "Bye" &&
        lm.league.byes?.includes(lm.user_matchup.roster_id));

    return condition1 && condition2 && condition3;
  });
};
