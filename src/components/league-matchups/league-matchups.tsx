import { Matchup } from "@/lib/types/userTypes";
import TableMain from "../table-main/table-main";
import Avatar from "../avatar/avatar";
import {
  getPlayerTotal,
  getSlotAbbrev,
  position_map,
} from "@/utils/getOptimalStarters";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useState } from "react";
import { syncMatchup } from "@/redux/lineupchecker/lineupcheckerActions";

const LeagueMatchups = ({
  matchup,
}: {
  matchup: {
    user_matchup: Matchup;
    opp_matchup: Matchup;
    league_matchups: Matchup[];
    league_index: number;
    league_name: string;
    league_avatar: string | null;
  };
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers } = useSelector((state: RootState) => state.common);
  const { schedule, projections, isSyncingMatchup } = useSelector(
    (state: RootState) => state.lineupchecker
  );
  const [activeIndex, setActiveIndex] = useState<string | false>(false);

  const slot_options = matchup.user_matchup.players.filter(
    (player_id) =>
      !matchup.user_matchup.starters.includes(player_id) &&
      position_map[
        matchup.user_matchup.league.roster_positions[
          parseInt(activeIndex || "0")
        ]
      ]?.includes(allplayers?.[player_id]?.position || "")
  );

  console.log({ activeIndex });

  return (
    <>
      <div className="nav">
        <div>
          {matchup.user_matchup.projection_current.toLocaleString("en-US", {
            maximumFractionDigits: 1,
          })}{" "}
          -{" "}
          {matchup.user_matchup.projection_optimal.toLocaleString("en-US", {
            maximumFractionDigits: 1,
          })}{" "}
          Median:{" "}
          {(
            matchup.league_matchups.reduce(
              (acc, cur) => acc + (cur.projection_optimal || 0),
              0
            ) / matchup.league_matchups.length
          ).toLocaleString("en-US", {
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
          })}
        </div>
        <div className="sync">
          <i
            className={
              "fa-solid fa-arrows-rotate " +
              (isSyncingMatchup === matchup.user_matchup.league_id
                ? "rotate"
                : "")
            }
            onClick={() =>
              dispatch(
                syncMatchup({
                  league_id: matchup.user_matchup.league_id,
                  user_id: matchup.user_matchup.user_id,
                  index: matchup.user_matchup.league.index,
                })
              )
            }
          ></i>
        </div>
        <div>
          {matchup.opp_matchup.username}{" "}
          {matchup.opp_matchup.projection_current.toLocaleString("en-US", {
            maximumFractionDigits: 1,
          })}{" "}
          -{" "}
          {matchup.opp_matchup.projection_optimal.toLocaleString("en-US", {
            maximumFractionDigits: 1,
          })}{" "}
        </div>
      </div>
      <TableMain
        type={2}
        half={true}
        headers={[]}
        data={matchup.user_matchup.starters.map((player_id, index) => {
          const classname = `${
            matchup.user_matchup.starters_optimal?.some(
              (os) => os.optimal_player_id === player_id
            )
              ? "green"
              : "red"
          } ${
            matchup.user_matchup.starters.some(
              (player_idStarters, indexStarters) =>
                (((schedule[allplayers?.[player_id]?.team || ""]?.kickoff ||
                  0) +
                  60 * 60 * 1000 <
                  (schedule[allplayers?.[player_idStarters]?.team || ""]
                    ?.kickoff || 0) &&
                  position_map[
                    matchup.user_matchup.league.roster_positions[index]
                  ].length >
                    position_map[
                      matchup.user_matchup.league.roster_positions[
                        indexStarters
                      ]
                    ].length) ||
                  ((schedule[allplayers?.[player_id]?.team || ""]?.kickoff ||
                    0) -
                    60 * 60 * 1000 >
                    (schedule[allplayers?.[player_idStarters]?.team || ""]
                      ?.kickoff || 0) &&
                    position_map[
                      matchup.user_matchup.league.roster_positions[index]
                    ].length <
                      position_map[
                        matchup.user_matchup.league.roster_positions[
                          indexStarters
                        ]
                      ].length)) &&
                position_map[
                  matchup.user_matchup.league.roster_positions[index]
                ].includes(
                  allplayers?.[player_idStarters]?.position || player_idStarters
                ) &&
                position_map[
                  matchup.user_matchup.league.roster_positions[indexStarters]
                ].includes(allplayers?.[player_id]?.position || player_id)
            )
              ? "yellowb"
              : ""
          }`;
          return {
            id: index.toString(),
            columns: [
              {
                text: getSlotAbbrev(
                  matchup.user_matchup.league.roster_positions[index]
                ),
                colspan: 1,
                classname,
              },
              {
                text: (
                  <Avatar
                    id={player_id}
                    text={allplayers?.[player_id]?.full_name || player_id}
                    type="P"
                  />
                ),
                colspan: 5,
                classname,
              },
              {
                text: schedule[allplayers?.[player_id]?.team || ""]?.opp || "-",
                colspan: 2,
                classname,
              },
              {
                text: getPlayerTotal(
                  matchup.user_matchup.league.scoring_settings,
                  projections[player_id] || {}
                ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
                colspan: 2,
                classname,
              },
            ],
          };
        })}
        placeholder=""
        sendActive={(active: string | false) => setActiveIndex(active)}
      />
      {activeIndex === "" ? (
        <TableMain
          type={2}
          half={true}
          headers={[]}
          data={(matchup.user_matchup.starters_optimal || [])?.map(
            (so, index) => {
              return {
                id: index.toString(),
                columns: [
                  {
                    text: getSlotAbbrev(so.slot__index.split("__")[0]),
                    colspan: 1,
                    classname: "",
                  },
                  {
                    text: (
                      <Avatar
                        id={so.optimal_player_id}
                        text={
                          allplayers?.[so.optimal_player_id]?.full_name ||
                          so.optimal_player_id
                        }
                        type="P"
                      />
                    ),
                    colspan: 2,
                    classname: "",
                  },
                ],
              };
            }
          )}
          placeholder=""
        />
      ) : (
        <TableMain
          type={2}
          half={true}
          headers={[]}
          data={slot_options
            .sort(
              (a, b) =>
                getPlayerTotal(
                  matchup.user_matchup.league.scoring_settings,
                  projections[b] || {}
                ) -
                getPlayerTotal(
                  matchup.user_matchup.league.scoring_settings,
                  projections[a] || {}
                )
            )
            .map((so) => {
              const classname = matchup.user_matchup.starters_optimal?.some(
                (so2) => so2.optimal_player_id === so
              )
                ? "green"
                : getPlayerTotal(
                    matchup.user_matchup.league.scoring_settings,
                    projections[so]
                  ) >
                  getPlayerTotal(
                    matchup.user_matchup.league.scoring_settings,
                    projections[
                      matchup.user_matchup.starters[
                        parseInt(activeIndex || "0")
                      ]
                    ]
                  )
                ? "yellow"
                : "red";
              return {
                id: so,
                columns: [
                  {
                    text: allplayers?.[so]?.position || "-",
                    classname,
                    colspan: 1,
                  },
                  {
                    text: (
                      <Avatar
                        id={so}
                        text={allplayers?.[so].full_name || so}
                        type="P"
                      />
                    ),
                    colspan: 5,
                    classname,
                  },
                  {
                    text: schedule[allplayers?.[so]?.team || ""]?.opp || "-",
                    colspan: 2,
                    classname,
                  },
                  {
                    text: getPlayerTotal(
                      matchup.user_matchup.league.scoring_settings,
                      projections[so] || {}
                    ).toLocaleString("en-US", { maximumFractionDigits: 1 }),
                    colspan: 2,
                    classname,
                  },
                ],
              };
            })}
          placeholder=""
        />
      )}
    </>
  );
};

export default LeagueMatchups;
