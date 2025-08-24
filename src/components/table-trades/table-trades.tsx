import {
  League as LeagueType,
  Trade as TradeType,
} from "@/lib/types/userTypes";
import "./table-trades.css";
import { useEffect, useMemo, useState } from "react";
import Avatar from "../avatar/avatar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getDraftPickId } from "@/utils/getPickId";
import { getTrendColor_Range } from "@/utils/getTrendColor";
import League from "../league/league";
import { updatedLmtradesState } from "@/redux/lmtrades/lmtradesSlice";
import TableMain from "../table-main/table-main";
import { usePathname } from "next/navigation";

type TradeTip = {
  player_id: string;
  type: "acquire" | "trade away";
  league: {
    league_id: string;
    avatar: string | null;
    name: string;
  };
  lm: {
    user_id: string;
    avatar: string | null;
    username: string;
  };
};

const Trade = ({
  trade,
  activeTrade,
  setActiveTrade,
  tradeTips,
}: {
  trade: TradeType;
  activeTrade: string;
  setActiveTrade: (transaction_id: string) => void;
  tradeTips: TradeTip[];
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
          <td colSpan={7} className="timestamp">
            <div className="flex justify-evenly">
              {new Date(trade.status_updated).toLocaleDateString("en-US")}

              <em>
                {new Date(trade.status_updated).toLocaleTimeString("en-US")}
              </em>
            </div>
          </td>
          <td colSpan={12}>
            <div className="flex justify-evenly">
              <Avatar
                id={trade.league?.avatar}
                text={trade.league?.name}
                type="L"
              />
            </div>
          </td>
        </tr>
        <tr>
          <td colSpan={3}>
            <div>
              {trade.league.settings.type === 2
                ? "Dynasty"
                : trade.league.settings.type === 1
                ? "Keeper"
                : "Redraft"}
            </div>
          </td>
          <td colSpan={3}>
            <div>
              {trade.league.settings.best_ball === 1 ? "Bestball" : "Lineup"}
            </div>
          </td>
          <td colSpan={2}>
            <div>{trade.league.rosters.length} Tm</div>
          </td>
          <td colSpan={2}>
            <div>
              S{" "}
              {trade.league.roster_positions.filter((rp) => rp !== "BN").length}
            </div>
          </td>
          <td colSpan={4}>
            <div>
              {trade.league.roster_positions
                .filter((rp) => rp === "QB")
                .length.toString()}{" "}
              QB{" "}
              {trade.league.roster_positions
                .filter((rp) => rp === "SUPER_FLEX")
                .length.toString()}{" "}
              SF
            </div>
          </td>
          <td colSpan={5}>
            <div>
              {trade.league.roster_positions
                .filter((rp) => rp === "TE")
                .length.toString()}{" "}
              TE{" "}
              {trade.league.scoring_settings.bonus_rec_te?.toLocaleString(
                "en-US",
                { maximumFractionDigits: 2 }
              ) || "0"}
              {"pt "}
              Prem
            </div>
          </td>
        </tr>
        {...trade.managers.map((user_id, index) => {
          const manager_roster = trade.rosters.find(
            (r) => r.user_id === user_id
          );

          const league_type = "dynasty";

          const ktc_current = ktcCurrent?.[league_type];

          return (
            <tr key={`${user_id}_${index}`}>
              <td colSpan={5}>
                <div>
                  <Avatar
                    id={manager_roster?.avatar || null}
                    type={"U"}
                    text={manager_roster?.username || "Orphan"}
                  />
                </div>
              </td>
              <td colSpan={8} className="adds">
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
                        const tip = tradeTips?.find(
                          (tip) =>
                            tip.player_id === add && tip.type === "trade away"
                        );
                        return (
                          <tr key={`${add}_${index}`}>
                            <td colSpan={2} className={tip ? "redb" : ""}>
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
                        const tip = tradeTips?.find(
                          (tip) =>
                            tip.player_id === drop && tip.type === "acquire"
                        );
                        return (
                          <tr key={`${drop}_${index}`}>
                            <td className={tip ? "greenb" : ""}>
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
            <td colSpan={19}>
              <TradeDetail trade={trade} tradeTips={tradeTips} />
            </td>
          </tr>
        </tbody>
      )}
    </table>
  );
};

const TradeDetail = ({
  trade,
  tradeTips,
}: {
  trade: TradeType;
  tradeTips: TradeTip[];
}) => {
  const pathname = usePathname();
  const dispatch: AppDispatch = useDispatch();
  const { detail_tab } = useSelector((state: RootState) => state.lmtrades);

  const tradeLeague: LeagueType = {
    index: 0,
    league_id: trade.league_id,
    name: trade.league.name,
    avatar: trade.league?.avatar,
    season: new Date().getFullYear().toString(),
    status: "",
    settings: trade.league.settings,
    scoring_settings: trade.league.scoring_settings,
    roster_positions: trade.league.roster_positions,
    rosters: trade.rosters,
    user_roster: trade.rosters[0],
  };

  const tabs = pathname.split("/")[3]?.includes("leaguemate")
    ? ["League", "Tips"]
    : ["League"];

  return (
    <>
      <div className="nav">
        {tabs.map((text) => {
          return (
            <button
              key={text}
              className={detail_tab === text ? "active" : ""}
              onClick={() =>
                dispatch(
                  updatedLmtradesState({ key: "detail_tab", value: text })
                )
              }
            >
              {text}
            </button>
          );
        })}
      </div>
      {detail_tab === "League" ? (
        <League type={2} league={tradeLeague} />
      ) : detail_tab === "Tips" ? (
        <TradeTips tradeTips={tradeTips} />
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
  tradeCount: number | undefined;
  fetchMore: () => void;
}) => {
  const { leaguemates, leagues } = useSelector(
    (state: RootState) => state.manager
  );
  const [activeTrade, setActiveTrade] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(Math.max(Math.max(Math.ceil((trades.length - 1) / 25), 5) - 4, 1));
  }, [trades]);

  const trade_tips_all = useMemo(() => {
    const tips: {
      [transaction_id: string]: TradeTip[];
    } = {};

    trades.forEach((trade) => {
      if (!tips[trade.transaction_id]) tips[trade.transaction_id] = [];

      trade.managers
        .filter((m_user_id) => leaguemates[m_user_id])
        .forEach((m_user_id) => {
          const common_league_ids = leaguemates[m_user_id].leagues.filter(
            (league_id) => leagues?.[league_id]?.settings?.disable_trades !== 1
          );

          const adds_lm = Object.keys(trade.adds).filter(
            (player_id) => trade.adds[player_id] === m_user_id
          );

          adds_lm.forEach((player_id) => {
            common_league_ids.forEach((league_id) => {
              if (
                leagues?.[league_id]?.user_roster?.players?.includes(player_id)
              ) {
                tips[trade.transaction_id].push({
                  player_id,
                  type: "trade away",
                  league: {
                    league_id,
                    avatar: leagues[league_id].avatar,
                    name: leagues[league_id].name,
                  },
                  lm: {
                    user_id: leaguemates[m_user_id].user_id,
                    avatar: leaguemates[m_user_id].avatar,
                    username: leaguemates[m_user_id].username,
                  },
                });
              }
            });
          });

          const drops_lm = Object.keys(trade.drops).filter(
            (player_id) => trade.drops[player_id] === m_user_id
          );

          drops_lm.forEach((player_id) => {
            common_league_ids.forEach((league_id) => {
              const lmRoster = leagues?.[league_id]?.rosters?.find(
                (r) => r.user_id === m_user_id
              );

              if (leagues && lmRoster?.players?.includes(player_id)) {
                tips[trade.transaction_id].push({
                  player_id,
                  type: "acquire",
                  league: {
                    league_id,
                    avatar: leagues[league_id].avatar,
                    name: leagues[league_id].name,
                  },
                  lm: {
                    user_id: leaguemates[m_user_id].user_id,
                    avatar: leaguemates[m_user_id].avatar,
                    username: leaguemates[m_user_id].username,
                  },
                });
              }
            });
          });
        });
    });

    return tips;
  }, [leaguemates, leagues, trades]);

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
        {(trades?.length || 0) < (tradeCount || 0) ? (
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
                  tradeTips={trade_tips_all[trade.transaction_id]}
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
      {tradeCount ? (
        <h2>{Number(tradeCount).toLocaleString("en-US")} Trades</h2>
      ) : null}
      {page_numbers}
      {table}
      {page_numbers}
    </>
  );
};

const TradeTips = ({ tradeTips }: { tradeTips: TradeTip[] }) => {
  const { allplayers } = useSelector((state: RootState) => state.common);

  return (
    <>
      <TableMain
        type={2}
        headers={[]}
        data={tradeTips.map((tip) => {
          return {
            id: `${tip.player_id}__${tip.league.league_id}__${tip.lm.user_id}`,
            columns: [
              {
                text: tip.type === "acquire" ? <>&#65291;</> : <>&#8722;</>,
                colspan: 1,
                classname:
                  (tip.type === "acquire" ? "green" : "red") + " font-black",
              },
              {
                text: (
                  <Avatar
                    id={tip.player_id}
                    text={
                      allplayers?.[tip.player_id]?.full_name || tip.player_id
                    }
                    type="P"
                  />
                ),
                colspan: 3,
                classname: "",
              },
              {
                text: (
                  <Avatar
                    id={tip.league.avatar}
                    text={tip.league.name}
                    type="L"
                  />
                ),
                colspan: 3,
                classname: "",
              },
              {
                text: (
                  <Avatar id={tip.lm.avatar} text={tip.lm.username} type="U" />
                ),
                colspan: 2,
                classname: "",
              },
            ],
          };
        })}
        placeholder=""
      />
    </>
  );
};

export default TableTrades;
