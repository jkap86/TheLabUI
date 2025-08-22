import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const PlayersFilters = ({
  filterDraftClass,
  setFilterDraftClass,
  filterTeam,
  setFilterTeam,
  filterPosition,
  setFilterPosition,
}: {
  filterDraftClass: string;
  setFilterDraftClass: (e: { target: { value: string } }) => void;
  filterTeam: string;
  setFilterTeam: (e: { target: { value: string } }) => void;
  filterPosition: string;
  setFilterPosition: (e: { target: { value: string } }) => void;
}) => {
  const { nflState, allplayers } = useSelector(
    (state: RootState) => state.common
  );

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

  return (
    <div className="nav-buttons">
      <div>
        <label>Draft Class</label>
        <select
          value={filterDraftClass}
          onChange={(draftClass) => setFilterDraftClass(draftClass)}
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
        <select value={filterTeam} onChange={(team) => setFilterTeam(team)}>
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
          onChange={(position) => setFilterPosition(position)}
        >
          <option>All</option>
          {positions.map((position) => {
            return <option key={position}>{position}</option>;
          })}
        </select>
      </div>
    </div>
  );
};

export default PlayersFilters;
