import { fetchMatchups } from "@/redux/lineupchecker/lineupcheckerActions";
import { AppDispatch, RootState } from "@/redux/store";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function useFetchMatchups({ searched }: { searched: string }) {
  const dispatch: AppDispatch = useDispatch();
  const { nflState } = useSelector((state: RootState) => state.common);
  const { searchedName, isLoadingMatchups } = useSelector(
    (state: RootState) => state.lineupchecker
  );

  useEffect(() => {
    if (nflState && !isLoadingMatchups && searched !== searchedName) {
      dispatch(fetchMatchups({ searched }));
    }
  }, [searched, nflState, searchedName, isLoadingMatchups, dispatch]);
}
