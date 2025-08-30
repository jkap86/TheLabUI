import { Allplayer } from "@/lib/types/commonTypes";
import { ProjectionEdits } from "@/lib/types/userTypes";

export const position_map: { [key: string]: string[] } = {
  QB: ["QB"],
  RB: ["RB"],
  WR: ["WR"],
  TE: ["TE"],
  FLEX: ["RB", "WR", "TE"],
  SUPER_FLEX: ["QB", "RB", "WR", "TE"],
  WRRB_FLEX: ["RB", "WR"],
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

  return optimal_starters;
};

export const getOptimalStartersLineupCheck = (
  allplayers: { [player_id: string]: Allplayer },
  roster_positions: string[],
  players: string[],
  starters: string[],
  stat_obj: { [player_id: string]: { [key: string]: number } },
  scoring_settings: { [cat: string]: number },
  schedule: { [team: string]: { kickoff: number; opp: string } },
  edits?: ProjectionEdits
) => {
  const values: { [player_id: string]: number } = {};

  players.forEach((player_id) => {
    values[player_id] = getPlayerTotal(
      scoring_settings,
      stat_obj[player_id] || {},
      edits?.[player_id]
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
            kickoff: schedule[allplayers[player_id]?.team]?.kickoff || 0,
          };
        }
      );
    })
    .sort((a, b) => b.value - a.value);

  const optimal_starters: {
    index: number;
    slot: string;
    slot__index: string;
    optimal_player_id: string;
    optimal_player_position: string;
    optimal_player_value: number;
    optimal_player_kickoff: number;
    current_player_id: string;
    current_player_position: string;
    current_player_value: number;
    current_player_kickoff: number;
    current_slot_options: {
      player_id: string;
      proj: number;
    }[];
  }[] = [];

  (roster_positions || [])
    .filter((slot) => position_map[slot])
    .forEach((slot, index) => {
      const current_player_id = starters[index];

      if (position_map[slot]) {
        const slot_options = playersWithValues.filter(
          (player) =>
            position_map[slot].includes(player.position) &&
            !optimal_starters.find(
              (os) => os.optimal_player_id === player.player_id
            )
        );

        const optimal_player = slot_options[0] || {
          player_id: "0",
          value: 0,
          kickoff: 0,
        };

        optimal_starters.push({
          index,
          slot,
          slot__index: `${slot}__${index}`,
          optimal_player_id: optimal_player.player_id,
          optimal_player_position: optimal_player.position,
          optimal_player_value: optimal_player.value,
          optimal_player_kickoff:
            schedule[allplayers[optimal_player.player_id]?.team]?.kickoff || 0,
          current_player_id,
          current_player_position: allplayers[current_player_id]?.position,
          current_player_value: values[current_player_id],
          current_player_kickoff:
            schedule[allplayers[current_player_id]?.team]?.kickoff || 0,
          current_slot_options: slot_options.map((so) => ({
            player_id: so.player_id,
            proj: so.value,
          })),
        });
      } else {
        optimal_starters.push({
          index,
          slot,
          slot__index: `${slot}__${index}`,
          optimal_player_id: current_player_id,
          optimal_player_position: allplayers[current_player_id].position,
          optimal_player_value: values[current_player_id],
          optimal_player_kickoff:
            schedule[allplayers[current_player_id]?.team]?.kickoff || 0,
          current_player_id: current_player_id,
          current_player_position: allplayers[current_player_id]?.position,
          current_player_value: values[current_player_id],
          current_player_kickoff:
            schedule[allplayers[current_player_id]?.team]?.kickoff || 0,
          current_slot_options: [],
        });
      }
    });

  const optimal_starters_ordered: {
    index: number;
    slot__index: string;
    optimal_player_id: string;
    optimal_player_position: string;
    optimal_player_value: number;
    optimal_player_kickoff: number;
    current_player_id: string;
    current_player_position: string;
    current_player_value: number;
    current_player_kickoff: number;
    earlyInFlex: boolean;
    lateNotInFlex: boolean;
    current_slot_options: {
      player_id: string;
      proj: number;
    }[];
  }[] = [];

  optimal_starters
    .filter((os) => position_map[os.slot__index.split("__")[0]])
    .sort(
      (a, b) =>
        position_map[a.slot__index.split("__")[0]].length -
        position_map[b.slot__index.split("__")[0]].length
    )
    .forEach((os) => {
      const slot = os.slot__index.split("__")[0];

      const slot_options_optimal = playersWithValues
        .filter(
          (player) =>
            optimal_starters.some(
              (os) => os.optimal_player_id === player.player_id
            ) &&
            position_map[slot].includes(player.position) &&
            !optimal_starters_ordered.find(
              (os) => os.optimal_player_id === player.player_id
            )
        )
        .sort((a, b) => a.kickoff - b.kickoff);

      const optimal_player = slot_options_optimal[0] || {
        player_id: "0",
        value: 0,
      };

      const earlyInFlex = starters.some((s, index) => {
        return (
          (schedule[allplayers?.[os.current_player_id]?.team || ""]?.kickoff ||
            0) +
            60 * 60 * 1000 <
            (schedule[allplayers?.[s]?.team || ""]?.kickoff || 0) &&
          position_map[roster_positions[index]].length <
            position_map[slot].length &&
          position_map[roster_positions[index]]?.includes(
            allplayers[os.current_player_id]?.position || ""
          ) &&
          position_map[slot]?.includes(allplayers[s]?.position || "")
        );
      });

      const lateNotInFlex = starters.some((s, index) => {
        return (
          (schedule[allplayers?.[os.current_player_id]?.team || ""]?.kickoff ||
            0) >
            (schedule[allplayers?.[s]?.team || ""]?.kickoff || 0) +
              60 * 60 * 1000 &&
          position_map[roster_positions[index]].length >
            position_map[slot].length &&
          position_map[roster_positions[index]]?.includes(
            allplayers[os.current_player_id]?.position || ""
          ) &&
          position_map[slot]?.includes(allplayers[s]?.position || "")
        );
      });

      optimal_starters_ordered.push({
        ...os,
        earlyInFlex,
        lateNotInFlex,
        optimal_player_id: optimal_player.player_id,
      });
    });

  const projection_optimal = optimal_starters.reduce(
    (acc, cur) => acc + cur.optimal_player_value,
    0
  );
  const projection_current = optimal_starters.reduce(
    (acc, cur) => acc + cur.current_player_value,
    0
  );

  return {
    starters_optimal: optimal_starters_ordered,
    values,
    projection_current,
    projection_optimal,
  };
};

export const getPlayerTotal = (
  scoring_settings: { [key: string]: number },
  stat_obj: { [key: string]: number },
  edits?: { [cat: string]: { update: number | ""; sleeper_value: number } }
) => {
  const projection = Object.keys(stat_obj || {})
    .filter((key) => Object.keys(scoring_settings).includes(key))
    .reduce(
      (acc, cur) =>
        acc +
        scoring_settings[cur] *
          ((edits?.[cur]?.update === "" ? -1 : edits?.[cur]?.update) ??
            stat_obj[cur]),
      0
    );

  return projection;
};

export const ppr_scoring_settings = {
  pass_yd: 0.04,
  pass_td: 5,
  pass_int: -1,
  pass_2pt: 2,

  rec_yd: 0.1,
  rec: 1,
  rec_2pt: 2,
  rec_td: 6,

  rush_yd: 0.1,
  rush_2pt: 2,
  rush_td: 6,
};
