"use client";

import React from "react";
import "./home.css";
import Image from "next/image";
import thelablogo from "../../../public/images/thelab.png";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Homepage = ({
  title,
  linkTo,
  id_searched,
  setId_searched,
  placeholder,
}: {
  title: string;
  linkTo: string;
  id_searched: string;
  setId_searched: (searched: string) => void;
  placeholder: string;
}) => {
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId_searched(e.target.value);
  };

  return (
    <div id="homepage">
      <Link
        href={"/tools"}
        className="m-8 absolute text-yellow-600 !text-[2.5rem] font-score"
      >
        Tools
      </Link>
      <div className="logo-container">
        <Image src={thelablogo} alt="logo" className="home-logo" />

        <div className="home-title">
          <h1 className="font-metal text-[var(--color1)]">The Lab</h1>
          <h1 className="font-metal text-yellow-600">{title}</h1>
          {/* <select
            className="nav-options"
            value={tab}
            onChange={(e) => setTab(e.target.value)}
          >
            {["PLAYERS", "LEAGUES", "LEAGUEMATES", "LEAGUEMATE TRADES"].map(
              (option) => {
                return <option key={option}>{option}</option>;
              }
            )}
          </select>
*/}
          <div className="user-input">
            <input
              type="text"
              value={id_searched}
              placeholder={placeholder}
              onChange={handleInputChange}
              list="users"
            />

            <button type="button" onClick={() => router.push(linkTo)}>
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
