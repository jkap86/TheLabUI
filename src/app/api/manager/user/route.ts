import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";
import axiosInstance from "@/lib/axiosInstance";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const searched = searchParams.get("searched");

  const cutoff = new Date().getTime() - 1 * 60 * 60 * 1000; // 1hr ago

  try {
    const findUserQuery = `
      SELECT * FROM users WHERE username ILIKE $1;
    `;

    const result = await pool.query(findUserQuery, [searched]);

    //  update user if out of date by cutoff or if has not been searched before
    if (
      !(result.rows[0]?.updated_at > new Date(cutoff)) ||
      result.rows[0]?.type !== "S"
    ) {
      const user = await axiosInstance.get(
        `https://api.sleeper.app/v1/user/${searched}`
      );

      const user_id = user.data.user_id;
      const display_name = user.data.display_name;
      const avatar = user.data.avatar || null;

      const insertQuery = `
        INSERT INTO users (user_id, username, avatar, type, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO UPDATE SET
          username = EXCLUDED.username,
          avatar = EXCLUDED.avatar,
          type = EXCLUDED.type,
          updated_at = EXCLUDED.updated_at;
      `;

      await pool.query(insertQuery, [
        user_id,
        display_name,
        avatar,
        "S",
        new Date(),
        new Date(),
      ]);

      return NextResponse.json(
        { user_id, username: display_name, avatar },
        { status: 200 }
      );
    } else {
      return NextResponse.json(result.rows[0], { status: 200 });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
      return NextResponse.json("Username not found", { status: 404 });
    }
  }
}
