import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const player_id1 = searchParams.get("player_id1");
  const player_id2 = searchParams.get("player_id2");
  const player_id3 = searchParams.get("player_id3");
  const player_id4 = searchParams.get("player_id4");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  console.log({ player_id1 });
  const conditions: string[] = [];

  if (player_id1?.includes(".")) {
    conditions.push(
      `EXISTS (SELECT 1 FROM jsonb_array_elements(t.draft_picks) AS dp WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') = $1)`
    );
  } else {
    conditions.push(`t.adds ? $1`);
  }

  const values = [player_id1];

  if (player_id2) {
    if (player_id2?.includes(".")) {
      if (player_id1?.includes(".")) {
        conditions.push(
          `
          ((SELECT dp->>'new' FROM jsonb_array_elements(t.draft_picks) AS dp WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') =$1 )
          = (SELECT dp->>'new' FROM jsonb_array_elements(t.draft_picks) AS dp WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') = $${
            values.length + 1
          }))
          `
        );
      } else {
        conditions.push(`
          (
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $${values.length + 1}
          ) = t.adds ->> $1
          `);
      }
    } else {
      if (player_id1?.includes(".")) {
        conditions.push(
          `(
              t.adds ->> $${values.length + 1}
            ) = (
              SELECT dp->>'new' 
              FROM jsonb_array_elements(t.draft_picks) AS dp 
              WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
                = $1
            )`
        );
      } else {
        conditions.push(`t.adds ? $${values.length + 1}`);
        conditions.push(`t.adds ->> $1 = t.adds ->> $${values.length + 1}`);
      }
    }
    values.push(player_id2);
  }

  if (player_id3) {
    if (player_id3?.includes(".")) {
      if (player_id1?.includes(".")) {
        conditions.push(
          `(
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $1
        ) != (
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $${values.length + 1}
          )`
        );
      } else {
        conditions.push(`(
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $${values.length + 1}
        ) != t.adds ->> $1`);
      }
    } else {
      if (player_id1?.includes(".")) {
        conditions.push(
          `t.adds ->> $${values.length + 1} != (
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $1
          )`
        );
      } else {
        conditions.push(`t.adds ->> $1 != t.adds ->> $${values.length + 1}`);
      }
    }
    values.push(player_id3);
  }

  if (player_id4) {
    if (player_id4?.includes(".")) {
      if (player_id3?.includes(".")) {
        conditions.push(
          `(
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $${values.length}
          ) = (
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $${values.length + 1}
          )`
        );
      } else {
        conditions.push(`
          (
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $${values.length + 1}
          ) = t.adds ->> $${values.length}`);
      }
    } else {
      if (player_id3?.includes(".")) {
        conditions.push(`t.adds ->> $${values.length + 1} = (
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $${values.length}
          )`);
      } else {
        conditions.push(
          `t.adds ->> ${values.length} = t.adds ->> $${values.length + 1}`
        );
      }
    }

    values.push(player_id4);
  }

  console.log({ values });

  const getPcTradesQuery = `
      SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions

      FROM trades t
      JOIN leagues l ON t.league_id = l.league_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY t.status_updated DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

  const countPcTradesQuery = `
      SELECT COUNT(*) 
      FROM trades t
      WHERE ${conditions.join(" AND ")}
    `;

  try {
    const result = await pool.query(getPcTradesQuery, [
      ...values,
      limit,
      offset,
    ]);

    const count = await pool.query(countPcTradesQuery, values);

    return NextResponse.json(
      {
        count: count.rows[0].count,
        rows: result.rows,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof Error) console.log(err.message);

    return NextResponse.json(err);
  }
}
