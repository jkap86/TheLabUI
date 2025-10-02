import LoadingIcon from "@/components/loading-icon/loading-icon";
import Link from "next/link";

export default function Tools() {
  const links = [
    { href: "/manager", text: "Manager" },
    { href: "/picktracker", text: "Pick Tracker" },
    { href: "/trades", text: "Trades" },
    { href: "/lineupchecker", text: "Lineup Checker" },
  ];
  return (
    <main className="relative h-[100dvh] flex flex-col items-center justify-center text-center">
      <h1 className="absolute top-0 left-0 right-0 h-[20rem] z-2 !text-[10rem] flex justify-center items-center font-metal font-black text-[var(--color1)] ![text-shadow:0_0_1rem_red]">
        The Lab
      </h1>
      <div className="relative h-[100dvh] flex items-center justify-center z-1">
        <div className="scale-150 drop-shadow-[0_0_5rem_white] opacity-[0.25]">
          <LoadingIcon messages={[]} />
        </div>
      </div>

      <nav className="h-[100dvh] pt-[5rem]  flex flex-col justify-evenly items-center absolute top-0 left-0 right-0 z-2">
        {links.map((link) => {
          return (
            <Link
              key={link.href}
              href={link.href}
              className="font-pulang text-[5rem] text-yellow-600 "
            >
              {link.text}
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
