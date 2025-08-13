import Avatar from "@/components/avatar/avatar";
import League from "@/components/league/league";
import TableMain from "@/components/table-main/table-main";
import { League as LeagueType, Playershare, User } from "@/lib/types/userTypes";
import { updatePlayersState } from "@/redux/players/playersSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { filterLeagueIds } from "@/utils/filterLeagues";
import {
  getLeaguesLeaguemateObj,
  leagueHeaders,
  leagueLeaguemateHeaders,
} from "@/utils/getLeaguesObj";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const OwnedAvailableLeagues = ({ league_ids }: { league_ids: string[] }) => {
  const dispatch: AppDispatch = useDispatch();
  const { leagues, leaguesValuesObj, type1, type2 } = useSelector(
    (state: RootState) => state.manager
  );
  const { OAColumn1, OAColumn2, OAColumn3, OAColumn4 } = useSelector(
    (state: RootState) => state.players
  );
  const [sortBy, setSortBy] = useState<{
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  }>({ column: 0, asc: false });

  const leaguesObj = leaguesValuesObj;

  return (
    <TableMain
      type={2}
      headers_options={leagueHeaders}
      headers={[
        {
          text: "League",
          colspan: 2,
          classname: "",
        },
        {
          text: OAColumn1,
          colspan: 1,
          classname: "",
          update: (value) =>
            dispatch(updatePlayersState({ key: "OAColumn1", value })),
        },
        {
          text: OAColumn2,
          colspan: 1,
          classname: "",
          update: (value) =>
            dispatch(updatePlayersState({ key: "OAColumn2", value })),
        },
        {
          text: OAColumn3,
          colspan: 1,
          classname: "",
          update: (value) =>
            dispatch(updatePlayersState({ key: "OAColumn3", value })),
        },
        {
          text: OAColumn4,
          colspan: 1,
          classname: "",
          update: (value) =>
            dispatch(updatePlayersState({ key: "OAColumn4", value })),
        },
      ]}
      headers_sort={[0, 1, 2, 3, 4]}
      data={filterLeagueIds(league_ids, { type1, type2, leagues }).map(
        (league_id) => {
          return {
            id: league_id,
            search: {
              text: leagues?.[league_id]?.name || league_id,
              display: (
                <Avatar
                  id={leagues?.[league_id]?.avatar}
                  text={leagues?.[league_id]?.name || league_id}
                  type="L"
                />
              ),
            },
            columns: [
              {
                text: (
                  <Avatar
                    id={leagues?.[league_id]?.avatar}
                    text={leagues?.[league_id]?.name || league_id}
                    type="L"
                  />
                ),
                sort: sortBy.asc
                  ? leagues?.[league_id]?.name
                  : leagues?.[league_id]?.index && -leagues[league_id].index,
                colspan: 2,
                classname: "",
              },
              ...[OAColumn1, OAColumn2, OAColumn3, OAColumn4].map((column) => {
                return {
                  text: leaguesObj?.[league_id]?.[column]?.text,
                  sort: leaguesObj?.[league_id]?.[column]?.sort,
                  colspan: 1,
                  classname: leaguesObj?.[league_id]?.[column]?.classname,
                  style: leaguesObj?.[league_id]?.[column]?.trendColor,
                };
              }),
            ],
            secondary: (
              <League type={3} league={leagues?.[league_id] as LeagueType} />
            ),
          };
        }
      )}
      placeholder="Leagues"
      sortBy={sortBy}
      setSortBy={setSortBy}
    />
  );
};

const TakenLeagues = ({
  leaguesTaken,
}: {
  leaguesTaken: {
    league_id: string;
    lm_roster_id: number;
    lm: User;
  }[];
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { leagues, leaguesValuesObj, type1, type2 } = useSelector(
    (state: RootState) => state.manager
  );
  const { TColumn1, TColumn2 } = useSelector(
    (state: RootState) => state.players
  );
  const [sortBy, setSortBy] = useState<{
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  }>({ column: 0, asc: false });

  const lmObj = getLeaguesLeaguemateObj(
    leaguesTaken.map((l) => {
      return {
        ...(leagues?.[l.league_id] as LeagueType),
        lm_roster_id: l.lm_roster_id,
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
    <TableMain
      type={2}
      headers_sort={[0, 1, 2, 3]}
      headers_options={[...leagueHeaders, ...leagueLeaguemateHeaders]}
      headers={[
        {
          text: "League",
          colspan: 2,
          classname: "",
        },
        {
          text: "Leaguemate",
          colspan: 2,
          classname: "",
        },
        {
          text: TColumn1,
          colspan: 1,
          classname: "",
          update: (value) =>
            dispatch(updatePlayersState({ key: "TColumn1", value })),
        },
        {
          text: TColumn2,
          colspan: 1,
          classname: "",
          update: (value) => {
            dispatch(updatePlayersState({ key: "TColumn2", value }));
          },
        },
      ]}
      data={filterLeagueIds(
        leaguesTaken.map((l) => l.league_id),
        { type1, type2, leagues }
      ).map((league_id) => {
        const lmRosterId = leaguesTaken.find(
          (lt) => lt.league_id === league_id
        )?.lm_roster_id;
        const lmRoster = leagues?.[league_id]?.rosters?.find(
          (r) => r.roster_id === lmRosterId
        );

        return {
          id: league_id,
          search: {
            text: leagues?.[league_id]?.name || league_id,
            display: (
              <Avatar
                id={leagues?.[league_id]?.avatar}
                text={leagues?.[league_id]?.name || league_id}
                type="L"
              />
            ),
          },
          columns: [
            {
              text: (
                <Avatar
                  id={leagues?.[league_id]?.avatar}
                  text={leagues?.[league_id]?.name || league_id}
                  type="L"
                />
              ),
              colspan: 2,
              classname: "",
              sort: sortBy.asc
                ? leagues?.[league_id]?.name
                : -(leagues?.[league_id]?.index || 0),
            },
            {
              text: (
                <Avatar
                  id={lmRoster?.avatar}
                  text={lmRoster?.username || "-"}
                  type="U"
                />
              ),
              colspan: 2,
              classname: "",
              sort: lmRoster?.username || "Orphan",
            },
            ...[TColumn1, TColumn2].map((column) => {
              return {
                text: leaguesObj[league_id][column]?.text || "-",
                colspan: 1,
                classname: leaguesObj[league_id][column]?.classname,
                style: leaguesObj[league_id][column]?.trendColor,
                sort: leaguesObj[league_id][column]?.sort || "-",
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
  );
};

type PlayerLeaguesProps = {
  player_id: string;
  player_leagues: Playershare;
};

const PlayerLeagues = ({ player_leagues }: PlayerLeaguesProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { playerLeaguesTab } = useSelector((state: RootState) => state.players);

  return (
    <>
      <div className="nav">
        <button
          className={playerLeaguesTab === "O" ? "active" : ""}
          onClick={() =>
            dispatch(
              updatePlayersState({ key: "playerLeaguesTab", value: "O" })
            )
          }
        >
          Owned
        </button>
        <button
          className={playerLeaguesTab === "T" ? "active" : ""}
          onClick={() =>
            dispatch(
              updatePlayersState({ key: "playerLeaguesTab", value: "T" })
            )
          }
        >
          Taken
        </button>
        <button
          className={playerLeaguesTab === "A" ? "active" : ""}
          onClick={() =>
            dispatch(
              updatePlayersState({ key: "playerLeaguesTab", value: "A" })
            )
          }
        >
          Available
        </button>
      </div>
      {playerLeaguesTab === "O" ? (
        <OwnedAvailableLeagues league_ids={player_leagues.owned} />
      ) : playerLeaguesTab === "T" ? (
        <TakenLeagues leaguesTaken={player_leagues.taken} />
      ) : playerLeaguesTab === "A" ? (
        <OwnedAvailableLeagues league_ids={player_leagues.available} />
      ) : null}
    </>
  );
};

export default PlayerLeagues;
