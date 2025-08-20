"use client";

import { use, useMemo, useState } from "react";
import ManagerLayout from "../manager-layout";
import TableMain from "@/components/table-main/table-main";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Avatar from "@/components/avatar/avatar";
import { updatePlayersState } from "@/redux/players/playersSlice";
import { filterLeagueIds } from "@/utils/filterLeagues";
import PlayerLeagues from "./components/playerLeagues";
import { colObj } from "@/lib/types/commonTypes";
import { getTrendColor_Range } from "@/utils/getTrendColor";
import { getPositionMaxAge } from "@/utils/getPositionMaxAge";

interface PlayersProps {
  params: Promise<{ searched: string }>;
}

const Players = ({ params }: PlayersProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { allplayers, ktcCurrent, nflState, projections } = useSelector(
    (state: RootState) => state.common
  );
  const { leagues, playershares, type1, type2 } = useSelector(
    (state: RootState) => state.manager
  );
  const {
    column1,
    column2,
    column3,
    column4,
    filterTeam,
    filterPosition,
    filterDraftClass,
  } = useSelector((state: RootState) => state.players);
  const [sortBy, setSortBy] = useState<{
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  }>({ column: 1, asc: false });

  const playersHeaders = [
    {
      abbrev: "# Own",
      text: "Number of Shares Owned",
      desc: "Number of Shares Owned",
    },
    {
      abbrev: "% Own",
      text: "Percentage of Leagues with Player Owned",
      desc: "Percentage of Leagues with Player Owned",
    },
    {
      abbrev: "KTC D",
      text: "Keep Trade Cut Dynasty Ranking",
      desc: "Keep Trade Cut Dynasty Ranking",
    },
    {
      abbrev: "Ppr Proj",
      text: "Ppr Projection",
      desc: "Ppr Projection",
    },
    {
      abbrev: "Age",
      text: "Age",
      desc: "Age",
    },
    {
      abbrev: "Draft Class",
      text: "Draft Class",
      desc: "Draft Class",
    },
  ];

  const playersObj = useMemo(() => {
    const obj: { [player_id: string]: { [col_abbrev: string]: colObj } } = {};

    Object.keys(playershares).forEach((player_id) => {
      const num_owned = filterLeagueIds(playershares[player_id].owned, {
        type1,
        type2,
        leagues,
      }).length;

      const percent_owned =
        num_owned /
          filterLeagueIds(Object.keys(leagues || {}), { type1, type2, leagues })
            .length || 0;

      const draftClass =
        parseInt(nflState?.season as string) -
        (allplayers?.[player_id]?.years_exp || 0);

      obj[player_id] = {
        "# Own": {
          sort: num_owned,
          text: num_owned.toString(),
          trendColor: getTrendColor_Range(percent_owned, 0, 0.25),
          classname: "font-metal text-[3.5rem]",
        },
        "% Own": {
          sort: percent_owned,
          text: Math.round(percent_owned * 1000) / 10 + "%",
          trendColor: getTrendColor_Range(percent_owned, 0, 0.25),
          classname: "font-metal text-[3.5rem]",
        },
        "KTC D": {
          sort: ktcCurrent?.dynasty[player_id] || 0,
          text: (ktcCurrent?.dynasty[player_id] || 0).toString(),
          trendColor: getTrendColor_Range(
            ktcCurrent?.dynasty[player_id] || 0,
            1000,
            6500
          ),
          classname: "ktc",
        },
        "Ppr Proj": {
          sort: projections?.[player_id]?.pts_ppr || 0,
          text:
            projections?.[player_id]?.pts_ppr?.toLocaleString("en-US", {
              maximumFractionDigits: 1,
            }) || "0",
          trendColor: getTrendColor_Range(
            projections?.[player_id]?.pts_ppr || 0,
            0,
            380
          ),
          classname: "stat",
        },
        Age: {
          sort: allplayers?.[player_id]?.age || 0,
          text: allplayers?.[player_id]?.age?.toString() || "-",
          trendColor: getTrendColor_Range(
            allplayers?.[player_id]?.age || 0,
            21,
            getPositionMaxAge(allplayers?.[player_id]?.position),
            true
          ),
          classname: "stat",
        },
        "Draft Class": {
          sort: draftClass,
          text: draftClass.toString(),
          trendColor: getTrendColor_Range(
            draftClass,
            parseInt(nflState?.season as string) - 10,
            parseInt(nflState?.season as string)
          ),
          classname: "stat",
        },
      };
    });

    return obj;
  }, [
    playershares,
    type1,
    type2,
    allplayers,
    ktcCurrent,
    leagues,
    nflState,
    projections,
  ]);

  const draftClasses = Array.from(
    new Set(
      Object.values(allplayers || {})
        .sort((a, b) => (a.years_exp || 0) - (b.years_exp || 0))
        .map((player) => player.years_exp || 0)
    )
  );

  const teams = Array.from(
    new Set(
      Object.values(allplayers || {})
        .filter((player) => player.team)
        .map((player) => player.team)
    )
  ).sort((a, b) => (a > b ? 1 : -1));

  const positions = ["QB", "RB", "WR", "TE", "K", "DEF", "DL", "LB", "DB"];

  const component = (
    <>
      <div className="nav-buttons">
        <div>
          <label>Draft Class</label>
          <select
            value={filterDraftClass}
            onChange={(e) =>
              dispatch(
                updatePlayersState({
                  key: "filterDraftClass",
                  value: e.target.value,
                })
              )
            }
          >
            <option>All</option>
            {draftClasses.map((draftClass) => {
              return (
                <option key={draftClass}>
                  {parseInt(nflState?.season as string) - draftClass}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label>Team</label>
          <select
            value={filterTeam}
            onChange={(e) =>
              dispatch(
                updatePlayersState({
                  key: "filterTeam",
                  value: e.target.value,
                })
              )
            }
          >
            <option>All</option>
            {teams.map((team) => {
              return <option key={team}>{team}</option>;
            })}
          </select>
        </div>
        <div>
          <label>Position</label>
          <select
            value={filterPosition}
            onChange={(e) =>
              dispatch(
                updatePlayersState({
                  key: "filterPosition",
                  value: e.target.value,
                })
              )
            }
          >
            <option>All</option>
            {positions.map((position) => {
              return <option key={position}>{position}</option>;
            })}
          </select>
        </div>
      </div>
      <TableMain
        type={1}
        headers_options={playersHeaders}
        headers={[
          {
            text: "Player",
            colspan: 2,
          },
          {
            text: column1,
            colspan: 1,
            update: (value) => {
              dispatch(updatePlayersState({ key: "column1", value }));
            },
          },
          {
            text: column2,
            colspan: 1,
            update: (value) => {
              dispatch(updatePlayersState({ key: "column2", value }));
            },
          },
          {
            text: column3,
            colspan: 1,
            update: (value) => {
              dispatch(updatePlayersState({ key: "column3", value }));
            },
          },
          {
            text: column4,
            colspan: 1,
            update: (value) => {
              dispatch(updatePlayersState({ key: "column4", value }));
            },
          },
        ]}
        headers_sort={[1, 0, 2, 3, 4]}
        data={[
          ...Object.keys(playershares)
            .filter(
              (player_id) =>
                (filterDraftClass === "All" ||
                  (
                    parseInt(nflState?.season as string) -
                    (allplayers?.[player_id]?.years_exp || 0)
                  ).toString() === filterDraftClass) &&
                (filterTeam === "All" ||
                  allplayers?.[player_id]?.team === filterTeam) &&
                (filterPosition === "All" ||
                  allplayers?.[player_id]?.position === filterPosition)
            )
            .map((player_id) => {
              return {
                id: player_id,
                search: {
                  text:
                    allplayers?.[player_id]?.full_name ||
                    (parseInt(player_id) && `Inactive Player - ${player_id}`) ||
                    player_id,
                  display: (
                    <Avatar
                      id={player_id}
                      text={
                        allplayers?.[player_id]?.full_name ||
                        (parseInt(player_id) &&
                          `Inactive Player - ${player_id}`) ||
                        player_id
                      }
                      type="P"
                    />
                  ),
                },
                columns: [
                  {
                    text: (
                      <Avatar
                        id={player_id}
                        text={allplayers?.[player_id]?.full_name || player_id}
                        type="P"
                      />
                    ),
                    colspan: 2,
                    classname: "",
                    sort: allplayers?.[player_id]?.full_name || player_id,
                  },
                  {
                    text: playersObj?.[player_id]?.[column1]?.text || "-",
                    sort: playersObj?.[player_id]?.[column1]?.sort || 0,
                    style: playersObj?.[player_id]?.[column1]?.trendColor,
                    colspan: 1,
                    classname: playersObj?.[player_id]?.[column1]?.classname,
                  },
                  {
                    text: playersObj?.[player_id]?.[column2]?.text || "-",
                    sort: playersObj?.[player_id]?.[column2]?.sort || 0,
                    colspan: 1,
                    classname: playersObj?.[player_id]?.[column2]?.classname,
                    style: playersObj?.[player_id]?.[column2]?.trendColor,
                  },
                  {
                    text: playersObj?.[player_id]?.[column3]?.text || "-",
                    sort: playersObj?.[player_id]?.[column3]?.sort || 0,
                    colspan: 1,
                    classname: playersObj?.[player_id]?.[column3]?.classname,
                    style: playersObj?.[player_id]?.[column3]?.trendColor,
                  },
                  {
                    text: playersObj?.[player_id]?.[column4]?.text || "-",
                    sort: playersObj?.[player_id]?.[column4]?.sort || 0,
                    colspan: 1,
                    classname: playersObj?.[player_id]?.[column4]?.classname,
                    style: playersObj?.[player_id]?.[column4]?.trendColor,
                  },
                ],
                secondary: (
                  <PlayerLeagues
                    player_id={player_id}
                    player_leagues={playershares[player_id]}
                  />
                ),
              };
            }),
        ]}
        placeholder="Players"
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </>
  );

  return <ManagerLayout searched={searched} component={component} />;
};

export default Players;
