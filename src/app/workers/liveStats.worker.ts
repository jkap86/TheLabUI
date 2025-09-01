import type { Allplayer, StatObj } from "@/lib/types/commonTypes";
import type { Matchup } from "@/lib/types/userTypes";
import type { League } from "@/lib/types/userTypes";
import {
  getOptimalStartersLineupCheck,
  getPlayerTotal,
} from "@/utils/getOptimalStarters";

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
};
self.onmessage = (e: MessageEvent<Message>) => {
  console.log("Worker received live stats");
  try {
    const { matchups, liveStats, allplayers } = e.data;

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
        const live_values: {
          [player_id: string]: {
            points: number;
            game_percent_complete: number;
          };
        } = {};

        m.players.forEach((player_id) => {
          try {
            const { stats, timeLeft } = liveStats[player_id] || {
              stats: {},
              timeLeft: 0,
            };

            const points = getPlayerTotal(
              matchupLeague.league.scoring_settings,
              stats
            );

            const game_percent_complete = 3600 - timeLeft / 3600;

            live_values[player_id] = { points, game_percent_complete };
          } catch {
            console.log("Error -" + player_id);
          }
        });

        const stat_obj = Object.fromEntries(
          Object.keys(liveStats).map((player_id) => [
            player_id,
            liveStats[player_id].stats,
          ])
        );

        const { starters_optimal, projection_current, projection_optimal } =
          getOptimalStartersLineupCheck(
            allplayers,
            matchupLeague.league.roster_positions,
            m.players,
            m.starters,
            stat_obj,
            matchupLeague.league.scoring_settings,
            {}
          );

        return {
          ...m,
          live_values,
          live_projection_current: projection_current,
          live_projection_optimal: projection_optimal,
          live_starters_optimal: starters_optimal,
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
  } catch {}
};
