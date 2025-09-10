"use client";

import { JSX } from "react";
import LoadingIcon from "@/components/loading-icon/loading-icon";
import useFetchMatchups from "@/hooks/lineupchecker/useFetchMatchups";
import useFetchAllplayers from "@/hooks/useFetchAllplayers";
import useFetchNflState from "@/hooks/useFetchNflState";
import Link from "next/link";
import Avatar from "@/components/avatar/avatar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import LeagueTypeSwitch from "@/components/leagueTypeSwitch/leagueTypeSwitch";
import { usePathname, useRouter } from "next/navigation";
import ShNavbar from "@/components/sh-navbar/sh-navbar";
import "../../../components/heading/heading.css";
import useFetchLive from "@/hooks/lineupchecker/useFetchLive";
import { getMedian } from "@/utils/getOptimalStarters";
import { updateLineupcheckerState } from "@/redux/lineupchecker/lineupcheckerSlice";

interface LayoutProps {
  searched: string;
  component: JSX.Element;
}

const LineupcheckerLayout = ({ searched, component }: LayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch: AppDispatch = useDispatch();
  const { type1, type2 } = useSelector((state: RootState) => state.manager);
  const {
    user,
    isLoadingUserLeagueIds,
    errorLoadingUserLeagueIds,
    isLoadingMatchups,
    errorMatchups,
    matchups,
    isUpdatingMatchups,
    matchupsProgress,
    recordTab,
  } = useSelector((state: RootState) => state.lineupchecker);

  const setRecordTab = (value: "Original" | "Live") => {
    dispatch(updateLineupcheckerState({ key: "recordTab", value }));
  };

  useFetchNflState();
  useFetchAllplayers();
  useFetchMatchups({ searched });
  useFetchLive();

  const orig_proj = Object.values(matchups)
    .filter(
      (m) =>
        (type1 === "All" ||
          (type1 === "Redraft" && m.league.settings.type !== 2) ||
          (type1 === "Dynasty" && m.league.settings.type === 2)) &&
        (type2 === "All" ||
          (type2 === "Bestball" && m.league.settings.best_ball === 1) ||
          (type2 === "Lineup" && m.league.settings.best_ball !== 1))
    )
    .reduce(
      (acc, cur) => {
        const key = "projection_current";
        const user_proj = cur.user_matchup[key];
        const opp_proj = cur.opp_matchup?.[key];

        const resultOpp =
          user_proj && opp_proj
            ? user_proj > opp_proj
              ? "W"
              : user_proj < opp_proj
              ? "L"
              : "T"
            : "-";

        const median = cur.league.settings.league_average_match
          ? getMedian(cur.league_matchups, key)
          : false;

        const resultMedian = median
          ? user_proj < median
            ? "L"
            : user_proj > median
            ? "W"
            : "T"
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

  const live_proj = Object.values(matchups)
    .filter(
      (m) =>
        (type1 === "All" ||
          (type1 === "Redraft" && m.league.settings.type !== 2) ||
          (type1 === "Dynasty" && m.league.settings.type === 2)) &&
        (type2 === "All" ||
          (type2 === "Bestball" && m.league.settings.best_ball === 1) ||
          (type2 === "Lineup" && m.league.settings.best_ball !== 1))
    )
    .reduce(
      (acc, cur) => {
        const key = "live_projection_current";
        const user_proj = cur.user_matchup[key] ?? 0;
        const opp_proj = cur.opp_matchup?.[key];

        const resultOpp =
          user_proj && opp_proj
            ? user_proj > opp_proj
              ? "W"
              : user_proj < opp_proj
              ? "L"
              : "T"
            : "-";

        const median = cur.league.settings.league_average_match
          ? getMedian(cur.league_matchups, key)
          : false;

        const resultMedian = median
          ? user_proj < median
            ? "L"
            : user_proj > median
            ? "W"
            : "T"
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

  const getRecordTable = (proj_record: {
    wins_opp: number;
    losses_opp: number;
    ties_opp: number;
    wins_med: number;
    losses_med: number;
    ties_med: number;
  }) => {
    return (
      <>
        <tr className="shadow-[inset_0_0_5rem_var(--color10)]">
          <td className="font-metal px-8 py-4">vs Opponent</td>
          <td className="font-pulang px-8 py-4">
            {isUpdatingMatchups ? (
              <i className="fa-solid fa-spinner fa-spin text-[var(--color1)]"></i>
            ) : (
              <>
                {proj_record.wins_opp} - {proj_record.losses_opp}
                {proj_record.ties_opp ? ` - ${proj_record.ties_opp}` : ""}
              </>
            )}
          </td>
          <td className="px-8 py-4">
            <em className="font-pulang">
              {isUpdatingMatchups ? (
                <i className="fa-solid fa-spinner fa-spin text-[var(--color1)]"></i>
              ) : (
                <>
                  {(
                    proj_record.wins_opp /
                    (proj_record.wins_opp +
                      proj_record.losses_opp +
                      proj_record.ties_opp)
                  ).toFixed(4)}
                </>
              )}
            </em>
          </td>
        </tr>
        <tr className="shadow-[inset_0_0_5rem_var(--color10)]">
          <td className="font-metal px-8 py-4">vs Median</td>
          <td className="font-pulang px-8 py-4">
            {isUpdatingMatchups ? (
              <i className="fa-solid fa-spinner fa-spin text-[var(--color1)]"></i>
            ) : (
              <>
                {proj_record.wins_med} - {proj_record.losses_med}
                {proj_record.ties_med ? ` - ${proj_record.ties_med}` : ""}
              </>
            )}
          </td>
          <td>
            <em className="font-pulang px-8 py-4">
              {isUpdatingMatchups ? (
                <i className="fa-solid fa-spinner fa-spin text-[var(--color1)]"></i>
              ) : (
                (
                  proj_record.wins_med /
                  (proj_record.wins_med +
                    proj_record.losses_med +
                    proj_record.ties_med)
                ).toFixed(4)
              )}
            </em>
          </td>
        </tr>
        <tr className="shadow-[inset_0_0_5rem_var(--color10)]">
          <td className="font-metal px-8 py-4">Total</td>
          <td className="font-pulang px-8 py-4">
            {isUpdatingMatchups ? (
              <i className="fa-solid fa-spinner fa-spin text-[var(--color1)]"></i>
            ) : (
              <>
                {proj_record.wins_opp + proj_record.wins_med} -{" "}
                {proj_record.losses_opp + proj_record.losses_med}
                {proj_record.ties_opp + proj_record.ties_med
                  ? ` - ${proj_record.ties_opp + proj_record.ties_med}`
                  : ""}
              </>
            )}
          </td>
          <td className="px-8 py-4">
            <em className="font-pulang">
              {isUpdatingMatchups ? (
                <i className="fa-solid fa-spinner fa-spin text-[var(--color1)]"></i>
              ) : (
                (
                  (proj_record.wins_opp + proj_record.wins_med) /
                  (proj_record.wins_opp +
                    proj_record.wins_med +
                    proj_record.losses_opp +
                    proj_record.losses_med +
                    proj_record.ties_opp +
                    proj_record.ties_med)
                ).toFixed(4)
              )}
            </em>
          </td>
        </tr>
      </>
    );
  };

  const recordTableOriginal = getRecordTable(orig_proj);

  const recordTableLive = getRecordTable(live_proj);

  return (
    <div className="h-[100dvh] flex flex-col justify-between">
      <ShNavbar />

      <div className="flex-1 flex flex-col">
        <div className="relative">
          <Link href={"/lineupchecker"} className="home">
            Lineup Checker Home
          </Link>
          {user?.username ? (
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
          ) : (
            errorLoadingUserLeagueIds || errorMatchups
          )}
        </div>
        {isLoadingUserLeagueIds || isLoadingMatchups ? (
          <div className="flex-1 flex flex-col justify-center items-center">
            <LoadingIcon
              messages={[`${matchupsProgress} League matchups Loaded`]}
            />
          </div>
        ) : (
          <div className="flex-1">
            <table className="!table-auto !w-[75rem] !border-spacing-8 p-4 m-auto text-[3rem] text-center bg-gray-700 shadow-[inset_0_0_25rem_var(--color10)], shadow-[0_0_2rem_goldenrod]">
              <tbody>
                <tr>
                  <td
                    className={
                      "text-[3rem]" +
                      (recordTab === "Original" ? " text-[var(--color1)]" : "")
                    }
                    onClick={() => setRecordTab("Original")}
                  >
                    Original
                  </td>
                  <td></td>
                  <td
                    className={
                      "text-[3rem]" +
                      (recordTab === "Live" ? " text-[var(--color1)]" : "")
                    }
                    onClick={() => setRecordTab("Live")}
                  >
                    Live
                  </td>
                </tr>
                <tr>
                  <td className="font-chill text-[4rem]" colSpan={3}>
                    Projected Record
                  </td>
                </tr>
                {recordTab === "Original"
                  ? recordTableOriginal
                  : recordTab === "Live"
                  ? recordTableLive
                  : null}
              </tbody>
            </table>
            <br />
            <h2>
              <select
                onChange={(e) =>
                  router.push(
                    pathname.replace(pathname.split("/")[3], e.target.value)
                  )
                }
                value={pathname.split("/")[3]}
                className="font-metal text-[var(--color1)] p-8 text-[4rem] text-center"
              >
                <option>matchups</option>
                <option>starters</option>
                <option>projections</option>
                <option>scores</option>
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
