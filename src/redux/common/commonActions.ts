import { Allplayer } from "@/lib/types/commonTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

type Reject = { message: string; status?: number };

export const fetchNflState = createAsyncThunk<
  Record<string, string | number>,
  { signal?: AbortSignal },
  { rejectValue: Reject }
>("fetchNflState", async ({ signal }, { rejectWithValue }) => {
  try {
    const nflState = await axios.get("/api/common/nflstate");

    return nflState.data;
  } catch (err: unknown) {
    if (["AbortError", "CanceledError"].includes((err as AxiosError).name)) {
      return rejectWithValue({ message: "__ABORTED__" });
    }
    return rejectWithValue({
      message: (err as Error).message ?? "Failed to fetch players",
    });
  }
});

export const fetchAllplayers = createAsyncThunk<
  Record<string, Allplayer>,
  { signal?: AbortSignal },
  { rejectValue: Reject }
>("fetchAllplayers", async ({ signal }, { rejectWithValue }) => {
  try {
    const allplayers = await axios.get("/api/common/allplayers", { signal });

    return Object.fromEntries(
      allplayers.data.map((player: Allplayer) => [player.player_id, player])
    );
  } catch (err: unknown) {
    if (["AbortError", "CanceledError"].includes((err as AxiosError).name)) {
      return rejectWithValue({ message: "__ABORTED__" });
    }
    return rejectWithValue({
      message: (err as Error).message ?? "Failed to fetch players",
    });
  }
});

export const fetchKtc = createAsyncThunk<
  Record<string, number>,
  { signal?: AbortSignal },
  { rejectValue: Reject }
>("fetchKtc", async ({ signal }, { rejectWithValue }) => {
  try {
    const ktc = await axios.get("/api/common/ktc/current");

    return Object.fromEntries(ktc.data.dynasty.values);
  } catch (err: unknown) {
    if (["AbortError", "CanceledError"].includes((err as AxiosError).name)) {
      return rejectWithValue({ message: "__ABORTED__" });
    }
    return rejectWithValue({
      message: (err as Error).message ?? "Failed to fetch players",
    });
  }
});

export const fetchProjections = createAsyncThunk<
  Record<string, Record<string, number>>,
  { signal?: AbortSignal },
  { rejectValue: Reject }
>("fetchProjections", async ({ signal }, { rejectWithValue }) => {
  try {
    const projections: {
      data: { player_id: string; stats: { [cat: string]: number } }[];
    } = await axios.get("/api/common/rosprojections");

    const projections_obj = Object.fromEntries(
      projections.data.map((p) => [p.player_id, p.stats])
    );

    return projections_obj;
  } catch (err: unknown) {
    if (["AbortError", "CanceledError"].includes((err as AxiosError).name)) {
      return rejectWithValue({ message: "__ABORTED__" });
    }
    return rejectWithValue({
      message: (err as Error).message ?? "Failed to fetch players",
    });
  }
});
