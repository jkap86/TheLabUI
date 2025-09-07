import { League, Matchup } from "@/lib/types/userTypes";
import LeagueScoresMatchup from "../league-scores-matchup/league-scores-matchup";
import LeagueScoresTeams from "../league-scores-teams/league-scores-teams";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateLineupcheckerState } from "@/redux/lineupchecker/lineupcheckerSlice";

const LeagueScores = ({
  matchupsLeague,
}: {
  matchupsLeague: {
    user_matchup: Matchup;
    opp_matchup?: Matchup;
    league_matchups: Matchup[];
    league: League;
  };
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { leagueScoresTab: tab } = useSelector(
    (state: RootState) => state.lineupchecker
  );

  const setTab = (value: string) => {
    dispatch(updateLineupcheckerState({ key: "leagueScoresTab", value }));
  };
  return (
    <>
      <div className="nav items-center">
        <button
          className={tab === "Matchups" ? "active" : ""}
          onClick={() => setTab("Matchups")}
        >
          Matchups
        </button>
        <button
          className={tab === "Teams" ? "active" : ""}
          onClick={() => setTab("Teams")}
        >
          Teams
        </button>
      </div>
      {tab === "Matchups" ? (
        <LeagueScoresMatchup matchupsLeague={matchupsLeague} />
      ) : tab === "Teams" ? (
        <LeagueScoresTeams matchupsLeague={matchupsLeague} />
      ) : null}
    </>
  );
};
export default LeagueScores;
