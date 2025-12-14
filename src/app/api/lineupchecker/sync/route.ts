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

// Force dynamic to prevent caching issues in production
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    const { league_id, user_id, week, best_ball, edits } = formData;

    console.log(`[SYNC] Starting sync for league ${league_id}, week ${week}`);

    const schedule_week = await getSchedule(week);
    const projections_week = await getProjections(week);
    const allplayers = await getAllplayers();

    console.log("[SYNC] Got schedule, projections, allplayers");

    const [league, matchups, rosters, users]: [
      { data: SleeperLeague },
      { data: SleeperMatchup[] },
      { data: SleeperRoster[] },
      { data: SleeperUser[] }
    ] = await Promise.all([
      axiosInstance.get(`https://api.sleeper.app/v1/league/${league_id}`),
      axiosInstance.get(
        `https://api.sleeper.app/v1/league/${league_id}/matchups/${week}`,
        { params: { date: new Date().getTime() } }
      ),
      axiosInstance.get(
        `https://api.sleeper.app/v1/league/${league_id}/rosters`
      ),
      axiosInstance.get(`https://api.sleeper.app/v1/league/${league_id}/users`),
    ]);

    console.log("[SYNC] Got Sleeper API data");

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

      const {
        starters_optimal,
        values,
        projection_current,
        projection_optimal,
      } = getOptimalStartersLineupCheck(
        allplayers,
        league.data.roster_positions,
        m.players,
        m.starters,
        projections_week,
        league.data.scoring_settings,
        schedule_week,
        { edits }
      );

      const {
        starters_optimal: starters_optimal_locked,
        projection_current: projection_current_locked,
        projection_optimal: projection_optimal_locked,
      } = getOptimalStartersLineupCheck(
        allplayers,
        league.data.roster_positions,
        m.players,
        m.starters,
        projections_week,
        league.data.scoring_settings,
        schedule_week,
        { edits, locked: true }
      );

      updated_matchups.push({
        ...m,
        starters:
          best_ball === 1
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
          best_ball === 1 ? projection_optimal : projection_current,
        projection_optimal,
        starters_optimal_locked:
          league.data.settings.best_ball === 1
            ? starters_optimal
            : starters_optimal_locked,
        projection_current_locked:
          league.data.settings.best_ball === 1
            ? projection_current
            : projection_current_locked,
        projection_optimal_locked:
          league.data.settings.best_ball === 1
            ? projection_optimal
            : projection_optimal_locked,
      });
    });

    await upsertMatchups(updated_matchups);

    console.log("[SYNC] Completed successfully");
    return NextResponse.json(updated_matchups);
  } catch (err: unknown) {
    console.error("[SYNC] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
