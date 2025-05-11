import { JSX, useEffect, useRef, useState } from "react";
import "./search.css";

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
}: {
  searched: string;
  setSearched: (searched: string) => void;
  options: Option[];
  placeholder: string;
}) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [searchOptions, setSearchOptions] = useState<Option[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOptions([]);
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
      setSearchOptions([]);
    } else if (match) {
      setSearchText(match.text);
      setSearched(match.id);
      setSearchOptions([]);
    } else {
      setSearchText(input);

      const filteredOptions: Option[] = options
        .filter((option: Option) =>
          option.text.toLowerCase().trim().includes(input.trim().toLowerCase())
        )
        .sort(
          (a, b) =>
            a.text.toLowerCase().trim().indexOf(input.trim().toLowerCase()) -
              b.text.toLowerCase().trim().indexOf(input.trim().toLowerCase()) ||
            (a.text.trim() > b.text.trim() ? 1 : -1)
        );

      setSearchOptions(filteredOptions);
    }
  };

  return (
    <div className="search_container" ref={searchRef}>
      <input
        className="search"
        type="text"
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        autoFocus={false}
      />
      {(searchText !== "" && (
        <button className="clear" onClick={() => handleSearch("")}>
          x
        </button>
      )) || (
        <button
          className="show"
          onClick={(e) =>
            setSearchOptions(
              options.sort(
                (a, b) =>
                  a.text
                    .toLowerCase()
                    .trim()
                    .indexOf(e.currentTarget.value.trim().toLowerCase()) -
                    b.text
                      .toLowerCase()
                      .trim()
                      .indexOf(e.currentTarget.value.trim().toLowerCase()) ||
                  (a.text.trim() > b.text.trim() ? 1 : -1)
              )
            )
          }
        >
          ^
        </button>
      )}
      {searchOptions.length > 0 && (
        <ol className="options">
          {searchOptions.map((option: Option, index) => {
            return (
              <li
                key={`${option.id}_${index}`}
                onClick={() => handleSearch(option.text)}
              >
                {option.display}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default Search;
