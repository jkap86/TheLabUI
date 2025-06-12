import { colObj } from "@/lib/types/commonTypes";
import { League } from "@/lib/types/userTypes";
import { getTrendColor_Range } from "./getTrendColor";

export const getLeaguesObj = (leagues: League[]) => {
  const obj: { [league_id: string]: { [col_abbrev: string]: colObj } } = {};

  leagues.forEach((league) => {
    const ktc_d_s_rk =
      [...league.rosters]
        .sort(
          (a, b) =>
            (b.starters_ktc_dynasty || 0) - (a.starters_ktc_dynasty || 0)
        )
        .findIndex((r) => r.roster_id === league.user_roster.roster_id) + 1;

    const ktc_d_b_t5_rk =
      [...league.rosters]
        .sort(
          (a, b) =>
            (b.bench_top5_ktc_dynasty || 0) - (a.bench_top5_ktc_dynasty || 0)
        )
        .findIndex((r) => r.roster_id === league.user_roster.roster_id) + 1;

    const p_s_rk =
      [...league.rosters]
        .sort((a, b) => (b.starter_proj || 0) - (a.starter_proj || 0))
        .findIndex((r) => r.roster_id === league.user_roster.roster_id) + 1;

    const p_b_t5_rk =
      [...league.rosters]
        .sort((a, b) => (b.bench_top5_proj || 0) - (a.bench_top5_proj || 0))
        .findIndex((r) => r.roster_id === league.user_roster.roster_id) + 1;

    const startingQbPointsRank =
      [...league.rosters]
        .sort((a, b) => (b.starter_qb_proj || 0) - (a.starter_qb_proj || 0))
        .findIndex((r) => r.roster_id === league.user_roster.roster_id) + 1;

    const startingRbPointsRank =
      [...league.rosters]
        .sort((a, b) => (b.starter_rb_proj || 0) - (a.starter_rb_proj || 0))
        .findIndex((r) => r.roster_id === league.user_roster.roster_id) + 1;

    const startingWrPointsRank =
      [...league.rosters]
        .sort((a, b) => (b.starter_wr_proj || 0) - (a.starter_wr_proj || 0))
        .findIndex((r) => r.roster_id === league.user_roster.roster_id) + 1;

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
      "D B T5 Rk": {
        sort: ktc_d_b_t5_rk,
        text: ktc_d_b_t5_rk.toString(),
        trendColor: getTrendColor_Range(
          ktc_d_b_t5_rk,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },

      "P S Rk": {
        sort: p_s_rk,
        text: p_s_rk.toString(),
        trendColor: getTrendColor_Range(p_s_rk, 1, league.rosters.length, true),
        classname: "rank",
      },
      "P B T5 Rk": {
        sort: p_b_t5_rk,
        text: p_b_t5_rk.toString(),
        trendColor: getTrendColor_Range(
          p_b_t5_rk,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },

      "P S QB Rk": {
        sort: startingQbPointsRank,
        text: startingQbPointsRank.toString(),
        trendColor: getTrendColor_Range(
          startingQbPointsRank,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },

      "P S RB Rk": {
        sort: startingRbPointsRank,
        text: startingRbPointsRank.toString(),
        trendColor: getTrendColor_Range(
          startingRbPointsRank,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },

      "P S WR Rk": {
        sort: startingWrPointsRank,
        text: startingWrPointsRank.toString(),
        trendColor: getTrendColor_Range(
          startingWrPointsRank,
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
      Status: {
        sort: league.status,
        text: league.status,
        trendColor: {},
        classname: "",
      },
    };
  });

  return obj;
};

export const getLeaguesLeaguemateObj = (leagues: League[]) => {
  const obj: { [league_id: string]: { [col_abbrev: string]: colObj } } = {};

  leagues.forEach((league) => {
    const p_s_rk_lm =
      [...league.rosters]
        .sort((a, b) => (b.starter_proj || 0) - (a.starter_proj || 0))
        .findIndex((r) => r.roster_id === league.lm_roster_id) + 1;

    const p_b_t5_rk_lm =
      [...league.rosters]
        .sort((a, b) => (b.bench_top5_proj || 0) - (a.bench_top5_proj || 0))
        .findIndex((r) => r.roster_id === league.lm_roster_id) + 1;

    const startingQbPointsRankLm =
      [...league.rosters]
        .sort((a, b) => (b.starter_qb_proj || 0) - (a.starter_qb_proj || 0))
        .findIndex((r) => r.roster_id === league.lm_roster_id) + 1;

    const startingRbPointsRankLm =
      [...league.rosters]
        .sort((a, b) => (b.starter_rb_proj || 0) - (a.starter_rb_proj || 0))
        .findIndex((r) => r.roster_id === league.lm_roster_id) + 1;

    const startingWrPointsRankLm =
      [...league.rosters]
        .sort((a, b) => (b.starter_wr_proj || 0) - (a.starter_wr_proj || 0))
        .findIndex((r) => r.roster_id === league.lm_roster_id) + 1;

    obj[league.league_id] = {
      "P S Rk Lm": {
        sort: p_s_rk_lm,
        text: p_s_rk_lm.toString(),
        trendColor: getTrendColor_Range(
          p_s_rk_lm,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "P B T5 Rk Lm": {
        sort: p_b_t5_rk_lm,
        text: p_b_t5_rk_lm.toString(),
        trendColor: getTrendColor_Range(
          p_b_t5_rk_lm,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },
      "P S QB Rk Lm": {
        sort: startingQbPointsRankLm,
        text: startingQbPointsRankLm.toString(),
        trendColor: getTrendColor_Range(
          startingQbPointsRankLm,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },

      "P S RB Rk Lm": {
        sort: startingRbPointsRankLm,
        text: startingRbPointsRankLm.toString(),
        trendColor: getTrendColor_Range(
          startingRbPointsRankLm,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
      },

      "P S WR Rk Lm": {
        sort: startingWrPointsRankLm,
        text: startingWrPointsRankLm.toString(),
        trendColor: getTrendColor_Range(
          startingWrPointsRankLm,
          1,
          league.rosters.length,
          true
        ),
        classname: "rank",
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
    abbrev: "P S Rk",
    text: "Projected Points Starters Rank",
    desc: "The rank of the total projected points of top redraft players.  Starters are determined by projected points",
  },
  {
    abbrev: "P B T5 Rk",
    text: "Projected Points Top 5 Bench Rank",
    desc: "The rank of the total projected points of top 5 bench players when optimal redraft roster is set.  Optimal starters are determined by projected points",
  },
  {
    abbrev: "P S QB Rk",
    text: "Projected Points Starting QBs Rank",
    desc: "The rank of the total projected points of the projected starting quarterbacks.",
  },
  {
    abbrev: "P S RB Rk",
    text: "Projected Points Starting RBs Rank",
    desc: "The rank of the total projected points of the projected starting running backs.",
  },
  {
    abbrev: "P S WR Rk",
    text: "Projected Points Starting WRs Rank",
    desc: "The rank of the total projected points of the projected starting wide receivers.",
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
  {
    abbrev: "Status",
    text: "Status",
    desc: "Status",
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
  {
    abbrev: "P S Rk Lm",
    text: "Projected Points Starters Rank - Leaguemate",
    desc: "The Leaguemate rank of the total projected points of top projected starters.  Starters are determined by projected points",
  },
  {
    abbrev: "P B T5 Rk Lm",
    text: "Projected Points Top 5 Bench Rank - Leaguemate",
    desc: "The Leaguemate rank of the total projected points of top 5 bench players when optimal projected roster is set.",
  },
  {
    abbrev: "P S QB Rk Lm",
    text: "P S QB Rk Lm",
    desc: "P S QB Rk Lm",
  },
  {
    abbrev: "P S RB Rk Lm",
    text: "P S RB Rk Lm",
    desc: "P S RB Rk Lm",
  },
  {
    abbrev: "P S WR Rk Lm",
    text: "P S WR Rk Lm",
    desc: "P S WR Rk Lm",
  },
];
