"use client";

import TableMain from "@/components/table-main/table-main";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

type LogDb = {
  ip: string;
  route: string;
  created_at: string;
};

type Log = {
  ip: string;
  route: string;
  created_at: string;
  tool: string;
  username: string;
  league_id: string;
  manager_tab: string;
};

const LogsPage = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [ip, setIp] = useState("");
  const [tool, setTool] = useState("");
  const [username, setUsername] = useState("");
  const [league_id, setLeague_id] = useState("");
  const [manager_tab, setManager_tab] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      const logs: { data: LogDb[] } = await axios.get("/api/fetchlogs");

      setLogs(
        logs.data.map((l) => {
          const route_array = l.route.split("/");

          const tool = route_array[1].toLowerCase();

          let username = "";
          let league_id = "";
          let manager_tab = "";

          if (["manager", "lineupchecker"].includes(tool) && route_array[2]) {
            username = route_array[2].toLowerCase();

            if (tool === "manager" && route_array[3]) {
              manager_tab = route_array[3].toLowerCase();
            }
          } else if (tool === "picktracker") {
            league_id = route_array[2];
          }

          return {
            ...l,
            tool,
            username,
            league_id,
            manager_tab,
          };
        })
      );
    };
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      return (
        (tool === "" || l.tool === tool) &&
        (ip === "" || l.ip === ip) &&
        (username === "" || l.username === username) &&
        (league_id === "" || l.league_id === league_id) &&
        (manager_tab === "" || l.manager_tab === manager_tab)
      );
    });
  }, [logs, ip, tool, username, league_id, manager_tab]);

  const { tools, usernames, league_ids, manager_tabs, ips } = useMemo(() => {
    const tools: string[] = [];
    const usernames: string[] = [];
    const league_ids: string[] = [];
    const manager_tabs: string[] = [];
    const ips: string[] = [];

    filteredLogs.forEach((log) => {
      if (!tools.includes(log.tool)) tools.push(log.tool);

      if (log.username && !usernames.includes(log.username))
        usernames.push(log.username);

      if (log.league_id && !league_ids.includes(log.league_id))
        league_ids.push(log.league_id);

      if (log.manager_tab && !manager_tabs.includes(log.manager_tab))
        manager_tabs.push(log.manager_tab);

      if (!ips.includes(log.ip)) ips.push(log.ip);
    });

    return { tools, usernames, league_ids, manager_tabs, ips };
  }, [filteredLogs]);

  const filters = [
    {
      label: "IP Address",
      id: "ip",
      list: ips,
      state: ip,
      setState: setIp,
    },
    {
      label: "Tool",
      id: "tools",
      list: tools,
      state: tool,
      setState: setTool,
    },
    {
      label: "Username",
      id: "username",
      list: usernames,
      state: username,
      setState: setUsername,
    },
    {
      label: "League Id",
      id: "league_id",
      list: league_ids,
      state: league_id,
      setState: setLeague_id,
    },
    {
      label: "Tab",
      id: "manager_tab",
      list: manager_tabs,
      state: manager_tab,
      setState: setManager_tab,
    },
  ];

  return (
    <div className="h-dvh">
      <h1 className="!text-[5rem] font-score text-blue-400">
        Logs - Last 24 hrs
      </h1>

      <div className="flex flex-col text-[3rem] items-center mx-auto my-8 bg-gray-700 w-fit p-8 max-w-[100vw]">
        {filters.map((f) => {
          return (
            <div
              key={f.label}
              className="w-full flex justify-center items-center m-4"
            >
              <label className="w-[35%] text-center">{f.label}</label>

              <div className="relative">
                <input
                  value={f.state}
                  onChange={(e) => f.setState(e.target.value.trim())}
                  list={f.id}
                  className="bg-gray-400 w-[25rem] text-center text-black font-black"
                />
                <datalist id={f.id}>
                  {f.list
                    .sort((a, b) =>
                      (parseInt(a) || a) > (parseInt(b) || b) ? 1 : -1
                    )
                    .map((item) => {
                      return (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      );
                    })}
                </datalist>
                <span
                  className="w-fit text-white-600 font-black text-[3rem] !bg-red-600 absolute right-0 top-0 px-2"
                  onClick={() => f.setState("")}
                >
                  {f.state !== "" ? "\u2716\uFE0E" : null}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="text-[3rem] m-8">
        {filteredLogs.length.toLocaleString("en-US")} Entries
      </h3>

      <TableMain
        type={1}
        headers={[
          {
            text: "Tool",
            colspan: 1,
            classname: "text-[2.5rem]",
          },
          {
            text: "User/League Id",
            colspan: 1,
            classname: "text-[2.5rem]",
          },
          {
            text: "Tab",
            colspan: 1,
            classname: "text-[2.5rem]",
          },
          {
            text: "IP Address",
            colspan: 1,
            classname: "text-[2.5rem]",
          },
          {
            text: "Timestamp",
            colspan: 1,
            classname: "text-[2.5rem]",
          },
        ]}
        data={filteredLogs
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .map((log, index) => {
            return {
              id: log.created_at + "__" + index,
              columns: [
                {
                  text: log.tool,
                  colspan: 1,
                  classname: "",
                },
                {
                  text: log.username || log.league_id || "-",
                  colspan: 1,
                  classname: "",
                },
                {
                  text: log.manager_tab || "-",
                  colspan: 1,
                  classname: "",
                },
                {
                  text: log.ip,
                  colspan: 1,
                  classname: "",
                },
                {
                  text: (
                    <>
                      {new Date(log.created_at).toLocaleDateString("en-US")}
                      <br />
                      <em>
                        {new Date(log.created_at).toLocaleTimeString("en-US")}
                      </em>
                    </>
                  ),
                  colspan: 1,
                  classname: "text-[2rem] font-score !break-all p-4",
                },
              ],
            };
          })}
        placeholder=""
      />
    </div>
  );
};

export default LogsPage;
