import { Allplayer } from "@/lib/types/commonTypes";

export const filterPlayerIds = ({
  player_ids,
  allplayers,
  nflState,
  filterDraftClass,
  filterTeam,
  filterPosition,
}: {
  player_ids: string[];
  allplayers: { [player_id: string]: Allplayer } | null;
  nflState: { [key: string]: string | number } | null;
  filterDraftClass: string;
  filterTeam: string;
  filterPosition: string;
}) => {
  return player_ids.filter(
    (player_id) =>
      (filterDraftClass === "All" ||
        (
          parseInt(nflState?.season as string) -
          (allplayers?.[player_id]?.years_exp || 0)
        ).toString() === filterDraftClass) &&
      (filterTeam === "All" || allplayers?.[player_id]?.team === filterTeam) &&
      (filterPosition === "All" ||
        allplayers?.[player_id]?.position === filterPosition)
  );
};
