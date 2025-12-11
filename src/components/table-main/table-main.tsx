import { JSX, useEffect, useState } from "react";
import Search from "../search/search";
import "./table-main.css";
import SortIcon from "../sort-icon/sort-icon";
import TableHeader from "../table-header/table-header";

type SetPage = (page: number) => void;

type entry = {
  id: string;
  search?: { text: string; display: JSX.Element };
  columns: {
    text: string | JSX.Element;
    sort?: string | number;
    classname: string;
    style?: { [key: string]: string };
    colspan: number;
  }[];
  secondary?: JSX.Element;
  classname?: string;
};

type TableMainProps = {
  sortBy?: {
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  };
  setSortBy?: ({
    column,
    asc,
  }: {
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  }) => void;
  type: number;
  headers: {
    text: string;
    colspan: number;
    classname?: string;
    update?: (value: string) => void;
  }[];
  headers_sort?: number[];
  headers_options?: { text: string; abbrev: string; desc: string }[];
  data: entry[];
  half?: boolean;
  filters1?: JSX.Element[];
  filters2?: JSX.Element[];
  placeholder?: string;
  sendActive?: (active: false | string) => void;
};

const PageNumbers = ({
  data,
  page,
  setPage,
}: {
  data: {
    id: string;
    search?: { text: string; display: JSX.Element };
    columns: {
      text: string | JSX.Element;
      colspan: number;
      classname: string;
      style?: { [key: string]: string };
    }[];
    secondary?: JSX.Element;
  }[];
  page: number;
  setPage: SetPage;
}) => {
  return (
    <div className="page_numbers_wrapper">
      <ol className="page_numbers">
        {Array.from(Array(Math.ceil(data?.length / 25 || 0)).keys()).map(
          (key) => {
            return (
              <li
                key={key + 1}
                className={page === key + 1 ? "active" : ""}
                onClick={() => setPage && setPage(key + 1)}
              >
                {key + 1}
              </li>
            );
          }
        )}
      </ol>
    </div>
  );
};

const TableMain = ({
  sortBy,
  setSortBy,
  type,
  headers,
  headers_sort,
  headers_options,
  data,
  half,
  filters1,
  filters2,
  placeholder,
  sendActive,
}: TableMainProps) => {
  const [searched, setSearched] = useState<false | string>(false);
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<false | string>(false);

  const body = !half
    ? data
        .filter((d) => !searched || d.id === searched)
        .sort((a, b) => {
          return sortBy
            ? sortBy.asc
              ? (a.columns[sortBy.column].sort || 0) >
                (b.columns[sortBy.column].sort || 0)
                ? 1
                : -1
              : (b.columns[sortBy.column].sort || 0) >
                (a.columns[sortBy.column].sort || 0)
              ? 1
              : -1
            : 1;
        })
        .slice((page - 1) * 25, (page - 1) * 25 + 25)
    : data;

  useEffect(() => {
    setPage(1);
  }, [sortBy, searched, data.length]);

  useEffect(() => {
    if (sendActive) sendActive(active);
  }, [active, sendActive]);

  return (
    <>
      {data.some((d) => d.search) && (
        <div className="searches">
          {filters1 &&
            filters1.map((filter, index) => {
              return <span key={index}>{filter}</span>;
            })}
          {
            <div
              className="text-[4rem] w-[40%] h-[10rem] m-auto"
              key={placeholder}
            >
              <Search
                searched={
                  data.find((d) => d.id === searched)?.search?.text || ""
                }
                setSearched={setSearched}
                options={data
                  .filter((d) => d.search)
                  .map((d) => ({
                    id: d.id,
                    text: d.search?.text || "",
                    display: d.search?.display || <></>,
                  }))}
                placeholder={placeholder || ""}
              />
            </div>
          }
          {filters2 &&
            filters2.map((filter, index) => {
              return <span key={index}>{filter}</span>;
            })}
        </div>
      )}
      {data.length > 25 && !searched && !half ? (
        <PageNumbers
          data={data.filter((d) => !searched || d.id === searched)}
          page={page}
          setPage={setPage}
        />
      ) : null}
      <table
        className={
          "main " +
          ((half && "half ") || "") +
          (type === 1 ? "one" : type === 2 ? "two" : "three")
        }
      >
        <thead className="main_heading">
          {headers_sort ? (
            <tr>
              {headers.map((h, index) => {
                return (
                  <th
                    key={index}
                    colSpan={h.colspan}
                    className={"sort_header " + h.classname}
                  >
                    {sortBy && setSortBy && headers_sort?.includes(index) ? (
                      <SortIcon
                        colNum={index as 0 | 1 | 2 | 3 | 4}
                        sortBy={sortBy}
                        setSortBy={(column, asc) => setSortBy({ column, asc })}
                      />
                    ) : null}
                  </th>
                );
              })}
            </tr>
          ) : null}
          <tr>
            {headers.map((h, index) => {
              return (
                <th
                  key={`${h.text}__${index}`}
                  colSpan={h.colspan}
                  className={"main_header " + h.classname}
                >
                  {h.update ? (
                    <TableHeader
                      columnText={h.text}
                      setColumnText={h.update}
                      options={headers_options || []}
                    />
                  ) : (
                    h.text
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {body.length > 0 ? (
            body
              .sort((a, b) => {
                return sortBy
                  ? sortBy.asc
                    ? (a.columns[sortBy.column].sort || 0) >
                      (b.columns[sortBy.column].sort || 0)
                      ? 1
                      : -1
                    : (b.columns[sortBy.column].sort || 0) >
                      (a.columns[sortBy.column].sort || 0)
                    ? 1
                    : -1
                  : 1;
              })
              .map((row, rowIndex: number) => {
                return (
                  <tr
                    key={row.id}
                    className={active === row.id ? "active-container" : ""}
                  >
                    <td
                      colSpan={row.columns.reduce(
                        (acc, cur) => acc + cur.colspan,
                        0
                      )}
                    >
                      <table>
                        <tbody>
                          <tr
                            className={
                              (active === row.id ? "active " : " ") +
                              (row.classname || "")
                            }
                            onClick={() =>
                              (row.secondary || half) &&
                              (active === row.id
                                ? setActive(false)
                                : setActive(row.id))
                            }
                          >
                            {row.columns.map((col, index: number) => {
                              return (
                                <td
                                  key={index}
                                  colSpan={col.colspan}
                                  className={
                                    "content " +
                                    col.classname +
                                    (headers_sort?.includes(index) &&
                                    sortBy?.column === index
                                      ? " sort"
                                      : "")
                                  }
                                  style={col.style}
                                >
                                  <div>
                                    {col.text === "LOADING" ? (
                                      <i className="fas fa-spinner fa-pulse"></i>
                                    ) : col.text === "INDEX" ? (
                                      rowIndex + 1
                                    ) : (
                                      col.text
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                          {active === row.id && (
                            <tr>
                              <td
                                className="secondaryComponent"
                                colSpan={row.columns.reduce(
                                  (acc, cur) => acc + cur.colspan,
                                  0
                                )}
                              >
                                {row.secondary}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                );
              })
          ) : (
            <tr>
              <td colSpan={headers.reduce((acc, cur) => acc + cur.colspan, 0)}>
                <table className="main_content">
                  <tbody>
                    <tr>
                      <td className="content">---</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {data.length > 25 && !searched && !half ? (
        <PageNumbers
          data={data.filter((d) => !searched || d.id === searched)}
          page={page}
          setPage={setPage}
        />
      ) : null}
    </>
  );
};

export default TableMain;
