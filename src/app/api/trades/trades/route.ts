import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";
import { getRosterStats } from "../../manager/leagues/helpers/getRosterStats";
import { Allplayer } from "@/lib/types/commonTypes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const player_id1 = searchParams.get("player_id1");
  const player_id2 = searchParams.get("player_id2");
  const player_id3 = searchParams.get("player_id3");
  const player_id4 = searchParams.get("player_id4");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  const conditions: string[] = [
    `(SELECT count(*) FROM jsonb_each(t.adds)) <= 10`,
  ];

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
        conditions.push(`
          (
            SELECT dp1->>'new'
            FROM jsonb_array_elements(t.draft_picks) AS dp1
            WHERE (dp1->>'season') || ' ' || (dp1->>'round') || '.' ||
                  COALESCE(LPAD((dp1->>'order')::text, 2, '0'), 'null') = $1
            LIMIT 1
          ) != (
            SELECT dp2->>'new'
            FROM jsonb_array_elements(t.draft_picks) AS dp2
            WHERE (dp2->>'season') || ' ' || (dp2->>'round') || '.' ||
                  COALESCE(LPAD((dp2->>'order')::text, 2, '0'), 'null') = $${
                    values.length + 1
                  }
            LIMIT 1
          )
`);
      } else {
        conditions.push(
          `(
              t.adds ->> $1
            ) != (
              SELECT dp->>'new' 
              FROM jsonb_array_elements(t.draft_picks) AS dp 
              WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
                = $${values.length + 1}
              LIMIT 1
            )`
        );
      }
    } else {
      if (player_id1?.includes(".")) {
        conditions.push(
          `(
              t.adds ->> $${values.length + 1}
            ) != (
              SELECT dp->>'new' 
              FROM jsonb_array_elements(t.draft_picks) AS dp 
              WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
                = $1
              LIMIT 1
            )`
        );
      } else {
        conditions.push(`t.adds ? $${values.length + 1}`);
        conditions.push(`t.adds ->> $1 != t.adds ->> $${values.length + 1}`);
      }
    }
    values.push(player_id2);
  }

  if (player_id3) {
    if (player_id3 === "Price Check") {
      if (player_id1?.includes(".")) {
        conditions.push(`
          (
            WITH pick(new_val) AS (
              SELECT dp->>'new'
              FROM jsonb_array_elements(t.draft_picks) dp
              WHERE (dp->>'season') || ' ' || (dp->>'round') || '.' ||
                    COALESCE(LPAD(dp->>'order', 2, '0'), 'null') = $1
              LIMIT 1
            )
            SELECT
              (SELECT count(*) FROM jsonb_array_elements(t.draft_picks) dp2
              WHERE dp2->>'new' IS NOT DISTINCT FROM (SELECT new_val FROM pick)
              ) = 1
              AND NOT EXISTS (
                SELECT 1
                FROM jsonb_each_text(t.adds) e(k, v)
                WHERE v IS NOT DISTINCT FROM (SELECT new_val FROM pick)
              )
          )
        `);
      } else {
        conditions.push(`
          NOT EXISTS (
            SELECT 1 
            FROM jsonb_each_text(t.adds) AS e(k, v)
            WHERE e.k != $1
              AND v = t.adds->>$1
          )
      `);

        conditions.push(`
          NOT EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(t.draft_picks) dp
            WHERE dp->>'new' = t.adds->>$1
          )
      `);
      }
    } else {
      if (player_id3?.includes(".")) {
        if (player_id1?.includes(".")) {
          conditions.push(
            `(
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $1
            LIMIT 1
        ) = (
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $${values.length + 1}
            LIMIT 1
          )`
          );
        } else {
          conditions.push(`(
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $${values.length + 1}
            LIMIT 1
        ) = t.adds ->> $1`);
        }
      } else {
        if (player_id1?.includes(".")) {
          conditions.push(
            `t.adds ->> $${values.length + 1} != (
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $1
            LIMIT 1
          )`
          );
        } else {
          conditions.push(`t.adds ->> $1 = t.adds ->> $${values.length + 1}`);
        }
      }
      values.push(player_id3);
    }
  }

  if (player_id4) {
    if (player_id4 === "Price Check") {
      if (player_id2?.includes(".")) {
        conditions.push(`
          (
            WITH pick(new_val) AS (
              SELECT dp->>'new'
              FROM jsonb_array_elements(t.draft_picks) dp
              WHERE (dp->>'season') || ' ' || (dp->>'round') || '.' ||
                    COALESCE(LPAD(dp->>'order', 2, '0'), 'null') = $2
              LIMIT 1
            )
            SELECT
              (SELECT count(*) FROM jsonb_array_elements(t.draft_picks) dp2
              WHERE dp2->>'new' IS NOT DISTINCT FROM (SELECT new_val FROM pick)
              ) = 1
              AND NOT EXISTS (
                SELECT 1
                FROM jsonb_each_text(t.adds) e(k, v)
                WHERE v IS NOT DISTINCT FROM (SELECT new_val FROM pick)
              )
          )
        `);
      } else {
        conditions.push(`
          NOT EXISTS (
            SELECT 1 
            FROM jsonb_each_text(t.adds) AS e(k, v)
            WHERE e.k != $2
              AND v = t.adds->>$2
          )
      `);

        conditions.push(`
          NOT EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(t.draft_picks) dp
            WHERE dp->>'new' = t.adds->>$2
          )
      `);
      }
    } else {
      if (player_id4?.includes(".")) {
        if (player_id2?.includes(".")) {
          conditions.push(
            `(
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $2
            LIMIT 1
          ) = (
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $${values.length + 1}
            LIMIT 1
          )`
          );
        } else {
          conditions.push(`
          (
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $${values.length + 1}
            LIMIT 1
          ) = t.adds ->> $2`);
        }
      } else {
        if (player_id2?.includes(".")) {
          conditions.push(`t.adds ->> $${values.length + 1} = (
            SELECT dp->>'new' 
            FROM jsonb_array_elements(t.draft_picks) AS dp 
            WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') 
              = $2
            LIMIT 1
          )`);
        } else {
          conditions.push(`t.adds ->> $2 = t.adds ->> $${values.length + 1}`);
        }
      }
      values.push(player_id4);
    }
  }

  const getPcTradesQuery = `
      SELECT t.*, to_jsonb(l) AS league

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

  const projections_db: {
    player_id: string;
    stats: { [cat: string]: number };
  }[] = await (
    await pool.query("SELECT * FROM common WHERE name = 'projections_ros'")
  ).rows[0].data;

  const projections = Object.fromEntries(
    projections_db.map((p) => [p.player_id, p.stats])
  );

  const allplayers_db = await (
    await pool.query("SELECT * FROM common WHERE name = 'allplayers'")
  ).rows[0].data;

  const allplayers = Object.fromEntries(
    allplayers_db.map((p: Allplayer) => [p.player_id, p])
  );

  const ktc_dynasty = await (
    await pool.query("SELECT * FROM common WHERE name = 'ktc_dates_dynasty'")
  ).rows[0].data;

  const ktcCurrent = {
    dynasty:
      ktc_dynasty[
        Object.keys(ktc_dynasty).sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        )[0]
      ],
    redraft: {},
  };

  try {
    const result = await pool.query(getPcTradesQuery, [
      ...values,
      limit,
      offset,
    ]);

    const trades = result.rows.map((trade) => {
      const rosters_stats = getRosterStats(
        trade.league,
        projections,
        allplayers,
        ktcCurrent
      );

      return {
        ...trade,
        rosters: rosters_stats,
      };
    });

    const count = await pool.query(countPcTradesQuery, values);

    return NextResponse.json(
      {
        count: count.rows[0].count,
        rows: trades,
        ktcCurrent,
        projections,
        getPcTradesQuery,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof Error) console.log(err.message);

    return NextResponse.json(err);
  }
}
