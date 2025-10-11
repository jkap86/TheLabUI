import { League, Playershare, User } from "@/lib/types/userTypes";
import { formatPickToString } from "../common/formatDraftPick";

export const getPlayerShares = (leagues: League[], user: User) => {
  const playershares: Record<string, Playershare> = {};
  const pickshares: Record<string, Playershare> = {};
  const leaguemates: Record<
    string,
    {
      user_id: string;
      username: string;
      avatar: string | null;
      leagues: string[];
    }
  > = {
    [user.user_id]: {
      user_id: user.user_id,
      username: user.username,
      avatar: user.avatar,
      leagues: [],
    },
  };

  // track all players in each league to calculate availability later
  const leaguePlayerSets: Record<string, Set<string>> = {};

  leagues.forEach((league) => {
    const leaguePlayers = (leaguePlayerSets[league.league_id] =
      new Set<string>());

    // --- user roster ---
    (league.user_roster.players || []).forEach((player_id) => {
      if (!playershares[player_id]) {
        playershares[player_id] = {
          owned: [],
          taken: [],
          available: [],
        };
      }

      playershares[player_id].owned.push(league.league_id);

      leaguePlayers.add(player_id);
    });

    (league.user_roster.draftpicks || []).forEach((draft_pick) => {
      const pick_id = formatPickToString(draft_pick);

      if (!pickshares[pick_id]) {
        pickshares[pick_id] = {
          owned: [],
          taken: [],
          available: [],
        };
      }

      pickshares[pick_id].owned.push(league.league_id);
    });

    // --- other rosters ---
    league.rosters
      .filter((roster) => roster.roster_id !== league.user_roster.roster_id)
      .forEach((roster) => {
        if (!leaguemates[roster.user_id]) {
          leaguemates[roster.user_id] = {
            user_id: roster.user_id,
            username: roster.username,
            avatar: roster.avatar,
            leagues: [],
          };
        }

        leaguemates[roster.user_id].leagues.push(league.league_id);

        (roster.players || [])?.forEach((player_id) => {
          if (!playershares[player_id]) {
            playershares[player_id] = {
              owned: [],
              taken: [],
              available: [],
            };
          }

          playershares[player_id].taken.push({
            lm_roster_id: roster.roster_id,
            lm: {
              user_id: roster.user_id,
              username: roster.username,
              avatar: roster.avatar || "",
            },
            league_id: league.league_id,
          });

          leaguePlayers.add(player_id);
        });

        (roster.draftpicks || []).forEach((draft_pick) => {
          const pick_id = formatPickToString(draft_pick);

          if (!pickshares[pick_id]) {
            pickshares[pick_id] = {
              owned: [],
              taken: [],
              available: [],
            };
          }

          pickshares[pick_id].taken.push({
            lm_roster_id: roster.roster_id,
            lm: {
              user_id: roster.user_id,
              username: roster.username,
              avatar: roster.avatar || "",
            },
            league_id: league.league_id,
          });
        });
      });
  });

  // --- availability ---
  leagues.forEach((league) => {
    const present = leaguePlayerSets[league.league_id] ?? new Set<string>();

    Object.keys(playershares).forEach((player_id) => {
      if (!present.has(player_id)) {
        playershares[player_id].available.push(league.league_id);
      }
    });
  });

  return { playershares, leaguemates, pickshares };
};
