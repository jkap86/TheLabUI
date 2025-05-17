"use client";

import LeagueTypeSwitch from "@/components/leagueTypeSwitch/leagueTypeSwitch";
import useFetchMatchups from "@/hooks/lineupchecker/useFetchMatchups";
import useFetchNflState from "@/hooks/useFetchNflState";
import Link from "next/link";

const Matchups = () => {
  useFetchNflState();
  useFetchMatchups({ searched: "jkap86" });

  return (
    <>
      <Link href={"/"} className="home">
        Home
      </Link>
      <LeagueTypeSwitch />
    </>
  );
};

export default Matchups;
