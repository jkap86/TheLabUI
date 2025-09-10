import useSWR from "swr";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { StatObj } from "@/lib/types/commonTypes";
import {
  updateLineupcheckerState,
  updateLiveStats,
  updateMatchups,
} from "@/redux/lineupchecker/lineupcheckerSlice";
import { useCallback, useEffect, useMemo, useRef } from "react";

type Response = {
  delay: number;
  stats: StatObj[];
};

export default function useFetchLive() {
  const dispatch: AppDispatch = useDispatch();
  const { nflState, allplayers } = useSelector(
    (state: RootState) => state.common
  );
  const { matchups, liveStats, projections } = useSelector(
    (state: RootState) => state.lineupchecker
  );
  const workerRef = useRef<Worker | null>(null);
  const matchupsRef = useRef(matchups);
  const allplayersRef = useRef(allplayers);
  const projectionsRef = useRef(projections);

  const week = Math.max(1, nflState?.leg as number);
  const route = week
    ? `/api/lineupchecker/live?week=${encodeURIComponent(week)}`
    : null;

  const fetcher = useCallback(
    (url: string) => axios.get<Response>(url).then((res) => res.data),
    []
  );

  const refreshInterval = useCallback(
    (data?: Response) => data?.delay ?? 30_000,
    []
  );

  const onSuccess = useCallback(
    (data: Response) => {
      const liveObj = Object.fromEntries(
        data.stats.map((statObj) => [statObj.player_id, statObj])
      );

      dispatch(updateLiveStats(liveObj));
    },
    [dispatch]
  );

  const swrOptions = useMemo(
    () => ({
      refreshInterval,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
      revalidateOnMount: false,
      dedupingInterval: 10_000,
      shouldRetryOnError: true,
      onSuccess,
    }),
    [refreshInterval, onSuccess]
  );

  const { data, mutate } = useSWR<Response>(route, fetcher, swrOptions);

  useEffect(() => {
    if (route && !data && allplayers && Object.keys(matchups).length > 0) {
      (async () => {
        dispatch(
          updateLineupcheckerState({ key: "isLoadingLiveStats", value: true })
        );

        await mutate(undefined, { revalidate: true });
      })();
    }
  }, [route, data, fetcher, mutate, allplayers, matchups, dispatch]);

  useEffect(() => {
    const worker = new Worker(
      new URL("../../app/workers/liveStats.worker.ts", import.meta.url)
    );
    workerRef.current = worker;

    // guard dispatch to avoid no-op updates causing renders
    let lastPayloadKey = "";

    worker.onmessage = (e: MessageEvent) => {
      const next = e.data?.matchups_w_live;
      const key = JSON.stringify(next);

      if (key !== lastPayloadKey) {
        lastPayloadKey = key;
        dispatch(updateMatchups(next));

        dispatch(
          updateLineupcheckerState({
            key: "isLoadingLiveStats",
            value: false,
          })
        );
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [dispatch]);

  useEffect(() => {
    matchupsRef.current = matchups;
  }, [matchups]);

  useEffect(() => {
    allplayersRef.current = allplayers;
  }, [allplayers]);

  useEffect(() => {
    projectionsRef.current = projections;
  }, [projections]);

  useEffect(() => {
    if (!liveStats) return;
    workerRef.current?.postMessage({
      liveStats,
      matchups: matchupsRef.current,
      allplayers: allplayersRef.current,
      projections: projectionsRef.current,
    });
  }, [liveStats]);
}
