"use client";

import Avatar from "@/components/avatar/avatar";
import LoadingIcon from "@/components/loading-icon/loading-icon";
import ShNavbar from "@/components/sh-navbar/sh-navbar";
import TableMain from "@/components/table-main/table-main";
import useFetchAllplayers from "@/hooks/useFetchAllplayers";
import axios from "axios";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import "../../../components/heading/heading.css";

interface Pick {
  pick: string;
  player_id: string;
  player_name: string;
  picked_by: string;
  picked_by_avatar: string;
}

const Picks = ({ params }: { params: Promise<{ league_id: string }> }) => {
  const { league_id } = use(params);
  const [league, setLeague] = useState({ avatar: "", name: "" });
  const [picks, setPicks] = useState<Pick[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPicks = async () => {
      setIsLoading(true);
      const p = await axios.get("/api/picktracker/picks", {
        params: {
          league_id: league_id,
        },
      });

      setLeague(p.data.league);
      if (p.data.picks) {
        setPicks(p.data.picks);
      } else if (p.data.error) {
        setError(p.data.error);
      }

      setIsLoading(false);
    };

    fetchPicks();
  }, [league_id]);

  useFetchAllplayers();

  return (
    <>
      {isLoading ? (
        <LoadingIcon messages={[]} />
      ) : (
        <>
          <ShNavbar />
          <div className="picktracker">
            <Link
              href={"/picktracker"}
              className="m-8 absolute text-yellow-600 !text-[2.5rem] font-score"
            >
              Pick Tracker Home
            </Link>
            <div className="heading">
              <h1 className="p-8">
                <Avatar id={league?.avatar} type="L" text={league?.name} />
              </h1>
            </div>
            {error ? (
              <h1 className="!text-[4rem] m-[5rem] text-red-600 font-score">
                {error}
              </h1>
            ) : (
              <TableMain
                type={1}
                headers={[
                  {
                    text: "Pick",
                    colspan: 2,
                  },
                  {
                    text: "Manager",
                    colspan: 4,
                  },
                  {
                    text: "Kicker",
                    colspan: 4,
                  },
                ]}
                data={
                  picks?.map((pick) => {
                    return {
                      id: pick.player_id,
                      columns: [
                        {
                          text: pick.pick,
                          sort: -pick.pick,
                          colspan: 2,
                          classname: "",
                        },
                        {
                          text: (
                            <Avatar
                              id={pick.picked_by_avatar}
                              type="U"
                              text={pick.picked_by}
                            />
                          ),
                          colspan: 4,
                          classname: "",
                        },
                        {
                          text: (
                            <Avatar
                              id={pick.player_id}
                              type="P"
                              text={pick.player_name}
                            />
                          ),
                          colspan: 4,
                          classname: "",
                        },
                      ],
                    };
                  }) || []
                }
                placeholder=""
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Picks;
