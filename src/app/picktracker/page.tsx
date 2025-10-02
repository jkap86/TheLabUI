"use client";

import Homepage from "@/components/common/home/home";
import { useState } from "react";

const Picktracker = () => {
  const [league_id_searched, setLeague_id_searched] = useState("");

  return (
    <Homepage
      title="Pick Tracker"
      linkTo={`/picktracker/${league_id_searched}`}
      id_searched={league_id_searched}
      setId_searched={setLeague_id_searched}
      placeholder="League ID"
    />
  );
};

export default Picktracker;
