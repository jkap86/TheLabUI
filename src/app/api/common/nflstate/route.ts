import { NextResponse } from "next/server";
import pool from "@/lib/pool";
import axiosInstance from "@/lib/axiosInstance";

const CC = "public, max-age=120, s-maxage=1800, stale-while-revalidate=300";

export async function GET(req: Request) {
  try {
    const data = await pool.query(
      "SELECT * FROM common WHERE name = 'nflState'"
    );

    const nflState_db = data.rows[0];

    const freshInDb =
      nflState_db &&
      new Date().getTime() - 1000 * 60 * 60 * 12 <
        new Date(nflState_db.updated_at).getTime();

    const etag = nflState_db
      ? `W/"${new Date(nflState_db.updated_at).getTime()}"`
      : undefined;

    const ifNoneMatch = req.headers.get("if-none-match");

    if (freshInDb && etag && ifNoneMatch === etag) {
      // Client has the latest version

      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Last-Modified": new Date(nflState_db.updated_at).toUTCString(),
          "Cache-Control": CC,
        },
      });
    }

    if (freshInDb && nflState_db) {
      const res = NextResponse.json(nflState_db.data, { status: 200 });

      res.headers.set("ETag", etag!);
      res.headers.set("Cache-Control", CC);

      return res;
    }

    try {
      const nflState = await axiosInstance.get(
        "https://api.sleeper.app/v1/state/nfl"
      );

      const data = {
        ...nflState.data,
        thelab_season: process.env.SEASON,
      };
      await pool.query(
        "INSERT INTO common (name, data) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET data = $2",
        ["nflState", data]
      );

      const now = new Date();
      const newEtag = `W/"${now.getTime()}"`;

      const res = NextResponse.json(data, { status: 200 });

      res.headers.set("ETag", newEtag);
      res.headers.set("Cache-Control", CC);

      return res;
    } catch (err: unknown) {
      if (nflState_db) {
        const res = NextResponse.json(nflState_db.data, { status: 200 });

        if (etag) res.headers.set("ETag", etag);

        res.headers.set("Cache-Control", CC);

        return res;
      }
      throw err;
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load nfl state - ", err },
      { status: 500 }
    );
  }
}
