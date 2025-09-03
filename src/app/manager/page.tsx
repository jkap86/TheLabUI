"use client";

import Homepage from "@/components/home/home";
import { useEffect, useState } from "react";

const Manager = () => {
  const [tab, setTab] = useState("");
  const [username_searched, setUsername_searched] = useState("");

  useEffect(() => {
    const tab_options = [
      "leagues",
      "players",
      "leaguemates",
      "leaguemate trades",
    ];

    const tab_previous = localStorage.getItem("tab");

    if (tab_previous && tab_options.includes(tab_previous)) {
      setTab(tab_previous);
    } else {
      setTab("LEAGUES");
    }
  }, []);

  return (
    <Homepage
      title="Manager"
      linkTo={`/manager/${username_searched.trim()}/${tab.toLowerCase()}`}
      id_searched={username_searched}
      setId_searched={setUsername_searched}
      placeholder="Username"
    />
  );
};
export default Manager;
