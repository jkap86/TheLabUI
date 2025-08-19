"use client";

import { use, useMemo, useState } from "react";
import ManagerLayout from "../manager-layout";
import TableMain from "@/components/table-main/table-main";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateLeaguematesState } from "@/redux/leaguemates/leaguematesSlice";
import Avatar from "@/components/avatar/avatar";
import { colObj } from "@/lib/types/commonTypes";
import { filterLeagueIds } from "@/utils/filterLeagues";
import LeaguemateLeagues from "./components/leaguemate-leagues";
import { getTrendColor_Range } from "@/utils/getTrendColor";
import {
  getLeaguemateHeaders,
  getLeaguesObj,
  leagueHeaders,
} from "@/utils/getLeaguesObj";

const Leaguemates = ({ params }: { params: Promise<{ searched: string }> }) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { leaguemates, type1, type2, leagues, leaguesValuesObj, user } =
    useSelector((state: RootState) => state.manager);
  const { column1, column2, column3, column4 } = useSelector(
    (state: RootState) => state.leaguemates
  );
  const [sortBy, setSortBy] = useState<{
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  }>({ column: 1, asc: false });

  const leaguemateHeaders: {
    abbrev: string;
    text: string;
    desc: string;
    key?: string;
  }[] = useMemo(() => {
    return [
      {
        abbrev: "# Common",
        text: "Number of Common Leagues",
        desc: "Number of Common Leagues",
      },
      ...leagueHeaders.map((h) => {
        return {
          ...{
            ...h,
            key: h.abbrev,
          },
        };
      }),
      ...getLeaguemateHeaders(leagueHeaders),
    ];
  }, []);

  const allLmRanks = useMemo(() => {
    const obj: {
      [lm_user_id: string]: {
        [league_id: string]: { [col_abbrev: string]: colObj };
      };
    } = {};

    if (leagues) {
      Object.keys(leaguemates).forEach((lm_user_id) => {
        const common = leaguemates[lm_user_id].leagues;

        const lm_ranks =
          getLeaguesObj(
            common.map((league_id) => leagues[league_id]),
            lm_user_id
          ) || {};

        obj[lm_user_id] = lm_ranks;
      });
    }
    return obj;
  }, [leagues, leaguemates]);

  const leaguematesObj = useMemo(() => {
    const rankAverages: {
      [lm_user_id: string]: { [col_abbrev: string]: colObj };
    } = {};

    if (leagues) {
      Object.keys(leaguemates).forEach((lm_user_id) => {
        const rankAverages_lm: { [col_abbrev: string]: colObj } = {};

        const common = filterLeagueIds(leaguemates[lm_user_id].leagues, {
          type1,
          type2,
          leagues,
        });

        const avg_league_size =
          common.reduce(
            (acc, cur) => acc + (leagues?.[cur].rosters.length || 0),
            0
          ) / common.length;

        const lm_ranks = allLmRanks[lm_user_id] || {};

        console.log({ common, lm_ranks });
        /*
      const getStartingPositionRanks = (
        position: string,
        group: "starters_optimal_dynasty",
        ktcType: "dynasty" | "redraft"
      ) => {
        const user_ranks: number[] = [];
        const lm_ranks: number[] = [];

        common.forEach((league_id) => {
          const ranks = [...(leagues || {})[league_id].rosters].sort((a, b) => {
            const total_a = [...(a[group] || [])]
              .filter(
                (player_id) => allplayers?.[player_id]?.position === position
              )
              .reduce((acc, cur) => acc + (ktcCurrent?.[ktcType][cur] || 0), 0);

            const total_b = [...(b[group] || [])]
              .filter(
                (player_id) => allplayers?.[player_id]?.position === position
              )
              .reduce((acc, cur) => acc + (ktcCurrent?.[ktcType][cur] || 0), 0);

            return total_b - total_a;
          });

          const lm_rank = ranks.findIndex((r) => r.user_id === lm_user_id) + 1;
          lm_ranks.push(lm_rank);

          const user_rank =
            ranks.findIndex(
              (r) => r.roster_id === leagues?.[league_id]?.user_roster.roster_id
            ) + 1;
          user_ranks.push(user_rank);
        });

        return { user_ranks, lm_ranks };
      };

      const getBenchPositionRanks = (
        position: string,
        group: "starters_optimal_dynasty",
        ktcType: "dynasty" | "redraft"
      ) => {
        const user_ranks: number[] = [];
        const lm_ranks: number[] = [];

        common.forEach((league_id) => {
          const ranks = [...(leagues || {})[league_id].rosters].sort((a, b) => {
            const total_a = [...(a.players || [])]
              .filter(
                (player_id) =>
                  allplayers?.[player_id]?.position === position &&
                  !(a[group] || []).includes(player_id)
              )
              .reduce((acc, cur) => acc + (ktcCurrent?.[ktcType][cur] || 0), 0);

            const total_b = [...(b.players || [])]
              .filter(
                (player_id) =>
                  allplayers?.[player_id]?.position === position &&
                  !(b[group] || []).includes(player_id)
              )
              .reduce((acc, cur) => acc + (ktcCurrent?.[ktcType][cur] || 0), 0);

            return total_b - total_a;
          });

          const lm_rank = ranks.findIndex((r) => r.user_id === lm_user_id) + 1;
          lm_ranks.push(lm_rank);

          const user_rank =
            ranks.findIndex(
              (r) => r.roster_id === leagues?.[league_id]?.user_roster.roster_id
            ) + 1;
          user_ranks.push(user_rank);
        });

        return { user_ranks, lm_ranks };
      };

      const { user_ranks: user_qb_d_ranks, lm_ranks: lm_qb_d_ranks } =
        getStartingPositionRanks("QB", "starters_optimal_dynasty", "dynasty");

      const s_qb_d_rk =
        user_qb_d_ranks.length === 0
          ? 0
          : user_qb_d_ranks.reduce((acc, cur) => acc + cur, 0) /
            user_qb_d_ranks.length;

      const s_qb_d_rk_lm =
        lm_qb_d_ranks.length === 0
          ? 0
          : lm_qb_d_ranks.reduce((acc, cur) => acc + cur, 0) /
            lm_qb_d_ranks.length;

      const { user_ranks: user_qb_d_b_ranks, lm_ranks: lm_qb_d_b_ranks } =
        getBenchPositionRanks("QB", "starters_optimal_dynasty", "dynasty");

      const { user_ranks: user_rb_d_ranks, lm_ranks: lm_rb_d_ranks } =
        getStartingPositionRanks("RB", "starters_optimal_dynasty", "dynasty");

      const { user_ranks: user_rb_d_b_ranks, lm_ranks: lm_rb_d_b_ranks } =
        getBenchPositionRanks("RB", "starters_optimal_dynasty", "dynasty");
        */

        for (const { abbrev, key } of leaguemateHeaders.filter(
          (h) => h.key !== undefined || h.abbrev.endsWith("\u0394")
        )) {
          let ranksArray: number[] = [];

          if (abbrev.endsWith(" Lm")) {
            ranksArray = common.flatMap(
              (league_id) => lm_ranks[league_id][key as string]?.sort as number
            );
          } else if (abbrev.endsWith("\u0394")) {
            ranksArray = common.flatMap(
              (league_id) => lm_ranks[league_id][abbrev]?.sort as number
            );
          } else {
            ranksArray = common.flatMap(
              (league_id) =>
                leaguesValuesObj[league_id][key as string]?.sort as number
            );
          }
          const rankAvg =
            ranksArray.length === 0
              ? 0
              : ranksArray.reduce((acc, cur) => acc + cur, 0) /
                ranksArray.length;

          rankAverages_lm[abbrev] = {
            sort: rankAvg,
            text: rankAvg.toFixed(1),
            trendColor: abbrev.endsWith("\u0394")
              ? getTrendColor_Range(
                  rankAvg,
                  -avg_league_size / 2,
                  avg_league_size / 2
                )
              : getTrendColor_Range(rankAvg, 1, avg_league_size, true),
            classname: "rank",
          };
        }

        const dynastyStartingQbsDelta =
          (rankAverages_lm["KTC S QB Rk Lm"]?.sort as number) -
          (rankAverages_lm["KTC S QB Rk"]?.sort as number);

        rankAverages[lm_user_id] = {
          "# Common": {
            text: common.length.toString(),
            sort: common.length,
            trendColor: {},
            classname: "",
          },
          "KTC S QB Rk \u0394": {
            sort: dynastyStartingQbsDelta,
            text: dynastyStartingQbsDelta.toFixed(1),
            trendColor: getTrendColor_Range(
              dynastyStartingQbsDelta,
              -(avg_league_size / 3),
              avg_league_size / 3
            ),
            classname: "",
          },
          ...rankAverages_lm,
        };
      });
    }
    return rankAverages;
  }, [
    leaguemates,
    leagues,
    allLmRanks,
    type1,
    type2,
    leaguemateHeaders,
    leaguesValuesObj,
  ]);

  const component = (
    <TableMain
      type={1}
      headers_options={leaguemateHeaders}
      headers_sort={[1, 0, 2, 3, 4]}
      headers={[
        {
          text: "Leaguemate",
          colspan: 2,
        },
        {
          text: column1,
          colspan: 1,
          update: (value) => {
            dispatch(updateLeaguematesState({ key: "column1", value }));
          },
        },
        {
          text: column2,
          colspan: 1,
          update: (value) => {
            dispatch(updateLeaguematesState({ key: "column2", value }));
          },
        },
        {
          text: column3,
          colspan: 1,
          update: (value) => {
            dispatch(updateLeaguematesState({ key: "column3", value }));
          },
        },
        {
          text: column4,
          colspan: 1,
          update: (value) => {
            dispatch(updateLeaguematesState({ key: "column4", value }));
          },
        },
      ]}
      data={Object.keys(leaguemates)
        .filter((user_id) => parseInt(user_id) && user_id !== user?.user_id)
        .map((user_id) => {
          const common = filterLeagueIds(leaguemates[user_id].leagues, {
            type1,
            type2,
            leagues,
          });
          return {
            id: user_id,
            search: {
              text: leaguemates[user_id].username,
              display: (
                <Avatar
                  id={leaguemates[user_id].avatar}
                  text={leaguemates[user_id].username}
                  type="U"
                />
              ),
            },
            columns: [
              {
                text: (
                  <Avatar
                    id={leaguemates[user_id].avatar}
                    text={leaguemates[user_id].username}
                    type="U"
                  />
                ),
                sort: leaguemates[user_id].username,
                colspan: 2,
                classname: "",
              },
              ...[column1, column2, column3, column4].map((col) => {
                const { text, sort, trendColor, classname } = leaguematesObj[
                  user_id
                ]?.[col] || {
                  text: "-",
                  sort: 0,
                  trendColor: {},
                  classname: "",
                };

                return {
                  text,
                  sort,
                  classname,
                  style: trendColor,
                  colspan: 1,
                };
              }),
            ],
            secondary: (
              <LeaguemateLeagues
                league_ids={common}
                lmObj={allLmRanks[user_id]}
              />
            ),
          };
        })}
      placeholder="Leaguemates"
      sortBy={sortBy}
      setSortBy={setSortBy}
    />
  );

  return <ManagerLayout searched={searched} component={component} />;
};

export default Leaguemates;
