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
  const rankings = [...league.rosters].sort(
    (a, b) =>
      b.wins - a.wins || a.losses - b.losses || b.fp - a.fp || b.fpa - a.fpa
  );

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

    const bench_ppg = (roster.players || [])
      .filter(
        (player_id) =>
          !starters_optimal_ppg.some((so) => so.optimal_player_id === player_id)
      )
      .map((player_id) => {
        return {
          player_id,
          value: getPlayerTotal(
            league.scoring_settings,
            projections[player_id] || {}
          ),
        };
      })
      .sort((a, b) => b.value - a.value);

    const starters_optimal_dynasty = getOptimalStarters(
      league.roster_positions,
      roster?.players || [],
      ktcCurrent.dynasty,
      allplayers
    );

    const bench_dynasty = (roster.players || [])
      .filter(
        (player_id) =>
          !starters_optimal_dynasty.some(
            (so) => so.optimal_player_id === player_id
          )
      )
      .map((player_id) => {
        return {
          player_id,
          value: ktcCurrent.dynasty[player_id] || 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    const rank =
      rankings.findIndex((r) => r.roster_id === roster.roster_id) + 1;

    return {
      ...roster,
      rank,
      starters_optimal_ppg: starters_optimal_ppg.map(
        (so) => so.optimal_player_id
      ),
      starters_optimal_dynasty: starters_optimal_dynasty.map(
        (so) => so.optimal_player_id
      ),
      bench_ppg: bench_ppg.map((b) => b.player_id),
      bench_dynasty: bench_dynasty.map((b) => b.player_id),

      ktc_dynasty__starters: starters_optimal_dynasty.reduce(
        (acc, cur) => acc + cur.value,
        0
      ),
      ktc_dynasty__bench_top_5: bench_dynasty
        .slice(0, 5)
        .reduce((acc, cur) => acc + cur.value, 0),
      ktc_dynasty__starter_qb: starters_optimal_dynasty
        .filter((so) => allplayers[so.optimal_player_id]?.position === "QB")
        .reduce((acc, cur) => acc + cur.value, 0),
      ktc_dynasty__bench_top_qb: bench_dynasty
        .filter((p) => allplayers[p.player_id]?.position === "QB")
        .slice(0, 1)
        .reduce((acc, cur) => acc + cur.value, 0),

      ktc_dynasty__bench_top5_flex: bench_dynasty
        .filter((p) =>
          ["RB", "WR", "TE"].includes(allplayers[p.player_id]?.position)
        )
        .slice(0, 5)
        .reduce((acc, cur) => acc + cur.value, 0),

      ktc_dynasty__starter_rb: starters_optimal_dynasty
        .filter((so) => allplayers[so.optimal_player_id]?.position === "RB")
        .reduce((acc, cur) => acc + cur.value, 0),

      ktc_dynasty__starter_wr: starters_optimal_dynasty
        .filter((so) => allplayers[so.optimal_player_id]?.position === "WR")
        .reduce((acc, cur) => acc + cur.value, 0),

      ros_projections__starters: starters_optimal_ppg.reduce(
        (acc, cur) => acc + cur.value,
        0
      ),

      ros_projections__bench_top_5: bench_ppg
        .slice(0, 5)
        .reduce((acc, cur) => acc + cur.value, 0),

      ros_projections__starter_qb: starters_optimal_ppg
        .filter((so) => allplayers[so.optimal_player_id]?.position === "QB")
        .reduce((acc, cur) => acc + cur.value, 0),

      ros_projections__bench_top_qb: bench_ppg
        .filter((p) => allplayers[p.player_id]?.position === "QB")
        .slice(0, 1)
        .reduce((acc, cur) => acc + cur.value, 0),

      ros_projections__bench_top5_flex: bench_ppg
        .filter((p) =>
          ["RB", "WR", "TE"].includes(allplayers[p.player_id]?.position)
        )

        .slice(0, 5)
        .reduce((acc, cur) => acc + cur.value, 0),

      ros_projections__starter_rb: starters_optimal_ppg
        .filter((so) => allplayers[so.optimal_player_id]?.position === "RB")
        .reduce((acc, cur) => acc + cur.value, 0),

      ros_projections__starter_wr: starters_optimal_ppg
        .filter((so) => allplayers[so.optimal_player_id]?.position === "WR")
        .reduce((acc, cur) => acc + cur.value, 0),
    };
  });
};
