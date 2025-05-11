import { fetchNflState } from "@/redux/commonActions";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { nflStateMessage } from "@/redux/commonSlice";

export default function useFetchNflState() {
  const dispatch: AppDispatch = useDispatch();
  const { nflState, isLoadingCommon, errorCommon } = useSelector(
    (state: RootState) => state.common
  );

  useEffect(() => {
    if (
      !nflState &&
      !isLoadingCommon.includes(nflStateMessage) &&
      errorCommon.length === 0
    )
      dispatch(fetchNflState());
  }, [dispatch, nflState, isLoadingCommon]);
}
