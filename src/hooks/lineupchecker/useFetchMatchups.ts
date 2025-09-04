import {
  fetchMatchups,
  fetchUserLeagueIds,
} from "@/redux/lineupchecker/lineupcheckerActions";
import {
  resetLineupcheckerState,
  updateLineupcheckerState,
} from "@/redux/lineupchecker/lineupcheckerSlice";
import { AppDispatch, RootState } from "@/redux/store";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function useFetchMatchups({ searched }: { searched: string }) {
  const dispatch: AppDispatch = useDispatch();
  const { nflState } = useSelector((state: RootState) => state.common);
  const {
    isLoadingMatchups,
    errorMatchups,
    user,
    matchups,
    isLoadingUserLeagueIds,
    errorLoadingUserLeagueIds,
    isUpdatingMatchups,
    edits,
  } = useSelector((state: RootState) => state.lineupchecker);

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
      !isLoadingMatchups &&
      !errorMatchups &&
      !isUpdatingMatchups
    ) {
      dispatch(
        fetchMatchups({
          user_id: user.user_id,
          week: Math.max(1, nflState?.leg as number),
          initial: true,
        })
      );
    }
  }, [
    nflState,
    user,
    searched,
    isLoadingMatchups,
    errorMatchups,
    isUpdatingMatchups,
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
      ? `edits__${Math.max(1, Number(nflState.leg))}__${user?.user_id}`
      : null;

  /*
  useEffect(() => {
    if (typeof window === "undefined" || !editString) return;

    const editsLocalString = localStorage.getItem(editString);

    let editsLocalParsed: ProjectionEdits = {};

    try {
      if (editsLocalString) {
        const parsed = JSON.parse(editsLocalString);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          editsLocalParsed = parsed;
        }
      }
    } catch {}

    dispatch(updateLineupcheckerEdits(editsLocalParsed));
    setEditsLoaded(true);
  }, [editString, dispatch]);
  */

  useEffect(() => {
    if (typeof window === "undefined" || !editString) return;

    if (edits && Object.keys(edits).length > 0) {
      localStorage.setItem(editString, JSON.stringify(edits));
    }
  }, [edits, editString]);
}
