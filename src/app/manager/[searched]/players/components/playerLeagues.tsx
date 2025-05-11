import Avatar from "@/components/avatar/avatar";
import League from "@/components/league/league";
import TableMain from "@/components/table-main/table-main";
import { League as LeagueType, Playershare, User } from "@/lib/types/userTypes";
import { updatePlayersState } from "@/redux/players/playersSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { filterLeagueIds } from "@/utils/filterLeagues";
import { getLeaguesObj } from "@/utils/getLeaguesObj";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

const OwnedAvailableLeagues = ({ league_ids }: { league_ids: string[] }) => {
  const dispatch: AppDispatch = useDispatch();
  const { leagues } = useSelector((state: RootState) => state.manager);
  const { OAColumn1, OAColumn2, OAColumn3, OAColumn4 } = useSelector(
    (state: RootState) => state.players
  );

  const leaguesObj = useMemo(() => {
    return getLeaguesObj(
      league_ids.map((league_id) => (leagues || {})[league_id])
    );
  }, [leagues, league_ids]);

  return (
    <TableMain
      type={2}
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
      data={filterLeagueIds(league_ids).map((league_id) => {
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
              sort: leagues?.[league_id]?.name || league_id,
              colspan: 2,
              classname: "",
            },
            ...[OAColumn1, OAColumn2, OAColumn3, OAColumn4].map((column) => {
              return {
                text: leaguesObj?.[league_id]?.[column]?.text,
                sort: leaguesObj?.[league_id]?.[column]?.sort,
                colspan: 1,
                classname: "",
              };
            }),
          ],
          secondary: (
            <League type={3} league={leagues?.[league_id] as LeagueType} />
          ),
        };
      })}
      placeholder="Leagues"
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
  const { leagues } = useSelector((state: RootState) => state.manager);
  const { TColumn1, TColumn2 } = useSelector(
    (state: RootState) => state.players
  );

  const leaguesObj = useMemo(() => {
    return getLeaguesObj(
      leaguesTaken.map((lt) => {
        return {
          ...(leagues?.[lt.league_id] as LeagueType),
          lm_roster_id: lt.lm_roster_id,
        };
      })
    );
  }, [leagues, leaguesTaken]);

  return (
    <TableMain
      type={2}
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
      data={filterLeagueIds(leaguesTaken.map((l) => l.league_id)).map(
        (league_id) => {
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
              },
              ...[TColumn1, TColumn2].map((column) => {
                return {
                  text: leaguesObj[league_id][column]?.text || "-",
                  colspan: 1,
                  classname: "",
                };
              }),
            ],
          };
        }
      )}
      placeholder=""
    />
  );
};

type PlayerLeaguesProps = {
  player_id: string;
  player_leagues: Playershare;
};

const PlayerLeagues = ({ player_id, player_leagues }: PlayerLeaguesProps) => {
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
