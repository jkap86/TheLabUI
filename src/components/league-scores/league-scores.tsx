import { League, Matchup } from "@/lib/types/userTypes";
import TableMain from "../table-main/table-main";

const LeagueScores = ({
  matchup,
}: {
  matchup: {
    user_matchup: Matchup;
    opp_matchup?: Matchup;
    league_matchups: Matchup[];
    league: League;
  };
}) => {
  const getTable = (matchup: Matchup | undefined) => {
    console.log({ matchup });
    return <TableMain type={2} half={true} headers={[]} data={[]} />;
  };

  const user_table = getTable(matchup.user_matchup);

  const opp_table = getTable(matchup.opp_matchup);

  return (
    <>
      {user_table}
      {opp_table}
    </>
  );
};
export default LeagueScores;
