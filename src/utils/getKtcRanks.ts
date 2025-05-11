import store, { RootState } from "@/redux/store";

export const getKtcAvgValue = (players: string[], type: "D" | "R") => {
  if (players.length === 0) return 0;

  const state: RootState = store.getState();

  const { ktcCurrent } = state.common;

  const ktc =
    type === "R" ? ktcCurrent?.redraft || {} : ktcCurrent?.dynasty || {};

  const total = players.reduce((acc, cur) => acc + (ktc[cur] || 0), 0);

  return Math.round(total / players.length);
};
