import axiosInstance from "@/lib/axiosInstance";

export const getProjections = async (week: string) => {
  const projections: {
    data: { player_id: string; stats: { [cat: string]: number } }[];
  } = await axiosInstance.get(
    `https://api.sleeper.com/projections/nfl/${process.env.SEASON}/${week}?season_type=regular`
  );

  const projections_obj: { [player_id: string]: { [cat: string]: number } } =
    {};

  projections.data
    .filter((p) => p.stats.pts_ppr)
    .forEach((p) => {
      projections_obj[p.player_id] = p.stats;
    });

  return projections_obj;
};
