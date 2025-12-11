import { fetchProjections } from "@/redux/common/commonActions";
import { projectionsMessage } from "@/redux/common/commonSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function useFetchRosProj() {
  const dispatch: AppDispatch = useDispatch();
  const { projections, isLoadingCommon, errorCommon } = useSelector(
    (state: RootState) => state.common
  );

  const ctrlRef = useRef<AbortController | null>(null);

  const isLoadingProj = useMemo(
    () => isLoadingCommon.includes(projectionsMessage),
    [isLoadingCommon]
  );
  const hasError = useMemo(() => errorCommon.length > 0, [errorCommon]);

  useEffect(() => {
    if (projections || isLoadingProj || hasError) return;

    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    dispatch(fetchProjections({ signal: ctrl.signal }));
  }, [dispatch, isLoadingCommon, projections, errorCommon]);

  useEffect(() => {
    return () => {
      ctrlRef.current?.abort();
    };
  }, []);
}
