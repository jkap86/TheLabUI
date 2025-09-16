import pool from "@/lib/pool";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");
  const season_type = searchParams.get("season_type");

  if (!start_date || !end_date || !season_type) {
    return NextResponse.json(
      { error: "start_date, end_date, and season_type are required" },
      { status: 400 }
    );
  }

  const ktcQuery = `
    WITH span AS (
      SELECT *
      FROM ktc_dynasty
      WHERE date BETWEEN to_timestamp($1::bigint / 1000)::date 
                      AND to_timestamp($2::bigint / 1000)::date
    ),
    ranked AS (
      SELECT
        s.*,
        ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY value         DESC, date DESC) AS rn_value_max,
        ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY value         ASC,  date DESC) AS rn_value_min,
        ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY overall_rank  DESC, date DESC) AS rn_overall_max,
        ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY overall_rank  ASC,  date DESC) AS rn_overall_min,
        ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY position_rank DESC, date DESC) AS rn_pos_max,
        ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY position_rank ASC,  date DESC) AS rn_pos_min
      FROM span s
    )
    SELECT
      player_id,

      -- value
      MAX(value) AS ktc_max,
      MIN(value) AS ktc_min,
      to_char(MIN(date) FILTER (WHERE rn_value_max = 1), 'FMMM/FMDD/YY') AS ktc_max_date,
      to_char(MIN(date) FILTER (WHERE rn_value_min = 1), 'FMMM/FMDD/YY') AS ktc_min_date,
      MAX(value) FILTER (WHERE date = to_timestamp($1::bigint / 1000)::date ) AS ktc_start,
      MAX(value) FILTER (WHERE date = to_timestamp($2::bigint / 1000)::date ) AS ktc_end,

      -- overall_rank
      MIN(overall_rank) AS ktc_overall_rank_max,
      MAX(overall_rank) AS ktc_overall_rank_min,
      to_char(MAX(date) FILTER (WHERE rn_overall_max = 1), 'FMMM/FMDD/YY') AS ktc_overall_rank_max_date,
      to_char(MAX(date) FILTER (WHERE rn_overall_min = 1), 'FMMM/FMDD/YY') AS ktc_overall_rank_min_date,
      MAX(overall_rank) FILTER (WHERE date = to_timestamp($1::bigint / 1000)::date) AS ktc_overall_rank_start,
      MAX(overall_rank) FILTER (WHERE date = to_timestamp($2::bigint / 1000)::date ) AS ktc_overall_rank_end,

      -- position_rank
      MIN(position_rank) AS ktc_position_rank_max,
      MAX(position_rank) AS ktc_position_rank_min,
      to_char(MAX(date) FILTER (WHERE rn_pos_max = 1), 'FMMM/FMDD/YY') AS ktc_position_rank_max_date,
      to_char(MAX(date) FILTER (WHERE rn_pos_min = 1), 'FMMM/FMDD/YY') AS ktc_position_rank_min_date,
      MAX(position_rank) FILTER (WHERE date = to_timestamp($1::bigint / 1000)::date ) AS ktc_position_rank_start,
      MAX(position_rank) FILTER (WHERE date = to_timestamp($2::bigint / 1000)::date ) AS ktc_position_rank_end

    FROM ranked
    GROUP BY player_id;
  `;

  const statsQuery = `
    SELECT
        player_id,
        jsonb_object_agg(key, sum_val) AS stats
    FROM (
        SELECT
            player_id,
            key,
            SUM((value)::numeric) AS sum_val
        FROM weekly_stats,
            jsonb_each_text(stats)
        WHERE kickoff > $1
          AND kickoff < $2
          AND season_type = $3
        GROUP BY player_id, key
    ) t
    GROUP BY player_id;
  `;

  const values = [parseInt(start_date), parseInt(end_date)];

  const resultStats = await pool.query(statsQuery, [...values, season_type]);
  const resultKtc = await pool.query(ktcQuery, values);

  const player_ids = Array.from(
    new Set([
      ...resultKtc.rows.map((r) => r.player_id),
      ...resultStats.rows.map((r) => r.player_id),
    ])
  );

  const response = player_ids.map((player_id) => {
    const ktcRow = resultKtc.rows.find((r) => r.player_id === player_id);
    const statsRow = resultStats.rows.find((r) => r.player_id === player_id);

    return {
      ...ktcRow,
      stats: statsRow?.stats ?? {},
    };
  });

  return NextResponse.json(response);
}
