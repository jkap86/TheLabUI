import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

const CC = "public, max-age=120, s-maxage=1200, stale-while-revalidate=300";

export async function GET(req: NextRequest) {
  try {
    const {
      current_date: date_dynasty,
      values: values_dynasty,
      last_modified: lastModified,
    } = await getKtcCurrent();

    /*
    const {
      date: date_dynasty,
      values: values_dynasty,
      lastModified,
    } = await getKtcValues("dynasty");
*/

    if (!date_dynasty || !values_dynasty) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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

const getKtcCurrent = async () => {
  const query = `
    WITH last_day AS (
      SELECT MAX(date) AS d
      FROM ktc_dynasty
    )
    SELECT
      ld.d AS current_date,
      MIN(k.updated_at) AS last_modified,
      jsonb_object_agg(k.player_id, k.value) AS values
    FROM ktc_dynasty k
    JOIN last_day ld ON k.date = ld.d
    GROUP BY ld.d;
  `;

  const result = await pool.query(query);

  const { current_date, last_modified, values } = result.rows[0];

  return { current_date, last_modified, values: Object.entries(values) };
};
/*
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
*/
