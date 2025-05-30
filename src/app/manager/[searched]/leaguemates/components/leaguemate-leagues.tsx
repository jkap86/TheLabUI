import Avatar from "@/components/avatar/avatar";
import League from "@/components/league/league";
import TableMain from "@/components/table-main/table-main";
import { League as LeagueType } from "@/lib/types/userTypes";
import { updateLeaguematesState } from "@/redux/leaguemates/leaguematesSlice";
import { AppDispatch, RootState } from "@/redux/store";
import {
  getLeaguesLeaguemateObj,
  getLeaguesObj,
  leagueHeaders,
  leagueLeaguemateHeaders,
} from "@/utils/getLeaguesObj";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

const LeaguemateLeagues = ({
  league_ids,
  lm_user_id,
}: {
  league_ids: string[];
  lm_user_id: string;
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { leagues, leaguesValuesObj } = useSelector(
    (state: RootState) => state.manager
  );
  const { leaguesColumn1, leaguesColumn2, leaguesColumn3, leaguesColumn4 } =
    useSelector((state: RootState) => state.leaguemates);

  const leaguemateLeaguesHeaders = [
    {
      abbrev: "KTC S D QB Rk",
      text: "KTC Starter Dynasty QB Rk",
      desc: "KTC S D QB Rk",
    },
    {
      abbrev: "KTC S D QB Rk L",
      text: "KTC S D QB Rk L",
      desc: "KTC S D QB Rk L",
    },
    {
      abbrev: "KTC S D RB Rk",
      text: "KTC S D RB Rk",
      desc: "KTC S D RB Rk",
    },
    {
      abbrev: "KTC S D RB Rk L",
      text: "KTC S D RB Rk L",
      desc: "KTC S D RB Rk L",
    },
    {
      abbrev: "KTC B D QB Rk",
      text: "KTC B D QB Rk",
      desc: "KTC B D QB Rk",
    },
    {
      abbrev: "KTC B D QB Rk L",
      text: "KTC B D QB Rk L",
      desc: "KTC B D QB Rk L",
    },
    {
      abbrev: "KTC B D RB Rk",
      text: "KTC B D RB Rk",
      desc: "KTC B D RB Rk",
    },
    {
      abbrev: "KTC B D RB Rk L",
      text: "KTC B D RB Rk L",
      desc: "KTC B D RB Rk L",
    },
  ];

  const lmObj = getLeaguesLeaguemateObj(
    league_ids.map((league_id) => {
      return {
        ...(leagues?.[league_id] as LeagueType),
        lm_roster_id: leagues?.[league_id]?.rosters?.find(
          (r) => r.user_id === lm_user_id
        )?.roster_id,
      };
    })
  );

  const leaguesObj = Object.fromEntries(
    Object.keys(leaguesValuesObj).map((league_id) => {
      return [
        league_id,
        {
          ...leaguesValuesObj[league_id],
          ...lmObj[league_id],
        },
      ];
    })
  );

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
                sort: -(leagues?.[league_id].index || 0),
              },
              ...[
                leaguesColumn1,
                leaguesColumn2,
                leaguesColumn3,
                leaguesColumn4,
              ].map((col, index) => {
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
      />
    </>
  );
};

export default LeaguemateLeagues;
