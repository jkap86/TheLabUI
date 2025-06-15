"use client";

import { use, useMemo } from "react";
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

const Leaguemates = ({ params }: { params: Promise<{ searched: string }> }) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { allplayers, ktcCurrent } = useSelector(
    (state: RootState) => state.common
  );
  const { leaguemates, type1, type2, leagues } = useSelector(
    (state: RootState) => state.manager
  );
  const { column1, column2, column3, column4 } = useSelector(
    (state: RootState) => state.leaguemates
  );

  const leaguemateHeaders = [
    {
      abbrev: "# Common",
      text: "Number of Common Leagues",
      desc: "Number of Common Leagues",
    },
    {
      abbrev: "B QB D Rk",
      text: "Bench QBs Dynasty Rank",
      desc: "Rank of the total KTC value of bench QBs",
    },
    {
      abbrev: "B QB D Rk L",
      text: "Bench QBs Dynasty Rank - Leaguemate",
      desc: "Leaguemate's Rank of the total KTC value of bench QBs",
    },

    {
      abbrev: "B RB D Rk",
      text: "Bench RBs Dynasty Rank",
      desc: "Rank of the total KTC value of bench RBs",
    },
    {
      abbrev: "B RB D Rk L",
      text: "Bench RBs Dynasty Rank - Leaguemate",
      desc: "Leaguemate's Rank of the total KTC value of bench RBs",
    },
  ];

  const leaguematesObj = useMemo(() => {
    const obj: { [user_id: string]: { [col_abbrev: string]: colObj } } = {};

    Object.keys(leaguemates).forEach((lm_user_id) => {
      const common = filterLeagueIds(leaguemates[lm_user_id].leagues);

      const avg_league_size =
        common.reduce(
          (acc, cur) => acc + (leagues?.[cur].rosters.length || 0),
          0
        ) / common.length;

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

      obj[lm_user_id] = {
        "# Common": {
          text: common.length.toString(),
          sort: common.length,
          trendColor: {},
          classname: "",
        },

        "S QB D Rk": {
          text: s_qb_d_rk.toLocaleString("en-US", { maximumFractionDigits: 1 }),
          sort: s_qb_d_rk,
          trendColor: getTrendColor_Range(s_qb_d_rk, 1, avg_league_size, true),
          classname: "",
        },
        "S QB D Rk Lm": {
          text: s_qb_d_rk_lm.toLocaleString("en-US", {
            maximumFractionDigits: 1,
          }),
          sort: s_qb_d_rk_lm,
          trendColor: getTrendColor_Range(
            s_qb_d_rk_lm,
            1,
            avg_league_size,
            true
          ),
          classname: "",
        },
        "S QB D Diff": {
          text: (s_qb_d_rk - s_qb_d_rk_lm).toLocaleString("en-US", {
            maximumFractionDigits: 1,
          }),
          sort: s_qb_d_rk - s_qb_d_rk_lm,
          trendColor: getTrendColor_Range(
            s_qb_d_rk - s_qb_d_rk_lm,
            1,
            avg_league_size,
            true
          ),
          classname: "",
        },

        "B QB D Rk": {
          text:
            user_qb_d_b_ranks.length === 0
              ? "-"
              : (
                  user_qb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
                  user_qb_d_b_ranks.length
                ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
          sort:
            user_qb_d_b_ranks.length === 0
              ? 0
              : user_qb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
                user_qb_d_b_ranks.length,
          trendColor: getTrendColor_Range(
            user_qb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
              user_qb_d_b_ranks.length,
            1,
            avg_league_size,
            true
          ),
          classname: "",
        },
        "B QB D Rk L": {
          text:
            lm_qb_d_ranks.length === 0
              ? "-"
              : (
                  lm_qb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
                  lm_qb_d_b_ranks.length
                ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
          sort:
            lm_qb_d_b_ranks.length === 0
              ? 0
              : lm_qb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
                lm_qb_d_b_ranks.length,
          trendColor: getTrendColor_Range(
            lm_qb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
              lm_qb_d_b_ranks.length,
            1,
            avg_league_size,
            true
          ),
          classname: "",
        },

        "S RB D Rk": {
          text:
            user_rb_d_ranks.length === 0
              ? "-"
              : (
                  user_rb_d_ranks.reduce((acc, cur) => acc + cur, 0) /
                  user_rb_d_ranks.length
                ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
          sort:
            user_rb_d_ranks.length === 0
              ? 0
              : user_rb_d_ranks.reduce((acc, cur) => acc + cur, 0) /
                user_rb_d_ranks.length,
          trendColor: getTrendColor_Range(
            user_rb_d_ranks.reduce((acc, cur) => acc + cur, 0) /
              user_rb_d_ranks.length,
            1,
            avg_league_size,
            true
          ),
          classname: "",
        },
        "S RB D Rk Lm": {
          text:
            lm_rb_d_ranks.length === 0
              ? "-"
              : (
                  lm_rb_d_ranks.reduce((acc, cur) => acc + cur, 0) /
                  lm_rb_d_ranks.length
                ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
          sort:
            lm_rb_d_ranks.length === 0
              ? 0
              : lm_rb_d_ranks.reduce((acc, cur) => acc + cur, 0) /
                lm_rb_d_ranks.length,
          trendColor: getTrendColor_Range(
            lm_rb_d_ranks.reduce((acc, cur) => acc + cur, 0) /
              lm_rb_d_ranks.length,
            1,
            avg_league_size,
            true
          ),
          classname: "",
        },
        "B RB D Rk": {
          text:
            user_rb_d_b_ranks.length === 0
              ? "-"
              : (
                  user_rb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
                  user_rb_d_b_ranks.length
                ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
          sort:
            user_rb_d_b_ranks.length === 0
              ? 0
              : user_rb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
                user_rb_d_b_ranks.length,
          trendColor: getTrendColor_Range(
            user_rb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
              user_rb_d_b_ranks.length,
            1,
            avg_league_size,
            true
          ),
          classname: "",
        },
        "B RB D Rk L": {
          text:
            lm_rb_d_ranks.length === 0
              ? "-"
              : (
                  lm_rb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
                  lm_rb_d_b_ranks.length
                ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
          sort:
            lm_rb_d_b_ranks.length === 0
              ? 0
              : lm_rb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
                lm_rb_d_b_ranks.length,
          trendColor: getTrendColor_Range(
            lm_rb_d_b_ranks.reduce((acc, cur) => acc + cur, 0) /
              lm_rb_d_b_ranks.length,
            1,
            avg_league_size,
            true
          ),
          classname: "",
        },
      };
    });
    return obj;
  }, [leaguemates, type1, type2, allplayers, ktcCurrent, leagues]);

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
        .filter(
          (user_id) =>
            filterLeagueIds(leaguemates[user_id].leagues).length > 0 &&
            parseInt(user_id)
        )
        .map((user_id) => {
          const common = filterLeagueIds(leaguemates[user_id].leagues);
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
              <LeaguemateLeagues league_ids={common} lm_user_id={user_id} />
            ),
          };
        })}
      placeholder="Leaguemates"
    />
  );

  return <ManagerLayout searched={searched} component={component} />;
};

export default Leaguemates;
