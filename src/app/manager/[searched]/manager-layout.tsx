"use client";

import { JSX } from "react";
import LoadingIcon from "@/components/loading-icon/loading-icon";
import useFetchNflState from "@/hooks/useFetchNflState";
import useFetchAllplayers from "@/hooks/useFetchAllplayers";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import useFetchKtcCurrent from "@/hooks/useFetchKtcCurrent";
import { useFetchUserAndLeagues } from "@/hooks/manager/useFetchUserAndLeagues";
import Heading from "@/components/heading/heading";
import ShNavbar from "@/components/sh-navbar/sh-navbar";
import useFetchRosProj from "@/hooks/useFetchRosProj";
import { useFetchLmTrades } from "@/hooks/manager/useFetchLmTrades";

interface LoadCommonDataProps {
  searched: string;
  component: JSX.Element;
}

const ManagerLayout = ({ searched, component }: LoadCommonDataProps) => {
  const { isLoadingCommon, errorCommon, nflState, allplayers } = useSelector(
    (state: RootState) => state.common
  );
  const {
    user,
    leagues,
    isLoadingUser,
    errorUser,
    isLoadingLeagues,
    errorLeagues,
    leaguesProgress,
  } = useSelector((state: RootState) => state.manager);

  useFetchNflState();
  useFetchAllplayers();
  useFetchKtcCurrent();
  useFetchRosProj();

  useFetchUserAndLeagues(searched);
  useFetchLmTrades();

  const errors = [...errorCommon, errorUser, errorLeagues].filter((e) => e);

  return (
    <div className="h-[100dvh] flex flex-col justify-between">
      <ShNavbar />
      {errors.length > 0 ? (
        <div className="h-screen flex-1 overflow-auto flex flex-col justify-center items-center">
          {errors.map((error) => {
            return (
              <div
                key={error}
                className="text-[5rem] text-red-600 font-black font-score"
              >
                {error}
              </div>
            );
          })}
        </div>
      ) : !allplayers || !nflState || isLoadingCommon.length > 0 || !user ? (
        <div className="flex-1 flex flex-col justify-center items-center">
          <LoadingIcon messages={[]} />
        </div>
      ) : (
        <div className="flex-1">
          <Heading />
          {isLoadingCommon.length > 0 ||
          isLoadingUser ||
          isLoadingLeagues ||
          leagues === null ? (
            <LoadingIcon messages={[`${leaguesProgress} Leagues Loaded`]} />
          ) : (
            component
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerLayout;
