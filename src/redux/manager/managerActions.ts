import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { League, User } from "@/lib/types/userTypes";
import { getPlayerShares } from "@/utils/getPlayerShares";
import { RootState } from "../store";
import { getLeaguesObj } from "@/utils/getLeaguesObj";

export const fetchUser = createAsyncThunk(
  "fetchUser",
  async (searched: string) => {
    const user_fetched = await axios.get("/api/manager/user", {
      params: { searched },
    });

    return user_fetched.data;
  }
);

export const fetchLeagues = createAsyncThunk(
  "fetchLeagues",
  async (
    {
      user,
      nflState,
    }: {
      user: User;
      nflState: { [key: string]: string | number };
    },
    { dispatch }
  ) => {
    const response = await fetch(
      `/api/manager/leagues?user_id=${user.user_id}&week=${1}&season=${
        nflState.season
      }`
    );

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let text = "";

    if (reader) {
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          text += decoder.decode(value, { stream: true });

          const matches = text.match(/{"league_id":/g);

          dispatch({
            type: "manager/updateLeaguesProgress",
            payload: matches?.length || 0,
          });
        }
      }
    }

    const text_array = text.split("\n");

    const parsedLeaguesArray: League[] = [];

    text_array
      .filter((chunk) => chunk.length > 0)
      .forEach((chunk) => {
        try {
          parsedLeaguesArray.push(...JSON.parse(chunk));
        } catch (err: unknown) {
          console.log({ err, chunk });
        }
      });

    const leaguesState = Object.fromEntries(
      parsedLeaguesArray.map((league: League) => {
        return [league["league_id"], league];
      })
    );

    const { playershares, pickshares, leaguemates } = getPlayerShares(
      parsedLeaguesArray,
      user
    );

    const leaguesValuesObj = getLeaguesObj(
      Object.values(leaguesState),
      user.user_id
    );

    return {
      leaguesState,
      playershares,
      pickshares,
      leaguemates,
      leaguesValuesObj,
    };
  }
);

export const syncLeague = createAsyncThunk(
  "syncLeague",
  async (
    {
      league_id,
      roster_id,
      week,
    }: {
      league_id: string;
      roster_id: number;
      week: number;
    },
    { getState }
  ) => {
    const state = getState() as RootState;
    const { leagues } = state.manager;

    const response = await axios.get("/api/manager/leagues/sync", {
      params: {
        league_id,
        roster_id,
        week,
      },
    });

    return {
      ...(leagues?.[league_id] || {}),
      ...response.data,
    };
  }
);

export const fetchLmTrades = createAsyncThunk(
  "fetchLmTrades",
  async (
    {
      manager,
      player,
      offset,
    }: { manager?: string; player?: string; offset: number },
    { getState }
  ) => {
    const state = getState() as RootState;

    const { leaguemates } = state.manager;

    const lmTrades = await axios.post("/api/manager/lmtrades", {
      leaguemate_ids: Object.keys(leaguemates),
      offset,
      limit: 125,
      manager,
      player,
    });

    return {
      manager,
      player,
      trades: lmTrades.data.rows,
      count: lmTrades.data.count,
    };
  }
);
