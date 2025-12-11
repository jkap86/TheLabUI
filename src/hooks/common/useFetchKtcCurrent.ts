import { fetchKtc } from "@/redux/common/commonActions";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useRef } from "react";
import { AppDispatch, RootState } from "@/redux/store";
import { ktcCurrentMessage } from "@/redux/common/commonSlice";

export default function useFetchKtcCurrent() {
  const dispatch: AppDispatch = useDispatch();
  const { ktcCurrent, isLoadingCommon, errorCommon } = useSelector(
    (state: RootState) => state.common
  );

  const ctrlRef = useRef<AbortController | null>(null);

  const isLoadingKtc = useMemo(
    () => isLoadingCommon.includes(ktcCurrentMessage),
    [isLoadingCommon]
  );
  const hasError = useMemo(() => errorCommon.length > 0, [errorCommon]);

  useEffect(() => {
    if (ktcCurrent || isLoadingKtc || hasError) return;

    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    dispatch(fetchKtc({ signal: ctrl.signal }));
  }, [dispatch, ktcCurrent, isLoadingKtc, hasError]);

  useEffect(() => {
    return () => {
      ctrlRef.current?.abort();
    };
  }, []);
}
