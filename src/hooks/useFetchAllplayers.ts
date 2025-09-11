import { fetchAllplayers } from "@/redux/common/commonActions";
import { allplayersMessage } from "@/redux/common/commonSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function useFetchAllplayers() {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers, isLoadingCommon, errorCommon } = useSelector(
    (state: RootState) => state.common
  );

  useEffect(() => {
    if (
      !allplayers &&
      !isLoadingCommon.includes(allplayersMessage) &&
      errorCommon.length === 0
    )
      dispatch(fetchAllplayers());
  }, [dispatch, allplayers, isLoadingCommon, errorCommon]);
}
