import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "axios";
import { Matchup } from "@/lib/types/userTypes";

export const fetchMatchups = createAsyncThunk(
  "fetchMatchups",
  async ({ searched }: { searched: string }, { getState }) => {
    const state = getState() as RootState;
    const { nflState } = state.common;

    const matchups: {
      data: {
        matchups: Matchup[];
        schedule_week: { [team: string]: { kickoff: number; opp: string } };
      };
    } = await axios.get("/api/lineupchecker", {
      params: {
        searched,
        week: Math.max(1, nflState?.week as number),
      },
    });

    const matchups_obj: {
      [league_id: string]: {
        user_matchup: Matchup;
        opp_matchup: Matchup;
        league_matchups: Matchup[];
        league_index: number;
        league_name: string;
        league_avatar: string | null;
      };
    } = {};

    const league_ids = Array.from(
      new Set(matchups.data.matchups.map((matchup) => matchup.league_id))
    );

    league_ids.forEach((league_id) => {
      const matchups_league = matchups.data.matchups.filter(
        (matchup) => matchup.league_id === league_id
      );

      const matchup_user = matchups_league.find(
        (matchup) => matchup.roster_id === matchup.roster_id_user
      );

      const matchup_opp = matchups_league.find(
        (matchup) => matchup.roster_id === matchup.roster_id_opp
      );

      if (matchup_user && matchup_opp) {
        matchups_obj[league_id] = {
          user_matchup: matchup_user,
          opp_matchup: matchup_opp,
          league_matchups: matchups_league,
          league_index: matchup_user.league.index,
          league_name: matchup_user.league.name,
          league_avatar: matchup_user.league.avatar,
        };
      }
    });

    return { matchups: matchups_obj, schedule: matchups.data.schedule_week };
  }
);
