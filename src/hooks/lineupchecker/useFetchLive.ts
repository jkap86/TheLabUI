import useSWR from "swr";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { StatObj } from "@/lib/types/commonTypes";
import { updateLiveStats } from "@/redux/lineupchecker/lineupcheckerSlice";
import { useEffect } from "react";

type Response = {
  delay: number;
  stats: StatObj[];
};

const fetcher = (url: string) =>
  axios.get<Response>(url).then((res) => res.data);

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

  useSWR<Response>(route, fetcher, {
    refreshInterval: (data) => data?.delay ?? 30_000, // fallback 30s
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 4000,
    onSuccess: (data) => {
      const liveObj = Object.fromEntries(
        data.stats.map((statObj) => [statObj.player_id, statObj])
      );

      dispatch(updateLiveStats(liveObj));
    },
  });

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
