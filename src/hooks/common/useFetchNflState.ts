import { fetchNflState } from "@/redux/common/commonActions";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { nflStateMessage } from "@/redux/common/commonSlice";

export default function useFetchNflState() {
  const dispatch: AppDispatch = useDispatch();
  const { nflState, isLoadingCommon, errorCommon } = useSelector(
    (state: RootState) => state.common
  );

  const ctrlRef = useRef<AbortController | null>(null);

  const isLoadingNflState = useMemo(
    () => isLoadingCommon.includes(nflStateMessage),
    [isLoadingCommon]
  );
  const hasError = useMemo(() => errorCommon.length > 0, [errorCommon]);

  useEffect(() => {
    if (nflState || isLoadingNflState || hasError) return;

    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    dispatch(fetchNflState({ signal: ctrl.signal }));
  }, [dispatch, nflState, isLoadingNflState, hasError]);

  useEffect(() => {
    return () => {
      ctrlRef.current?.abort();
    };
  }, []);
}
