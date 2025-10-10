import { fetchAllplayers } from "@/redux/common/commonActions";
import { allplayersMessage } from "@/redux/common/commonSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function useFetchAllplayers() {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers, isLoadingCommon, errorCommon } = useSelector(
    (state: RootState) => state.common
  );
  const ctrlRef = useRef<AbortController | null>(null);

  const isLoadingAllplayers = useMemo(
    () => isLoadingCommon.includes(allplayersMessage),
    [isLoadingCommon]
  );

  const hasError = useMemo(() => errorCommon.length > 0, [errorCommon]);

  useEffect(() => {
    if (allplayers || isLoadingAllplayers || hasError) return;

    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    dispatch(fetchAllplayers({ signal: ctrl.signal }));
  }, [dispatch, allplayers, isLoadingAllplayers, hasError]);

  useEffect(() => {
    return () => {
      ctrlRef.current?.abort();
    };
  }, []);
}
