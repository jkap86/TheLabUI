export const formatPickToString = (pick: {
  season: string | number;
  round: number | string;
  order?: number | string | null;
}) => {
  const ord =
    pick.order !== undefined && pick.order !== null
      ? Number(pick.order).toLocaleString("en-US", { minimumIntegerDigits: 2 })
      : String(pick.order);

  return `${pick.season} ${pick.round}.${ord}`;
};
