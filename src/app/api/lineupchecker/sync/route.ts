import axiosInstance from "@/lib/axiosInstance";
import {
  SleeperLeague,
  SleeperMatchup,
  SleeperRoster,
  SleeperUser,
} from "@/lib/types/sleeperApiTypes";
import { getOptimalStartersLineupCheck } from "@/utils/getOptimalStarters";
import { NextRequest, NextResponse } from "next/server";
import {
  getAllplayers,
  getProjections,
  getSchedule,
  upsertMatchups,
} from "../route";
import { Matchup } from "@/lib/types/userTypes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const league_id = searchParams.get("league_id") as string;
  const user_id = searchParams.get("user_id") as string;
  const week = searchParams.get("week") as string;
  const index = searchParams.get("index") as string;

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

    const { starters_optimal, projection_current, projection_optimal } =
      getOptimalStartersLineupCheck(
        allplayers,
        league.data.roster_positions,
        m.players,
        m.starters,
        projections_week,
        league.data.scoring_settings,
        schedule_week
      );

    updated_matchups.push({
      ...m,
      week: parseInt(week as string),
      updated_at: new Date(),
      league_id,
      roster_id_user,
      roster_id_opp,
      username: user?.display_name || "Orphan",
      user_id,
      avatar: user?.avatar || null,
      league: {
        index: parseInt(index),
        name: league.data.name,
        avatar: league.data.avatar,
        settings: league.data.settings,
        scoring_settings: league.data.scoring_settings,
        roster_positions: league.data.roster_positions,
      },
      starters_optimal,
      projection_current,
      projection_optimal,
    });
  });

  await upsertMatchups(updated_matchups);

  return NextResponse.json(updated_matchups);
}
