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
  async (
    {
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
    },
    { dispatch }
  ) => {
    const controller = new AbortController();

    const res = await fetch("/api/lineupchecker/matchups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, league_ids, week, edits }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let text = "";

    if (reader) {
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          text += decoder.decode(value, { stream: true });

          const matches = text.match(/,"matchups":/g);

          dispatch({
            type: "lineupchecker/updateMatchupsProgress",
            payload: matches?.length || 0,
          });
        }
      }
    }

    const text_array = text.split("\n");

    const parsedRes: {
      matchups: {
        league_id: string;
        league: League;
        matchups: Matchup[];
      }[];
      schedule: { [team: string]: { kickoff: number; opp: string } };
      projections: { [player_id: string]: { [cat: string]: number } };
    } = { matchups: [], schedule: {}, projections: {} };

    text_array
      .filter((chunk) => chunk.length > 0)
      .forEach((chunk) => {
        try {
          const parsed = JSON.parse(chunk);

          if (Array.isArray(parsed)) {
            parsedRes.matchups.push(...parsed);
          } else {
            if (parsed?.schedule) parsedRes.schedule = parsed.schedule;
            if (parsed?.projections) parsedRes.projections = parsed.projections;
          }
        } catch (err: unknown) {
          console.log({ err, chunk });
        }
      });

    console.log({ parsedRes });

    const matchups_obj: {
      [league_id: string]: {
        user_matchup: Matchup;
        opp_matchup?: Matchup;
        league_matchups: Matchup[];
        league: League;
      };
    } = {};

    parsedRes.matchups.forEach((r) => {
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
      Object.keys(parsedRes.projections).map((player_id) => {
        return [
          player_id,
          {
            ...parsedRes.projections[player_id],
            pts_ppr: getPlayerTotal(
              ppr_scoring_settings,
              parsedRes.projections[player_id]
            ),
          },
        ];
      })
    );

    return {
      matchups: matchups_obj,
      schedule: parsedRes.schedule,
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
