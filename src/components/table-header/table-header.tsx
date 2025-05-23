import { JSX, useEffect, useState } from "react";
import "./table-header.css";
import Modal from "../modal/modal";
import Search from "../search/search";
import { text } from "stream/consumers";

interface TableHeaderProps {
  options: { text: string; abbrev: string; desc: string }[];
  columnText: string;
  setColumnText: (value: string) => void;
}

const TableHeader = ({
  options,
  columnText,
  setColumnText,
}: TableHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [col, setCol] = useState("");

  useEffect(() => {
    isOpen && setCol(columnText);
  }, [columnText, isOpen]);

  const search_options = options.map((o) => ({
    id: o.abbrev,
    text: o.text,
    display: <>{o.abbrev}</>,
  }));

  const active = options.find((so) => so.abbrev === col);

  return (
    <>
      <div className="columndropdown" onClick={() => setIsOpen(true)}>
        <div className="columnText">
          <div>{columnText}</div>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          col.trim() && setColumnText(col);
          setIsOpen(false);
        }}
      >
        <div>
          <div className="column-options">
            <ul>
              {options.map((o) => {
                return (
                  <li
                    key={o.abbrev}
                    className={o.abbrev === active?.abbrev ? "active" : ""}
                    onClick={() => setCol(o.abbrev)}
                  >
                    {o.text}
                  </li>
                );
              })}
            </ul>
          </div>
          <h3>{active?.abbrev}</h3>
          <h5>{active?.desc}</h5>
        </div>
      </Modal>
    </>
  );
};

export default TableHeader;
