import { fetchMatchups } from "@/redux/lineupchecker/lineupcheckerActions";
import { AppDispatch, RootState } from "@/redux/store";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function useFetchMatchups({ searched }: { searched: string }) {
  const dispatch: AppDispatch = useDispatch();
  const { nflState } = useSelector((state: RootState) => state.common);

  useEffect(() => {
    if (nflState) {
      dispatch(fetchMatchups({ searched }));
    }
  }, [searched, nflState, dispatch]);
}
