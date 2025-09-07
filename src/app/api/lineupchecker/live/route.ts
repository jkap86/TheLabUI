import { NextRequest, NextResponse } from "next/server";
import { getSchedule } from "../helpers/getSchedule";
import axios from "axios";

const CC =
  "public, s-maxage=30, stale-while-revalidate=300, max-age=0, must-revalidate";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const week = searchParams.get("week");

  if (!week)
    return NextResponse.json("Error week not provided", { status: 400 });

  const stats: {
    player_id: string;
    stats: { [cat: string]: number };
    kickoff: number;
    timeLeft: number;
    is_in_progress: boolean;
  }[] = [];

  let delay;
  try {
    const [schedule, statsRaw] = await Promise.all([
      getSchedule(week),
      axios.get(
        `https://api.sleeper.com/stats/nfl/${process.env.SEASON}/${week}?season_type=regular`,
        {
          params: {
            timestamp: new Date().getTime(),
          },
        }
      ),
    ]);

    statsRaw.data.forEach(
      (statObj: {
        player_id: string;
        stats: { [cat: string]: number };
        player: { team: string };
      }) => {
        const { kickoff, timeLeft, is_in_progress } = schedule[
          statObj.player.team
        ] ?? { kickoff: 0, timeLeft: 0, is_in_progress: false };

        stats.push({
          player_id: statObj.player_id,
          stats: statObj.stats,
          kickoff: kickoff ?? 0,
          timeLeft: kickoff ? timeLeft ?? 3600 : 0,
          is_in_progress,
        });
      }
    );

    const upcomingKickoffTimes = Object.values(schedule)
      .filter((team) => team.kickoff > new Date().getTime())
      .map((team) => team.kickoff);

    delay = Object.values(schedule).some((team) => team.is_in_progress)
      ? 30_000
      : upcomingKickoffTimes.length > 0
      ? Math.min(...upcomingKickoffTimes) - new Date().getTime()
      : 12 * 60 * 60 * 1000;
  } catch (e: unknown) {
    if (e instanceof Error) console.log(e.message + " - fetch projections");
    delay = 30_000;
  }

  return NextResponse.json(
    { stats, delay },
    { headers: { "Cache-Control": CC } }
  );
}
