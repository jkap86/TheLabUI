import { League, Playershare, User } from "@/lib/types/userTypes";

export const getPlayerShares = (leagues: League[], user: User) => {
  const playershares: {
    [player_id: string]: Playershare;
  } = {};

  const pickshares: {
    [pick_id: string]: Playershare;
  } = {};

  const leaguemates: {
    [key: string]: {
      user_id: string;
      username: string;
      avatar: string | null;
      leagues: string[];
    };
  } = {
    [user.user_id]: {
      user_id: user.user_id,
      username: user.username,
      avatar: user.avatar,
      leagues: [],
    },
  };

  leagues.forEach((league) => {
    (league.user_roster?.players || [])?.forEach((player_id) => {
      if (!playershares[player_id]) {
        playershares[player_id] = {
          owned: [],
          taken: [],
          available: [],
        };
      }

      playershares[player_id].owned.push(league.league_id);
    });

    (league.user_roster.draftpicks || []).forEach((draft_pick) => {
      const pick_id = `${draft_pick.season} ${draft_pick.round}.${
        draft_pick.order?.toLocaleString("en-US", {
          minimumIntegerDigits: 2,
        }) || draft_pick.order
      }`;

      if (!pickshares[pick_id]) {
        pickshares[pick_id] = {
          owned: [],
          taken: [],
          available: [],
        };
      }

      pickshares[pick_id].owned.push(league.league_id);
    });

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
        });

        (roster.draftpicks || []).forEach((draft_pick) => {
          const pick_id = `${draft_pick.season} ${draft_pick.round}.${
            draft_pick.order?.toLocaleString("en-US", {
              minimumIntegerDigits: 2,
            }) || draft_pick.order
          }`;

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

  leagues.forEach((league) => {
    const available = Object.keys(playershares).filter(
      (player_id) =>
        !league.rosters.some((roster) => roster.players?.includes(player_id))
    );

    available.forEach((player_id) => {
      playershares[player_id].available.push(league.league_id);
    });
  });

  return { playershares, leaguemates, pickshares };
};
