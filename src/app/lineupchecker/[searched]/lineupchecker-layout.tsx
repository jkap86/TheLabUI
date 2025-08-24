"use client";

import { JSX } from "react";
import LoadingIcon from "@/components/loading-icon/loading-icon";
import useFetchMatchups from "@/hooks/lineupchecker/useFetchMatchups";
import useFetchAllplayers from "@/hooks/useFetchAllplayers";
import useFetchNflState from "@/hooks/useFetchNflState";
import Link from "next/link";
import Avatar from "@/components/avatar/avatar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import LeagueTypeSwitch from "@/components/leagueTypeSwitch/leagueTypeSwitch";
import { usePathname, useRouter } from "next/navigation";
import ShNavbar from "@/components/sh-navbar/sh-navbar";

interface LayoutProps {
  searched: string;
  component: JSX.Element;
}

const LineupcheckerLayout = ({ searched, component }: LayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { type1, type2 } = useSelector((state: RootState) => state.manager);
  const { isLoadingMatchups, matchups } = useSelector(
    (state: RootState) => state.lineupchecker
  );

  useFetchNflState();
  useFetchAllplayers();
  useFetchMatchups({ searched });

  const proj_record = Object.values(matchups)
    .filter(
      (m) =>
        (type1 === "All" ||
          (type1 === "Redraft" && m.settings.type !== 2) ||
          (type1 === "Dynasty" && m.settings.type === 2)) &&
        (type2 === "All" ||
          (type2 === "Bestball" && m.settings.best_ball === 1) ||
          (type2 === "Lineup" && m.settings.best_ball !== 1))
    )
    .reduce(
      (acc, cur) => {
        const key = "projection_current";
        const user_proj = cur.user_matchup[key];
        const opp_proj = cur.opp_matchup[key];

        const resultOpp =
          user_proj > opp_proj
            ? "W"
            : user_proj < opp_proj
            ? "L"
            : user_proj === opp_proj
            ? "T"
            : "-";

        const median = cur.user_matchup.league.settings.league_average_match
          ? cur.league_matchups.reduce(
              (acc, cur2) => acc + (cur2[key] || 0),
              0
            ) / cur.league_matchups.length
          : false;

        const resultMedian = median
          ? user_proj < median
            ? "L"
            : user_proj > median
            ? "W"
            : user_proj === median
            ? "T"
            : ""
          : "";

        return {
          wins_opp: acc.wins_opp + (resultOpp === "W" ? 1 : 0),
          losses_opp: acc.losses_opp + (resultOpp === "L" ? 1 : 0),
          ties_opp: acc.ties_opp + (resultOpp === "T" ? 1 : 0),
          wins_med: acc.wins_med + (resultMedian === "W" ? 1 : 0),
          losses_med: acc.losses_med + (resultMedian === "L" ? 1 : 0),
          ties_med: acc.ties_med + (resultMedian === "T" ? 1 : 0),
        };
      },
      {
        wins_opp: 0,
        losses_opp: 0,
        ties_opp: 0,
        wins_med: 0,
        losses_med: 0,
        ties_med: 0,
      }
    );

  const recordTable = (
    <table className="!table-auto !w-fit !border-spacing-8 p-4 m-auto text-[3rem] text-center bg-gray-700 shadow-[inset_0_0_25rem_var(--color10)], shadow-[0_0_2rem_goldenrod]">
      <tbody>
        <tr>
          <td className="font-chill text-[3rem]" colSpan={3}>
            Projected Record
          </td>
        </tr>
        <tr className="shadow-[inset_0_0_5rem_var(--color10)]">
          <td className="font-metal px-8 py-4">vs Opponent</td>
          <td className="font-pulang px-8 py-4">
            {proj_record.wins_opp} - {proj_record.losses_opp}
            {proj_record.ties_opp ? ` - ${proj_record.ties_opp}` : ""}
          </td>
          <td className="px-8 py-4">
            <em className="font-pulang">
              {(
                proj_record.wins_opp /
                (proj_record.wins_opp +
                  proj_record.losses_opp +
                  proj_record.ties_opp)
              ).toFixed(4)}
            </em>
          </td>
        </tr>
        <tr className="shadow-[inset_0_0_5rem_var(--color10)]">
          <td className="font-metal px-8 py-4">vs Median</td>
          <td className="font-pulang px-8 py-4">
            {proj_record.wins_med} - {proj_record.losses_med}
            {proj_record.ties_med ? ` - ${proj_record.ties_med}` : ""}
          </td>
          <td>
            <em className="font-pulang px-8 py-4">
              {(
                proj_record.wins_med /
                (proj_record.wins_med +
                  proj_record.losses_med +
                  proj_record.ties_med)
              ).toFixed(4)}
            </em>
          </td>
        </tr>
        <tr className="shadow-[inset_0_0_5rem_var(--color10)]">
          <td className="font-metal px-8 py-4">Total</td>
          <td className="font-pulang px-8 py-4">
            {proj_record.wins_opp + proj_record.wins_med} -{" "}
            {proj_record.losses_opp + proj_record.losses_med}
            {proj_record.ties_opp + proj_record.ties_med
              ? ` - ${proj_record.ties_opp + proj_record.ties_med}`
              : ""}
          </td>
          <td className="px-8 py-4">
            <em className="font-pulang">
              {(
                (proj_record.wins_opp + proj_record.wins_med) /
                (proj_record.wins_opp +
                  proj_record.wins_med +
                  proj_record.losses_opp +
                  proj_record.losses_med +
                  proj_record.ties_opp +
                  proj_record.ties_med)
              ).toFixed(4)}
            </em>
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div className="h-[100dvh] flex flex-col justify-between">
      <ShNavbar />

      <div className="flex-1 flex flex-col">
        <div className="relative">
          <Link href={"/lineupchecker"} className="home">
            Lineup Checker Home
          </Link>
          {Object.values(matchups)[0]?.user_matchup?.username ? (
            <>
              <div className="heading pt-[5rem]">
                <h1 className="tool-title !text-[5rem] ![text-shadow:0_0_.5rem_red]">
                  Lineup Checker
                </h1>

                <h1>
                  <Avatar
                    id={Object.values(matchups)[0]?.user_matchup?.avatar}
                    type="U"
                    text={Object.values(matchups)[0]?.user_matchup?.username}
                  />
                </h1>
              </div>

              <LeagueTypeSwitch />
            </>
          ) : null}
        </div>
        {isLoadingMatchups ? (
          <div className="flex-1 flex flex-col justify-center items-center">
            <LoadingIcon messages={[]} />
          </div>
        ) : (
          <div className="flex-1">
            {recordTable}
            <br />
            <h2>
              <select
                onChange={(e) =>
                  router.push(
                    pathname.replace(pathname.split("/")[3], e.target.value)
                  )
                }
                value={pathname.split("/")[3]}
                className="font-metal text-[var(--color1)] p-8 text-[4rem]"
              >
                <option>matchups</option>
                <option>starters</option>
              </select>
            </h2>
            {component}
          </div>
        )}
      </div>
    </div>
  );
};

export default LineupcheckerLayout;
