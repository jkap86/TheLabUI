import pool from "@/lib/pool";
import { Allplayer } from "@/lib/types/commonTypes";
import { NextRequest, NextResponse } from "next/server";
import { getRosterStats } from "../leagues/helpers/getRosterStats";
import { Trade } from "@/lib/types/userTypes";

export async function POST(req: NextRequest) {
  const formData = await req.json();

  const { leaguemate_ids, offset, limit, manager, player } = formData;

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
          SELECT t.*, to_jsonb(l) AS league
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

      const trades = getTradesWithStats(
        result.rows,
        projections,
        allplayers,
        ktcCurrent
      );

      return NextResponse.json(
        {
          count: count.rows[0].count,
          rows: trades,
          manager,
          player,
        },
        { status: 200 }
      );
    } else if (manager && !player) {
      conditions.push(`t.managers && $1`);
      const getLmTradesQuery = ` 
          SELECT t.*, to_jsonb(l) AS league
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

      const trades = getTradesWithStats(
        result.rows,
        projections,
        allplayers,
        ktcCurrent
      );

      return NextResponse.json(
        {
          count: count.rows[0].count,
          rows: trades,
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
          SELECT t.*, to_jsonb(l) AS league
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

      const trades = getTradesWithStats(
        result.rows,
        projections,
        allplayers,
        ktcCurrent
      );

      return NextResponse.json(
        {
          count: count.rows[0].count,
          rows: trades,
          manager,
          player,
        },
        { status: 200 }
      );
    }
  } else {
    const getLmTradesQuery = ` 
        SELECT t.*, to_jsonb(l) AS league
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

    const trades = getTradesWithStats(
      result.rows,
      projections,
      allplayers,
      ktcCurrent
    );

    return NextResponse.json(
      {
        count: count.rows[0].count,
        rows: trades,
      },
      { status: 200 }
    );
  }
}

const getTradesWithStats = (
  rows: Trade[],
  projections: { [player_id: string]: { [cat: string]: number } },
  allplayers: { [player_id: string]: Allplayer },
  ktcCurrent: {
    dynasty: { [player_id: string]: number };
    redraft: { [player_id: string]: number };
  }
) => {
  return rows.map((trade) => {
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
};
