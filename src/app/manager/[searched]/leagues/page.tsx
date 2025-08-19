"use client";

import { use, useState } from "react";
import ManagerLayout from "../manager-layout";
import TableMain from "@/components/table-main/table-main";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Avatar from "@/components/avatar/avatar";
import { filterLeagueIds } from "@/utils/filterLeagues";
import { League as LeagueType } from "@/lib/types/userTypes";
import League from "@/components/league/league";
import { updateLeaguesState } from "@/redux/leagues/leaguesSlice";
import { leagueHeaders } from "@/utils/getLeaguesObj";

interface LeaguesProps {
  params: Promise<{ searched: string }>;
}

const Leagues = ({ params }: LeaguesProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { leagues, leaguesValuesObj, type1, type2 } = useSelector(
    (state: RootState) => state.manager
  );
  const { column1, column2, column3, column4 } = useSelector(
    (state: RootState) => state.leagues
  );
  const [sortBy, setSortBy] = useState<{
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  }>({ column: 0, asc: false });

  const leaguesObj = leaguesValuesObj;

  const overallRecord = filterLeagueIds(Object.keys(leagues || {}), {
    type1,
    type2,
    leagues,
  }).reduce(
    (acc, cur) => {
      const { wins, losses, ties, fp, fpa } = leagues?.[cur]?.user_roster || {
        wins: 0,
        losses: 0,
        ties: 0,
        fp: 0,
        fpa: 0,
      };
      return {
        wins: acc.wins + wins,
        losses: acc.losses + losses,
        ties: acc.ties + ties,
        fp: acc.fp + fp,
        fpa: acc.fpa + fpa,
      };
    },
    {
      wins: 0,
      losses: 0,
      ties: 0,
      fp: 0,
      fpa: 0,
    }
  );

  const recordTable = (
    <table className="!table-auto !w-[50%] !border-spacing-8 p-4 mx-auto my-8 text-[3rem] text-center bg-gray-700 shadow-[inset_0_0_25rem_var(--color10)], shadow-[0_0_2rem_goldenrod]">
      <tbody>
        <tr className="shadow-[inset_0_0_5rem_var(--color10)]">
          <td>Record</td>
          <td>
            {overallRecord.wins} - {overallRecord.losses}
            {overallRecord.ties ? ` - ${overallRecord.ties}` : ""}
          </td>
          <td>
            <em>
              {overallRecord.wins + overallRecord.losses + overallRecord.ties >
              0
                ? (
                    overallRecord.wins /
                    (overallRecord.wins +
                      overallRecord.losses +
                      overallRecord.ties)
                  ).toFixed(4)
                : ".0000"}
            </em>
          </td>
        </tr>
        <tr className="shadow-[inset_0_0_5rem_var(--color10)]">
          <td>Points For/Against</td>
          <td>
            {overallRecord.fp.toLocaleString("en-US", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </td>
          <td>
            {overallRecord.fpa.toLocaleString("en-US", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </td>
        </tr>
      </tbody>
    </table>
  );

  const current_month_index = new Date().getMonth();
  const component = (
    <>
      <h3 className="text-[2.5rem]">
        League Count:{" "}
        {
          filterLeagueIds(Object.keys(leagues || {}), {
            type1,
            type2,
            leagues,
          }).length
        }
      </h3>
      {current_month_index >= 7 || current_month_index === 0
        ? recordTable
        : null}
      <TableMain
        type={1}
        headers_sort={[0, 1, 2, 3, 4]}
        headers_options={leagueHeaders}
        headers={[
          {
            text: "League",
            colspan: 2,
          },
          {
            text: column1,
            colspan: 1,
            update: (value: string) =>
              dispatch(updateLeaguesState({ key: "column1", value: value })),
          },
          {
            text: column2,
            colspan: 1,
            update: (value: string) =>
              dispatch(updateLeaguesState({ key: "column2", value: value })),
          },
          {
            text: column3,
            colspan: 1,
            update: (value: string) =>
              dispatch(updateLeaguesState({ key: "column3", value: value })),
          },
          {
            text: column4,
            colspan: 1,
            update: (value: string) =>
              dispatch(updateLeaguesState({ key: "column4", value: value })),
          },
        ]}
        data={filterLeagueIds(Object.keys(leagues || {}), {
          type1,
          type2,
          leagues,
        }).map((league_id) => {
          const league = leagues?.[league_id] as LeagueType;

          return {
            id: league.league_id,
            search: {
              text: league.name,
              display: (
                <Avatar id={league.avatar} text={league.name} type="L" />
              ),
            },
            columns: [
              {
                text: <Avatar id={league.avatar} text={league.name} type="L" />,
                sort: sortBy.asc ? league.name : -league.index,
                colspan: 2,
                classname: "",
              },
              ...[column1, column2, column3, column4].map((col) => {
                return {
                  text: leaguesObj?.[league.league_id]?.[col]?.text || "-",
                  sort: leaguesObj?.[league.league_id]?.[col]?.sort || 0,
                  style: leaguesObj?.[league.league_id]?.[col]?.trendColor,
                  colspan: 1,
                  classname: leaguesObj?.[league.league_id]?.[col]?.classname,
                };
              }),
            ],
            secondary: <League league={league} type={2} />,
          };
        })}
        placeholder="Leagues"
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </>
  );

  return <ManagerLayout searched={searched} component={component} />;
};

export default Leagues;
