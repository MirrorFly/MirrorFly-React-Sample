import Store from '../../../Store';
import SDK from '../../SDK.js';
import {
    fetchingUserList,
    RosterDataUpsert
} from '../../../Actions/RosterActions';
import {
    compare
} from '../../../Helpers/Utility';

let totalPages = 0;
let latestSearchText = "";

const userList = {
    getUsersListFromSDK: async function (pageNumber = 1, searchText = "") {
        if (pageNumber === 1 || pageNumber <= totalPages) {
            latestSearchText = searchText;
            await Store.dispatch(fetchingUserList(true));
            const response = await SDK.getUsersList(searchText, pageNumber, 20);
            if (searchText === latestSearchText) {
                if (response.statusCode === 200) {
                    totalPages = response.totalPages;
                    let friends = response.users.map(user => {
                        return {
                            ...user,
                            isFriend: true,
                            isDeletedUser: false
                        }
                    });
                    let contacts = friends.sort(compare);
                    Store.dispatch(RosterDataUpsert(contacts, pageNumber));
                } else {
                    Store.dispatch(fetchingUserList(false));
                }
            }
        } else {
            Store.dispatch(fetchingUserList(false));
        }
    }
}

export default userList;