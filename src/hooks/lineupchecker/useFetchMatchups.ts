//import { fetchMatchups } from "@/redux/lineupchecker/lineupcheckerActions";
import {
  fetchMatchups,
  fetchUserLeagueIds,
} from "@/redux/lineupchecker/lineupcheckerActions";
import {
  resetLineupcheckerState,
  updateLineupcheckerEdits,
  updateLineupcheckerState,
} from "@/redux/lineupchecker/lineupcheckerSlice";
import { AppDispatch, RootState } from "@/redux/store";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function useFetchMatchups({ searched }: { searched: string }) {
  const dispatch: AppDispatch = useDispatch();
  const { nflState } = useSelector((state: RootState) => state.common);
  const {
    isLoadingMatchups,
    errorMatchups,
    user,
    league_ids,
    matchups,
    isLoadingUserLeagueIds,
    errorLoadingUserLeagueIds,
    isUpdatingMatchups,
    edits,
  } = useSelector((state: RootState) => state.lineupchecker);
  const [editsLoaded, setEditsLoaded] = useState(false);

  useEffect(() => {
    if (user && user.username.toLowerCase() !== searched?.toLowerCase()) {
      dispatch(resetLineupcheckerState());
    }
  }, [searched, user, dispatch]);

  useEffect(() => {
    if (!user && !isLoadingUserLeagueIds && !errorLoadingUserLeagueIds) {
      dispatch(fetchUserLeagueIds({ searched }));
    }
  }, [
    user,
    isLoadingUserLeagueIds,
    errorLoadingUserLeagueIds,
    searched,
    dispatch,
  ]);

  useEffect(() => {
    if (
      !(Object.keys(matchups).length > 0) &&
      nflState &&
      user?.username.toLowerCase() === searched?.toLowerCase() &&
      league_ids.length > 0 &&
      !isLoadingMatchups &&
      !errorMatchups &&
      !isUpdatingMatchups &&
      editsLoaded
    ) {
      dispatch(
        fetchMatchups({
          user_id: user.user_id,
          league_ids,
          week: Math.max(1, nflState?.leg as number),
          edits,
          initial: true,
        })
      );
    }
  }, [
    nflState,
    user,
    searched,
    league_ids,
    isLoadingMatchups,
    errorMatchups,
    isUpdatingMatchups,
    editsLoaded,
    matchups,
    edits,
    dispatch,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(
        updateLineupcheckerState({
          key: "updateMatchupsAvailable",
          value: true,
        })
      );
    }, 15_000);

    return () => clearTimeout(timeout);
  }, [matchups, dispatch]);

  const editString =
    user && nflState
      ? `edits__${Math.max(1, nflState?.leg as number)}__${user?.user_id}`
      : "";
  useEffect(() => {
    const editsLocalString = localStorage.getItem(editString);

    try {
      const editsLocalParsed = editsLocalString && JSON.parse(editsLocalString);

      dispatch(updateLineupcheckerEdits(editsLocalParsed));
    } catch {}
  }, [editString, dispatch]);

  useEffect(() => {
    if (editString && Object.keys(edits || {}).length > 0) {
      localStorage.setItem(editString, JSON.stringify(edits));
    }

    setEditsLoaded(true);
  }, [edits, editString]);
}
