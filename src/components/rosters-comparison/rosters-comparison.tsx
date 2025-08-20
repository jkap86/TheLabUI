"use client";

import { League, Roster } from "@/lib/types/userTypes";
import TableMain from "../table-main/table-main";
import { getPlayerTotal, getSlotAbbrev } from "@/utils/getOptimalStarters";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Avatar from "../avatar/avatar";
import { getDraftPickId } from "@/utils/getPickId";
import "./rosters-comparison.css";

const RostersComparisonPage = ({
  league,
  roster_id1,
  roster_id2,
}: {
  league: League;
  roster_id1: number;
  roster_id2: number;
}) => {
  const { allplayers, projections, ktcCurrent } = useSelector(
    (state: RootState) => state.common
  );

  const getRosterTable = (roster: Roster | undefined) => {
    return (
      <TableMain
        type={2}
        half={true}
        headers={[
          { text: "", colspan: 1 },
          { text: "Player", colspan: 4 },
          { text: "KTC", colspan: 2 },
          { text: "Ros Proj", colspan: 2 },
        ]}
        data={[
          ...league.roster_positions
            .filter((rp) => rp !== "BN")
            .map((rp, index) => {
              const player_id = roster?.starters_optimal_ppg?.[index] || "0";

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
                    text: (ktcCurrent?.dynasty?.[player_id] || 0).toString(),
                    colspan: 2,
                    style: {},
                    classname: "",
                  },
                  {
                    text: getPlayerTotal(
                      league.scoring_settings,
                      projections?.[player_id] || {}
                    ).toFixed(0),
                    colspan: 2,
                    style: {},
                    classname: "",
                  },
                ],
              };
            }),
          ...(roster?.players
            ?.filter(
              (player_id) => !roster.starters_optimal_ppg?.includes(player_id)
            )
            ?.sort((a, b) => {
              const getPositionValue = (player_id: string) => {
                const position = allplayers && allplayers[player_id]?.position;

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
                    colspan: 4,
                    classname: "",
                  },
                  {
                    text: (ktcCurrent?.dynasty?.[player_id] || 0).toString(),
                    colspan: 2,
                    style: {},
                    classname: "",
                  },
                  {
                    text: getPlayerTotal(
                      league.scoring_settings,
                      projections?.[player_id] || {}
                    ).toFixed(0),
                    colspan: 2,
                    style: {},
                    classname: "",
                  },
                ],
              };
            }) || []),
          ...([...(roster?.draftpicks || [])]
            ?.sort(
              (a, b) =>
                a.season - b.season ||
                a.round - b.round ||
                (a.order || 0) - (b.order || 0) ||
                (b.roster_id === roster?.roster_id ? 1 : 0) -
                  (a.roster_id === roster?.roster_id ? 1 : 0)
            )
            ?.map((pick) => {
              const pick_id = getDraftPickId(pick);

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
                        (pick.roster_id === roster?.roster_id
                          ? ""
                          : ` ${pick.original_user.username}`),
                    colspan: 4,
                    classname: "",
                  },
                  {
                    text: (ktcCurrent?.dynasty?.[pick_id] || 0).toString(),
                    colspan: 2,
                    style: {},
                    classname: "",
                  },
                  {
                    text: "-",
                    colspan: 2,
                    style: {},
                    classname: "",
                  },
                ],
              };
            }) || []),
        ]}
        placeholder=""
      />
    );
  };

  const roster1 = league.rosters.find((r) => r.roster_id === roster_id1);

  const roster2 = league.rosters.find((r) => r.roster_id === roster_id2);

  const table1 = getRosterTable(roster1);
  const table2 = getRosterTable(roster2);

  return (
    <>
      <div className="nav">
        <div></div>
        <div></div>
      </div>
      <div className="rosters-container">
        {table1}
        {table2}
      </div>
    </>
  );
};

export default RostersComparisonPage;
