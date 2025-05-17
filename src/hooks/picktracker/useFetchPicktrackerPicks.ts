import { AppDispatch } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";

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

export default function useFetchPicktrackerPicks({
  league_id,
}: {
  league_id: string;
}) {
  const [picks, setPicks] = useState([]);
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
}
