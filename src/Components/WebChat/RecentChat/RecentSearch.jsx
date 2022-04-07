import React, { useState } from "react";
import { Search, Close } from '../../../assets/images';
const RecentSearch = (props) => {
  const [searchValue, setSearchValue] = useState("");

  const searchFilterList = (e) => {
    const { value } = e.target;
    if (value.trim().length === 0) {
      setSearchValue(value);
      props.search("");
    } else {
      setSearchValue(value);
      props.search(value);
    }
  }

  const resetInputField = () => {
    setSearchValue("")
    props.search('');
  }

  return (
    <div className="search">
      <input type="text"
        className="search-contacts"
        name="search-contacts"
        autoComplete="off"
        placeholder="Search"
        value={searchValue}
        onChange={searchFilterList}
      />
      <i className=""> {!searchValue && <Search />}</i>
      <i className="" onClick={resetInputField}>{searchValue && <Close />}</i>
    </div>
  );
}

export default RecentSearch;
