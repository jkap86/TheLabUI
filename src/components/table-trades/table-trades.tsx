import {
  League as LeagueType,
  Trade as TradeType,
} from "@/lib/types/userTypes";
import "./table-trades.css";
import { JSX, useEffect, useState } from "react";
import Avatar from "../avatar/avatar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getDraftPickId } from "@/utils/getPickId";
import { getTrendColor_Range } from "@/utils/getTrendColor";
import League from "../league/league";
import { getOptimalStarters, getPlayerTotal } from "@/utils/getOptimalStarters";

const Trade = ({
  trade,
  activeTrade,
  setActiveTrade,
}: {
  trade: TradeType;
  activeTrade: string;
  setActiveTrade: (transaction_id: string) => void;
}) => {
  const { ktcCurrent, allplayers } = useSelector(
    (state: RootState) => state.common
  );

  return (
    <table
      className={
        "trade " + (activeTrade === trade.transaction_id ? "active-trade" : "")
      }
    >
      <tbody
        onClick={() =>
          setActiveTrade(
            activeTrade === trade.transaction_id ? "" : trade.transaction_id
          )
        }
        className={activeTrade === trade.transaction_id ? "active" : ""}
      >
        <tr>
          <td colSpan={6} className="timestamp">
            <div>
              {new Date(trade.status_updated).toLocaleDateString("en-US")}
            </div>
            <div>
              {new Date(trade.status_updated).toLocaleTimeString("en-US")}
            </div>
          </td>
          <td colSpan={12}>
            <Avatar id={trade.avatar} text={trade.name} type="L" />
          </td>
        </tr>
        <tr>
          <td colSpan={3}>
            <div>
              {trade.settings.type === 2
                ? "Dynasty"
                : trade.settings.type === 1
                ? "Keeper"
                : "Redraft"}
            </div>
          </td>
          <td colSpan={3}>
            <div>{trade.settings.best_ball === 1 ? "Bestball" : "Lineup"}</div>
          </td>
          <td colSpan={3}>
            <div>
              Start {trade.roster_positions.filter((rp) => rp !== "BN").length}
            </div>
          </td>
          <td colSpan={4}>
            <div>
              {trade.roster_positions
                .filter((rp) => rp === "QB")
                .length.toString()}{" "}
              QB{" "}
              {trade.roster_positions
                .filter((rp) => rp === "SUPER_FLEX")
                .length.toString()}{" "}
              SF
            </div>
          </td>
          <td colSpan={5}>
            <div>
              {trade.roster_positions
                .filter((rp) => rp === "TE")
                .length.toString()}{" "}
              TE {trade.scoring_settings.bonus_rec_te || "0"}
              {"pt "}
              Prem
            </div>
          </td>
        </tr>
        {...trade.managers.map((user_id, index) => {
          const manager_roster = trade.rosters.find(
            (r) => r.user_id === user_id
          );

          const league_type = trade.settings.type === 2 ? "dynasty" : "redraft";

          const ktc_current = ktcCurrent?.[league_type];

          return (
            <tr key={`${user_id}_${index}`}>
              <td colSpan={5}>
                <Avatar
                  id={manager_roster?.avatar || null}
                  type={"U"}
                  text={manager_roster?.username || "Orphan"}
                />
              </td>
              <td colSpan={7} className="adds">
                <table className="adds">
                  <tbody>
                    {Object.keys(trade.adds)
                      .filter(
                        (add) => trade.adds[add] === manager_roster?.user_id
                      )
                      .sort(
                        (a, b) =>
                          (ktcCurrent?.[league_type]?.[b] || 0) -
                          (ktcCurrent?.[league_type]?.[a] || 0)
                      )
                      .map((add, index) => {
                        return (
                          <tr key={`${add}_${index}`}>
                            <td
                              colSpan={2}
                              className={
                                trade.tips?.away.some(
                                  (tip) =>
                                    tip.player_id === add &&
                                    tip.leaguemate_id === trade.adds[add]
                                )
                                  ? "redb"
                                  : ""
                              }
                            >
                              <div>
                                {allplayers && allplayers[add]?.full_name}
                              </div>
                            </td>
                            <td
                              className="content ktc"
                              style={getTrendColor_Range(
                                ktcCurrent?.[league_type]?.[add] || 0,
                                1000,
                                8000
                              )}
                            >
                              {ktcCurrent?.[league_type]?.[add] || "0"}
                            </td>
                          </tr>
                        );
                      })}

                    {trade.draft_picks
                      .filter((dp) => dp.new === manager_roster?.user_id)
                      .sort(
                        (a, b) =>
                          (ktcCurrent?.[league_type]?.[getDraftPickId(b)] ||
                            0) -
                          (ktcCurrent?.[league_type]?.[getDraftPickId(a)] || 0)
                      )
                      .map((dp) => {
                        return (
                          <tr
                            key={`${dp.season}_${dp.round}_${dp.original}_${index}_${trade.transaction_id}`}
                          >
                            <td colSpan={2}>
                              {dp.order
                                ? `${dp.season} ${
                                    dp.round
                                  }.${dp.order.toLocaleString("en-US", {
                                    minimumIntegerDigits: 2,
                                  })}`
                                : `${dp.season} Round ${dp.round}`}
                            </td>
                            <td
                              className="content ktc"
                              style={getTrendColor_Range(
                                ktcCurrent?.[league_type]?.[
                                  getDraftPickId(dp)
                                ] || 0,
                                1000,
                                8000
                              )}
                            >
                              {ktcCurrent?.[league_type]?.[
                                getDraftPickId(dp)
                              ] || 0}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </td>
              <td colSpan={6} className="drops">
                <table className="drops">
                  <tbody>
                    {Object.keys(trade.drops)
                      .filter(
                        (drops) =>
                          trade.drops[drops] === manager_roster?.user_id
                      )
                      .sort(
                        (a, b) =>
                          (ktc_current?.[b] || 0) - (ktc_current?.[a] || 0)
                      )
                      .map((drop, index) => {
                        return (
                          <tr key={`${drop}_${index}`}>
                            <td
                              className={
                                trade.tips?.for?.some(
                                  (tip) =>
                                    tip.player_id === drop &&
                                    trade.drops[drop] === tip.leaguemate_id
                                )
                                  ? "greenb"
                                  : ""
                              }
                            >
                              <div>
                                {allplayers && allplayers[drop]?.full_name}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {trade.draft_picks
                      .filter((dp) => dp.old === manager_roster?.user_id)
                      .sort(
                        (a, b) =>
                          (ktc_current?.[getDraftPickId(b)] || 0) -
                          (ktc_current?.[getDraftPickId(a)] || 0)
                      )
                      .map((dp, index) => {
                        return (
                          <tr
                            key={`${dp.season}_${dp.round}_${dp.original}_${index}_${trade.transaction_id}`}
                          >
                            <td>
                              <div>
                                {dp.order
                                  ? `${dp.season} ${
                                      dp.round
                                    }.${dp.order.toLocaleString("en-US", {
                                      minimumIntegerDigits: 2,
                                    })}`
                                  : `${dp.season} Round ${dp.round}`}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </td>
            </tr>
          );
        })}
      </tbody>
      {activeTrade === trade.transaction_id && (
        <tbody>
          <tr>
            <td colSpan={18}>
              <TradeDetail trade={trade} />
            </td>
          </tr>
        </tbody>
      )}
    </table>
  );
};

const TradeDetail = ({ trade }: { trade: TradeType }) => {
  const { ktcCurrent, projections } = useSelector(
    (state: RootState) => state.common
  );
  const { detail_tab } = useSelector((state: RootState) => state.lmtrades);

  const tradeLeague: LeagueType = {
    index: 0,
    league_id: trade.league_id,
    name: trade.name,
    avatar: trade.avatar,
    season: new Date().getFullYear().toString(),
    status: "",
    settings: trade.settings,
    scoring_settings: trade.scoring_settings,
    roster_positions: trade.roster_positions,
    rosters: trade.rosters.map((r) => {
      const values = Object.fromEntries(
        (r.players || []).map((player_id) => [
          player_id,
          getPlayerTotal(
            trade.scoring_settings,
            projections?.[player_id] || {}
          ),
        ])
      );
      return {
        ...r,
        starters_optimal_dynasty: getOptimalStarters(
          trade.roster_positions,
          r.players || [],
          ktcCurrent?.dynasty || {}
        ),
        starters_optimal_redraft: getOptimalStarters(
          trade.roster_positions,
          r.players || [],
          ktcCurrent?.redraft || {}
        ),
        starters_optimal_ppg: getOptimalStarters(
          trade.roster_positions,
          r.players || [],
          values
        ),
      };
    }),
    user_roster: trade.rosters[0],
  };

  return (
    <>
      <div className="nav">
        {["Tips", "League"].map((text) => {
          return (
            <button key={text} className={detail_tab === text ? "active" : ""}>
              {text}
            </button>
          );
        })}
      </div>
      {detail_tab === "League" ? (
        <League type={2} league={tradeLeague} />
      ) : null}
    </>
  );
};

const TableTrades = ({
  trades,
  tradeCount,
  fetchMore,
}: {
  trades: TradeType[];
  tradeCount: number;
  fetchMore: () => void;
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers } = useSelector((state: RootState) => state.common);
  const { playershares, pickshares, leaguemates } = useSelector(
    (state: RootState) => state.manager
  );
  const { searched_manager, searched_player } = useSelector(
    (state: RootState) => state.lmtrades
  );
  const [activeTrade, setActiveTrade] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(Math.max(Math.max(Math.ceil((trades.length - 1) / 25), 5) - 4, 1));
  }, [trades]);

  const page_numbers = (
    <div className="page_numbers_wrapper">
      <ol className="page_numbers">
        {Array.from(Array(Math.ceil(trades?.length / 25 || 0)).keys()).map(
          (key) => {
            return (
              <li
                key={key + 1}
                className={page === key + 1 ? "active" : ""}
                onClick={() => setPage(key + 1)}
              >
                {key + 1}
              </li>
            );
          }
        )}
        {(trades?.length || 0) < tradeCount ? (
          <li onClick={fetchMore}>...</li>
        ) : null}
      </ol>
    </div>
  );

  const table = (
    <table className="trades">
      {trades.slice((page - 1) * 25, (page - 1) * 25 + 25).map((trade) => {
        return (
          <tbody key={trade.transaction_id}>
            <tr>
              <td>
                <Trade
                  trade={trade}
                  activeTrade={activeTrade}
                  setActiveTrade={setActiveTrade}
                />
              </td>
            </tr>
          </tbody>
        );
      })}
    </table>
  );

  return (
    <>
      <h2>{tradeCount} Trades</h2>
      {page_numbers}
      {table}
      {page_numbers}
    </>
  );
};

export default TableTrades;
