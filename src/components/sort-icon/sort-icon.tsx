import "./sort-icon.css";

type ClickHandler = (column: 0 | 1 | 2 | 3 | 4, asc: boolean) => void;

type SortIconProps = {
  colNum: 0 | 1 | 2 | 3 | 4;
  sortBy: { column: 0 | 1 | 2 | 3 | 4; asc: boolean };
  setSortBy: ClickHandler;
};

const SortIcon = ({ colNum, sortBy, setSortBy }: SortIconProps) => {
  const asc = sortBy.column === colNum ? !sortBy.asc : sortBy.asc;
  return (
    <div
      onClick={() => setSortBy(colNum, asc)}
      className={sortBy?.column === colNum ? "active" : ""}
    >
      {sortBy?.column === colNum ? (
        !sortBy?.asc ? (
          <i className="fa-solid fa-caret-down active"></i>
        ) : (
          <i className="fa-solid fa-caret-up active"></i>
        )
      ) : !sortBy?.asc ? (
        <i className="fa-solid fa-caret-down"></i>
      ) : (
        <i className="fa-solid fa-caret-up"></i>
      )}
    </div>
  );
};

export default SortIcon;
