import axiosInstance from "@/lib/axiosInstance";

function timeStringToS(
  time: string | undefined,
  quarter_num: number | ""
): number {
  const [minutes, seconds] = time?.split(":").map(Number) || [];

  return minutes * 60 + seconds + (4 - (quarter_num || 1)) * 15 * 60;
}

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
        time_remaining?: string;
        is_in_progress: boolean;
        quarter_num: number | "";
      };
    }) => {
      schedule_obj[game.metadata.away_team] = {
        kickoff: game.start_time,
        opp: "@ " + game.metadata.home_team,
        timeLeft:
          timeStringToS(
            game.metadata.time_remaining,
            game.metadata.quarter_num
          ) ?? 3600,
        is_in_progress: game.metadata.is_in_progress,
      };

      schedule_obj[game.metadata.home_team] = {
        kickoff: game.start_time,
        opp: "vs " + game.metadata.away_team,
        timeLeft:
          timeStringToS(
            game.metadata.time_remaining,
            game.metadata.quarter_num
          ) ?? 3600,
        is_in_progress: game.metadata.is_in_progress,
      };
    }
  );

  return schedule_obj;
};
