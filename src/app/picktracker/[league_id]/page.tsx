"use client";

import Avatar from "@/components/avatar/avatar";
import LoadingIcon from "@/components/loading-icon/loading-icon";
import ShNavbar from "@/components/sh-navbar/sh-navbar";
import TableMain from "@/components/table-main/table-main";
import useFetchAllplayers from "@/hooks/useFetchAllplayers";
import axios from "axios";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface Picks {
  league: {
    avatar: string;
    name: string;
  };
  picks: {
    pick: string;
    player_id: string;
    player_name: string;
    picked_by: string;
    picked_by_avatar: string;
  }[];
}

const Picks = ({ params }: { params: Promise<{ league_id: string }> }) => {
  const { league_id } = use(params);
  const [picks, setPicks] = useState<Picks>({
    league: { avatar: "", name: "" },
    picks: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPicks = async () => {
      setIsLoading(true);
      const p = await axios.get("/api/picktracker/picks", {
        params: {
          league_id: league_id,
        },
      });

      setPicks(p.data);
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
        <div className="picktracker">
          <ShNavbar />
          <Link href={"/"} className="home">
            The Lab Home
          </Link>
          <h1>
            <Avatar
              id={picks.league?.avatar}
              type="L"
              text={picks.league?.name}
            />
          </h1>
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
              picks.picks?.map((pick) => {
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
        </div>
      )}
    </>
  );
};

export default Picks;
