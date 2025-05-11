import store, { RootState } from "@/redux/store";

export const getDraftPickId = (pick: {
  season: number | string;
  round: number;
  order?: number | null;
}) => {
  const state: RootState = store.getState();

  const { ktcCurrent } = state.common;

  if (
    pick.order &&
    Object.keys(ktcCurrent || {}).some((player_id) => player_id.includes("."))
  ) {
    return `${pick.season} ${pick.round}.${pick.order.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
    })}`;
  } else {
    if (pick.order && pick.order <= 4) {
      return `${pick.season} Early ${pick.round + getSuffix(pick.round)}`;
    } else if (pick.order && pick.order >= 9) {
      return `${pick.season} Late ${pick.round + getSuffix(pick.round)}`;
    } else {
      return `${pick.season} Mid ${pick.round + getSuffix(pick.round)}`;
    }
  }
};

const getSuffix = (round: number) => {
  switch (round) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const convertDraftPickName = (pick_id: string) => {
  let pick_name = pick_id;

  if (pick_name.includes(".null")) {
    const pick_array = pick_id.split(" ");
    const season = pick_array[0];
    const round = pick_array[1].split(".")[0];
    pick_name = `${season} Round ${round}`;
  }

  return pick_name;
};

export const convertDraftPickId = (pick_id: string) => {
  let pick_name = pick_id;

  if (pick_name.includes(" Round ")) {
    const pick_array = pick_id.split(" Round ");
    const season = pick_array[0];
    const round = pick_array[1];
    pick_name = `${season} ${round}.null`;
  }

  return pick_name;
};

export const converDraftPickNameToKtc = (pick_name: string) => {
  const pick_array = pick_name.split(" ");

  const season = pick_array[0];
  const round = parseInt(pick_array[1].split(".")[0]);
  const order = parseInt(pick_array[1].split(".")[1]) || null;

  const ktc_name = getDraftPickId({ season, round, order });

  return ktc_name;
};
