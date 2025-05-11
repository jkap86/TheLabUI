import store, { RootState } from "@/redux/store";

export const position_map: { [key: string]: string[] } = {
  QB: ["QB"],
  RB: ["RB", "FB"],
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
  values: { [player_id: string]: number } | null
) => {
  const state: RootState = store.getState();

  const { allplayers } = state.common;

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

  roster_positions
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
