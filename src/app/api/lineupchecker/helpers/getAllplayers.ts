import pool from "@/lib/pool";
import { Allplayer } from "@/lib/types/commonTypes";

export const getAllplayers = async () => {
  const data = await pool.query(
    "SELECT * FROM common WHERE name = 'allplayers'"
  );

  const players_obj: { [player_id: string]: Allplayer } = {};

  data.rows[0].data
    .filter((player: Allplayer) => player.active)
    .forEach((player: Allplayer) => {
      players_obj[player.player_id] = player;
    });

  return players_obj;
};
