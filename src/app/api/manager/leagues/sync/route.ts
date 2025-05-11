import { NextRequest, NextResponse } from "next/server";
import { updateLeagues } from "../helpers/updateLeagues";
import axiosInstance from "@/lib/axiosInstance";
import { Roster } from "@/lib/types/userTypes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const league_id = searchParams.get("league_id") as string;
  const userRoster_id = parseInt(searchParams.get("roster_id") || "0");
  const week = searchParams.get("week");

  try {
    const updatedLeague = await updateLeagues([league_id], [league_id], week);

    const user_roster = updatedLeague[0].rosters.find(
      (roster: Roster) =>
        roster.roster_id === userRoster_id && (roster.players || []).length > 0
    );

    const league_to_send = {
      ...updatedLeague[0],
      user_roster,
    };

    return NextResponse.json(league_to_send, {
      status: 200,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
      return NextResponse.json(err.message);
    } else {
      console.log({ err });
      return NextResponse.json("unkown error");
    }
  }
}
