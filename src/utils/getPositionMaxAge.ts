export const getPositionMaxAge = (position: string | undefined) => {
  switch (position) {
    case "QB":
      return 37;
    case "RB":
      return 29;
    case "WR":
      return 31;
    case "TE":
      return 34;
    default:
      return 0;
  }
};
