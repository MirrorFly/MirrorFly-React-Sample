import React from 'react';
import ReactDOM from 'react-dom';
import { ReactComponent as SearchIcon } from '../../../assets/images/search.svg';
import { ReactComponent as Close } from '../../../assets/images/search_close.svg';

class Search extends React.Component {

  /**
   * Following the states used in Search Component.
   *
   */
  state = { isTyping: false }
  /**
  * Following the states used in Search Component.
  *
  * @param {object} event to handle the searched element.
  */
  searchFilterList = () => {
    let search = ReactDOM.findDOMNode(this).getElementsByClassName('search-contacts');
    const value = search.length ? search[0].value : '';
    const { handleSearchFilterList } = this.props
    const searchWith = value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    this.setState({
      isTyping: value ? true : false
    })
    handleSearchFilterList(searchWith)
  }

  /**
   * clear search field
   */
  clearSearch = () => {
    let search = ReactDOM.findDOMNode(this).getElementsByClassName('search-contacts');
    search[0].value = '';
    this.searchFilterList()
  }

  /**
   * render() method to render the Search component into browser.
   */
  render() {
    const { isTyping } = this.state
    return (
      <div className="search">
        <input type="text" className="search-contacts" name="search-contacts" autoComplete="off" placeholder="Search" onChange={this.searchFilterList}></input>
        <i className={(this.state.isTyping) ? '' : 'Search'} title="Search"> {!isTyping && <SearchIcon />}</i>
        <i className={(this.state.isTyping) ? 'CloseSearch' : ''} title="Clear search" onClick={this.clearSearch}>{isTyping && <Close />}</i>
      </div>
    );
  }
}

export default Search;
