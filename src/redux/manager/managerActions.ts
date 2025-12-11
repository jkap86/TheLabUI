import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { League, Leaguemate, Playershare, User } from "@/lib/types/userTypes";
import { getPlayerShares } from "@/utils/manager/getPlayerShares";
import { RootState } from "../store";
import { getLeaguesObj } from "@/utils/getLeaguesObj";
import { colObj } from "@/lib/types/commonTypes";

type FetchUserArg = { searched: string; signal?: AbortSignal };

export const fetchUser = createAsyncThunk<
  User,
  FetchUserArg,
  { state: RootState; rejectValue: { message: string; status?: number } }
>("fetchUser", async ({ searched, signal }, { rejectWithValue }) => {
  try {
    const res = await axios.get("/api/manager/user", {
      params: { searched },
      signal,
    });

    return res.data as User;
  } catch (error: unknown) {
    console.log({ error });
    const err = error as AxiosError;
    if (["AbortError", "CanceledError"].includes(err?.name)) {
      return rejectWithValue({ message: "__ABORTED__" });
    }

    const status = err?.response?.status;
    const message = err?.message ?? "Failed to fetch user";

    return rejectWithValue({ message, status });
  }
});

type ErrorPayload = { message: string; status?: number };
type FetchLeaguesArg = {
  user: User;
  nflState: { [key: string]: string | number } | null;
  signal?: AbortSignal;
};

export const fetchLeagues = createAsyncThunk<
  {
    leaguesState: { [league_id: string]: League };
    playershares: {
      [player_id: string]: Playershare;
    };
    pickshares: {
      [pick_id: string]: Playershare;
    };
    leaguemates: {
      [lm_user_id: string]: Leaguemate;
    };
    leaguesValuesObj: {
      [league_id: string]: {
        [col_abbrev: string]: colObj;
      };
    };
  },
  FetchLeaguesArg,
  { state: RootState; rejectValue: ErrorPayload }
>(
  "fetchLeagues",
  async ({ user, nflState, signal }, { dispatch, rejectWithValue }) => {
    try {
      if (!user?.user_id) {
        return rejectWithValue({ message: "Missing user_id" });
      }

      const season = nflState?.season;
      if (!season) {
        return rejectWithValue({ message: "Missing season" });
      }

      const url = new URL("/api/manager/leagues", window.location.origin);
      url.searchParams.set("user_id", user.user_id);
      url.searchParams.set("season", String(season));

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/x-ndjson, application/json" },
        signal,
      });

      if (!res.ok) {
        const status = res.status;
        // Try to read a small error body safely
        let message = `Failed to fetch leagues (${status})`;
        try {
          const t = await res.text();
          if (t) message = t.slice(0, 500);
        } catch {}
        return rejectWithValue({ message, status });
      }

      // Stream NDJSON from ReadableStream (browser environment)
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = "";

      if (reader) {
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;

          if (value) {
            text += decoder.decode(value, { stream: true });

            const matches = text.match(/\{"league_id":/g);

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
            parsedLeaguesArray.push(JSON.parse(chunk));
          } catch (err: unknown) {
            console.log({ err, chunk });
          }
        });

      const leaguesState = Object.fromEntries(
        parsedLeaguesArray.map((league: League) => [league.league_id, league])
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
    } catch (error: unknown) {
      const err = error as AxiosError;
      // Normalize aborts vs other errors
      if (["AbortError", "CanceledError"].includes(err?.name)) {
        return rejectWithValue({ message: "Request aborted by caller" });
      }
      const status = err?.response?.status;
      const message = err?.message ?? "Failed to fetch leagues";
      return rejectWithValue({ message, status });
    }
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
