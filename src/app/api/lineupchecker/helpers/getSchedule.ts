import axiosInstance from "@/lib/axiosInstance";

export const getSchedule = async (week: string) => {
  const graphqlQuery = {
    query: `
              query batch_scores {
                  scores(
                      sport: "nfl"
                      season_type: "regular"
                      season: "${process.env.SEASON}"
                      week: ${week}
                  ) {
                      
                      game_id
                      metadata 
                      status
                      start_time
                  }
              }
              `,
  };
  const schedule_week = await axiosInstance.post(
    "https://sleeper.com/graphql",
    graphqlQuery
  );

  const schedule_obj: {
    [team: string]: {
      kickoff: number;
      opp: string;
      timeLeft: number;
      is_in_progress: boolean;
    };
  } = {};

  schedule_week.data.data.scores.forEach(
    (game: {
      start_time: number;
      metadata: {
        away_team: string;
        home_team: string;
        time_remaining?: number;
        is_in_progress: boolean;
      };
    }) => {
      schedule_obj[game.metadata.away_team] = {
        kickoff: game.start_time,
        opp: "@ " + game.metadata.home_team,
        timeLeft: game.metadata.time_remaining || 3600,
        is_in_progress: game.metadata.is_in_progress,
      };

      schedule_obj[game.metadata.home_team] = {
        kickoff: game.start_time,
        opp: "vs " + game.metadata.away_team,
        timeLeft: game.metadata.time_remaining || 3600,
        is_in_progress: game.metadata.is_in_progress,
      };
    }
  );

  return schedule_obj;
};
