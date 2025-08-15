import { colObj } from "@/lib/types/commonTypes";
import { League, Roster } from "@/lib/types/userTypes";
import { getTrendColor_Range } from "./getTrendColor";

export const rankBy = <K extends keyof Roster>(
  rosters: Roster[],
  user_id: string,
  key: K
): number => {
  const userVal = rosters.find((r) => r.user_id === user_id)?.[key] as
    | number
    | undefined;

  let rank = 1;

  for (const r of rosters) {
    const v = (r[key] ?? 0) as number;

    if (v > (userVal as number)) rank++;
  }

  return rank;
};

export const getRankColObj = (rank: number, total: number): colObj => {
  return {
    sort: rank,
    text: String(rank),
    trendColor: getTrendColor_Range(rank, 1, total, true),
    classname: "rank",
  };
};

export const getLeaguesObj = (
  leagues: League[],
  user_id: string
): { [league_id: string]: { [col_abbrev: string]: colObj } } => {
  const obj: { [league_id: string]: { [col_abbrev: string]: colObj } } = {};

  leagues.forEach((league) => {
    const ranks: { [abbrev: string]: colObj } = {};

    for (const { abbrev, key } of leagueHeaders.filter((h) => h.key)) {
      const rk = rankBy(league.rosters, user_id, key as keyof Roster);

      ranks[abbrev + (user_id === league.user_roster.user_id ? "" : " Lm")] =
        getRankColObj(rk, league.rosters.length);
    }

    obj[league.league_id] = {
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
      ...ranks,
    };
  });

  return obj;
};

export const leagueHeaders = [
  {
    abbrev: "KTC S Rk",
    text: "Keep Trade Cut Dynasty Starters Rank",
    desc: "The user rank of the total KTC dynasty value of optimal dynasty starters.  Optimal starters are determined by KTC dynasty values",
    key: "ktc_dynasty__starters",
  },
  {
    abbrev: "KTC B T5 Rk",
    text: "Keep Trade Cut Dynasty Top 5 Bench Rank",
    desc: "The user rank of the total KTC dynasty value of top 5 bench players when optimal dynasty roster is set.  Optimal starters are determined by KTC dynasty values",
    key: "ktc_dynasty__bench_top_5",
  },
  {
    abbrev: "KTC S QB Rk",
    text: "Keep Trade Cut Dynasty Starting QBs Rank",
    desc: "The user rank of the total KTC dynasty value of starting QBs when optimal dynasty roster is set.  Optimal starters are determined by KTC dynasty values",
    key: "ktc_dynasty__starter_qb",
  },
  {
    abbrev: "KTC B T QB Rk",
    text: "Keep Trade Cut Dynasty Top Bench QB Rank",
    desc: "The user rank of the total KTC dynasty value of top bench QB when optimal dynasty roster is set.  Optimal roster is determined by KTC dynasty values",
    key: "ktc_dynasty__bench_top_qb",
  },
  {
    abbrev: "KTC B T5 F RK",
    text: "Keep Trade Cut Dynasty Top 5 Bench Flex Rank",
    desc: "The user rank of the total KTC dynasty value of top 5 bench flex players when optimal dynasty roster is set.  Optimal starters are determined by KTC dynasty values",
    key: "ktc_dynasty__bench_top5_flex",
  },
  {
    abbrev: "KTC S RB Rk",
    text: "Keep Trade Cut Dynasty Starting RBs Rank",
    desc: "The user rank of the total KTC dynasty value of starting RBs when optimal dynasty roster is set.  Optimal starters are determined by KTC dynasty values",
    key: "ktc_dynasty__starter_rb",
  },
  {
    abbrev: "KTC B RB Rk",
    text: "Keep Trade Cut Dynasty Bench RBs Rank",
    desc: "The user rank of the total KTC dynasty value of bench RBs when optimal dynasty roster is set.  Optimal roster is determined by KTC dynasty values",
  },

  {
    abbrev: "Proj S Rk",
    text: "Projected Points Starters Rank",
    desc: "The user rank of the total projected points of optimal starters.  Starters are determined by projected points",
    key: "ros_projections__starters",
  },
  {
    abbrev: "Proj B T5 Rk",
    text: "Projected Points Top 5 Bench Rank",
    desc: "The user rank of the total projected points of top 5 bench players when optimal redraft roster is set.  Optimal starters are determined by projected points",
    key: "ros_projections__bench_top_5",
  },
  {
    abbrev: "Proj S QB Rk",
    text: "Projected Points Starting QBs Rank",
    desc: "The user rank of the total projected points of the projected starting quarterbacks.",
    key: "ros_projections__starter_qb",
  },
  {
    abbrev: "Proj B T5 F Rk",
    text: "Projected Points Top 5 Bench Flex Rank",
    desc: "The user rank of the total projected points of top 5 bench flex players when optimal redraft roster is set.  Optimal starters are determined by projected points",
    key: "ros_projections__bench_top5_flex",
  },
  {
    abbrev: "Proj S RB Rk",
    text: "Projected Points Starting RBs Rank",
    desc: "The user rank of the total projected points of the projected starting running backs.",
    key: "ros_projections__starter_rb",
  },
  {
    abbrev: "Proj S WR Rk",
    text: "Projected Points Starting WRs Rank",
    desc: "The user rank of the total projected points of the projected starting wide receivers.",
    key: "ros_projections__starter_wr",
  },

  {
    abbrev: "Rank",
    text: "League Rank",
    desc: "The user league Rank based on W/L and Points",
    key: "rank",
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
