import { Allplayer } from "@/lib/types/commonTypes";
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllplayers,
  fetchKtc,
  fetchNflState,
  fetchProjections,
} from "./commonActions";

export interface CommonState {
  nflState: { [key: string]: string | number } | null;
  allplayers: { [player_id: string]: Allplayer } | null;
  ktcCurrent: {
    dynasty: { [player_id: string]: number };
    redraft: { [player_id: string]: number };
  } | null;
  projections: { [player_id: string]: { [cat: string]: number } } | null;
  isLoadingCommon: string[];
  errorCommon: string[];
}

const initialState: CommonState = {
  nflState: null,
  allplayers: null,
  ktcCurrent: null,
  projections: null,
  isLoadingCommon: [],
  errorCommon: [],
};

export const nflStateMessage = "NFL State";
export const allplayersMessage = "Players";
export const ktcCurrentMessage = "KTC Values";
export const projectionsMessage = "ROS Projections";

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNflState.pending, (state) => {
        state.isLoadingCommon.push(nflStateMessage);
      })
      .addCase(fetchNflState.fulfilled, (state, action) => {
        state.isLoadingCommon = state.isLoadingCommon.filter(
          (x) => x !== nflStateMessage
        );

        state.nflState = action.payload;
      })
      .addCase(fetchNflState.rejected, (state, action) => {
        state.isLoadingCommon = state.isLoadingCommon.filter(
          (x) => x !== nflStateMessage
        );

        state.errorCommon.push(action.error.message || "");
      });

    builder
      .addCase(fetchAllplayers.pending, (state) => {
        state.isLoadingCommon.push(allplayersMessage);
      })
      .addCase(fetchAllplayers.fulfilled, (state, action) => {
        state.isLoadingCommon = state.isLoadingCommon.filter(
          (x) => x !== allplayersMessage
        );

        state.allplayers = action.payload;
      })
      .addCase(fetchAllplayers.rejected, (state, action) => {
        state.isLoadingCommon = state.isLoadingCommon.filter(
          (x) => x !== allplayersMessage
        );

        state.errorCommon.push(action.error.message || "");
      });

    builder
      .addCase(fetchKtc.pending, (state) => {
        state.isLoadingCommon.push(ktcCurrentMessage);
      })
      .addCase(fetchKtc.fulfilled, (state, action) => {
        state.isLoadingCommon = state.isLoadingCommon.filter(
          (x) => x !== ktcCurrentMessage
        );

        state.ktcCurrent = {
          dynasty: Object.fromEntries(action.payload.dynasty.values),
          redraft: Object.fromEntries(action.payload.redraft.values),
        };
      })
      .addCase(fetchKtc.rejected, (state, action) => {
        state.isLoadingCommon = state.isLoadingCommon.filter(
          (x) => x !== ktcCurrentMessage
        );

        state.errorCommon.push(action.error.message || "");
      });

    builder
      .addCase(fetchProjections.pending, (state) => {
        state.isLoadingCommon.push(projectionsMessage);
      })
      .addCase(fetchProjections.fulfilled, (state, action) => {
        state.isLoadingCommon = state.isLoadingCommon.filter(
          (x) => x !== projectionsMessage
        );

        state.projections = action.payload;
      })
      .addCase(fetchProjections.rejected, (state, action) => {
        state.isLoadingCommon = state.isLoadingCommon.filter(
          (x) => x !== projectionsMessage
        );

        state.errorCommon.push(action.error.message || "");
      });
  },
});

export default commonSlice.reducer;
