import pool from "@/lib/pool";

export const getKtcCurrent = async () => {
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
