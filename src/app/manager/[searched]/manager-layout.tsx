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
  const { isLoadingCommon, errorCommon } = useSelector(
    (state: RootState) => state.common
  );
  const { isLoadingUser, errorUser, isLoadingLeagues, leaguesProgress } =
    useSelector((state: RootState) => state.manager);

  useFetchNflState();
  useFetchAllplayers();
  useFetchKtcCurrent();
  useFetchRosProj();

  useFetchUserAndLeagues(searched);
  useFetchLmTrades();

  const errors = [...errorCommon, errorUser].filter((e) => e);

  return (
    <div className="">
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
      ) : isLoadingCommon.length > 0 || isLoadingUser ? (
        <LoadingIcon messages={[]} />
      ) : (
        <>
          <Heading />
          {isLoadingCommon.length > 0 ||
          isLoadingUser ? null : isLoadingLeagues ? (
            <LoadingIcon messages={[`${leaguesProgress} Leagues Loaded`]} />
          ) : (
            component
          )}
        </>
      )}
    </div>
  );
};

export default ManagerLayout;
