import pool from "@/lib/pool";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.json();

  const { leaguemate_ids, offset, limit, manager, player } = formData;

  const conditions: string[] = [];

  if (manager || player) {
    if (manager && player) {
      if (player.includes(".")) {
        conditions.push(
          `EXISTS (SELECT 1 FROM jsonb_array_elements(t.draft_picks) AS dp WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') = $1)`
        );
      } else {
        conditions.push(`t.adds ? $1`);
      }

      conditions.push(`t.managers && $2`);

      const getLmTradesQuery = ` 
          SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions
          FROM trades t
          JOIN leagues l ON t.league_id = l.league_id
          WHERE ${conditions.join(" AND ")}
          ORDER BY t.status_updated DESC
          LIMIT $3 OFFSET $4
        `;

      const countLmTradesQuery = `
            SELECT COUNT(*) 
            FROM trades t
            WHERE ${conditions.join(" AND ")}
          `;

      const result = await pool.query(getLmTradesQuery, [
        player,
        [manager],
        offset,
        limit,
      ]);

      const count = await pool.query(countLmTradesQuery, [player, [manager]]);

      return NextResponse.json(
        {
          count: count.rows[0].count,
          rows: result.rows,
          manager,
          player,
        },
        { status: 200 }
      );
    } else if (manager && !player) {
      conditions.push(`t.managers && $1`);
      const getLmTradesQuery = ` 
          SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions
          FROM trades t
          JOIN leagues l ON t.league_id = l.league_id
          WHERE ${conditions.join(" AND ")}
          ORDER BY t.status_updated DESC
          LIMIT $2 OFFSET $3
        `;

      const countLmTradesQuery = `
            SELECT COUNT(*) 
            FROM trades t
            WHERE ${conditions.join(" AND ")} 
          `;

      const result = await pool.query(getLmTradesQuery, [
        [manager],
        limit,
        offset,
      ]);

      const count = await pool.query(countLmTradesQuery, [[manager]]);

      return NextResponse.json(
        {
          count: count.rows[0].count,
          rows: result.rows,
          manager,
          player,
        },
        { status: 200 }
      );
    } else if (!manager && player) {
      if (player.includes(".")) {
        conditions.push(
          `EXISTS (SELECT 1 FROM jsonb_array_elements(t.draft_picks) AS dp WHERE (dp->>'season') || ' ' || (dp->>'round')::text || '.' || COALESCE(LPAD((dp->>'order')::text, 2, '0'), 'null') = $1)`
        );
      } else {
        conditions.push(`t.adds ? $1`);
      }

      conditions.push(`t.managers && $2`);

      const getLmTradesQuery = ` 
          SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions
          FROM trades t
          JOIN leagues l ON t.league_id = l.league_id
          WHERE ${conditions.join(" AND ")}
          ORDER BY t.status_updated DESC
          LIMIT $3 OFFSET $4
        `;

      const countLmTradesQuery = `
            SELECT COUNT(*) 
            FROM trades t
            WHERE ${conditions.join(" AND ")}
          `;

      const result = await pool.query(getLmTradesQuery, [
        player,
        [leaguemate_ids],
        limit,
        offset,
      ]);

      const count = await pool.query(countLmTradesQuery, [
        player,
        [leaguemate_ids],
      ]);

      return NextResponse.json(
        {
          count: count.rows[0].count,
          rows: result.rows,
          manager,
          player,
        },
        { status: 200 }
      );
    }
  } else {
    const getLmTradesQuery = ` 
        SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions
        FROM trades t
        JOIN leagues l ON t.league_id = l.league_id
        WHERE t.managers && $1
        ORDER BY t.status_updated DESC
        LIMIT $2 OFFSET $3
      `;

    const countLmTradesQuery = `
          SELECT COUNT(*) 
          FROM trades
          WHERE managers && $1
        `;

    const result = await pool.query(getLmTradesQuery, [
      leaguemate_ids,
      limit,
      offset,
    ]);

    const count = await pool.query(countLmTradesQuery, [leaguemate_ids]);

    return NextResponse.json(
      {
        count: count.rows[0].count,
        rows: result.rows,
      },
      { status: 200 }
    );
  }
}
