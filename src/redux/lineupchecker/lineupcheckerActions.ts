import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "axios";

export const fetchMatchups = createAsyncThunk(
  "fetchMatchups",
  async ({ searched }: { searched: string }, { getState }) => {
    const state = getState() as RootState;
    const { nflState } = state.common;

    const matchups = await axios.get("/api/lineupchecker", {
      params: {
        searched,
        week: Math.max(1, nflState?.week as number),
      },
    });

    return matchups.data;
  }
);
