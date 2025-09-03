import { Allplayer } from "@/lib/types/commonTypes";
import { ProjectionEdits } from "@/lib/types/userTypes";

export const position_map: { [key: string]: string[] } = {
  QB: ["QB"],
  RB: ["RB"],
  WR: ["WR"],
  TE: ["TE"],
  FLEX: ["RB", "WR", "TE"],
  SUPER_FLEX: ["QB", "RB", "WR", "TE"],
  WRRB_FLEX: ["RB", "WR"],
  REC_FLEX: ["WR", "TE"],
  K: ["K"],
  DEF: ["DEF"],
  DL: ["DL"],
  LB: ["LB"],
  DB: ["DB"],
  IDP_FLEX: ["DL", "LB", "DB"],
};

export const getSlotAbbrev = (slot: string) => {
  switch (slot) {
    case "FLEX":
      return "FLX";
    case "SUPER_FLEX":
      return "SF";
    case "WRRB_FLEX":
      return "W/R";
    case "REC_FLEX":
      return "W/T";
    case "IDP_FLEX":
      return "IDP";
    default:
      return slot;
  }
};

/*
export const getOptimalStarters = (
  roster_positions: string[],
  players: string[],
  values: { [player_id: string]: number } | null,
  allplayers: { [player_id: string]: Allplayer }
) => {
  const playersWithValues = players
    .flatMap((player_id) => {
      return (allplayers?.[player_id]?.fantasy_positions || []).map(
        (position) => {
          return {
            player_id,
            position,
            value: values?.[player_id] || 0,
          };
        }
      );
    })
    .sort((a, b) => b.value - a.value);

  const optimal_starters: {
    index: number;
    slot__index: string;
    optimal_player_id: string;
    player_position: string;
    value: number;
  }[] = [];

  (roster_positions || [])
    .filter((slot) => position_map[slot])
    .forEach((slot, index) => {
      if (position_map[slot]) {
        const slot_options = playersWithValues.filter(
          (player) =>
            position_map[slot].includes(player.position) &&
            !optimal_starters.find(
              (os) =>
                os.optimal_player_id === player.player_id &&
                os.player_position === player.position
            )
        );

        const optimal_player = slot_options[0] || { player_id: "0", value: 0 };

        optimal_starters.push({
          index,
          slot__index: `${slot}__${index}`,
          optimal_player_id: optimal_player.player_id,
          player_position: optimal_player.position,
          value: optimal_player.value,
        });
      } else {
        optimal_starters.push({
          index,
          slot__index: `${slot}__${index}`,
          optimal_player_id: "0",
          player_position: "-",
          value: 0,
        });
      }
    });

  return optimal_starters;
};

export const getOptimalStartersLineupCheck = (
  allplayers: { [player_id: string]: Allplayer },
  roster_positions: string[],
  players: string[],
  starters: string[],
  stat_obj: { [player_id: string]: { [key: string]: number } },
  scoring_settings: { [cat: string]: number },
  schedule: { [team: string]: { kickoff: number; opp: string } },
  edits?: ProjectionEdits
) => {
  const values: { [player_id: string]: number } = {};

  players.forEach((player_id) => {
    values[player_id] = getPlayerTotal(
      scoring_settings,
      stat_obj[player_id] || {},
      edits?.[player_id]
    );
  });

  const playersWithValues = players
    .flatMap((player_id) => {
      return (allplayers?.[player_id]?.fantasy_positions || []).map(
        (position) => {
          return {
            player_id,
            position,
            value: values?.[player_id] || 0,
            kickoff: schedule[allplayers[player_id]?.team]?.kickoff || 0,
          };
        }
      );
    })
    .sort((a, b) => b.value - a.value);

  const optimal_starters: {
    index: number;
    slot: string;
    slot__index: string;
    optimal_player_id: string;
    optimal_player_position: string;
    optimal_player_value: number;
    optimal_player_kickoff: number;
    current_player_id: string;
    current_player_position: string;
    current_player_value: number;
    current_player_kickoff: number;
    current_slot_options: {
      player_id: string;
      proj: number;
    }[];
  }[] = [];

  (roster_positions || [])
    .filter((slot) => position_map[slot])
    .sort((a, b) => position_map[a].length - position_map[b].length)
    .forEach((slot) => {
      const index =
        roster_positions.indexOf(slot) +
        optimal_starters.filter((os) => os.slot === slot).length;

      const current_player_id = starters[index];

      if (position_map[slot]) {
        const slot_options = playersWithValues.filter(
          (player) =>
            position_map[slot].includes(player.position) &&
            !optimal_starters.find(
              (os) => os.optimal_player_id === player.player_id
            )
        );

        const optimal_player = slot_options[0] || {
          player_id: "0",
          value: 0,
          kickoff: 0,
        };

        optimal_starters.push({
          index,
          slot,
          slot__index: `${slot}__${index}`,
          optimal_player_id: optimal_player.player_id,
          optimal_player_position: optimal_player.position,
          optimal_player_value: optimal_player.value,
          optimal_player_kickoff:
            schedule[allplayers[optimal_player.player_id]?.team]?.kickoff || 0,
          current_player_id,
          current_player_position: allplayers[current_player_id]?.position,
          current_player_value: values[current_player_id] || 0,
          current_player_kickoff:
            schedule[allplayers[current_player_id]?.team]?.kickoff || 0,
          current_slot_options: slot_options.map((so) => ({
            player_id: so.player_id,
            proj: so.value,
          })),
        });
      } else {
        optimal_starters.push({
          index,
          slot,
          slot__index: `${slot}__${index}`,
          optimal_player_id: current_player_id,
          optimal_player_position: allplayers[current_player_id].position,
          optimal_player_value: values[current_player_id] || 0,
          optimal_player_kickoff:
            schedule[allplayers[current_player_id]?.team]?.kickoff || 0,
          current_player_id: current_player_id,
          current_player_position: allplayers[current_player_id]?.position,
          current_player_value: values[current_player_id] || 0,
          current_player_kickoff:
            schedule[allplayers[current_player_id]?.team]?.kickoff || 0,
          current_slot_options: [],
        });
      }
    });

  const optimal_starters_ordered: {
    index: number;
    slot__index: string;
    optimal_player_id: string;
    optimal_player_position: string;
    optimal_player_value: number;
    optimal_player_kickoff: number;
    current_player_id: string;
    current_player_position: string;
    current_player_value: number;
    current_player_kickoff: number;
    earlyInFlex: boolean;
    lateNotInFlex: boolean;
    current_slot_options: {
      player_id: string;
      proj: number;
    }[];
  }[] = [];

  optimal_starters
    .sort(
      (a, b) =>
        position_map[a.slot__index.split("__")[0]].length -
        position_map[b.slot__index.split("__")[0]].length
    )
    .forEach((os) => {
      const slot_options_optimal = playersWithValues
        .filter(
          (player) =>
            optimal_starters.some(
              (os) => os.optimal_player_id === player.player_id
            ) &&
            position_map[os.slot].includes(player.position) &&
            !optimal_starters_ordered.find(
              (os) => os.optimal_player_id === player.player_id
            )
        )
        .sort((a, b) => a.kickoff - b.kickoff);

      const optimal_player = slot_options_optimal[0] || {
        player_id: "0",
        value: 0,
      };

      const earlyInFlex = starters.some((s, index) => {
        return (
          (schedule[allplayers?.[os.current_player_id]?.team || ""]?.kickoff ||
            0) +
            60 * 60 * 1000 <
            (schedule[allplayers?.[s]?.team || ""]?.kickoff || 0) &&
          position_map[roster_positions[index]].length <
            position_map[os.slot].length &&
          position_map[roster_positions[index]]?.includes(
            allplayers[os.current_player_id]?.position || ""
          ) &&
          position_map[os.slot]?.includes(allplayers[s]?.position || "")
        );
      });

      const lateNotInFlex = starters.some((s, index) => {
        return (
          (schedule[allplayers?.[os.current_player_id]?.team || ""]?.kickoff ||
            0) -
            60 * 60 * 1000 >
            (schedule[allplayers?.[s]?.team || ""]?.kickoff || 0) &&
          position_map[roster_positions[index]].length >
            position_map[os.slot].length &&
          position_map[roster_positions[index]]?.includes(
            allplayers[os.current_player_id]?.position || ""
          ) &&
          position_map[os.slot]?.includes(allplayers[s]?.position || "")
        );
      });

      optimal_starters_ordered.push({
        ...os,
        earlyInFlex,
        lateNotInFlex,
        optimal_player_id: optimal_player.player_id,
      });
    });

  const projection_optimal = optimal_starters.reduce(
    (acc, cur) => acc + cur.optimal_player_value,
    0
  );
  const projection_current = optimal_starters.reduce(
    (acc, cur) => acc + cur.current_player_value,
    0
  );

  return {
    starters_optimal: optimal_starters.sort((a, b) => a.index - b.index),
    values,
    projection_current,
    projection_optimal,
  };
};
*/

export const getOptimalStarters = (
  roster_positions: string[],
  players: string[],
  values: { [player_id: string]: number } | null,
  allplayers: { [player_id: string]: Allplayer }
) => {
  const starting_roster_positions = roster_positions.filter(
    (rp) => rp !== "BN"
  );

  // Build variants: one per (player_id, eligible fantasy position)
  type Variant = {
    player_id: string;
    position: string;
    value: number;
  };

  const variants: Variant[] = players.flatMap((pid) => {
    const poss = allplayers?.[pid]?.fantasy_positions || [];
    const val = values?.[pid] ?? 0;
    return poss.map((pos) => ({ player_id: pid, position: pos, value: val }));
  });

  // Filter usable slots
  const slotKeys = (starting_roster_positions || [])
    .map((slot, index) => ({ slot, index }))
    .filter(({ slot }) => !!position_map[slot]);

  const S = slotKeys.length;
  const V = variants.length;

  // ---- Min-Cost Max-Flow (exact assignment) ----
  class MCMF {
    n: number;
    adj: { to: number; rev: number; cap: number; cost: number }[][];
    constructor(n: number) {
      this.n = n;
      this.adj = Array.from({ length: n }, () => []);
    }
    addEdge(u: number, v: number, cap: number, cost: number) {
      this.adj[u].push({ to: v, rev: this.adj[v].length, cap, cost });
      this.adj[v].push({
        to: u,
        rev: this.adj[u].length - 1,
        cap: 0,
        cost: -cost,
      });
    }
    run(s: number, t: number, wantFlow = Infinity) {
      let flow = 0,
        cost = 0;
      while (flow < wantFlow) {
        const dist = Array(this.n).fill(Infinity);
        const inq = Array(this.n).fill(false);
        const parent = Array(this.n).fill(-1);
        const pedge = Array(this.n).fill(-1);
        dist[s] = 0;
        inq[s] = true;
        const q: number[] = [s];
        while (q.length) {
          const u = q.shift()!;
          inq[u] = false;
          for (let i = 0; i < this.adj[u].length; i++) {
            const e = this.adj[u][i];
            if (e.cap > 0 && dist[u] + e.cost < dist[e.to]) {
              dist[e.to] = dist[u] + e.cost;
              parent[e.to] = u;
              pedge[e.to] = i;
              if (!inq[e.to]) {
                q.push(e.to);
                inq[e.to] = true;
              }
            }
          }
        }
        if (!isFinite(dist[t])) break;

        const N = this.n;
        const EPS = 1e-12;

        const path: Array<{ u: number; i: number }> = [];
        let v = t;
        let hops = 0;
        const onPath = new Set<number>();

        while (v !== s) {
          if (++hops > N) {
            throw new Error("MCMF: parent chain cycle/too long (bad parents)");
          }
          onPath.add(v);

          let u = parent[v];
          let i = pedge[v];
          let ok = false;

          if (u >= 0 && i >= 0) {
            const e = this.adj[u][i];
            if (
              e &&
              e.to === v &&
              e.cap > 0 &&
              Number.isFinite(dist[u]) &&
              Math.abs(dist[u] + e.cost - dist[v]) <= EPS
            ) {
              ok = true;
            }
          }

          if (!ok) {
            let found = false;
            for (let uu = 0; uu < N && !found; uu++) {
              if (!Number.isFinite(dist[uu])) continue;
              const adjU = this.adj[uu];
              for (let ii = 0; ii < adjU.length; ii++) {
                const e = adjU[ii];
                if (e.to !== v) continue;
                if (e.cap <= 0) continue;
                if (Math.abs(dist[uu] + e.cost - dist[v]) > EPS) continue;
                u = uu;
                i = ii;
                found = true;
                break;
              }
            }
            if (!found) throw new Error("MCMF: no valid predecessor found");
          }

          if (onPath.has(u) && u !== s) {
            throw new Error(
              "MCMF: cycle detected in predecessor reconstruction"
            );
          }

          path.push({ u, i });
          v = u;
        }

        // apply augmentation
        for (let k = path.length - 1; k >= 0; k--) {
          const { u, i } = path[k];
          const e = this.adj[u][i];
          if (!e || e.cap <= 0)
            throw new Error("MCMF: zero/invalid cap when augmenting");
          e.cap -= 1;
          this.adj[e.to][e.rev].cap += 1;
        }

        flow += 1;
        cost += dist[t];
      }
      return { flow, cost };
    }
  }

  // Unique players → player nodes to enforce "use at most once"
  const uniquePlayers = Array.from(new Set(variants.map((v) => v.player_id)));
  const pIndex: Record<string, number> = {};
  uniquePlayers.forEach((pid, i) => (pIndex[pid] = i));

  // Node indexing
  // source=0
  // slots: 1..S
  // variants: S+1 .. S+V
  // players: S+V+1 .. S+V+P
  // sink: S+V+P+1
  const source = 0;
  const baseSlots = 1;
  const baseVariants = baseSlots + S;
  const basePlayers = baseVariants + V;
  const sink = basePlayers + uniquePlayers.length;

  const g = new MCMF(sink + 1);

  // source -> slots
  for (let si = 0; si < S; si++) g.addEdge(source, baseSlots + si, 1, 0);

  // slots -> variants (only if eligible per position_map)
  const slotVariantEdge: { si: number; vi: number; u: number; ei: number }[] =
    [];
  for (let si = 0; si < S; si++) {
    const { slot } = slotKeys[si];
    const elig = new Set(position_map[slot] || []);
    const u = baseSlots + si;
    for (let vi = 0; vi < V; vi++) {
      const v = variants[vi];
      if (elig.has(v.position)) {
        const before = g.adj[u].length;
        g.addEdge(u, baseVariants + vi, 1, -v.value); // maximize value
        slotVariantEdge.push({ si, vi, u, ei: before });
      }
    }
  }

  // variant -> player
  for (let vi = 0; vi < V; vi++) {
    const pid = variants[vi].player_id;
    g.addEdge(baseVariants + vi, basePlayers + pIndex[pid], 1, 0);
  }

  // player -> sink
  for (let pi = 0; pi < uniquePlayers.length; pi++) {
    g.addEdge(basePlayers + pi, sink, 1, 0);
  }

  // run flow (fill as many slots as possible)
  g.run(source, sink, S);

  // reconstruct chosen variant per slot
  const chosenVariantBySlot: (number | null)[] = Array(S).fill(null);
  for (const rec of slotVariantEdge) {
    const e = g.adj[rec.u][rec.ei];
    if (e.cap === 0) chosenVariantBySlot[rec.si] = rec.vi;
  }

  // build return in ORIGINAL roster order (index is original array position)
  const optimal_starters = starting_roster_positions.map((slot, index) => {
    if (!position_map[slot]) {
      return {
        index,
        slot__index: `${slot}__${index}`,
        optimal_player_id: "0",
        player_position: "-",
        value: 0,
      };
    }
    // find which slotKeys entry corresponds to original index
    const si = slotKeys.findIndex((sk) => sk.index === index);
    if (si === -1) {
      return {
        index,
        slot__index: `${slot}__${index}`,
        optimal_player_id: "0",
        player_position: "-",
        value: 0,
      };
    }
    const chosenVi = chosenVariantBySlot[si];
    if (chosenVi === null) {
      return {
        index,
        slot__index: `${slot}__${index}`,
        optimal_player_id: "0",
        player_position: "-",
        value: 0,
      };
    }
    const v = variants[chosenVi];
    return {
      index,
      slot__index: `${slot}__${index}`,
      optimal_player_id: v.player_id,
      player_position: v.position,
      value: v.value,
    };
  });

  return optimal_starters;
};

type Options = {
  edits?: ProjectionEdits;
  locked?: boolean;
  taxi?: string[];
};
export const getOptimalStartersLineupCheck = (
  allplayers: { [player_id: string]: Allplayer },
  roster_positions: string[],
  players: string[],
  starters: string[],
  stat_obj: { [player_id: string]: { [key: string]: number } },
  scoring_settings: { [cat: string]: number },
  schedule: { [team: string]: { kickoff: number; opp: string } },
  options?: Options
) => {
  /*
  const schedule = Object.fromEntries(
    Object.keys(schedule_test).map((team) => {
      if (["PHI", "DAL"].includes(team)) {
        return [
          team,
          {
            ...schedule_test[team],
            kickoff: schedule_test[team].kickoff - 3 * 24 * 60 * 60 * 1000,
          },
        ];
      } else {
        return [
          team,
          {
            ...schedule_test[team],
          },
        ];
      }
    })
  );
  */

  const starting_roster_positions = roster_positions.filter(
    (rp) => rp !== "BN"
  );

  const FLEX_BUFFER_MS = 60 * 60 * 1000; // 1 hour tolerance

  // Helpers
  //const restrictiveness = (slot: string) => position_map[slot]?.length ?? 999;
  const canFit = (pid: string, slot: string) => {
    const poss = allplayers[pid]?.fantasy_positions || [];
    const elig = position_map[slot] || [];
    return poss.some((p) => elig.includes(p));
  };

  // Build slot entries with stable occurrence indexes for duplicates
  const slotEntries = (() => {
    const seen = new Map<string, number>();
    return starting_roster_positions.map((slot, i) => {
      const c = seen.get(slot) ?? 0;
      seen.set(slot, c + 1);
      return { slot, index: i, occ: c };
    });
  })();

  // 1) Values by player
  const values: { [player_id: string]: number } = {};
  for (const player_id of players) {
    values[player_id] = getPlayerTotal(
      scoring_settings,
      stat_obj[player_id] || {},
      options?.edits?.[player_id]
    );
  }

  // 2) Variants (player_id × fantasy_position)
  type Variant = {
    player_id: string;
    position: string;
    value: number;
    kickoff: number;
  };
  const variants: Variant[] = players.flatMap((player_id) => {
    const poss = allplayers?.[player_id]?.fantasy_positions || [];
    const value = values[player_id] || 0;
    const kickoff = schedule[allplayers[player_id]?.team || ""]?.kickoff || 0;
    return poss.map((position) => ({ player_id, position, value, kickoff }));
  });

  // 3) Min-Cost Max-Flow
  class MCMF {
    n: number;
    adj: { to: number; rev: number; cap: number; cost: number }[][];
    constructor(n: number) {
      this.n = n;
      this.adj = Array.from({ length: n }, () => []);
    }
    addEdge(u: number, v: number, cap: number, cost: number) {
      this.adj[u].push({ to: v, rev: this.adj[v].length, cap, cost });
      this.adj[v].push({
        to: u,
        rev: this.adj[u].length - 1,
        cap: 0,
        cost: -cost,
      });
    }
    run(s: number, t: number, wantFlow = Infinity) {
      let flow = 0,
        cost = 0;
      while (flow < wantFlow) {
        const dist = Array(this.n).fill(Infinity);
        const inq = Array(this.n).fill(false);
        const parent = Array(this.n).fill(-1);
        const pedge = Array(this.n).fill(-1);
        dist[s] = 0;
        inq[s] = true;
        const q: number[] = [s];
        while (q.length) {
          const u = q.shift()!;
          inq[u] = false;
          for (let i = 0; i < this.adj[u].length; i++) {
            const e = this.adj[u][i];
            if (e.cap > 0 && dist[u] + e.cost < dist[e.to]) {
              dist[e.to] = dist[u] + e.cost;
              parent[e.to] = u;
              pedge[e.to] = i;
              if (!inq[e.to]) {
                q.push(e.to);
                inq[e.to] = true;
              }
            }
          }
        }
        if (!isFinite(dist[t])) break;

        // augment by 1 (SAFE)
        const N = this.n;
        const EPS = 1e-12;

        const path: Array<{ u: number; i: number }> = [];
        let v = t;
        let hops = 0;
        const onPath = new Set<number>();

        while (v !== s) {
          if (++hops > N) {
            throw new Error("MCMF: parent chain cycle/too long (bad parents)");
          }
          onPath.add(v);

          let u = parent[v];
          let i = pedge[v];
          let ok = false;

          if (u >= 0 && i >= 0) {
            const e = this.adj[u][i];
            if (
              e &&
              e.to === v &&
              e.cap > 0 &&
              Number.isFinite(dist[u]) &&
              Math.abs(dist[u] + e.cost - dist[v]) <= EPS
            ) {
              ok = true;
            }
          }

          if (!ok) {
            let found = false;
            for (let uu = 0; uu < N && !found; uu++) {
              if (onPath.has(uu)) continue;

              if (!Number.isFinite(dist[uu])) continue;

              const adjU = this.adj[uu];

              for (let ii = 0; ii < adjU.length; ii++) {
                const e = adjU[ii];
                if (e.to !== v) continue;
                if (e.cap <= 0) continue;
                if (Math.abs(dist[uu] + e.cost - dist[v]) > EPS) continue;
                u = uu;
                i = ii;
                found = true;
                break;
              }
            }
            if (!found) throw new Error("MCMF: no valid predecessor found");
          }

          if (onPath.has(u) && u !== s) {
            throw new Error(
              "MCMF: cycle detected in predecessor reconstruction"
            );
          }

          path.push({ u, i });
          v = u;
        }

        // apply augmentation
        for (let k = path.length - 1; k >= 0; k--) {
          const { u, i } = path[k];
          const e = this.adj[u][i];
          if (!e || e.cap <= 0)
            throw new Error("MCMF: zero/invalid cap when augmenting");
          e.cap -= 1;
          this.adj[e.to][e.rev].cap += 1;
        }

        flow += 1;
        cost += dist[t];
      }
      return { flow, cost };
    }
  }

  const S = slotEntries.length;
  const V = variants.length;

  const uniqPlayers = Array.from(new Set(variants.map((v) => v.player_id)));
  const pIndex: Record<string, number> = {};
  uniqPlayers.forEach((pid, i) => (pIndex[pid] = i));

  const source = 0;
  const baseSlots = 1;
  const baseVariants = baseSlots + S;
  const basePlayers = baseVariants + V;
  const sink = basePlayers + uniqPlayers.length;
  const g = new MCMF(sink + 1);

  // source -> slots
  for (let si = 0; si < S; si++) g.addEdge(source, baseSlots + si, 1, 0);

  // slot -> variant edges
  const slotVariantEdge: {
    slotIdx: number;
    varIdx: number;
    u: number;
    ei: number;
  }[] = [];
  const now = Date.now();
  const startersSet = new Set(starters);

  // players on bench (not already in starters) whose kickoff has passed
  const frozenBench = new Set(
    players.filter((pid) => {
      if (startersSet.has(pid)) return false;
      const team = allplayers[pid]?.team || "";
      const k = schedule[team]?.kickoff || 0;
      return k > 0 && k <= now;
    })
  );

  for (let si = 0; si < S; si++) {
    const { slot, index: originalIndex } = slotEntries[si];
    const elig = new Set(position_map[slot] || []);
    const u = baseSlots + si;

    // identify current player & whether this slot should be locked
    const curPlayer = starters[originalIndex];
    const curKick = schedule[allplayers[curPlayer]?.team || ""]?.kickoff || 0;
    const slotIsLockedToCurrent =
      !!options?.locked && curPlayer && curKick > 0 && curKick <= now;

    for (let vi = 0; vi < V; vi++) {
      const v = variants[vi];

      if (options?.taxi && options.taxi.includes(v.player_id)) continue;

      if (options?.locked && frozenBench.has(v.player_id)) continue;

      // respect position eligibility
      if (!elig.has(v.position)) continue;

      // if locked, ONLY allow the current starter's variants in this slot
      if (slotIsLockedToCurrent && v.player_id !== curPlayer) continue;

      const before = g.adj[u].length;
      g.addEdge(u, baseVariants + vi, 1, -v.value);
      slotVariantEdge.push({ slotIdx: si, varIdx: vi, u, ei: before });
    }
  }

  // variant -> player
  for (let vi = 0; vi < V; vi++) {
    g.addEdge(
      baseVariants + vi,
      basePlayers + pIndex[variants[vi].player_id],
      1,
      0
    );
  }
  // player -> sink
  for (let i = 0; i < uniqPlayers.length; i++) {
    g.addEdge(basePlayers + i, sink, 1, 0);
  }

  g.run(source, sink, S);

  const chosenVariantBySlot: (number | null)[] = Array(S).fill(null);
  for (const rec of slotVariantEdge) {
    const e = g.adj[rec.u][rec.ei];
    if (e.cap === 0) chosenVariantBySlot[rec.slotIdx] = rec.varIdx;
  }

  // precompute options for each slot
  const optionsBySlot: {
    [slotIndex: number]: { player_id: string; proj: number }[];
  } = {};
  for (let si = 0; si < S; si++) {
    const slotKey = slotEntries[si].slot;
    const elig = new Set(position_map[slotKey] || []);
    optionsBySlot[si] = variants
      .filter((v) => elig.has(v.position))
      .map((v) => ({ player_id: v.player_id, proj: v.value }))
      .sort((a, b) => b.proj - a.proj);
  }

  // 4) Build result array
  type StarterRow = {
    index: number;
    slot: string;
    slot__index: string;
    optimal_player_id: string;
    optimal_player_position: string;
    optimal_player_value: number;
    optimal_player_kickoff: number;
    current_player_id: string;
    current_player_position: string;
    current_player_value: number;
    current_player_kickoff: number;
    current_slot_options: { player_id: string; proj: number }[];
    earlyInFlex: boolean;
    lateNotInFlex: boolean;
  };

  const optimal_starters: StarterRow[] = [];
  for (let i = 0; i < S; i++) {
    const { slot, index: originalIndex, occ } = slotEntries[i];
    const slot__index = `${slot}__${occ}`;
    const curPlayer = starters[originalIndex];
    const curKick = schedule[allplayers[curPlayer]?.team || ""]?.kickoff || 0;
    const chosenVi = chosenVariantBySlot[i];
    const optimal =
      chosenVi !== null
        ? variants[chosenVi]
        : { player_id: "0", position: "-", value: 0, kickoff: 0 };

    optimal_starters.push({
      index: originalIndex,
      slot,
      slot__index,
      optimal_player_id: optimal.player_id,
      optimal_player_position: optimal.position,
      optimal_player_value: optimal.value,
      optimal_player_kickoff: optimal.kickoff,
      current_player_id: curPlayer,
      current_player_position: allplayers[curPlayer]?.position,
      current_player_value: values[curPlayer] || 0,
      current_player_kickoff: curKick,
      current_slot_options: optionsBySlot[i],
      earlyInFlex: false,
      lateNotInFlex: false,
    });
  }

  // 5) Flag earlyInFlex / lateNotInFlex on OPTIMAL lineup
  for (let i = 0; i < optimal_starters.length; i++) {
    const A = optimal_starters[i];
    if (!position_map[A.slot]) continue;

    for (let j = 0; j < optimal_starters.length; j++) {
      if (i === j) continue;
      const B = optimal_starters[j];
      if (!position_map[B.slot]) continue;

      const AisMoreFlexible =
        (position_map[A.slot]?.length ?? 0) >
        (position_map[B.slot]?.length ?? 0);
      if (!AisMoreFlexible) continue;

      const canSwap =
        canFit(A.current_player_id, B.slot) &&
        canFit(B.current_player_id, A.slot);
      if (!canSwap) continue;

      const Ak = A.current_player_kickoff || 0;
      const Bk = B.current_player_kickoff || 0;

      // Flag if earlier player is stuck in the flexible slot
      if (Ak + FLEX_BUFFER_MS < Bk) {
        A.earlyInFlex = true;
        B.lateNotInFlex = true;
      }
    }
  }

  const projection_optimal = optimal_starters.reduce(
    (acc, cur) => acc + cur.optimal_player_value,
    0
  );
  const projection_current = optimal_starters.reduce(
    (acc, cur) => acc + cur.current_player_value,
    0
  );

  return {
    starters_optimal: optimal_starters.sort((a, b) => a.index - b.index),
    values,
    projection_current,
    projection_optimal,
  };
};

/*
export const getOptimalStartersLineupCheck = (
  allplayers: { [player_id: string]: Allplayer },
  roster_positions: string[],
  players: string[],
  starters: string[],
  stat_obj: { [player_id: string]: { [key: string]: number } },
  scoring_settings: { [cat: string]: number },
  schedule: { [team: string]: { kickoff: number; opp: string } },
  edits?: ProjectionEdits
) => {
  const starting_roster_positions= roster_positions.filter(rp => rp !== 'BN')
  // ----- helpers -----
  const restrictiveness = (slot: string) => position_map[slot]?.length ?? 999;

  const canFit = (pid: string, slot: string) => {
    const poss = allplayers[pid]?.fantasy_positions || [];
    const elig = position_map[slot] || [];
    return poss.some((p) => elig.includes(p));
  };

  // Build slot entries with stable occurrence indexes for duplicates
  const slotEntries = (() => {
    const seen = new Map<string, number>();
    return starting_roster_positions.map((slot, i) => {
      const c = seen.get(slot) ?? 0;
      seen.set(slot, c + 1);
      return { slot, index: i, occ: c }; // index is original position in array
    });
  })();

  // ----- 1) values by player -----
  const values: { [player_id: string]: number } = {};
  for (const player_id of players) {
    values[player_id] = getPlayerTotal(
      scoring_settings,
      stat_obj[player_id] || {},
      edits?.[player_id]
    );
  }

  // ----- 2) build position variants (one per eligible fantasy position) -----
  type Variant = {
    player_id: string;
    position: string;
    value: number;
    kickoff: number;
  };

  const variants: Variant[] = players.flatMap((player_id) => {
    const poss = allplayers?.[player_id]?.fantasy_positions || [];
    const value = values[player_id] || 0;
    const kickoff = schedule[allplayers[player_id]?.team || ""]?.kickoff || 0;
    return poss.map((position) => ({ player_id, position, value, kickoff }));
  });

  // ----- 3) exact optimal assignment via Min-Cost Max-Flow -----
  // Graph model:
  // source -> slots -> variants (only if eligible) -> player nodes -> sink
  // (player nodes ensure each player is used at most once)
  class MCMF {
    n: number;
    adj: { to: number; rev: number; cap: number; cost: number }[][];
    constructor(n: number) {
      this.n = n;
      this.adj = Array.from({ length: n }, () => []);
    }
    addEdge(u: number, v: number, cap: number, cost: number) {
      this.adj[u].push({ to: v, rev: this.adj[v].length, cap, cost });
      this.adj[v].push({
        to: u,
        rev: this.adj[u].length - 1,
        cap: 0,
        cost: -cost,
      });
    }
    run(s: number, t: number, wantFlow = Infinity) {
      let flow = 0,
        cost = 0;
      while (flow < wantFlow) {
        const dist = Array(this.n).fill(Infinity);
        const inq = Array(this.n).fill(false);
        const parent = Array(this.n).fill(-1);
        const pedge = Array(this.n).fill(-1);
        dist[s] = 0;
        inq[s] = true;
        const q: number[] = [s];
        while (q.length) {
          const u = q.shift()!;
          inq[u] = false;
          for (let i = 0; i < this.adj[u].length; i++) {
            const e = this.adj[u][i];
            if (e.cap > 0 && dist[u] + e.cost < dist[e.to]) {
              dist[e.to] = dist[u] + e.cost;
              parent[e.to] = u;
              pedge[e.to] = i;
              if (!inq[e.to]) {
                q.push(e.to);
                inq[e.to] = true;
              }
            }
          }
        }
        if (!isFinite(dist[t])) break;
        // augment by 1
        let v = t;
        while (v !== s) {
          const u = parent[v],
            i = pedge[v],
            e = this.adj[u][i];
          e.cap -= 1;
          this.adj[v][e.rev].cap += 1;
          v = u;
        }
        flow += 1;
        cost += dist[t];
      }
      return { flow, cost };
    }
  }

  const S = slotEntries.length;
  const V = variants.length;

  // build unique players list for player nodes
  const uniqPlayers = Array.from(new Set(variants.map((v) => v.player_id)));
  const pIndex: Record<string, number> = {};
  uniqPlayers.forEach((pid, i) => (pIndex[pid] = i));

  // Node layout:
  // source = 0
  // slots: 1..S
  // variants: S+1 .. S+V
  // players: S+V+1 .. S+V+P
  // sink = S+V+P+1
  const source = 0;
  const baseSlots = 1;
  const baseVariants = baseSlots + S;
  const basePlayers = baseVariants + V;
  const sink = basePlayers + uniqPlayers.length;

  const g = new MCMF(sink + 1);

  // source -> slots (cap 1)
  for (let si = 0; si < S; si++) g.addEdge(source, baseSlots + si, 1, 0);

  // slot -> variant (cap 1) if variant is eligible for that slot
  // keep handles for reconstruction
  const slotVariantEdge: {
    slotIdx: number;
    varIdx: number;
    u: number;
    ei: number;
  }[] = [];
  for (let si = 0; si < S; si++) {
    const { slot } = slotEntries[si];
    const elig = new Set(position_map[slot] || []);
    const u = baseSlots + si;
    for (let vi = 0; vi < V; vi++) {
      const v = variants[vi];
      if (elig.has(v.position)) {
        const before = g.adj[u].length;
        // maximize value => use cost = -value
        g.addEdge(u, baseVariants + vi, 1, -v.value);
        slotVariantEdge.push({ slotIdx: si, varIdx: vi, u, ei: before });
      }
    }
  }

  // variant -> player (cap 1)
  for (let vi = 0; vi < V; vi++) {
    const pid = variants[vi].player_id;
    const pNode = basePlayers + pIndex[pid];
    g.addEdge(baseVariants + vi, pNode, 1, 0);
  }

  // player -> sink (cap 1)
  for (let i = 0; i < uniqPlayers.length; i++) {
    g.addEdge(basePlayers + i, sink, 1, 0);
  }

  // push up to S units of flow (fill as many slots as possible)
  g.run(source, sink, S);

  // reconstruct chosen variant per slot
  const chosenVariantBySlot: (number | null)[] = Array(S).fill(null);
  for (const rec of slotVariantEdge) {
    const e = g.adj[rec.u][rec.ei]; // forward edge
    if (e.cap === 0) {
      chosenVariantBySlot[rec.slotIdx] = rec.varIdx;
    }
  }

  // For UI: precompute per-slot option list (sorted by value desc)
  const optionsBySlot: {
    [slotIndex: number]: { player_id: string; proj: number }[];
  } = {};
  for (let si = 0; si < S; si++) {
    const slotKey = slotEntries[si].slot;
    const elig = new Set(position_map[slotKey] || []);
    const opts = variants
      .filter((v) => elig.has(v.position))
      .map((v) => ({ player_id: v.player_id, proj: v.value }))
      .sort((a, b) => b.proj - a.proj);
    optionsBySlot[si] = opts;
  }

  // ----- 4) format result objects (keep your original shape) -----
  const optimal_starters: {
    index: number;
    slot: string;
    slot__index: string;
    optimal_player_id: string;
    optimal_player_position: string;
    optimal_player_value: number;
    optimal_player_kickoff: number;
    current_player_id: string;
    current_player_position: string;
    current_player_value: number;
    current_player_kickoff: number;
    current_slot_options: {
      player_id: string;
      proj: number;
    }[];
  }[] = [];

  // We’ll iterate in the ORIGINAL roster order for indices and current starters mapping.
  for (let i = 0; i < S; i++) {
    const { slot, index: originalIndex, occ } = slotEntries[i];
    const slot__index = `${slot}__${occ}`;
    const curPlayer = starters[originalIndex];
    const curKick = schedule[allplayers[curPlayer]?.team || ""]?.kickoff || 0;

    const chosenVi = chosenVariantBySlot[i];
    const optimal =
      chosenVi !== null
        ? variants[chosenVi]
        : { player_id: "0", position: "-", value: 0, kickoff: 0 };

    optimal_starters.push({
      index: originalIndex,
      slot,
      slot__index,
      optimal_player_id: optimal.player_id,
      optimal_player_position: optimal.position,
      optimal_player_value: optimal.value,
      optimal_player_kickoff: optimal.kickoff,
      current_player_id: curPlayer,
      current_player_position: allplayers[curPlayer]?.position, // keep your field naming
      current_player_value: values[curPlayer] || 0,
      current_player_kickoff: curKick,
      current_slot_options: optionsBySlot[i],
    });
  }

  // projections (same as yours)
  const projection_optimal = optimal_starters.reduce(
    (acc, cur) => acc + cur.optimal_player_value,
    0
  );
  const projection_current = optimal_starters.reduce(
    (acc, cur) => acc + cur.current_player_value,
    0
  );

  // return shape unchanged
  return {
    starters_optimal: optimal_starters.sort((a, b) => a.index - b.index),
    values,
    projection_current,
    projection_optimal,
  };
};
*/

export const getPlayerTotal = (
  scoring_settings: { [key: string]: number },
  stat_obj: { [key: string]: number },
  edits?: { [cat: string]: { update: number | ""; sleeper_value: number } }
) => {
  const projection = Object.keys(stat_obj || {})
    .filter((key) => Object.keys(scoring_settings).includes(key))
    .reduce(
      (acc, cur) =>
        acc +
        scoring_settings[cur] *
          ((edits?.[cur]?.update === ""
            ? stat_obj[cur]
            : edits?.[cur]?.update) ?? stat_obj[cur]),
      0
    );

  return projection;
};

export const ppr_scoring_settings = {
  pass_yd: 0.04,
  pass_td: 5,
  pass_int: -1,
  pass_2pt: 2,

  rec_yd: 0.1,
  rec: 1,
  rec_2pt: 2,
  rec_td: 6,

  rush_yd: 0.1,
  rush_2pt: 2,
  rush_td: 6,
};
