import Link from "next/link";
import "./sh-navbar.css";

const ShNavbar = () => {
  const nav_items = [
    {
      text: "South Harmon Home",
      link: "https://www.southharmonff.com/",
    },
    {
      text: "ADP",
      link: "https://www.southharmonff.com/adp",
    },
    {
      text: "WoRP",
      link: "https://www.southharmonff.com/worp",
    },
    {
      text: "Patreon",
      link: "https://www.patreon.com/SouthHarmon",
    },
    {
      text: "Articles",
      link: "https://www.southharmonff.com/articles",
    },
    {
      text: "Dynasty MindWoRPed",
      link: "https://www.southharmonff.com/mindworped",
    },
    {
      text: "Store",
      link: "https://www.southharmonff.com/store",
    },
    {
      text: "Team Reviews",
      link: "https://www.southharmonff.com/team-reviews",
    },
  ];

  return (
    <div className="sh_nav">
      {nav_items.map((nav_item) => {
        return (
          <Link
            key={nav_item.text}
            rel="noreferrer"
            href={nav_item.link}
            target={
              !nav_item.link.includes("southharmonff.com") ? "_blank" : "_self"
            }
          >
            {nav_item.text}
          </Link>
        );
      })}
    </div>
  );
};

export default ShNavbar;
