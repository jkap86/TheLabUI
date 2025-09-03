import Link from "next/link";
import "./heading.css";
import Avatar from "../avatar/avatar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import LeagueTypeSwitch from "../leagueTypeSwitch/leagueTypeSwitch";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { filterLeagueIds } from "@/utils/filterLeagues";

const Heading = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, leagues, type1, type2 } = useSelector(
    (state: RootState) => state.manager
  );

  useEffect(() => {
    if (pathname.split("/")[1] === "manager") {
      const tabLocal = pathname.split("/")[3];

      localStorage.setItem("tab", tabLocal);
    }
  }, [pathname]);

  const leagueCount = (
    <h3 className="text-[2.5rem] !my-[2rem] mx-auto text-[3rem] font-score w-fit p-[3rem] text-yellow-600">
      League Count:{" "}
      {
        filterLeagueIds(Object.keys(leagues || {}), {
          type1,
          type2,
          leagues,
        }).length
      }
    </h3>
  );

  return (
    <>
      <div className="heading relative">
        <Link href={"/manager"} className="home">
          Manager Home
        </Link>

        {pathname.split("/")[3] === "leaguemate-trades" ? (
          <div className="flex justify-center text-[2.5rem] m-8 absolute right-0 text-orange-600 font-score">
            <Link href={"/trades"}>Search All Trades</Link>
          </div>
        ) : null}

        <h1>
          <Avatar
            id={user?.avatar || ""}
            type="U"
            text={user?.username || ""}
          />
        </h1>

        {pathname.split("/")[3] === "leaguemate-trades" ? null : (
          <>
            <LeagueTypeSwitch />
            {leagueCount}
          </>
        )}

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
    </>
  );
};

export default Heading;
