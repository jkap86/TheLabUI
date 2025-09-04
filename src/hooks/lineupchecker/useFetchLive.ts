import useSWR from "swr";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { StatObj } from "@/lib/types/commonTypes";
import { updateLiveStats } from "@/redux/lineupchecker/lineupcheckerSlice";
import { useCallback, useEffect, useMemo } from "react";

type Response = {
  delay: number;
  stats: StatObj[];
};

export default function useFetchLive() {
  const dispatch: AppDispatch = useDispatch();
  const { nflState, allplayers } = useSelector(
    (state: RootState) => state.common
  );
  const { matchups, liveStats } = useSelector(
    (state: RootState) => state.lineupchecker
  );

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
    if (route && !data) {
      mutate(fetcher(route), { revalidate: false });
    }
  }, [route, data, fetcher, mutate]);

  useEffect(() => {
    if (Object.keys(liveStats).length === 0) return;

    const worker = new Worker(
      new URL("../../app/workers/liveStats.worker.ts", import.meta.url)
    );

    worker.onmessage = (e) => {
      console.log({ e });
    };

    worker.postMessage({ liveStats, matchups, allplayers });
  }, [liveStats, matchups, allplayers]);
}
