import { fetchLeagues, fetchUser } from "@/redux/manager/managerActions";
import { resetState } from "@/redux/manager/managerSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useFetchUserAndLeagues = (searched: string) => {
  const dispatch: AppDispatch = useDispatch();
  const { nflState, ktcCurrent, projections } = useSelector(
    (state: RootState) => state.common
  );
  const {
    user,
    isLoadingUser,
    errorUser,
    leagues,
    isLoadingLeagues,
    errorLeagues,
  } = useSelector((state: RootState) => state.manager);

  useEffect(() => {
    if (user?.username?.toLowerCase() !== searched?.toLowerCase()) {
      dispatch(resetState());
    }
  }, []);

  useEffect(() => {
    if (
      !user &&
      !isLoadingUser &&
      !errorUser &&
      nflState &&
      ktcCurrent &&
      projections
    ) {
      dispatch(fetchUser(searched));
    } else if (
      nflState &&
      ktcCurrent &&
      projections &&
      user &&
      !leagues &&
      !isLoadingLeagues &&
      !errorLeagues
    ) {
      dispatch(fetchLeagues({ user, nflState }));
    }
  }, [
    dispatch,
    user,
    isLoadingUser,
    errorUser,
    nflState,
    ktcCurrent,
    projections,
    leagues,
    isLoadingLeagues,
    errorLeagues,
    searched,
  ]);
};
