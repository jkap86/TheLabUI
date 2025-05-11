import { fetchKtc } from "@/redux/commonActions";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { AppDispatch, RootState } from "@/redux/store";
import { ktcCurrentMessage } from "@/redux/commonSlice";

export default function useFetchKtcCurrent() {
  const dispatch: AppDispatch = useDispatch();
  const { ktcCurrent, isLoadingCommon, errorCommon } = useSelector(
    (state: RootState) => state.common
  );

  useEffect(() => {
    if (
      !ktcCurrent &&
      !isLoadingCommon.includes(ktcCurrentMessage) &&
      errorCommon.length === 0
    ) {
      dispatch(fetchKtc());
    }
  }, [dispatch, ktcCurrent, isLoadingCommon]);
}
