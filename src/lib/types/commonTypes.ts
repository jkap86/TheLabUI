import { JSX } from "react";

export type Allplayer = {
  player_id: string;
  position: string;
  team: string;
  full_name: string;
  first_name: string;
  last_name: string;
  age: string;
  fantasy_positions: string[];
  years_exp: number;
  active: boolean;
};

export type colObj = {
  sort: number | string;
  text: string | JSX.Element;
  trendColor: { [key: string]: string };
  classname: string;
};
