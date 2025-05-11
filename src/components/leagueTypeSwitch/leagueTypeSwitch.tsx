import { AppDispatch, RootState } from "@/redux/store";
import "./leagueTypeSwitch.css";
import { useDispatch, useSelector } from "react-redux";
import {
  updateLeagueType1,
  updateLeagueType2,
} from "@/redux/manager/managerSlice";

const LeagueTypeSwitch = () => {
  const dispatch: AppDispatch = useDispatch();
  const { type1, type2 } = useSelector((state: RootState) => state.manager);

  const setType1 = (type: "Redraft" | "All" | "Dynasty") => {
    return dispatch(updateLeagueType1(type));
  };

  const setType2 = (type: "Bestball" | "All" | "Lineup") => {
    return dispatch(updateLeagueType2(type));
  };

  return (
    <div className="switch_wrapper">
      <div className="switch">
        <button
          className={"sw " + (type1 === "Redraft" ? "active" : "")}
          onClick={() => dispatch(setType1("Redraft"))}
        >
          Redraft
        </button>
        <button
          className={"sw " + (type1 === "All" ? "active" : "")}
          onClick={() => dispatch(setType1("All"))}
        >
          All
        </button>
        <button
          className={"sw " + (type1 === "Dynasty" ? "active" : "")}
          onClick={() => dispatch(setType1("Dynasty"))}
        >
          Dynasty
        </button>
      </div>
      <div className="switch">
        <button
          className={"sw " + (type2 === "Bestball" ? "active" : "")}
          onClick={() => dispatch(setType2("Bestball"))}
        >
          Bestball
        </button>
        <button
          className={"sw " + (type2 === "All" ? "active" : "")}
          onClick={() => dispatch(setType2("All"))}
        >
          All
        </button>
        <button
          className={"sw " + (type2 === "Lineup" ? "active" : "")}
          onClick={() => dispatch(setType2("Lineup"))}
        >
          Lineup
        </button>
      </div>
    </div>
  );
};

export default LeagueTypeSwitch;
