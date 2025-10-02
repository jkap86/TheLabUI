"use client";

import TableMain from "@/components/table-main/table-main";
import { AppDispatch, RootState } from "@/redux/store";
import { use, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LineupcheckerLayout from "../lineupchecker-layout";
import Avatar from "@/components/common/avatar/avatar";
import {
  getPlayerTotal,
  ppr_scoring_settings,
} from "@/utils/getOptimalStarters";
import { fetchMatchups } from "@/redux/lineupchecker/lineupcheckerActions";
import PprPointsEdit from "./components/ppr-points-edit";
import ProjectionsPlayer from "./components/projections-player";
import { filterPlayerIds } from "@/utils/filterPlayers";
import PlayersFilters from "@/components/players-filters/players-filters";
import { updateLineupcheckerEdits } from "@/redux/lineupchecker/lineupcheckerSlice";
import Modal from "@/components/modal/modal";

const ProjectionsPage = ({
  params,
}: {
  params: Promise<{ searched: string }>;
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { allplayers, nflState } = useSelector(
    (state: RootState) => state.common
  );
  const {
    projections,
    edits,
    schedule,
    user,
    updateMatchupsAvailable,
    liveStats,
  } = useSelector((state: RootState) => state.lineupchecker);
  const [filterDraftClass, setFilterDraftClass] = useState("All");
  const [filterTeam, setFilterTeam] = useState("All");
  const [filterPosition, setFilterPosition] = useState("All");
  const [sortBy, setSortBy] = useState<{ column: 2 | 3; asc: boolean }>({
    column: 2,
    asc: false,
  });
  const [editedPpr, setEditedPpr] = useState<{ [player_id: string]: number }>(
    {}
  );
  const [isOpen, setIsOpen] = useState(false);

  const update = () => {
    if (user)
      dispatch(
        fetchMatchups({
          user_id: user.user_id,
          week: Math.max(1, nflState?.leg as number),
          edits,
        })
      );
  };

  const component = (
    <>
      <div className="relative">
        <i
          onClick={() => setIsOpen(true)}
          className="fas fa-info-circle absolute text-[3rem] top-[-5rem] right-[5rem] text-red-600"
        ></i>
        <div className="flex justify-center max-w-[100vmin] m-auto">
          <button
            onClick={updateMatchupsAvailable ? update : undefined}
            className={
              "w-[50rem] m-4 p-4 text-[3.5rem] bg-[var(--color2)] !border-2 border-gray-400 border-double" +
              (updateMatchupsAvailable ? "" : " opacity-25")
            }
          >
            Update Matchups & Record
          </button>

          <button
            onClick={() => {
              if (Object.keys(edits || {}).length > 0) {
                dispatch(updateLineupcheckerEdits({}));
              } else {
                const editString =
                  (nflState &&
                    user &&
                    `edits__${Math.max(1, nflState?.leg as number)}__${
                      user?.user_id
                    }`) ||
                  "";

                const savedString = localStorage.getItem(editString) ?? "{}";

                let savedParsed;

                try {
                  savedParsed = JSON.parse(savedString);
                } catch {
                  savedParsed = false;
                }

                console.log({ savedParsed });

                if (savedParsed) {
                  dispatch(updateLineupcheckerEdits(savedParsed));
                }
              }
            }}
            className={
              "w-[25rem] m-4 p-4 text-[3.5rem] bg-[var(--color2)] !border-2 border-gray-400 border-double"
            }
          >
            {Object.keys(edits || {}).length > 0
              ? "Reset All Edits"
              : "Load Edits"}
          </button>
        </div>
        <PlayersFilters
          filterDraftClass={filterDraftClass}
          setFilterDraftClass={(e: { target: { value: string } }) =>
            setFilterDraftClass(e.target.value)
          }
          filterTeam={filterTeam}
          setFilterTeam={(e: { target: { value: string } }) =>
            setFilterTeam(e.target.value)
          }
          filterPosition={filterPosition}
          setFilterPosition={(e: { target: { value: string } }) =>
            setFilterPosition(e.target.value)
          }
        />
        <TableMain
          type={1}
          headers_sort={[2, 3, 4]}
          headers={[
            { text: "Player", colspan: 2 },
            {
              text: "Opp",
              colspan: 1,
            },
            {
              text: "Ppr Proj",
              colspan: 1,
            },
            {
              text: "Edited Ppr",
              colspan: 1,
            },
            {
              text: "Ppr Points",
              colspan: 1,
            },
          ]}
          data={filterPlayerIds({
            player_ids: Object.keys(projections),
            allplayers,
            nflState,
            filterDraftClass,
            filterPosition,
            filterTeam,
          })
            .sort(
              (a, b) => (projections[b].pts_ppr || 0) - projections[a].pts_ppr
            )
            .map((player_id) => {
              const player = allplayers?.[player_id];

              const text =
                allplayers?.[player_id]?.full_name ||
                (parseInt(player_id) ? "Inactive " + player_id : player_id);

              const live_points = getPlayerTotal(
                ppr_scoring_settings,
                liveStats[player_id]?.stats ?? {}
              );
              return {
                id: player_id,
                search: {
                  text: text,
                  display: <Avatar id={player_id} text={text} type="P" />,
                },
                columns: [
                  {
                    text: (
                      <Avatar
                        id={player_id}
                        text={player?.full_name || player_id}
                        type="P"
                      />
                    ),
                    colspan: 2,
                    classname: "",
                  },
                  {
                    text: schedule[player?.team || ""]?.opp ?? "-",
                    colspan: 1,
                    classname: "",
                  },
                  {
                    text: (projections[player_id]?.pts_ppr ?? 0).toFixed(1),
                    colspan: 1,
                    classname: "",
                    sort: projections[player_id]?.pts_ppr ?? 0,
                  },
                  {
                    text: (
                      <PprPointsEdit
                        player_id={player_id}
                        scoring_settings={ppr_scoring_settings}
                        prevValue={editedPpr[player_id] ?? 0}
                        sendValue={(value) =>
                          setEditedPpr((prevState) => ({
                            ...prevState,
                            [player_id]: value,
                          }))
                        }
                      />
                    ),
                    colspan: 1,
                    classname: "",
                    sort: editedPpr[player_id] ?? 0,
                  },
                  {
                    text: live_points.toFixed(1),
                    classname: "",
                    colspan: 1,
                    sort: live_points,
                  },
                ],
                secondary: <ProjectionsPlayer player_id={player_id} />,
              };
            })}
          placeholder="Player"
          sortBy={sortBy}
          setSortBy={(value) =>
            setSortBy({
              column: value.column as 2 | 3,
              asc: value.asc,
            })
          }
        />
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <p className="text-[3rem]">
          Modfiy Player Projections and click Update button to update matchup
          optimal starters and projected record. Most recent edits are saved to
          device.
        </p>
      </Modal>
    </>
  );

  return <LineupcheckerLayout searched={searched} component={component} />;
};

export default ProjectionsPage;
