"use client";

import { RootState } from "@/redux/store";
import { getPlayerTotal } from "@/utils/getOptimalStarters";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

const PprPointsEdit = ({
  player_id,
  scoring_settings,
  className,
  prevValue,
  sendValue,
}: {
  player_id: string;
  scoring_settings: { [cat: string]: number };
  className?: string;
  prevValue?: number;
  sendValue?: (value: number) => void;
}) => {
  const { edits, projections } = useSelector(
    (state: RootState) => state.lineupchecker
  );

  const value = useMemo(() => {
    return getPlayerTotal(
      scoring_settings,
      projections[player_id],
      edits?.[player_id]
    );
  }, [scoring_settings, projections, edits, player_id]);

  useEffect(() => {
    if (sendValue && prevValue !== value) sendValue(value);
  }, [value, prevValue, sendValue]);

  return (
    <span
      className={
        className &&
        Object.keys(edits[player_id] || {}).some(
          (cat) =>
            edits[player_id][cat].sleeper_value !== edits[player_id][cat].update
        )
          ? "text-yellow-600"
          : className ??
            ((projections[player_id]?.pts_ppr ?? 0) > value
              ? "red"
              : (projections[player_id]?.pts_ppr ?? 0) < value
              ? "green"
              : "")
      }
    >
      {value.toFixed(1)}
    </span>
  );
};

export default PprPointsEdit;
