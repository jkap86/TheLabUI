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
    WITH f AS (  
    SELECT *
    FROM player_game_stats
    WHERE kickoff > $1::bigint
      AND kickoff < $2::bigint
      AND season_type = $3
    ),
    g AS (  
      SELECT player_id,
            COUNT(DISTINCT CASE WHEN COALESCE(off_snp, 0) > 0 THEN game_id END)::int AS games,
            COALESCE(
              ROUND(
                100.0 * SUM(COALESCE(off_snp, 0))::numeric
                      / NULLIF(SUM(COALESCE(team_plays, 0))::numeric, 0),
                1
              )::float8,
              0.0
            ) AS off_snp_pct
      FROM f
      GROUP BY player_id
    ),
    kv AS (  
      SELECT
        f.player_id,
        k.key,
        SUM(k.val)::numeric AS sum_val
      FROM f
      CROSS JOIN LATERAL (
        VALUES
          ('pass_att',          COALESCE(f.pass_att, 0)::numeric),
          ('pass_sack',         COALESCE(f.pass_sack, 0)::numeric),
          ('pass_att_ez',       COALESCE(f.pass_att_ez, 0)::numeric),
          ('pass_att_rz',       COALESCE(f.pass_att_rz, 0)::numeric),
          ('pass_td_rz',        COALESCE(f.pass_td_rz, 0)::numeric),
          ('pass_cmp',          COALESCE(f.pass_cmp, 0)::numeric),
          ('pass_yds',          COALESCE(f.pass_yds, 0)::numeric),
          ('pass_td',           COALESCE(f.pass_td, 0)::numeric),
          ('pass_int',          COALESCE(f.pass_int, 0)::numeric),
          ('pass_air_yds_comp', COALESCE(f.pass_air_yds_comp, 0)::numeric),
          ('pass_air_yds_tot',  COALESCE(f.pass_air_yds_tot, 0)::numeric),
          ('pass_ep',           ROUND(COALESCE(f.pass_ep, 0)::numeric, 1)),
          ('pass_epa',          ROUND(COALESCE(f.pass_epa, 0)::numeric, 1)),

          ('rec_tgt',           COALESCE(f.rec_tgt, 0)::numeric),
          ('rec_tgt_ez',        COALESCE(f.rec_tgt_ez, 0)::numeric),
          ('rec_tgt_rz',        COALESCE(f.rec_tgt_rz, 0)::numeric),
          ('rec_rz',            COALESCE(f.rec_rz, 0)::numeric),
          ('rec_td_rz',         COALESCE(f.rec_td_rz, 0)::numeric),
          ('rec',               COALESCE(f.rec, 0)::numeric),
          ('rec_yds',           COALESCE(f.rec_yds, 0)::numeric),
          ('rec_td',            COALESCE(f.rec_td, 0)::numeric),
          ('rec_air_yds_comp',  COALESCE(f.rec_air_yds_comp, 0)::numeric),
          ('rec_air_yds_tot',   COALESCE(f.rec_air_yds_tot, 0)::numeric),
          ('rec_ep',            ROUND(COALESCE(f.rec_ep, 0)::numeric, 1)),
          ('rec_epa',           ROUND(COALESCE(f.rec_epa, 0)::numeric, 1)),

          ('rush_gl_att',       COALESCE(f.rush_gl_att, 0)::numeric),
          ('rush_rz_att',       COALESCE(f.rush_rz_att, 0)::numeric),
          ('rush_att',          COALESCE(f.rush_att, 0)::numeric),
          ('rush_yds',          COALESCE(f.rush_yds, 0)::numeric),
          ('rush_td',           COALESCE(f.rush_td, 0)::numeric),
          ('rush_successes',    COALESCE(f.rush_successes, 0)::numeric),
          ('rush_ep',           ROUND(COALESCE(f.rush_ep, 0)::numeric, 1)),
          ('rush_epa',          ROUND(COALESCE(f.rush_epa, 0)::numeric, 1)),

          ('off_snp',           COALESCE(f.off_snp, 0)::numeric),
          ('team_plays',        COALESCE(f.team_plays, 0)::numeric),
          ('team_pass_att',     COALESCE(f.team_pass_att, 0)::numeric),
          ('team_pass_cmp',     COALESCE(f.team_pass_cmp, 0)::numeric),
          ('team_pass_yd',      COALESCE(f.team_pass_yd, 0)::numeric),
          ('team_pass_td',      COALESCE(f.team_pass_td, 0)::numeric),
          ('team_air_yds_comp', COALESCE(f.team_air_yds_comp, 0)::numeric),
          ('team_air_yds_tot',  COALESCE(f.team_air_yds_tot, 0)::numeric)
      ) AS k(key, val)
      GROUP BY f.player_id, k.key
    ),
    s AS (  
      SELECT player_id, jsonb_object_agg(key, sum_val ORDER BY key) AS stats
      FROM kv
      GROUP BY player_id
    )
    SELECT
      s.player_id,
      COALESCE(g.games, 0) AS games,
      COALESCE(g.off_snp_pct,0) AS off_snp_pct,
      s.stats
    FROM s
    LEFT JOIN g USING (player_id);
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
      ...(statsRow ?? {}),
    };
  });

  return NextResponse.json(response);
}
