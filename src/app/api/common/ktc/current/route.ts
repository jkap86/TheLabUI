import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

const CC = "public, max-age=60, s-maxage=900, stale-while-revalidate=120";

export async function GET(req: NextRequest) {
  try {
    const {
      date: date_dynasty,
      values: values_dynasty,
      lastModified,
    } = await getKtcValues("dynasty");

    if (!date_dynasty || !values_dynasty) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const etag = `W/"${lastModified.getTime()}"`;
    const ifNoneMatch = req.headers.get("if-none-match");

    console.log(etag, ifNoneMatch, lastModified);

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

    const res = NextResponse.json(
      {
        dynasty: { date: date_dynasty, values: values_dynasty },
        redraft: {},
      },
      { status: 200 }
    );

    res.headers.set("ETag", etag);
    res.headers.set("Last-Modified", lastModified.toUTCString());
    res.headers.set("Cache-Control", CC);

    return res;
  } catch {
    return NextResponse.json("Error fetching KTC values", { status: 500 });
  }
}

const getKtcValues = async (type: "dynasty" | "fantasy") => {
  const ktc_dates_db = await pool.query(
    `SELECT * FROM common WHERE name = 'ktc_dates_${type}'`
  );

  const ktc_dates: { [date: string]: { [key: string]: number } } =
    ktc_dates_db.rows[0]?.data || {};

  const lastModified = ktc_dates_db.rows[0].updated_at;

  const date = Object.keys(ktc_dates).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )[0];

  const current_values_obj = ktc_dates[date] || {};

  const values = Object.entries(current_values_obj);

  return { date, values, lastModified };
};
