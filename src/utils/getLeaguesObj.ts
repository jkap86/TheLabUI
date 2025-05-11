import { colObj } from "@/lib/types/commonTypes";
import { League } from "@/lib/types/userTypes";
import { getKtcAvgValue } from "./getKtcRanks";
import store, { RootState } from "@/redux/store";
import { getTrendColor_Range } from "./getTrendColor";

export const getLeaguesObj = (leagues: League[]) => {
  const state: RootState = store.getState();
  const { ktcCurrent, allplayers } = state.common;

  const obj: { [league_id: string]: { [col_abbrev: string]: colObj } } = {};

  leagues.forEach((league) => {
    const ktc_d_s_rk =
      [...league.rosters]
        .sort(
          (a, b) =>
            getKtcAvgValue(b.starters_optimal_dynasty, "D") -
            getKtcAvgValue(a.starters_optimal_dynasty, "D")
        )
        .findIndex((r) => r.roster_id === league.user_roster.roster_id) + 1;

    const ktc_d_s_rk_l =
      [...league.rosters]
        .sort(
          (a, b) =>
            getKtcAvgValue(b.starters_optimal_dynasty, "D") -
            getKtcAvgValue(a.starters_optimal_dynasty, "D")
        )
        .findIndex((r) => r.roster_id === league.lm_roster_id) + 1;

    const ktc_d_b_5_rk =
      [...league.rosters]
        .sort(
          (a, b) =>
            getKtcAvgValue(
              (b.players || [])
                .filter(
                  (player_id) => !b.starters_optimal_dynasty.includes(player_id)
                )
                .sort(
                  (a, b) =>
                    (ktcCurrent?.redraft?.[b] || 0) -
                    (ktcCurrent?.redraft?.[a] || 0)
                )
                .slice(0, 5),
              "D"
            ) -
            getKtcAvgValue(
              (a.players || [])
                .filter(
                  (player_id) => !a.starters_optimal_dynasty.includes(player_id)
                )
                .sort(
                  (a, b) =>
                    (ktcCurrent?.redraft?.[b] || 0) -
                    (ktcCurrent?.redraft?.[a] || 0)
                )
                .slice(0, 5),
              "D"
            )
        )
        .findIndex((r) => r.roster_id === league.user_roster.roster_id) + 1;

    const ktc_r_s_rk =
      [...league.rosters]
        .sort(
          (a, b) =>
            getKtcAvgValue(b.starters_optimal_redraft, "R") -
            getKtcAvgValue(a.starters_optimal_redraft, "R")
        )
        .findIndex((r) => r.roster_id === league.user_roster.roster_id) + 1;

    const ktc_r_s_rk_l =
      [...league.rosters]
        .sort(
          (a, b) =>
            getKtcAvgValue(b.starters_optimal_redraft, "R") -
            getKtcAvgValue(a.starters_optimal_redraft, "R")
        )
        .findIndex((r) => r.roster_id === league.lm_roster_id) + 1;

    const ktc_r_b_5_rk =
      [...league.rosters]
        .sort(
          (a, b) =>
            getKtcAvgValue(
              (b.players || [])
                .filter(
                  (player_id) => !b.starters_optimal_redraft.includes(player_id)
                )
                .sort(
                  (a, b) =>
                    (ktcCurrent?.redraft?.[b] || 0) -
                    (ktcCurrent?.redraft?.[a] || 0)
                )
                .slice(0, 5),
              "R"
            ) -
            getKtcAvgValue(
              (a.players || [])
                .filter(
                  (player_id) => !a.starters_optimal_redraft.includes(player_id)
                )
                .sort(
                  (a, b) =>
                    (ktcCurrent?.redraft?.[b] || 0) -
                    (ktcCurrent?.redraft?.[a] || 0)
                )
                .slice(0, 5),
              "R"
            )
        )
        .findIndex((r) => r.roster_id === league.user_roster.roster_id) + 1;

    const ktc_d_qb = [...league.rosters].sort(
      (a, b) =>
        [...b.starters_optimal_dynasty]
          .filter((player_id) => allplayers?.[player_id]?.position === "QB")
          .reduce((acc, cur) => acc + (ktcCurrent?.dynasty[cur] || 0), 0) -
        [...a.starters_optimal_dynasty]
          .filter((player_id) => allplayers?.[player_id]?.position === "QB")
          .reduce((acc, cur) => acc + (ktcCurrent?.dynasty[cur] || 0), 0)
    );

    const ktc_d_qb_rk =
      ktc_d_qb.findIndex((r) => r.roster_id === league.user_roster.roster_id) +
      1;

    const ktc_d_qb_rk_l =
      ktc_d_qb.findIndex((r) => r.roster_id === league.lm_roster_id) + 1;

    const ktc_d_qb_bench = [...league.rosters].sort(
      (a, b) =>
        [...(b.players || [])]
          .filter(
            (player_id) =>
              allplayers?.[player_id]?.position === "QB" &&
              !b.starters_optimal_dynasty.includes(player_id)
          )
          .reduce((acc, cur) => acc + (ktcCurrent?.dynasty[cur] || 0), 0) -
        [...(a.players || [])]
          .filter(
            (player_id) =>
              allplayers?.[player_id]?.position === "QB" &&
              !a.starters_optimal_dynasty.includes(player_id)
          )
          .reduce((acc, cur) => acc + (ktcCurrent?.dynasty[cur] || 0), 0)
    );

    const ktc_d_qb_rk_bench =
      ktc_d_qb_bench.findIndex(
        (r) => r.roster_id === league.user_roster.roster_id
      ) + 1;

    const ktc_d_qb_rk_l_bench =
      ktc_d_qb_bench.findIndex((r) => r.roster_id === league.lm_roster_id) + 1;

    const ktc_d_rb = [...league.rosters].sort(
      (a, b) =>
        [...b.starters_optimal_dynasty]
          .filter((player_id) => allplayers?.[player_id]?.position === "RB")
          .reduce((acc, cur) => acc + (ktcCurrent?.dynasty[cur] || 0), 0) -
        [...a.starters_optimal_dynasty]
          .filter((player_id) => allplayers?.[player_id]?.position === "RB")
          .reduce((acc, cur) => acc + (ktcCurrent?.dynasty[cur] || 0), 0)
    );

    const ktc_d_rb_rk =
      ktc_d_rb.findIndex((r) => r.roster_id === league.user_roster.roster_id) +
      1;

    const ktc_d_rb_rk_l =
      ktc_d_rb.findIndex((r) => r.roster_id === league.lm_roster_id) + 1;

    const ktc_d_rb_bench = [...league.rosters].sort(
      (a, b) =>
        [...(b.players || [])]
          .filter(
            (player_id) =>
              allplayers?.[player_id]?.position === "RB" &&
              !b.starters_optimal_dynasty.includes(player_id)
          )
          .reduce((acc, cur) => acc + (ktcCurrent?.dynasty[cur] || 0), 0) -
        [...(a.players || [])]
          .filter(
            (player_id) =>
              allplayers?.[player_id]?.position === "RB" &&
              !a.starters_optimal_dynasty.includes(player_id)
          )
          .reduce((acc, cur) => acc + (ktcCurrent?.dynasty[cur] || 0), 0)
    );

    const ktc_d_rb_rk_bench =
      ktc_d_rb_bench.findIndex(
        (r) => r.roster_id === league.user_roster.roster_id
      ) + 1;

    const ktc_d_rb_rk_l_bench =
      ktc_d_rb_bench.findIndex((r) => r.roster_id === league.lm_roster_id) + 1;

    obj[league.league_id] = {
      "D S Rk": {
        sort: ktc_d_s_rk,
        text: ktc_d_s_rk.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_s_rk,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "D S Rk L": {
        sort: ktc_d_s_rk_l,
        text: ktc_d_s_rk_l.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_s_rk_l,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "D B T5 Rk": {
        sort: ktc_d_b_5_rk,
        text: ktc_d_b_5_rk.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_b_5_rk,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "R S Rk": {
        sort: ktc_r_s_rk,
        text: ktc_r_s_rk.toString(),
        trendColor: getTrendColor_Range(
          ktc_r_s_rk,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "R S Rk L": {
        sort: ktc_r_s_rk_l,
        text: ktc_r_s_rk_l.toString(),
        trendColor: getTrendColor_Range(
          ktc_r_s_rk_l,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "R B T5 Rk": {
        sort: ktc_r_b_5_rk,
        text: ktc_r_b_5_rk.toString(),
        trendColor: getTrendColor_Range(
          ktc_r_b_5_rk,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "D S QB Rk": {
        sort: ktc_d_qb_rk,
        text: ktc_d_qb_rk.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_qb_rk,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "D S QB Rk L": {
        sort: ktc_d_qb_rk_l,
        text: ktc_d_qb_rk_l.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_qb_rk_l,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },

      "D B QB Rk": {
        sort: ktc_d_qb_rk_bench,
        text: ktc_d_qb_rk_bench.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_qb_rk_bench,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "D B QB Rk L": {
        sort: ktc_d_qb_rk_l_bench,
        text: ktc_d_qb_rk_l_bench.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_qb_rk_l_bench,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },

      "D S RB Rk": {
        sort: ktc_d_rb_rk,
        text: ktc_d_rb_rk.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_rb_rk,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "D S RB Rk L": {
        sort: ktc_d_rb_rk_l,
        text: ktc_d_rb_rk_l.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_rb_rk_l,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },

      "D B RB Rk": {
        sort: ktc_d_rb_rk_bench,
        text: ktc_d_rb_rk_bench.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_rb_rk_bench,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "D B RB Rk L": {
        sort: ktc_d_rb_rk_l_bench,
        text: ktc_d_rb_rk_l_bench.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_rb_rk_l_bench,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },

      "Trade Deadline": {
        sort: league.settings.trade_deadline,
        text: league.settings.trade_deadline.toString(),
        trendColor: {},
        classname: "",
      },
      "Waivers Enabled": {
        sort: league.settings.daily_waivers,
        text: league.settings.daily_waivers ? "Yes" : "No",
        trendColor: {},
        classname: "",
      },
    };
  });

  return obj;
};

export const leagueHeaders = [
  {
    abbrev: "D S Rk",
    text: "Keep Trade Cut Dynasty Starters Rank",
    desc: "The rank of the total KTC dynasty value of optimal dynasty starters.  Optimal starters are determined by KTC dynasty values",
  },
  {
    abbrev: "D B T5 Rk",
    text: "Keep Trade Cut Dynasty Top 5 Bench Rank",
    desc: "The rank of the total KTC dynasty value of top 5 bench players when optimal dynasty roster is set.  Optimal starters are determined by KTC dynasty values",
  },
  {
    abbrev: "R S Rk",
    text: "Keep Trade Cut Redraft Starters Rank",
    desc: "The rank of the total KTC redraft value of top redraft players.  Starters are determined by KTC redraft values",
  },
  {
    abbrev: "R B T5 Rk",
    text: "Keep Trade Cut Redraft Top 5 Bench Rank",
    desc: "The rank of the total KTC redraft value of top 5 bench players when optimal redraft roster is set.  Optimal starters are determined by KTC redraft values",
  },
  {
    abbrev: "D S QB Rk",
    text: "Keep Trade Cut Dynasty Starting QBs Rank",
    desc: "The rank of the total KTC dynasty value of starting QBs when optimal dynasty roster is set.  Optimal starters are determined by KTC dynasty values",
  },
  {
    abbrev: "D B QB Rk",
    text: "Keep Trade Cut Dynasty Bench QBs Rank",
    desc: "The rank of the total KTC dynasty value of bench QBs when optimal dynasty roster is set.  Optimal roster is determined by KTC dynasty values",
  },
  {
    abbrev: "D S RB Rk",
    text: "Keep Trade Cut Dynasty Starting RBs Rank",
    desc: "The rank of the total KTC dynasty value of starting RBs when optimal dynasty roster is set.  Optimal starters are determined by KTC dynasty values",
  },
  {
    abbrev: "D B RB Rk",
    text: "Keep Trade Cut Dynasty Bench RBs Rank",
    desc: "The rank of the total KTC dynasty value of bench RBs when optimal dynasty roster is set.  Optimal roster is determined by KTC dynasty values",
  },
  {
    abbrev: "Trade Deadline",
    text: "Trade Deadline",
    desc: "",
  },
  {
    abbrev: "Waivers Enabled",
    text: "Waivers Enabled",
    desc: "",
  },
];

export const leagueLeaguemateHeaders = [
  {
    abbrev: "D S Rk Lm",
    text: "Keep Trade Cut Dynasty Starters Rank - Leaguemate",
    desc: "Leaguemate rank of the total KTC value of optimal dynasty starters.  Optimal starters are determined by KTC dynasty values",
  },
  {
    abbrev: "D B T5 Rk Lm",
    text: "Keep Trade Cut Dynasty Top 5 Bench Rank - Leaguemate",
    desc: "Leaguemate rank of the total KTC value of top 5 bench players when optimal dynasty roster is set.  Optimal starters are determined by KTC dynasty values",
  },
  {
    abbrev: "R S Rk Lm",
    text: "Keep Trade Cut Redraft Starters Rank - Leaguemate",
    desc: "Leaguemate rank of the total value of top redraft players.  Starters are determined by KTC redraft values",
  },
  {
    abbrev: "R B T5 Rk Lm",
    text: "Keep Trade Cut Redraft Top 5 Bench Rank - Leaguemate",
    desc: "Leaguemate rank of the total KTC value of top 5 bench players when optimal redraft roster is set.  Optimal starters are determined by KTC redraft values",
  },

  {
    abbrev: "D S QB Rk Lm",
    text: "Keep Trade Cut Dynasty Starting QBs Rank - Leaguemate",
    desc: "Leaguemate rank of the total KTC dynasty value of starting QBs when optimal dynasty roster is set.  Optimal starters are determined by KTC dynasty values",
  },
];
