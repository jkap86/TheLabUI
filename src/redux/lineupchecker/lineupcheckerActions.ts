import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { League, Matchup, ProjectionEdits, User } from "@/lib/types/userTypes";
import {
  getPlayerTotal,
  ppr_scoring_settings,
} from "@/utils/getOptimalStarters";

export const fetchUserLeagueIds = createAsyncThunk(
  "fetchUserLeagueIds",
  async ({ searched }: { searched: string }) => {
    const res: { data: { user: User; league_ids: string[] } } = await axios.get(
      "/api/lineupchecker/user",
      {
        params: { searched },
      }
    );

    return res.data;
  }
);

export const fetchMatchups = createAsyncThunk(
  "fetchMatchups",
  async ({
    user_id,
    league_ids,
    week,
    edits,
  }: {
    user_id: string;
    league_ids: string[];
    week: number;
    edits?: ProjectionEdits;
    initial?: true;
  }) => {
    const response: {
      data: {
        matchups: { league_id: string; league: League; matchups: Matchup[] }[];
        schedule_week: { [team: string]: { kickoff: number; opp: string } };
        projections_week: { [player_id: string]: { [cat: string]: number } };
      };
    } = await axios.post("/api/lineupchecker/matchups", {
      user_id,
      league_ids,
      week,
      edits,
    });

    const matchups_obj: {
      [league_id: string]: {
        user_matchup: Matchup;
        opp_matchup?: Matchup;
        league_matchups: Matchup[];
        league: League;
      };
    } = {};

    response.data.matchups.forEach((r) => {
      const user_matchup = r.matchups.find(
        (m) => m.roster_id === m.roster_id_user
      );
      const opp_matchup = r.matchups.find(
        (m) => m.roster_id === m.roster_id_opp
      );

      if (user_matchup)
        matchups_obj[r.league_id] = {
          user_matchup,
          opp_matchup,
          league_matchups: r.matchups,
          league: r.league,
        };
    });

    const projections = Object.fromEntries(
      Object.keys(response.data.projections_week).map((player_id) => {
        return [
          player_id,
          {
            ...response.data.projections_week[player_id],
            pts_ppr: getPlayerTotal(
              ppr_scoring_settings,
              response.data.projections_week[player_id]
            ),
          },
        ];
      })
    );

    return {
      matchups: matchups_obj,
      schedule: response.data.schedule_week,
      projections,
    };
  }
);

export const syncMatchup = createAsyncThunk(
  "syncMatchup",
  async ({
    league_id,
    user_id,
    week,
    best_ball,
    edits,
  }: {
    league_id: string;
    user_id: string;
    index: number;
    week: number;
    best_ball: number;
    edits: ProjectionEdits;
  }) => {
    const league_matchups: { data: Matchup[] } = await axios.post(
      "/api/lineupchecker/sync",
      {
        league_id,
        week,
        user_id,
        best_ball,
        edits,
      }
    );

    const user_matchup = league_matchups.data.find(
      (matchup) => matchup.roster_id === matchup.roster_id_user
    );

    const opp_matchup = league_matchups.data.find(
      (matchup) => matchup.roster_id === matchup.roster_id_opp
    );

    return {
      user_matchup,
      opp_matchup,
      league_matchups: league_matchups.data,
    };
  }
);
