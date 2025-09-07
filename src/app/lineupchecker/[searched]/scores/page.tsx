"use client";

import { use } from "react";
import LineupcheckerLayout from "../lineupchecker-layout";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import LineupcheckerScores from "@/components/lineupchecker-scores/lineupchecker-scores";
//import LeagueScores from "@/components/league-scores/league-scores";

const LivePage = ({ params }: { params: Promise<{ searched: string }> }) => {
  const { searched } = use(params);
  const { matchups } = useSelector((state: RootState) => state.lineupchecker);

  const component = <LineupcheckerScores matchups={Object.values(matchups)} />;

  return <LineupcheckerLayout searched={searched} component={component} />;
};

export default LivePage;
