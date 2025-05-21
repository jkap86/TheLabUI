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

interface LoadCommonDataProps {
  searched: string;
  component: JSX.Element;
}

const ManagerLayout = ({ searched, component }: LoadCommonDataProps) => {
  const { isLoadingCommon, errorCommon } = useSelector(
    (state: RootState) => state.common
  );
  const {
    isLoadingUser,
    errorUser,
    isLoadingLeagues,
    leagues,
    leaguesProgress,
    errorLeagues,
  } = useSelector((state: RootState) => state.manager);

  useFetchNflState();
  useFetchAllplayers();
  useFetchKtcCurrent();
  useFetchRosProj();

  useFetchUserAndLeagues(searched);

  return (
    <>
      <ShNavbar />
      {errorCommon.length > 0 &&
        errorCommon.map((err) => {
          return <h5>{err}</h5>;
        })}

      {errorUser}
      {isLoadingCommon.length > 0 || isLoadingUser ? (
        <LoadingIcon messages={[]} />
      ) : (
        <Heading />
      )}
      {isLoadingCommon.length > 0 || isLoadingUser ? null : isLoadingLeagues ? (
        <LoadingIcon messages={[`${leaguesProgress} Leagues Loaded`]} />
      ) : (
        component
      )}
    </>
  );
};

export default ManagerLayout;
