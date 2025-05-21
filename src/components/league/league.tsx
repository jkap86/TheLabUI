import { League as LeagueType } from "@/lib/types/userTypes";
import { usePathname } from "next/navigation";
import TableMain from "../table-main/table-main";
import { JSX, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getKtcAvgValue, getTotalProj } from "@/utils/getKtcRanks";
import Avatar from "../avatar/avatar";
import { getPlayerTotal, getSlotAbbrev } from "@/utils/getOptimalStarters";
import { getDraftPickId } from "@/utils/getPickId";
import { updateStandingsState } from "@/redux/standings/standingsSlice";
import { syncLeague } from "@/redux/manager/managerActions";
import { getTrendColor_Range } from "@/utils/getTrendColor";

type LeagueProps = {
  type: number;
  league: LeagueType;
};

type colObj = {
  sort: number | string;
  text: string | JSX.Element;
  trendColor: { [key: string]: string };
  classname: string;
};

const League = ({ league, type }: LeagueProps) => {
  const pathname = usePathname();
  const dispatch: AppDispatch = useDispatch();
  const { nflState, allplayers, ktcCurrent, projections } = useSelector(
    (state: RootState) => state.common
  );
  const { isSyncingLeague } = useSelector((state: RootState) => state.manager);
  const { teamsColumn1, teamsColumn2, playersColumn1, playersColumn2 } =
    useSelector((state: RootState) => state.standings);
  const [activeRosterId, setActiveRosterId] = useState<false | string>(false);

  const activeRoster = league.rosters.find(
    (r) => r.roster_id.toString() === activeRosterId
  );

  const projectionsObj = useMemo(() => {
    const players: { [player_id: string]: number } = {};
    const teams: { [roster_id: number]: { p_s: number; p_b_5: number } } = {};

    const player_ids = league.rosters.flatMap((r) => r.players || []);

    player_ids.forEach((player_id) => {
      players[player_id] = getPlayerTotal(
        league.scoring_settings,
        projections?.[player_id] || {}
      );
    });

    league.rosters.forEach((r) => {
      const p_s = r.starters_optimal_ppg.reduce(
        (acc, cur) => acc + players[cur],
        0
      );
      const p_b_5 = (r.players || [])
        .filter((player_id) => !r.starters_optimal_ppg.includes(player_id))
        .sort((a, b) => players[b] - players[a])
        .slice(0, 5)
        .reduce((acc, cur) => acc + players[cur], 0);

      teams[r.roster_id] = {
        p_s,
        p_b_5,
      };
    });

    return { players, teams };
  }, [league]);

  const teamsHeaders = [
    {
      abbrev: "P S",
      text: "P S",
      desc: "P S",
    },
    {
      abbrev: "P B T5",
      text: "P B T5",
      desc: "P B T5",
    },
    {
      abbrev: "D S",
      text: "KTC Dynasty Average Starter Value",
      desc: "Average KTC Dynasty Value of Optimal Starters. Optimal starters are determined by KTC dynasty values",
    },
    {
      abbrev: "D B T5",
      text: "KTC Dynasty Average of Top 5 Bench Players Value",
      desc: `Average KTC Dynasty Value of top 5 bench players when optimal starters are set. 
            Optimal starters and top bench players are determined by KTC dynasty values.`,
    },

    {
      abbrev: "R S",
      text: "KTC Redraft Average Starter Value",
      desc: "Average KTC Redraft Value of Optimal Starters. Optimal starters are determined by KTC redraft values",
    },
    {
      abbrev: "R B T5",
      text: "KTC Redraft Average of Top 5 Bench Players Value",
      desc: `Average KTC Redraft Value of top 5 bench players when optimal starters are set. 
            Optimal starters and top bench players are determined by KTC redraft values.`,
    },
    {
      abbrev: "D S QB",
      text: "KTC S D QB",
      desc: "KTC S D QB",
    },
    {
      abbrev: "D B QB",
      text: "D B QB",
      desc: "D B QB",
    },
    {
      abbrev: "D S RB",
      text: "KTC S D RB",
      desc: "KTC S D RB",
    },
    {
      abbrev: "D B RB",
      text: "D B RB",
      desc: "D B RB",
    },
  ];

  const teamsObj = useMemo(() => {
    const obj: {
      [roster_id: number]: {
        [column: string]: colObj;
      };
    } = {};

    league.rosters.forEach((r) => {
      const ktc_d_s = getKtcAvgValue(r.starters_optimal_dynasty, "D");
      const ktc_d_b_5 = getKtcAvgValue(
        (r.players || [])
          .filter(
            (player_id) => !r.starters_optimal_dynasty.includes(player_id)
          )
          .sort(
            (a, b) =>
              (ktcCurrent?.dynasty?.[b] || 0) - (ktcCurrent?.dynasty?.[a] || 0)
          )
          .slice(0, 5),
        "D"
      );
      const ktc_r_s = getKtcAvgValue(r.starters_optimal_redraft, "R");
      const ktc_r_b_5 = getKtcAvgValue(
        (r.players || [])
          .filter(
            (player_id) => !r.starters_optimal_redraft.includes(player_id)
          )
          .sort(
            (a, b) =>
              (ktcCurrent?.redraft?.[b] || 0) - (ktcCurrent?.redraft?.[a] || 0)
          )
          .slice(0, 5),
        "R"
      );
      const ktc_s_d_qb = r.starters_optimal_dynasty
        .filter((player_id) => allplayers?.[player_id]?.position === "QB")
        .reduce((acc, cur) => acc + (ktcCurrent?.dynasty?.[cur] || 0), 0);

      const ktc_s_d_qb_bench = (r.players || [])
        .filter(
          (player_id) =>
            allplayers?.[player_id]?.position === "QB" &&
            !r.starters_optimal_dynasty.includes(player_id)
        )
        .reduce((acc, cur) => acc + (ktcCurrent?.dynasty?.[cur] || 0), 0);

      const ktc_s_d_rb = r.starters_optimal_dynasty
        .filter((player_id) => allplayers?.[player_id]?.position === "RB")
        .reduce((acc, cur) => acc + (ktcCurrent?.dynasty?.[cur] || 0), 0);

      const ktc_s_d_rb_bench = (r.players || [])
        .filter(
          (player_id) =>
            allplayers?.[player_id]?.position === "RB" &&
            !r.starters_optimal_dynasty.includes(player_id)
        )
        .reduce((acc, cur) => acc + (ktcCurrent?.dynasty?.[cur] || 0), 0);

      const P_s = getTotalProj(r.starters_optimal_ppg, league.scoring_settings);

      const p_b_5 = getTotalProj(
        (r.players || [])
          .filter((player_id) => !r.starters_optimal_ppg.includes(player_id))
          .sort(
            (a, b) =>
              getPlayerTotal(league.scoring_settings, projections?.[b] || {}) -
              getPlayerTotal(league.scoring_settings, projections?.[a] || {})
          )
          .slice(0, 5),
        league.scoring_settings
      );

      obj[r.roster_id] = {
        "D S": {
          sort: ktc_d_s,
          text: ktc_d_s.toString(),
          trendColor: {},
          classname: "ktc",
        },
        "D B T5": {
          sort: ktc_d_b_5,
          text: ktc_d_b_5.toString(),
          trendColor: {},
          classname: "ktc",
        },

        "R S": {
          sort: ktc_r_s,
          text: ktc_r_s.toString(),
          trendColor: {},
          classname: "ktc",
        },
        "R B T5": {
          sort: ktc_r_b_5,
          text: ktc_r_b_5.toString(),
          trendColor: {},
          classname: "ktc",
        },
        "D S QB": {
          sort: ktc_s_d_qb,
          text: ktc_s_d_qb.toString(),
          trendColor: {},
          classname: "",
        },
        "D B QB": {
          sort: ktc_s_d_qb_bench,
          text: ktc_s_d_qb_bench.toString(),
          trendColor: {},
          classname: "",
        },
        "D S RB": {
          sort: ktc_s_d_rb,
          text: ktc_s_d_rb.toString(),
          trendColor: {},
          classname: "",
        },
        "D B RB": {
          sort: ktc_s_d_rb_bench,
          text: ktc_s_d_rb_bench.toString(),
          trendColor: {},
          classname: "",
        },
        "P S": {
          sort: P_s,
          text: P_s.toLocaleString("en-US", { maximumFractionDigits: 0 }),
          trendColor: getTrendColor_Range(
            P_s,
            Math.min(
              ...Object.values(projectionsObj.teams).map((obj) => obj.p_s)
            ),
            Math.max(
              ...Object.values(projectionsObj.teams).map((obj) => obj.p_s)
            )
          ),
          classname: "",
        },
        "P B T5": {
          sort: p_b_5,
          text: p_b_5.toLocaleString("en-US", { maximumFractionDigits: 0 }),
          trendColor: getTrendColor_Range(
            p_b_5,
            Math.min(
              ...Object.values(projectionsObj.teams).map((obj) => obj.p_b_5)
            ),
            Math.max(
              ...Object.values(projectionsObj.teams).map((obj) => obj.p_b_5)
            )
          ),
          classname: "",
        },
      };
    });

    return obj;
  }, []);

  const playersHeaders = [
    {
      abbrev: "KTC D",
      text: "KTC Dynasty Value",
      desc: "",
    },
    {
      abbrev: "KTC R",
      text: "KTC Redraft Value",
      desc: "",
    },
    {
      abbrev: "ROS P",
      text: "Rest of Season Projected Points",
      desc: "",
    },
  ];

  const playersObj = useMemo(() => {
    const obj: {
      [player_id: string]: {
        [column: string]: colObj;
      };
    } = {};

    const players_proj = Object.fromEntries(
      (activeRoster?.players || []).map((player_id) => [
        player_id,
        getPlayerTotal(league.scoring_settings, projections?.[player_id] || {}),
      ])
    );

    (activeRoster?.players || []).forEach((player_id) => {
      const ktc_d = ktcCurrent?.dynasty?.[player_id] || 0;
      const ktc_r = ktcCurrent?.redraft?.[player_id] || 0;

      const proj = players_proj[player_id];

      obj[player_id] = {
        "KTC D": {
          sort: ktc_d,
          text: ktc_d.toString(),
          trendColor: {},
          classname: "rank",
        },
        "KTC R": {
          sort: ktc_r,
          text: ktc_r.toString(),
          trendColor: {},
          classname: "rank",
        },
        "ROS P": {
          sort: proj,
          text: proj.toLocaleString("en-US", { maximumFractionDigits: 0 }),
          trendColor: getTrendColor_Range(
            proj,
            Math.min(...Object.values(projectionsObj.players)),
            Math.max(...Object.values(projectionsObj.players))
          ),
          classname: "stat",
        },
      };
    });

    return obj;
  }, [activeRoster]);

  return (
    <>
      <div className="nav">
        <div></div>
        {!pathname.includes("trades") && (
          <div className="sync">
            <i
              className={
                "fa-solid fa-arrows-rotate " +
                (isSyncingLeague === league.league_id ? "rotate" : "")
              }
              onClick={() =>
                dispatch(
                  syncLeague({
                    league_id: league.league_id,
                    roster_id: league.user_roster.roster_id,
                    week: nflState?.week as number,
                  })
                )
              }
            ></i>
          </div>
        )}
        <div></div>
      </div>
      <TableMain
        type={type}
        half={true}
        headers={[
          {
            text: "Rk",
            colspan: 1,
          },
          {
            text: "Manager",
            colspan: 4,
          },
          {
            text: teamsColumn1,
            colspan: 2,
            update: (value: string) =>
              dispatch(updateStandingsState({ key: "teamsColumn1", value })),
          },
          {
            text: teamsColumn2,
            colspan: 2,
            update: (value: string) =>
              dispatch(updateStandingsState({ key: "teamsColumn2", value })),
          },
        ]}
        headers_sort={[2, 3]}
        headers_options={teamsHeaders}
        data={[...league.rosters].map((roster, index) => {
          const defaultColumn = {
            text: "-",
            sort: 0,
            trendColor: {},
            classname: "",
          };
          const {
            text: text1,
            sort: sort1,
            trendColor: trendColor1,
            classname: classname1,
          } = teamsObj?.[roster.roster_id]?.[teamsColumn1] || defaultColumn;

          const {
            text: text2,
            sort: sort2,
            trendColor: trendColor2,
            classname: classname2,
          } = teamsObj?.[roster.roster_id]?.[teamsColumn2] || defaultColumn;

          return {
            id: roster.roster_id.toString(),
            columns: [
              {
                text: "INDEX",
                colspan: 1,
                classname: "",
              },
              {
                text: (
                  <Avatar id={roster.avatar} text={roster.username} type="U" />
                ),
                colspan: 4,
                classname: "",
              },

              {
                text: text1,
                sort: sort1,
                colspan: 2,
                classname: classname1,
                style: trendColor1,
              },

              {
                text: text2,
                sort: sort2,
                colspan: 2,
                classname: classname2,
                style: trendColor2,
              },
            ],
          };
        })}
        placeholder=""
        sendActive={(active: string | false) => setActiveRosterId(active)}
      />
      {activeRoster ? (
        <TableMain
          type={type}
          half={true}
          headers={[
            {
              text: "",
              colspan: 1,
              classname: "",
            },
            {
              text: "Player",
              colspan: 4,
              classname: "",
            },
            {
              text: playersColumn1,
              colspan: 2,
              classname: "",
              update: (value: string) =>
                dispatch(
                  updateStandingsState({ key: "playersColumn1", value })
                ),
            },
            {
              text: playersColumn2,
              colspan: 2,
              classname: "",
              update: (value: string) =>
                dispatch(
                  updateStandingsState({ key: "playersColumn2", value })
                ),
            },
          ]}
          headers_options={playersHeaders}
          data={[
            ...league.roster_positions
              .filter((rp) => rp !== "BN")
              .map((rp, index) => {
                const defaultColumn = {
                  text: "-",
                  trendColor: {},
                  classname: "",
                };

                const player_id =
                  activeRoster?.starters_optimal_ppg?.[index] || "0";

                const {
                  text: text1,
                  trendColor: trendColor1,
                  classname: classname1,
                } = playersObj[player_id]?.[playersColumn1] || defaultColumn;

                const {
                  text: text2,
                  trendColor: trendColor2,
                  classname: classname2,
                } = playersObj[player_id]?.[playersColumn2] || defaultColumn;

                return {
                  id: `${rp}__${index}`,
                  columns: [
                    {
                      text: getSlotAbbrev(rp),
                      colspan: 1,
                      classname: "slot",
                    },
                    {
                      text:
                        (allplayers && player_id && allplayers[player_id] && (
                          <Avatar
                            id={player_id}
                            text={allplayers[player_id].full_name}
                            type="P"
                          />
                        )) ||
                        "-",
                      colspan: 4,
                      classname: "",
                    },
                    {
                      text: text1,
                      colspan: 2,
                      style: trendColor1,
                      classname: classname1,
                    },
                    {
                      text: text2,
                      colspan: 2,
                      style: trendColor2,
                      classname: classname2,
                    },
                  ],
                };
              }),
            ...(activeRoster?.players
              ?.filter(
                (player_id) =>
                  !activeRoster.starters_optimal_ppg?.includes(player_id)
              )
              ?.sort((a, b) => {
                const getPositionValue = (player_id: string) => {
                  const position =
                    allplayers && allplayers[player_id]?.position;

                  switch (position) {
                    case "QB":
                      return 1;
                    case "RB":
                      return 2;
                    case "FB":
                      return 2;
                    case "WR":
                      return 3;
                    case "TE":
                      return 4;
                    default:
                      return 5;
                  }
                };

                return (
                  getPositionValue(a) - getPositionValue(b) ||
                  (getPlayerTotal(
                    league.scoring_settings,
                    projections?.[b] || {}
                  ) || 0) -
                    (getPlayerTotal(
                      league.scoring_settings,
                      projections?.[a] || {}
                    ) || 0)
                );
              })
              ?.map((player_id) => {
                const defaultColumn = {
                  text: "-",
                  trendColor: {},
                  classname: "",
                };
                const {
                  text: text1,
                  trendColor: trendColor1,
                  classname: classname1,
                } = playersObj[player_id]?.[playersColumn1] || defaultColumn;

                const {
                  text: text2,
                  trendColor: trendColor2,
                  classname: classname2,
                } = playersObj[player_id]?.[playersColumn2] || defaultColumn;

                return {
                  id: player_id,
                  columns: [
                    {
                      text: "BN",
                      colspan: 1,
                      classname: "slot",
                    },
                    {
                      text:
                        (allplayers && player_id && allplayers[player_id] && (
                          <Avatar
                            id={player_id}
                            text={allplayers[player_id].full_name}
                            type="P"
                          />
                        )) ||
                        "-",
                      colspan: 3,
                      classname: "",
                    },
                    {
                      text: text1,
                      colspan: 2,
                      style: trendColor1,
                      classname: classname1,
                    },
                    {
                      text: text2,
                      colspan: 2,
                      style: trendColor2,
                      classname: classname2,
                    },
                  ],
                };
              }) || []),
            ...([...(activeRoster?.draftpicks || [])]
              ?.sort(
                (a, b) =>
                  a.season - b.season ||
                  a.round - b.round ||
                  (a.order || 0) - (b.order || 0) ||
                  (b.roster_id === activeRoster?.roster_id ? 1 : 0) -
                    (a.roster_id === activeRoster?.roster_id ? 1 : 0)
              )
              ?.map((pick) => {
                const pick_id = getDraftPickId(pick);

                const { text, trendColor, classname } = playersObj[pick_id]?.[
                  playersColumn1
                ] || {
                  text: "-",
                  trendColor: {},
                  classname: "",
                };

                return {
                  id: `${pick.season}_${pick.round}_${pick.roster_id}`,
                  columns: [
                    {
                      text: "PK",
                      colspan: 1,
                      classname: "slot",
                    },
                    {
                      text: pick.order
                        ? `${pick.season} ${
                            pick.round
                          }.${pick.order.toLocaleString("en-US", {
                            minimumIntegerDigits: 2,
                          })}`
                        : `${pick.season} Round ${pick.round}` +
                          (pick.roster_id === activeRoster?.roster_id
                            ? ""
                            : ` ${pick.original_user.username}`),
                      colspan: 3,
                      classname: "",
                    },
                    {
                      text,
                      colspan: 2,
                      style: trendColor || {},
                      classname,
                    },
                  ],
                };
              }) || []),
          ]}
          placeholder=""
        />
      ) : (
        <TableMain
          type={type}
          half={true}
          headers={[]}
          data={[]}
          placeholder=""
        />
      )}
    </>
  );
};

export default League;
