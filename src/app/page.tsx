import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-evenly flex-col bg-[var(--backgroundcolor)] text-white text-3xl">
      <Link href={"/manager"}>Manager</Link>
      <div>Pick Tracker</div>
      <div>Lineup Checker</div>
      <div>Trades</div>
    </div>
  );
}
