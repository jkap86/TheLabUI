"use client";

import Avatar from "@/components/avatar/avatar";
import LeagueMatchups from "@/components/league-matchups/league-matchups";
import LeagueTypeSwitch from "@/components/leagueTypeSwitch/leagueTypeSwitch";
import LoadingIcon from "@/components/loading-icon/loading-icon";
import TableMain from "@/components/table-main/table-main";
import useFetchMatchups from "@/hooks/lineupchecker/useFetchMatchups";
import useFetchAllplayers from "@/hooks/useFetchAllplayers";
import useFetchNflState from "@/hooks/useFetchNflState";
import { RootState } from "@/redux/store";

import Link from "next/link";
import { use } from "react";
import { useSelector } from "react-redux";

const Matchups = ({ params }: { params: Promise<{ searched: string }> }) => {
  const { searched } = use(params);
  const { type1, type2 } = useSelector((state: RootState) => state.manager);
  const { isLoadingMatchups, matchups } = useSelector(
    (state: RootState) => state.lineupchecker
  );
  useFetchNflState();
  useFetchAllplayers();
  useFetchMatchups({ searched });

  console.log({ matchups });
  const headers = [
    {
      text: "League",
      colspan: 2,
      classname: "",
    },
    {
      text: "Opt-Act",
      colspan: 1,
      classname: "",
    },
  ];

  const data = Object.keys(matchups)
    .filter(
      (league_id) =>
        (type1 === "All" ||
          (type1 === "Redraft" && matchups[league_id].settings.type !== 2) ||
          (type1 === "Dynasty" && matchups[league_id].settings.type === 2)) &&
        (type2 === "All" ||
          (type2 === "Bestball" &&
            matchups[league_id].settings.best_ball === 1) ||
          (type2 === "Lineup" && matchups[league_id].settings.best_ball !== 1))
    )
    .sort((a, b) => matchups[a].league_index - matchups[b].league_index)
    .map((league_id) => {
      const matchup = matchups[league_id];

      const { text, classname } =
        matchup.user_matchup.projection_current ===
        matchup.user_matchup.projection_optimal
          ? { text: <>&#10004;&#xfe0e;</>, classname: "green" }
          : {
              text: (
                matchup.user_matchup.projection_optimal -
                matchup.user_matchup.projection_current
              ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
              classname: "red",
            };
      return {
        id: league_id,
        columns: [
          {
            text: (
              <Avatar
                id={matchup.league_avatar}
                text={matchup.league_name}
                type="L"
              />
            ),
            colspan: 2,
            classname: "",
            sort: -matchup.league_index,
          },
          {
            text: text,
            colspan: 1,
            classname: classname,
          },
        ],
        secondary: <LeagueMatchups matchup={matchups[league_id]} />,
      };
    });

  return (
    <>
      <Link href={"/"} className="home">
        Home
      </Link>
      <LeagueTypeSwitch />
      {isLoadingMatchups ? (
        <LoadingIcon messages={[]} />
      ) : (
        <TableMain type={1} headers={headers} data={data} placeholder="" />
      )}
    </>
  );
};

export default Matchups;
