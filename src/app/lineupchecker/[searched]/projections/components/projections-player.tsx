import { ProjectionEdits } from "@/lib/types/userTypes";
import { updateLineupcheckerEdits } from "@/redux/lineupchecker/lineupcheckerSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

const ProjectionsPlayer = ({ player_id }: { player_id: string }) => {
  const dispatch: AppDispatch = useDispatch();
  const { projections, edits, matchups } = useSelector(
    (state: RootState) => state.lineupchecker
  );

  const scoring_cats = Array.from(
    new Set(
      Object.values(matchups).flatMap((m) =>
        Object.keys(m.league.scoring_settings)
      )
    )
  );

  const updateEdits = (cat: string, value: string) => {
    const updatedEdits: ProjectionEdits = {
      ...edits,
      [player_id]: {
        ...edits[player_id],
        [cat]: {
          sleeper_value: projections[player_id]?.[cat] ?? 0,
          update: value.trim() === "" ? "" : Number(value),
        },
      },
    };

    dispatch(updateLineupcheckerEdits(updatedEdits));
  };

  /*
  const component = (
    <>
      <div className="nav"></div>
      <TableMain
        type={2}
        headers={[{ text: "Setting", colspan: 2 }]}
        data={Object.keys(projections[player_id])
          .filter((cat) => scoring_cats.includes(cat))
          .sort((a, b) => {
            const getValue = (c: string) => {
              let value = 0;

              if (c.startsWith("bonus")) {
                value += 5;
              }

              if (!["pass", "rush", "rec"].some((type) => c.includes(type))) {
                value += 4;
              }

              ["pass", "rush", "rec"].forEach((_, index) => {
                value += index;
              });

              return value;
            };

            return getValue(a) - getValue(b);
          })
          .map((cat) => {
            const editValue =
              edits[player_id]?.[cat]?.update ??
              projections[player_id][cat] ??
              "0";
            return {
              id: cat,
              columns: [
                {
                  text: cat.replaceAll("_", " "),
                  colspan: 1,
                  classname: "",
                },
                {
                  text:
                    projections[player_id]?.[cat]?.toLocaleString("en-US", {
                      maximumFractionDigits: 1,
                    }) || "0",
                  colspan: 1,
                  classname: "",
                },
                {
                  text: (
                    <div className="text-[4rem]">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => updateEdits(cat, e.target.value)}
                      />
                    </div>
                  ),
                  colspan: 1,
                  classname: "",
                },
              ],
            };
          })}
      />
    </>
  );
  */

  const component = (
    <>
      <div className="nav items-center">
        {[0, 0.5, 1, 1.5, 2].map((value) => {
          return (
            <div
              key={value}
              className="p-2 shadow-[inset_0_0_3rem_black]"
              onClick={() => {
                const stat_obj = Object.fromEntries(
                  Object.keys(projections[player_id] || {})
                    .filter((cat) => scoring_cats.includes(cat))
                    .map((cat) => {
                      return [
                        cat,
                        edits[player_id]?.[cat]?.update ??
                          projections[player_id][cat],
                      ];
                    })
                );

                const updated: {
                  [cat: string]: { update: number | ""; sleeper_value: number };
                } = {};

                Object.keys(stat_obj).forEach((cat) => {
                  updated[cat] = {
                    update:
                      value === 1
                        ? projections[player_id][cat] || 0
                        : parseFloat(
                            ((stat_obj[cat] || 0) * value).toLocaleString(
                              "en-US",
                              { maximumFractionDigits: 2 }
                            )
                          ),
                    sleeper_value: projections[player_id][cat] || 0,
                  };
                });

                dispatch(
                  updateLineupcheckerEdits({
                    ...edits,
                    [player_id]: updated,
                  })
                );
              }}
            >
              {value === 1 ? "Original" : value.toString()}
              {value === 1 ? "" : "x"}
            </div>
          );
        })}
      </div>
      <div className="p-8 bg-gray-700 shadow-[inset_0_0_40rem_black] shadow">
        <table className="border-separate !border-spacing-4">
          <tbody>
            {Object.keys(projections[player_id])
              .filter((cat) => scoring_cats.includes(cat))
              .sort((a, b) => {
                const getValue = (c: string) => {
                  let value = 0;

                  if (c.startsWith("bonus")) {
                    value += 5;
                  }

                  if (
                    !["pass", "rush", "rec"].some((type) => c.includes(type))
                  ) {
                    value += 4;
                  }

                  ["pass", "rush", "rec"].forEach((_, index) => {
                    value += index;
                  });

                  return value;
                };

                return getValue(a) - getValue(b);
              })
              .map((cat) => {
                const editValue =
                  edits[player_id]?.[cat]?.update ??
                  projections[player_id][cat] ??
                  "";

                const sleeperValue = projections[player_id]?.[cat] ?? 0;

                return (
                  <tr key={cat} className="">
                    <td></td>
                    <td
                      colSpan={2}
                      className="p-4 bg-[maroon] shadow-[inset_0_0_3rem_black]"
                    >
                      {cat.replaceAll("_", " ")}
                    </td>

                    <td className="p-4 bg-[maroon] shadow-[inset_0_0_1rem_black]">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => updateEdits(cat, e.target.value)}
                        //onBlur={() => updateEdits(cat)}
                        className={`text-[4rem] w-full text-center bg-[black] ${
                          (editValue || 0) > sleeperValue
                            ? "green"
                            : (editValue || 0) < sleeperValue
                            ? "red"
                            : ""
                        }`}
                      />
                    </td>
                    <td className="text-center">
                      {sleeperValue !== editValue ? (
                        <div className="font-metal line-through text-[4rem] text-yellow-600">
                          {sleeperValue}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
  return component;
};

export default ProjectionsPlayer;
