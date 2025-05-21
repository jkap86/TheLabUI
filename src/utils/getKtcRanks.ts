import store, { RootState } from "@/redux/store";
import { getPlayerTotal } from "./getOptimalStarters";

export const getKtcAvgValue = (players: string[], type: "D" | "R") => {
  if (players.length === 0) return 0;

  const state: RootState = store.getState();

  const { ktcCurrent } = state.common;

  const ktc =
    type === "R" ? ktcCurrent?.redraft || {} : ktcCurrent?.dynasty || {};

  const total = players.reduce((acc, cur) => acc + (ktc[cur] || 0), 0);

  return Math.round(total / players.length);
};

export const getTotalProj = (
  players: string[],
  scoring_settings: { [cat: string]: number }
) => {
  if (players.length === 0) return 0;

  const state: RootState = store.getState();

  const { projections } = state.common;

  const total = players.reduce(
    (acc, cur) =>
      acc + getPlayerTotal(scoring_settings, projections?.[cur] || {}),
    0
  );

  return total;
};
