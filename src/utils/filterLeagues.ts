import store, { RootState } from "@/redux/store";

export const filterLeagueIds = (league_ids: string[]) => {
  const state: RootState = store.getState();

  const { type1, type2, leagues } = state.manager;

  return league_ids.filter((league_id) => {
    const condition1 =
      type1 === "All" ||
      (type1 === "Redraft" && leagues?.[league_id].settings.type !== 2) ||
      (type1 === "Dynasty" && leagues?.[league_id].settings.type === 2);

    const condition2 =
      type2 === "All" ||
      (type2 === "Bestball" && leagues?.[league_id].settings.best_ball === 1) ||
      (type2 === "Lineup" && leagues?.[league_id].settings.best_ball !== 1);

    return condition1 && condition2;
  });
};
