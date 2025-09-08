import type { Allplayer, StatObj } from "@/lib/types/commonTypes";
import type { Matchup } from "@/lib/types/userTypes";
import type { League } from "@/lib/types/userTypes";
import { getLivePointsObj, getLiveProjObj } from "@/utils/getLiveProjObject";
import { getOptimalStartersLineupCheck } from "@/utils/getOptimalStarters";

type Message = {
  matchups: {
    [league_id: string]: {
      user_matchup: Matchup;
      opp_matchup?: Matchup;
      league_matchups: Matchup[];
      league: League;
    };
  };
  liveStats: { [player_id: string]: StatObj };
  allplayers: { [player_id: string]: Allplayer };
  projections: { [player_id: string]: { [cat: string]: number } };
};

self.onmessage = (e: MessageEvent<Message>) => {
  console.log("Worker received live stats");
  try {
    const { matchups, liveStats, allplayers, projections } = e.data;

    const matchups_w_live: {
      [league_id: string]: {
        user_matchup: Matchup;
        opp_matchup?: Matchup;
        league_matchups: Matchup[];
        league: League;
      };
    } = {};

    Object.keys(matchups).forEach((league_id) => {
      const matchupLeague = matchups[league_id];

      const league_matchups_w_live = matchupLeague.league_matchups.map((m) => {
        const { live_values, stat_obj_points } = getLiveProjObj({
          m,
          liveStats,
          scoring_settings: matchupLeague.league.scoring_settings,
        });

        const {
          starters_optimal: live_points_starters_optimal,
          projection_current: live_points_current,
          projection_optimal: live_points_optimal,
        } = getOptimalStartersLineupCheck(
          allplayers,
          matchupLeague.league.roster_positions,
          m.players,
          m.starters,
          stat_obj_points,
          matchupLeague.league.scoring_settings,
          {}
        );

        const stat_obj_live_proj = getLivePointsObj({
          projections,
          liveStats,
          live_values,
        });

        const {
          starters_optimal: live_projection_starters_optimal,
          projection_current: live_projection_current,
          projection_optimal: live_projection_optimal,
        } = getOptimalStartersLineupCheck(
          allplayers,
          matchupLeague.league.roster_positions,
          m.players,
          m.starters,
          stat_obj_live_proj,
          matchupLeague.league.scoring_settings,
          {}
        );

        return {
          ...m,
          live_values,
          live_projection_current:
            matchupLeague.league.settings.best_ball === 1
              ? live_projection_optimal
              : live_projection_current,
          live_projection_optimal,
          live_projection_starters_optimal,
          live_points_current:
            matchupLeague.league.settings.best_ball === 1
              ? live_points_starters_optimal.reduce(
                  (acc, so) =>
                    acc + (live_values[so.optimal_player_id]?.points ?? 0),
                  0
                )
              : live_points_current,
          live_points_optimal,
          live_points_starters_optimal,
        };
      });

      matchups_w_live[league_id] = {
        ...matchupLeague,
        league_matchups: league_matchups_w_live,
        user_matchup: league_matchups_w_live.find(
          (m) => m.roster_id === matchupLeague.user_matchup.roster_id
        ) as Matchup,
        opp_matchup: league_matchups_w_live.find(
          (m) => m.roster_id === matchupLeague.opp_matchup?.roster_id
        ),
      };
    });

    postMessage({ matchups_w_live });
  } catch (err) {
    console.log({ err });
  }
};
