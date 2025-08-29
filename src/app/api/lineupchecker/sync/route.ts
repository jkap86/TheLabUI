import axiosInstance from "@/lib/axiosInstance";
import {
  SleeperLeague,
  SleeperMatchup,
  SleeperRoster,
  SleeperUser,
} from "@/lib/types/sleeperApiTypes";
import { getOptimalStartersLineupCheck } from "@/utils/getOptimalStarters";
import { NextRequest, NextResponse } from "next/server";
import { upsertMatchups } from "../helpers/upsertMatchups";
import { Matchup } from "@/lib/types/userTypes";
import { getSchedule } from "../helpers/getSchedule";
import { getProjections } from "../helpers/getProjections";
import { getAllplayers } from "../helpers/getAllplayers";

export async function POST(req: NextRequest) {
  const formData = await req.json();

  const { league_id, user_id, week, best_ball, edits } = formData;

  const schedule_week = await getSchedule(week);
  const projections_week = await getProjections(week);
  const allplayers = await getAllplayers();

  const [league, matchups, rosters, users]: [
    { data: SleeperLeague },
    { data: SleeperMatchup[] },
    { data: SleeperRoster[] },
    { data: SleeperUser[] }
  ] = await Promise.all([
    await axiosInstance.get(`https://api.sleeper.app/v1/league/${league_id}`),
    await axiosInstance.get(
      `https://api.sleeper.app/v1/league/${league_id}/matchups/${week}`,
      {
        params: {
          date: new Date().getTime(),
        },
      }
    ),
    await axiosInstance.get(
      `https://api.sleeper.app/v1/league/${league_id}/rosters`
    ),
    await axiosInstance.get(
      `https://api.sleeper.app/v1/league/${league_id}/users`
    ),
  ]);

  const roster_user = rosters.data.find(
    (r: SleeperRoster) => r.owner_id === user_id
  );

  const roster_id_user = roster_user?.roster_id as number;

  const matchup_user = matchups.data.find(
    (m: SleeperMatchup) => m.roster_id === roster_id_user
  );

  const roster_id_opp = matchups.data.find(
    (m: SleeperMatchup) =>
      m.matchup_id === matchup_user?.matchup_id &&
      m.roster_id !== roster_id_user
  )?.roster_id;

  const updated_matchups: Matchup[] = [];

  matchups.data.forEach((m: SleeperMatchup) => {
    const user = users.data.find(
      (u: SleeperUser) =>
        u.user_id ===
        rosters.data.find((r: SleeperRoster) => r.roster_id === m.roster_id)
          ?.owner_id
    );

    const { starters_optimal, values, projection_current, projection_optimal } =
      getOptimalStartersLineupCheck(
        allplayers,
        league.data.roster_positions,
        m.players,
        m.starters,
        projections_week,
        league.data.scoring_settings,
        schedule_week,
        edits
      );

    updated_matchups.push({
      ...m,
      starters:
        best_ball === "1"
          ? starters_optimal.map((so) => so.optimal_player_id)
          : m.starters,
      week: parseInt(week as string),
      updated_at: new Date(),
      league_id,
      roster_id_user,
      roster_id_opp,
      username: user?.display_name || "Orphan",
      user_id: user?.user_id || "0",
      avatar: user?.avatar || null,
      starters_optimal,
      values,
      projection_current:
        best_ball === "1" ? projection_optimal : projection_current,
      projection_optimal,
    });
  });

  await upsertMatchups(updated_matchups);

  return NextResponse.json(updated_matchups);
}
