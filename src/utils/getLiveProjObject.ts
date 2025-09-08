import { StatObj } from "@/lib/types/commonTypes";
import { Matchup } from "@/lib/types/userTypes";
import { getPlayerTotal } from "./getOptimalStarters";

export const getLiveProjObj = ({
  m,
  liveStats,
  scoring_settings,
}: {
  m: Matchup;
  liveStats: { [player_id: string]: StatObj };
  scoring_settings: { [cat: string]: number };
}) => {
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

      const points = getPlayerTotal(scoring_settings, stats);

      const game_percent_complete = (3600 - timeLeft) / 3600;

      const original_proj = m.values[player_id] ?? 0;

      const live_proj = original_proj * (1 - game_percent_complete) + points;

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

  return { live_values, stat_obj_points };
};

export const getLivePointsObj = ({
  projections,
  liveStats,
  live_values,
}: {
  projections: {
    [player_id: string]: {
      [cat: string]: number;
    };
  };
  liveStats: { [player_id: string]: StatObj };
  live_values: {
    [player_id: string]: {
      points: number;
      game_percent_complete: number;
      live_proj: number;
    };
  };
}) => {
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

  return stat_obj_live_proj;
};
