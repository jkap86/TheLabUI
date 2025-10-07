import { fetchLeagues, fetchUser } from "@/redux/manager/managerActions";
import { resetState } from "@/redux/manager/managerSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useFetchUserAndLeagues = (searchedRaw: string) => {
  const dispatch: AppDispatch = useDispatch();
  const { nflState, ktcCurrent, projections } = useSelector(
    (state: RootState) => state.common
  );
  const { user, leagues, isLoadingLeagues, errorLeagues, errorUser } =
    useSelector((state: RootState) => state.manager);

  console.log({ errorUser, errorLeagues, user, leagues });

  const commonLoaded = useMemo(
    () => Boolean(nflState && ktcCurrent && projections),
    [nflState, ktcCurrent, projections]
  );

  const searched = useMemo(
    () => (searchedRaw ?? "").trim().toLowerCase(),
    [searchedRaw]
  );
  const username = useMemo(
    () => user?.username?.toLowerCase?.() ?? "",
    [user?.username]
  );

  const userCtrlRef = useRef<AbortController | null>(null);
  const leaguesCtrlRef = useRef<AbortController | null>(null);

  const lastUserRequestedRef = useRef<string>("");

  useEffect(() => {
    if (!commonLoaded) return;
    if (!searched) return;
    if (lastUserRequestedRef.current === searched) return;

    // Clear prior manager state for a new lookup (your existing reducer)
    dispatch(resetState());

    // abort only the previous USER request
    userCtrlRef.current?.abort();
    const ctrl = new AbortController();
    userCtrlRef.current = ctrl;
    lastUserRequestedRef.current = searched;

    // fetch user

    dispatch(fetchUser({ searched, signal: ctrl.signal }))
      .unwrap()
      .catch((e) => {
        // If aborted (Strict Mode unmount or manual abort), allow retry on next mount
        if (e?.message === "__ABORTED__" || e?.name === "AbortError") {
          lastUserRequestedRef.current = ""; // <-- critical: permit re-dispatch after remount
          return;
        }
        // real error: keep lastUserRequestedRef so we don't thrash on same bad query
        console.warn("fetchUser error:", e);
      });
  }, [commonLoaded, searched, dispatch]);

  useEffect(() => {
    if (!commonLoaded || !user) return;
    if (!searched) return;

    // Only proceed if the loaded user matches current search input
    if (username !== searched) return;

    // Avoid duplicate starts
    if (leagues || isLoadingLeagues || errorLeagues) return;

    leaguesCtrlRef.current?.abort();
    const ctrl = new AbortController();
    leaguesCtrlRef.current = ctrl;

    dispatch(fetchLeagues({ user, nflState, signal: ctrl.signal }))
      .unwrap()
      .catch((e) => {
        if (e?.message === "__ABORTED__" || e?.name === "AbortError") return;
        console.warn("fetchLeagues error:", e);
      });
  }, [
    commonLoaded,
    user,
    searched,
    username,
    nflState,
    leagues,
    isLoadingLeagues,
    errorLeagues,
    dispatch,
  ]);

  useEffect(() => {
    return () => {
      userCtrlRef.current?.abort();
      lastUserRequestedRef.current = "";
      leaguesCtrlRef.current?.abort();
    };
  }, []);
};
