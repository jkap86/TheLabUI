"use client";

import Homepage from "@/components/common/home/home";
import { useState } from "react";

const LineupChecker = () => {
  const [username_searched, setUsername_searched] = useState("");

  return (
    <Homepage
      title="Lineup Checker"
      linkTo={`/lineupchecker/${username_searched}/matchups`}
      id_searched={username_searched}
      setId_searched={setUsername_searched}
      placeholder="Username"
    />
  );
};

export default LineupChecker;
