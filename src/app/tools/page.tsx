import Link from "next/link";

export default function Tools() {
  return (
    <div className="min-h-screen flex items-center justify-evenly flex-col bg-[var(--backgroundcolor)] text-white text-3xl">
      <Link href={"/manager"}>Manager</Link>
      <Link href={"/picktracker"}>Pick Tracker</Link>
      <Link href={"/trades"}>Trades</Link>
      <Link href={"/lineupchecker"}>Lineup Checker</Link>
      <Link href={"/playertrends"}>Player Trends</Link>
    </div>
  );
}
