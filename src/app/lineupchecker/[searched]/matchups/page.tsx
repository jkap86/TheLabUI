"use client";

import { RootState } from "@/redux/store";
import { use } from "react";
import { useSelector } from "react-redux";
import LineupcheckerLayout from "../lineupchecker-layout";
import LineupcheckerMatchups from "@/components/lineupchecker-matchups/lineupchecker-matchups";

const Matchups = ({ params }: { params: Promise<{ searched: string }> }) => {
  const { searched } = use(params);
  const { matchups } = useSelector((state: RootState) => state.lineupchecker);

  const component = (
    <LineupcheckerMatchups
      type={1}
      league_matchups={Object.keys(matchups).map((league_id) => {
        return {
          ...matchups[league_id],
          league_id,
        };
      })}
    />
  );

  return <LineupcheckerLayout searched={searched} component={component} />;
};

export default Matchups;
