import { Allplayer } from "@/lib/types/commonTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchNflState = createAsyncThunk("fetchNflState", async () => {
  try {
    const nflState = await axios.get("/api/common/nflstate");

    return nflState.data;
  } catch {
    return "Error fetching Nfl State";
  }
});

export const fetchAllplayers = createAsyncThunk("fetchAllplayers", async () => {
  const allplayers = await axios.get("/api/common/allplayers");

  const allplayersObject = Object.fromEntries(
    allplayers.data.map((player: Allplayer) => [player.player_id, player])
  );

  return allplayersObject;
});

export const fetchKtc = createAsyncThunk("fetchKtc", async () => {
  try {
    const ktc = await axios.get("/api/common/ktc/current");

    return ktc.data;
  } catch {
    return "Error fetching KTC current Values";
  }
});

export const fetchProjections = createAsyncThunk(
  "fetchProjections",
  async () => {
    const projections: {
      data: { player_id: string; stats: { [cat: string]: number } }[];
    } = await axios.get("/api/common/rosprojections");

    const projections_obj = Object.fromEntries(
      projections.data.map((p) => [p.player_id, p.stats])
    );

    return projections_obj;
  }
);
