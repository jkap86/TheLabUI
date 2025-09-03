import pool from "@/lib/pool";
import { NextResponse } from "next/server";

const CC = "public, max-age=60, s-maxage=900, stale-while-revalidate=120";

export async function GET(req: Request) {
  try {
    const data = await pool.query(
      "SELECT * FROM common WHERE name = 'projections_ros'"
    );

    const projections_ros_db = data.rows[0];

    if (!projections_ros_db) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const lastModified = new Date(projections_ros_db.updated_at);
    const etag = `W/"${lastModified.getTime()}"`;
    const ifNoneMatch = req.headers.get("if-none-match");

    if (etag && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Last-Modified": lastModified.toUTCString(),
          "Cache-Control": CC,
        },
      });
    }

    const res = NextResponse.json(projections_ros_db.data, { status: 200 });
    res.headers.set("ETag", etag);
    res.headers.set("Last-Modified", lastModified.toUTCString());
    res.headers.set("Cache-Control", CC);

    return res;
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
