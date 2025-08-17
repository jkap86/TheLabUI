import Avatar from "@/components/avatar/avatar";
import League from "@/components/league/league";
import TableMain from "@/components/table-main/table-main";
import { colObj } from "@/lib/types/commonTypes";
import { League as LeagueType } from "@/lib/types/userTypes";
import { updateLeaguematesState } from "@/redux/leaguemates/leaguematesSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { getLeaguemateHeaders, leagueHeaders } from "@/utils/getLeaguesObj";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const LeaguemateLeagues = ({
  league_ids,
  lmObj,
}: {
  league_ids: string[];
  lmObj: {
    [league_id: string]: { [col_abbrev: string]: colObj };
  };
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { leagues, leaguesValuesObj } = useSelector(
    (state: RootState) => state.manager
  );
  const { leaguesColumn1, leaguesColumn2, leaguesColumn3, leaguesColumn4 } =
    useSelector((state: RootState) => state.leaguemates);
  const [sortBy, setSortBy] = useState<{
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  }>({ column: 0, asc: false });

  const leaguesObj = Object.fromEntries(
    Object.keys(leaguesValuesObj)
      .filter((league_id) => lmObj[league_id])
      .map((league_id) => {
        return [
          league_id,
          {
            ...leaguesValuesObj[league_id],
            ...lmObj[league_id],
          },
        ];
      })
  );

  const leagueLeaguemateHeaders = getLeaguemateHeaders(leagueHeaders);
  return (
    <>
      <div className="nav"></div>
      <TableMain
        type={2}
        headers_options={[...leagueHeaders, ...leagueLeaguemateHeaders]}
        headers_sort={[0, 1, 2, 3, 4]}
        headers={[
          {
            text: "League",
            colspan: 2,
            classname: "",
          },
          {
            text: leaguesColumn1,
            colspan: 1,
            classname: "",
            update: (value) =>
              dispatch(
                updateLeaguematesState({ key: "leaguesColumn1", value })
              ),
          },
          {
            text: leaguesColumn2,
            colspan: 1,
            classname: "",
            update: (value) =>
              dispatch(
                updateLeaguematesState({ key: "leaguesColumn2", value })
              ),
          },
          {
            text: leaguesColumn3,
            colspan: 1,
            classname: "",
            update: (value) =>
              dispatch(
                updateLeaguematesState({ key: "leaguesColumn3", value })
              ),
          },
          {
            text: leaguesColumn4,
            colspan: 1,
            classname: "",
            update: (value) =>
              dispatch(
                updateLeaguematesState({ key: "leaguesColumn4", value })
              ),
          },
        ]}
        data={league_ids.map((league_id) => {
          return {
            id: league_id,
            columns: [
              {
                text: (
                  <Avatar
                    id={leagues?.[league_id].avatar}
                    text={leagues?.[league_id]?.name || league_id}
                    type="L"
                  />
                ),
                colspan: 2,
                classname: "",
                sort: sortBy.asc
                  ? leagues?.[league_id]?.name
                  : -(leagues?.[league_id].index || 0),
              },
              ...[
                leaguesColumn1,
                leaguesColumn2,
                leaguesColumn3,
                leaguesColumn4,
              ].map((col) => {
                const { text, sort, trendColor, classname } = leaguesObj[
                  league_id
                ]?.[col] || {
                  text: "-",
                  sort: 0,
                  trendColor: {},
                  classname: "",
                };
                return {
                  text,
                  sort,
                  style: trendColor,
                  classname,
                  colspan: 1,
                };
              }),
            ],
            secondary: (
              <League type={3} league={leagues?.[league_id] as LeagueType} />
            ),
          };
        })}
        placeholder=""
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </>
  );
};

export default LeaguemateLeagues;
