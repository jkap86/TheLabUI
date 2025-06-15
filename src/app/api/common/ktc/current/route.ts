import { NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET() {
  try {
    const { date: date_dynasty, values: values_dynasty } = await getKtcValues(
      "dynasty"
    );

    const { date: date_redraft, values: values_redraft } = await getKtcValues(
      "fantasy"
    );

    return NextResponse.json(
      {
        dynasty: { date: date_dynasty, values: values_dynasty },
        redraft: { date: date_redraft, values: values_redraft },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json("Error fetching KTC values", { status: 500 });
  }
}

const getKtcValues = async (type: "dynasty" | "fantasy") => {
  const ktc_dates_db = await pool.query(
    `SELECT * FROM common WHERE name = 'ktc_dates_${type}'`
  );

  const ktc_dates: { [date: string]: { [key: string]: number } } =
    ktc_dates_db.rows[0]?.data || {};

  const date = Object.keys(ktc_dates).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )[0];

  const current_values_obj = ktc_dates[date] || {};

  const values = Object.entries(current_values_obj);

  return { date, values };
};
