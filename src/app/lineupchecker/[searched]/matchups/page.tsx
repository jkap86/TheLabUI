"use client";

import { RootState, AppDispatch } from "@/redux/store";
import { use, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import LineupcheckerLayout from "../lineupchecker-layout";
import LineupcheckerMatchups from "@/components/lineupchecker-matchups/lineupchecker-matchups";
import { updateLineupcheckerState } from "@/redux/lineupchecker/lineupcheckerSlice";
import Modal from "@/components/modal/modal";

const Matchups = ({ params }: { params: Promise<{ searched: string }> }) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { matchups, locked } = useSelector(
    (state: RootState) => state.lineupchecker
  );
  const [isOpen, setIsOpen] = useState(false);

  const modalItems = [
    {
      key: <i className="fa-solid fa-lock text-yellow-700"></i>,
      value:
        "Locked Rosters - ignore subs involving players who have already played",
    },
    {
      key: <i className="fa-solid fa-lock-open text-yellow-700"></i>,
      value:
        "Unlocked Rosters - include subs involving players who have already played",
    },
    {
      key: "Ordered",
      value:
        "Roster set so players playing later are in flex spots, as to allow more flexibility after early players have played",
    },
  ];

  const component = (
    <>
      <div className="flex justify-center m-8 text-[4rem] text-yellow-700 relative">
        <i
          onClick={() => setIsOpen(true)}
          className="fas fa-info-circle absolute text-[3rem] top-[-5rem] right-[5rem] text-red-600"
        ></i>
        {locked ? (
          <i
            className="fa-solid fa-lock"
            onClick={() =>
              dispatch(
                updateLineupcheckerState({ key: "locked", value: false })
              )
            }
          ></i>
        ) : (
          <i
            className="fa-solid fa-lock-open"
            onClick={() =>
              dispatch(updateLineupcheckerState({ key: "locked", value: true }))
            }
          ></i>
        )}
      </div>
      <LineupcheckerMatchups
        type={1}
        league_matchups={Object.keys(matchups).map((league_id) => {
          return {
            ...matchups[league_id],
            league_id,
          };
        })}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="text-[3rem] flex flex-col">
          {modalItems.map((item) => {
            return (
              <div key={item.value} className="flex m-8 !rounded">
                <div className="w-[30%] flex justify-center items-center text-red-700 font-black bg-gray-900">
                  {item.key}
                </div>
                <div className="w-[70%] bg-gray-400 pl-8">{item.value}</div>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );

  return <LineupcheckerLayout searched={searched} component={component} />;
};

export default Matchups;
