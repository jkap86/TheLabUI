import Link from "next/link";
import "./heading.css";
import Avatar from "../avatar/avatar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import LeagueTypeSwitch from "../leagueTypeSwitch/leagueTypeSwitch";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const Heading = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.manager);

  useEffect(() => {
    if (pathname.split("/")[1] === "manager")
      localStorage.setItem("tab", pathname.split("/")[3]);
  }, [pathname]);

  return (
    <div className="heading relative">
      <Link
        href={"/"}
        className="m-8 absolute text-yellow-600 !text-[2.5rem] font-score"
      >
        Manager Home
      </Link>

      {pathname.split("/")[3] === "leaguemate-trades" ? (
        <div className="flex justify-center text-[2.5rem] m-8 absolute right-0 text-orange-600 font-score">
          <Link href={"/trades"}>Search All Trades</Link>
        </div>
      ) : null}

      <h1>
        <Avatar id={user?.avatar || ""} type="U" text={user?.username || ""} />
      </h1>

      <LeagueTypeSwitch />

      <h2>
        <select
          value={pathname.split("/")[3].replace("-", " ").toUpperCase()}
          onChange={(e) =>
            user &&
            router.push(
              `/manager/${user.username}/${e.target.value
                .replace(" ", "-")
                .toLowerCase()}`
            )
          }
        >
          <option>LEAGUES</option>
          <option>PLAYERS</option>
          <option>LEAGUEMATES</option>
          <option>LEAGUEMATE TRADES</option>
        </select>
      </h2>
    </div>
  );
};

export default Heading;
