"use client";

import { useState } from "react";
import LineupcheckerMatchups from "../lineupchecker-matchups/lineupchecker-matchups";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const PlayerMatchups = ({
  start,
  bench,
  opp_start,
  opp_bench,
}: {
  start: string[];
  bench: string[];
  opp_start: string[];
  opp_bench: string[];
}) => {
  const { matchups } = useSelector((state: RootState) => state.lineupchecker);
  const [matchupsType, setMatchupsType] = useState("Start");

  const league_ids =
    matchupsType === "Start"
      ? start
      : matchupsType === "Bench"
      ? bench
      : matchupsType === "Opp Start"
      ? opp_start
      : matchupsType === "Opp Bench"
      ? opp_bench
      : [];

  const matchupsView = league_ids.map((league_id) => {
    return {
      ...matchups[league_id],
      league_id,
    };
  });

  return (
    <>
      <div className="nav">
        {["Start", "Bench", "Opp Start", "Opp Bench"].map((label) => {
          return (
            <button
              key={label}
              value={matchupsType}
              onClick={() => setMatchupsType(label)}
              className={matchupsType === label ? "active" : ""}
            >
              {label}
            </button>
          );
        })}
      </div>
      <LineupcheckerMatchups type={2} league_matchups={matchupsView} />
    </>
  );
};

export default PlayerMatchups;
