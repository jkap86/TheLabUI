"use client";

import { use, useMemo } from "react";
import ManagerLayout from "../manager-layout";
import TableMain from "@/components/table-main/table-main";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Avatar from "@/components/avatar/avatar";
import { filterLeagueIds } from "@/utils/filterLeagues";
import { League as LeagueType } from "@/lib/types/userTypes";
import { getKtcAvgValue } from "@/utils/getKtcRanks";
import League from "@/components/league/league";
import { updateLeaguesState } from "@/redux/leagues/leaguesSlice";
import { getLeaguesObj, leagueHeaders } from "@/utils/getLeaguesObj";

interface LeaguesProps {
  params: Promise<{ searched: string }>;
}

const Leagues = ({ params }: LeaguesProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { leagues } = useSelector((state: RootState) => state.manager);
  const { column1, column2, column3, column4 } = useSelector(
    (state: RootState) => state.leagues
  );

  const leaguesObj = useMemo(() => {
    return getLeaguesObj(Object.values(leagues || {}));
  }, [leagues, getKtcAvgValue]);

  const component = (
    <>
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
        data={filterLeagueIds(Object.keys(leagues || {})).map((league_id) => {
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
                sort: -league.index,
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
      />
    </>
  );

  return <ManagerLayout searched={searched} component={component} />;
};

export default Leagues;
