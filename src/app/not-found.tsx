import { redirect } from "next/navigation";

export default function NotFound() {
  if (process.env.NODE_ENV === "production") redirect("/");
}
