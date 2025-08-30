"use client";

import { useEffect } from "react";
import LineupcheckerMatchups from "../lineupchecker-matchups/lineupchecker-matchups";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import LineupcheckerStartBenchOver from "../lineupchecker-startbenchover/lineupchecker-startbenchover";
import { updateLineupcheckerState } from "@/redux/lineupchecker/lineupcheckerSlice";

const PlayerMatchups = ({
  player_id1,
  start,
  bench,
  opp_start,
  opp_bench,
  started_over,
  benched_for,
}: {
  player_id1: string;
  start: string[];
  bench: string[];
  opp_start: string[];
  opp_bench: string[];
  started_over: {
    [player_id: string]: {
      league_id: string;
      starter_proj: number;
      bench_proj: number;
    }[];
  };
  benched_for: {
    [player_id: string]: {
      league_id: string;
      starter_proj: number;
      bench_proj: number;
    }[];
  };
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { matchups } = useSelector((state: RootState) => state.lineupchecker);
  const { playersTab, playersTab2, matchupsType } = useSelector(
    (state: RootState) => state.lineupchecker
  );

  useEffect(() => {
    let col1;
    let col2;
    let col3;

    if (playersTab2 === "Start Over") {
      col1 = "# Start Over";
      col2 = "Sub Avg S Proj";
      col3 = "Player2 Avg S";
    } else {
      col1 = "# Bench For";
      col2 = "Sub Avg B Proj";
      col3 = "Player2 Avg B";
    }

    dispatch(updateLineupcheckerState({ key: "playersCol1", value: col1 }));
    dispatch(updateLineupcheckerState({ key: "playersCol2", value: col2 }));
    dispatch(updateLineupcheckerState({ key: "playersCol3", value: col3 }));
  }, [playersTab2, dispatch]);

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
        {["Leagues", "Players"].map((label) => {
          return (
            <button
              key={label}
              value={playersTab}
              onClick={() =>
                dispatch(
                  updateLineupcheckerState({ key: "playersTab", value: label })
                )
              }
              className={playersTab === label ? "active" : ""}
            >
              {label}
            </button>
          );
        })}
      </div>
      {playersTab === "Leagues" ? (
        <div className="nav">
          {["Start", "Bench", "Opp Start", "Opp Bench"].map((label) => {
            return (
              <button
                key={label}
                onClick={() =>
                  dispatch(
                    updateLineupcheckerState({
                      key: "matchupsType",
                      value: label,
                    })
                  )
                }
                className={matchupsType === label ? "active" : ""}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="nav">
          {["Start Over", "Bench For"].map((label) => {
            return (
              <button
                key={label}
                onClick={() =>
                  dispatch(
                    updateLineupcheckerState({
                      key: "playersTab2",
                      value: label,
                    })
                  )
                }
                className={playersTab2 === label ? "active" : ""}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
      {playersTab === "Leagues" ? (
        <LineupcheckerMatchups type={2} league_matchups={matchupsView} />
      ) : (
        <LineupcheckerStartBenchOver
          player_id1={player_id1}
          started_over={started_over}
          benched_for={benched_for}
        />
      )}
    </>
  );
};

export default PlayerMatchups;
