import axiosInstance from "@/lib/axiosInstance";
import { NextRequest, NextResponse } from "next/server";

const CC = "private, max-age=3600, s-maxage=1800, stale-while-revalidate=300";

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

  return NextResponse.json(
    {
      user: {
        user_id: user.user_id,
        avatar: user.avatar,
        username: user.display_name,
      },
    },
    { headers: { "Cache-Control": CC } }
  );
}
