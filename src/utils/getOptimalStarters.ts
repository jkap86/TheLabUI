import { Allplayer } from "@/lib/types/commonTypes";

export const position_map: { [key: string]: string[] } = {
  QB: ["QB"],
  RB: ["RB"],
  WR: ["WR"],
  TE: ["TE"],
  FLEX: ["RB", "FB", "WR", "TE"],
  SUPER_FLEX: ["QB", "RB", "FB", "WR", "TE"],
  WRRB_FLEX: ["RB", "FB", "WR"],
  REC_FLEX: ["WR", "TE"],
  K: ["K"],
  DEF: ["DEF"],
  DL: ["DL"],
  LB: ["LB"],
  DB: ["DB"],
  IDP_FLEX: ["DL", "LB", "DB"],
};

export const getSlotAbbrev = (slot: string) => {
  switch (slot) {
    case "FLEX":
      return "FLX";
    case "SUPER_FLEX":
      return "SF";
    case "WRRB_FLEX":
      return "W/R";
    case "REC_FLEX":
      return "W/T";
    case "IDP_FLEX":
      return "IDP";
    default:
      return slot;
  }
};

export const getOptimalStarters = (
  roster_positions: string[],
  players: string[],
  values: { [player_id: string]: number } | null,
  allplayers: { [player_id: string]: Allplayer }
) => {
  const playersWithValues = players
    .flatMap((player_id) => {
      return (allplayers?.[player_id]?.fantasy_positions || []).map(
        (position) => {
          return {
            player_id,
            position,
            value: values?.[player_id] || 0,
          };
        }
      );
    })
    .sort((a, b) => b.value - a.value);

  const optimal_starters: {
    index: number;
    slot__index: string;
    optimal_player_id: string;
    player_position: string;
    value: number;
  }[] = [];

  (roster_positions || [])
    .filter((slot) => position_map[slot])
    .forEach((slot, index) => {
      if (position_map[slot]) {
        const slot_options = playersWithValues.filter(
          (player) =>
            position_map[slot].includes(player.position) &&
            !optimal_starters.find(
              (os) => os.optimal_player_id === player.player_id
            )
        );

        const optimal_player = slot_options[0] || { player_id: "0", value: 0 };

        optimal_starters.push({
          index,
          slot__index: `${slot}__${index}`,
          optimal_player_id: optimal_player.player_id,
          player_position: optimal_player.position,
          value: optimal_player.value,
        });
      } else {
        optimal_starters.push({
          index,
          slot__index: `${slot}__${index}`,
          optimal_player_id: "0",
          player_position: "-",
          value: 0,
        });
      }
    });

  return optimal_starters.map((os) => os.optimal_player_id);
};

export const getOptimalStartersLineupCheck = (
  allplayers: { [player_id: string]: Allplayer },
  roster_positions: string[],
  players: string[],
  starters: string[],
  stat_obj: { [player_id: string]: { [key: string]: number } },
  scoring_settings: { [cat: string]: number },
  schedule: { [team: string]: { kickoff: number; opp: string } }
) => {
  const values: { [player_id: string]: number } = {};

  players.forEach((player_id) => {
    values[player_id] = getPlayerTotal(
      scoring_settings,
      stat_obj[player_id] || {}
    );
  });

  const playersWithValues = players
    .flatMap((player_id) => {
      return (allplayers?.[player_id]?.fantasy_positions || []).map(
        (position) => {
          return {
            player_id,
            position,
            value: values?.[player_id] || 0,
          };
        }
      );
    })
    .sort((a, b) => b.value - a.value);

  const optimal_starters: {
    index: number;
    slot__index: string;
    optimal_player_id: string;
    player_position: string;
    value: number;
    kickoff: number;
  }[] = [];

  (roster_positions || [])
    .filter((slot) => position_map[slot])
    .forEach((slot, index) => {
      if (position_map[slot]) {
        const slot_options = playersWithValues.filter(
          (player) =>
            position_map[slot].includes(player.position) &&
            !optimal_starters.find(
              (os) => os.optimal_player_id === player.player_id
            )
        );

        const optimal_player = slot_options[0] || { player_id: "0", value: 0 };

        optimal_starters.push({
          index,
          slot__index: `${slot}__${index}`,
          optimal_player_id: optimal_player.player_id,
          player_position: optimal_player.position,
          value: optimal_player.value,
          kickoff:
            schedule[allplayers[optimal_player.player_id]?.team]?.kickoff || 0,
        });
      } else {
        optimal_starters.push({
          index,
          slot__index: `${slot}__${index}`,
          optimal_player_id: starters[index],
          player_position: "-",
          value: 0,
          kickoff: 0,
        });
      }
    });

  const starters_optimal = optimal_starters.map((so) => {
    return {
      ...so,
      earlyInFlex: optimal_starters.some(
        (os) =>
          so.kickoff < os.kickoff &&
          position_map[so.slot__index.split("__")[0]].length >
            position_map[os.slot__index.split("__")[0]].length
      ),
      lateNotInFlex: optimal_starters.some(
        (os) =>
          so.kickoff > os.kickoff &&
          position_map[so.slot__index.split("__")[0]].length <
            position_map[os.slot__index.split("__")[0]].length
      ),
    };
  });
  const projection_optimal = optimal_starters.reduce(
    (acc, cur) => acc + cur.value,
    0
  );
  const projection_current = starters.reduce(
    (acc, cur) => acc + (values?.[cur] || 0),
    0
  );

  return { starters_optimal, projection_current, projection_optimal };
};

export const getPlayerTotal = (
  scoring_settings: { [key: string]: number },
  stat_obj: { [key: string]: number }
) => {
  const projection = Object.keys(stat_obj || {})
    .filter((key) => Object.keys(scoring_settings).includes(key))
    .reduce((acc, cur) => acc + scoring_settings[cur] * stat_obj[cur], 0);

  return projection;
};
