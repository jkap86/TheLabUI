import { JSX, useEffect, useMemo, useRef, useState } from "react";
import "./search.css";
import { FixedSizeList as List } from "react-window";

const ROW_HEIGHT = 36;
const MAX_MENU_HEIGHT = 240;

interface Option {
  id: string;
  text: string;
  display: JSX.Element;
}

const Search = ({
  searched,
  setSearched,
  options,
  placeholder,
  disabled,
}: {
  searched: string;
  setSearched: (searched: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
}) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  //const [searchOptions, setSearchOptions] = useState<Option[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        //setSearchOptions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchText(searched);
  }, [searched]);

  const handleSearch = (input: string) => {
    const match = options.find(
      (x: Option) => x.text.trim().toLowerCase() === input.trim().toLowerCase()
    );

    if (input.trim() === "") {
      setSearchText("");
      setSearched("");
      setIsOpen(false);
      // setSearchOptions([]);
    } else if (match) {
      setSearchText(match.text);
      setSearched(match.id);
      setIsOpen(false);
      // setSearchOptions([]);
    } else {
      setSearchText(input);
      setIsOpen(true);

      // setSearchOptions(filteredOptions);
    }
  };

  const searchOptions = useMemo(() => {
    const filteredOptions: Option[] = options
      .filter((option: Option) =>
        option.text
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase()
          .trim()
          .includes(
            searchText
              .trim()
              .replace(/[^a-zA-Z0-9]/g, "")
              .toLowerCase()
          )
      )
      .sort(
        (a, b) =>
          a.text.toLowerCase().trim().indexOf(searchText.trim().toLowerCase()) -
            b.text
              .toLowerCase()
              .trim()
              .indexOf(searchText.trim().toLowerCase()) ||
          (a.text.trim() > b.text.trim() ? 1 : -1)
      );

    return filteredOptions;
  }, [searchText, options]);

  return (
    <div className="search_container" ref={searchRef}>
      <div className="relative">
        <div>
          <input
            className={"search" + (disabled ? " opacity-[.25]" : "")}
            type="text"
            value={searchText}
            onChange={(e) => !disabled && handleSearch(e.target.value)}
            placeholder={placeholder}
            autoFocus={false}
          />
          {(searchText !== "" && (
            <button className="clear" onClick={() => handleSearch("")}>
              {"\u2716\uFE0E"}
            </button>
          )) || (
            <button
              className="show"
              onClick={(e) => !disabled && setIsOpen(true)}
            >
              <i className="fa-solid fa-caret-down"></i>
            </button>
          )}
        </div>

        {searchOptions.length > 0 && isOpen && (
          <List
            className="options"
            height={MAX_MENU_HEIGHT}
            itemCount={searchOptions.length}
            itemSize={ROW_HEIGHT}
            width="100%"
          >
            {({ index, style }) => {
              const option = searchOptions[index];

              return (
                <li
                  key={`${option.id}`}
                  style={style}
                  onClick={() => handleSearch(option.text)}
                >
                  {option.display}
                </li>
              );
            }}
          </List>
        )}
      </div>
    </div>
  );
};

export default Search;
