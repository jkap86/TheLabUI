"use client";

import { AppDispatch, RootState } from "@/redux/store";
import { use } from "react";
import { useDispatch, useSelector } from "react-redux";
import LineupcheckerLayout from "../lineupchecker-layout";
import LineupcheckerMatchups from "@/components/lineupchecker-matchups/lineupchecker-matchups";
import { updateLineupcheckerState } from "@/redux/lineupchecker/lineupcheckerSlice";

const Matchups = ({ params }: { params: Promise<{ searched: string }> }) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { matchups, locked } = useSelector(
    (state: RootState) => state.lineupchecker
  );

  const component = (
    <>
      {/*<div className="flex justify-center mb-8 text-[4rem] text-yellow-700">
        {locked ? (
          <i
            className="fa-solid fa-lock"
            onClick={() =>
              dispatch(
                updateLineupcheckerState({ key: "locked", value: false })
              )
            }
          ></i>
        ) : (
          <i
            className="fa-solid fa-lock-open"
            onClick={() =>
              dispatch(updateLineupcheckerState({ key: "locked", value: true }))
            }
          ></i>
        )}
      </div>*/}
      <LineupcheckerMatchups
        type={1}
        league_matchups={Object.keys(matchups).map((league_id) => {
          return {
            ...matchups[league_id],
            league_id,
          };
        })}
      />
    </>
  );

  return <LineupcheckerLayout searched={searched} component={component} />;
};

export default Matchups;
