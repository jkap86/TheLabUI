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
        const live_values: {
          [player_id: string]: {
            points: number;
            game_percent_complete: number;
            live_proj: number;
          };
        } = {};

        m.players.forEach((player_id) => {
          try {
            const { stats, timeLeft } = liveStats[player_id] || {
              stats: {},
              timeLeft: 3600,
            };

            const points = getPlayerTotal(
              matchupLeague.league.scoring_settings,
              stats
            );

            const game_percent_complete = (3600 - timeLeft) / 3600;

            const original_proj = m.values[player_id] ?? 0;

            const live_proj =
              original_proj * (1 - game_percent_complete) + points;

            live_values[player_id] = {
              points,
              game_percent_complete,
              live_proj,
            };
          } catch {
            console.log("Error -" + player_id);
          }
        });

        const stat_obj_points = Object.fromEntries(
          Object.keys(liveStats).map((player_id) => [
            player_id,
            liveStats[player_id].stats,
          ])
        );

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

        const stat_obj_live_proj: {
          [player_id: string]: { [key: string]: number };
        } = {};

        const players_ids = Array.from(
          new Set([...Object.keys(projections), ...Object.keys(liveStats)])
        );

        players_ids.forEach((player_id) => {
          stat_obj_live_proj[player_id] = {};

          const stat_keys = Array.from(
            new Set([
              ...Object.keys(liveStats[player_id]?.stats || {}),
              ...Object.keys(projections[player_id] || {}),
            ])
          );

          stat_keys.forEach((cat) => {
            const value =
              (projections[player_id]?.[cat] || 0) *
                (1 - (live_values[player_id]?.game_percent_complete || 0)) +
              (liveStats[player_id]?.stats?.[cat] || 0);

            stat_obj_live_proj[player_id][cat] = value;
          });
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
          live_projection_current,
          live_projection_optimal,
          live_projection_starters_optimal,
          live_points_current,
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
