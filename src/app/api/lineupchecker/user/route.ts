import axiosInstance from "@/lib/axiosInstance";
import { SleeperLeague } from "@/lib/types/sleeperApiTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const searched = searchParams.get("searched");

  let user;

  try {
    user = (
      await axiosInstance.get(`https://api.sleeper.app/v1/user/${searched}`)
    )?.data;
  } catch (err: unknown) {
    console.log({ err });
  }

  if (!user) return NextResponse.json("Username not found", { status: 404 });

  let league_ids: string[] | undefined;

  try {
    const leagues: { data: SleeperLeague[] } = await axiosInstance.get(
      `https://api.sleeper.app/v1/user/${user.user_id}/leagues/nfl/${process.env.SEASON}`
    );

    league_ids = leagues.data
      .filter((l) => l.status === "in_season")
      .map((l) => l.league_id);
  } catch (err: unknown) {
    console.log({ err });
  }

  if (!league_ids)
    return NextResponse.json("Error fetching user leagues", { status: 404 });

  return NextResponse.json({
    user: {
      user_id: user.user_id,
      avatar: user.avatar,
      username: user.display_name,
    },
    league_ids,
  });
}
