import { Allplayer } from "@/lib/types/commonTypes";
import { LeagueDb } from "@/lib/types/dbTypes";
import { getOptimalStarters, getPlayerTotal } from "@/utils/getOptimalStarters";

export const getRosterStats = (
  league: LeagueDb,
  projections: { [player_id: string]: { [cat: string]: number } },
  allplayers: { [player_id: string]: Allplayer },
  ktcCurrent: {
    dynasty: {
      [player_id: string]: number;
    };
    redraft: {
      [player_id: string]: number;
    };
  }
) => {
  return [...league.rosters].map((roster) => {
    const values = Object.fromEntries(
      (roster.players || []).map((player_id) => {
        const player_total = getPlayerTotal(
          league.scoring_settings,
          projections[player_id] || {}
        );
        return [player_id, player_total];
      })
    );

    const starters_optimal_ppg = getOptimalStarters(
      league.roster_positions,
      roster?.players || [],
      values,
      allplayers
    );

    const starters_optimal_dynasty = getOptimalStarters(
      league.roster_positions,
      roster?.players || [],
      ktcCurrent.dynasty,
      allplayers
    );

    return {
      ...roster,
      starters_optimal_ppg,
      starters_optimal_redraft: getOptimalStarters(
        league.roster_positions,
        roster?.players || [],
        ktcCurrent.redraft,
        allplayers
      ),
      starters_optimal_dynasty,

      starter_proj: starters_optimal_ppg.reduce(
        (acc, cur) =>
          acc + getPlayerTotal(league.scoring_settings, projections[cur] || {}),
        0
      ),
      bench_top5_proj: (roster.players || [])
        .filter((player_id) => !starters_optimal_ppg.includes(player_id))
        .sort(
          (a, b) =>
            getPlayerTotal(league.scoring_settings, projections[b] || {}) -
            getPlayerTotal(league.scoring_settings, projections[a] || {})
        )
        .slice(0, 5)
        .reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(league.scoring_settings, projections[cur] || {}),
          0
        ),
      starters_ktc_dynasty: starters_optimal_dynasty.reduce(
        (acc, cur) => acc + (ktcCurrent.dynasty[cur] || 0),
        0
      ),
      bench_top5_ktc_dynasty: (roster.players || [])
        .filter((player_id) => !starters_optimal_dynasty.includes(player_id))
        .sort(
          (a, b) => (ktcCurrent.dynasty[b] || 0) - (ktcCurrent.dynasty[a] || 0)
        )
        .slice(0, 5)
        .reduce((acc, cur) => acc + (ktcCurrent.dynasty[cur] || 0), 0),

      starter_qb_proj: starters_optimal_ppg
        .filter((player_id) => allplayers[player_id]?.position === "QB")
        .reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(league.scoring_settings, projections[cur] || {}),
          0
        ),
      bench_top_qb_proj: (roster.players || [])
        .filter(
          (player_id) =>
            !starters_optimal_ppg.includes(player_id) &&
            allplayers[player_id]?.position === "QB"
        )
        .sort(
          (a, b) =>
            getPlayerTotal(league.scoring_settings, projections[b] || {}) -
            getPlayerTotal(league.scoring_settings, projections[a] || {})
        )
        .slice(0, 1)
        .reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(league.scoring_settings, projections[cur] || {}),
          0
        ),

      starter_rb_proj: starters_optimal_ppg
        .filter((player_id) => allplayers[player_id]?.position === "RB")
        .reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(league.scoring_settings, projections[cur] || {}),
          0
        ),

      starter_wr_proj: starters_optimal_ppg
        .filter((player_id) => allplayers[player_id]?.position === "WR")
        .reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(league.scoring_settings, projections[cur] || {}),
          0
        ),
    };
  });
};
