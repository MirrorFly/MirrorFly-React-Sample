import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Search, Close } from '../../assets/images';
import { getValidSearchVal, handleFilterBlockedContact } from '../../Helpers/Utility';
import { getUserInfoForSearch } from '../../Helpers/Chat/User';
import userList from './RecentChat/userList';
import { REACT_APP_CONTACT_SYNC } from '../processENV';

class WebChatSearch extends React.Component {

  /**
   * Following the states used in WebChatSearch Component.
   *
   */
  state = { isTyping: false }
  /**
  * Following the states used in WebChatSearch Component.
  *
  * @param {object} event to handle the searched element.
  */
  searchFilterList = () => {
    let search = ReactDOM.findDOMNode(this).getElementsByClassName('search-contacts');
    const value = search.length ? search[0].value : '';
    const { searchIn, rosterDataResponse, rosterData: { data }, handleSearchFilterList } = this.props
    const searchWith = getValidSearchVal(value);
    this.setState({
      isTyping: value ? true : false
    });
    if (!REACT_APP_CONTACT_SYNC) {
      handleSearchFilterList(null, searchWith)
      userList.getUsersListFromSDK(1, searchWith);  
    } else {
      let updatedList = (searchIn === 'recent-chat') ? rosterDataResponse : handleFilterBlockedContact(data);
      updatedList = updatedList.filter((item) => {
        const { roster, recent } = item
        let filterData = (searchIn === 'recent-chat') ? roster || recent : item;
        const regexList = getUserInfoForSearch(filterData);
        return regexList.find((str) => {
          if (!item.isFriend || !str) return false
          return (str.search(new RegExp(searchWith, "i")) !== -1)
        });
      });
      handleSearchFilterList(updatedList, value);
    }
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
   * render() method to render the WebChatSearch component into browser.
   */
  render() {
    const { isTyping } = this.state
    return (
      <div className="search">
        <input type="text" className="search-contacts" name="search-contacts" autoComplete="off" placeholder="Search" onChange={this.searchFilterList}></input>
        <i className={(this.state.isTyping) ? '' : 'Search'} title="Search"> {!isTyping && <Search />}</i>
        <i className={(this.state.isTyping) ? 'CloseSearch' : ''} title="Clear search" onClick={this.clearSearch}>{isTyping && <Close />}</i>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return ({
    rosterData: state.rosterData,
  });
};

export default connect(mapStateToProps, null)(WebChatSearch);
