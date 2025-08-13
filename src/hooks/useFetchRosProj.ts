import { fetchProjections } from "@/redux/commonActions";
import { projectionsMessage } from "@/redux/commonSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function useFetchRosProj() {
  const dispatch: AppDispatch = useDispatch();
  const { projections, isLoadingCommon, errorCommon } = useSelector(
    (state: RootState) => state.common
  );

  useEffect(() => {
    if (
      !projections &&
      !isLoadingCommon.includes(projectionsMessage) &&
      errorCommon.length === 0
    ) {
      dispatch(fetchProjections());
    }
  }, [dispatch, isLoadingCommon, projections, errorCommon]);
}
