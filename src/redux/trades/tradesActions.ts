import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchTrades = createAsyncThunk(
  "fetchTrades",
  async (
    {
      player_id1,
      player_id2,
      player_id3,
      player_id4,
      offset,
      limit,
    }: {
      player_id1?: string;
      player_id2?: string;
      player_id3?: string;
      player_id4?: string;
      offset: number;
      limit: number;
    },
    { dispatch }
  ) => {
    const trades = await axios.get("/api/trades/trades", {
      params: {
        player_id1,
        player_id2,
        player_id3,
        player_id4,
        offset,
        limit,
      },
    });

    dispatch({
      type: "common/updateKtcProjections",
      payload: {
        ktcCurrent: trades.data.ktcCurrent,
        projections: trades.data.projections,
      },
    });

    return {
      player_id1,
      player_id2,
      player_id3,
      player_id4,
      count: trades.data.count,
      trades: trades.data.rows,
    };
  }
);
