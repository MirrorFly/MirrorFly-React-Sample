import {
  ROSTER_DATA,
  ROSTER_DATA_UPDATE,
  ROSTER_DATA_ADD,
  ROSTER_DATA_UPSERT,
  FETCHING_USER_LIST
} from '../Actions/Constants';
import {
  compare
} from '../Helpers/Utility';

const updateRoster = (rosterData = [], newData = {}) => {
  return rosterData.map(profile => {
    if (newData.userId === profile.userId) {
      return {
        ...profile,
        ...newData
      }
    }
    return profile
  })
}

const upsertRoster = (rosterData = [], newData = [], pageNumber = 1) => {

  if (pageNumber === 1) {
    for (let roster in rosterData) {
      if (rosterData[roster].isFriend) {
        rosterData[roster].isFriend = false;
      }
    }
  }

  for (let user in newData) {
    let key = userExists(rosterData, newData[user].userId)
    if (key > -1) {
      rosterData[key] = newData[user];
    } else {
      rosterData.push(newData[user]);
    }
  }
 
  let contacts = [...rosterData];
  contacts.sort(compare);
  return [...contacts];
}

const userExists = (rosterData, userId) => {
  for (let user in rosterData) {
    if (rosterData[user].userId === userId) {
      return Number(user);
    }
  }
  return -1;
}

const getDisplayNamefromRoster = (roster = []) => {
  const getAllNames = roster.map(profile => {
    const jid = (profile.username) ? profile.username : profile.userId;
    return [jid, profile]
  })
  return new Map(getAllNames)
}

const addNewRoster = (state, newData = {}) => {
  let {
    data = [], rosterNames
  } = state;
  if (newData.userId && !rosterNames.has(newData.userId)) {
    data = [...data, newData];
    rosterNames = getDisplayNamefromRoster(data);
  }
  return {
    rosterNames,
    data
  }
}

const ROSTER_DEFAULT_STATE = {
  isFetchingUserList: false,
  rosterNames: {},
  data: []
}

export default function RosterReducer(state = ROSTER_DEFAULT_STATE, action = {}) {
  const {
    payload: {
      id,
      data
    } = {}
  } = action
  switch (action.type) {
    case ROSTER_DATA:
      return {
        ...action.payload,
          rosterNames: getDisplayNamefromRoster(action.payload.data)
      }
      case ROSTER_DATA_UPSERT:
        const pageNumber = action.payload.pageNumber;
        const roster = upsertRoster(state.data, data, pageNumber);
        return {
          ...action.payload,
            data: roster,
            rosterNames: getDisplayNamefromRoster(roster),
            isFetchingUserList: false
        }
        case ROSTER_DATA_UPDATE:
          const rosterDetails = updateRoster(state.data, data)
          return {
            ...state,
            id,
            data: rosterDetails,
              rosterNames: getDisplayNamefromRoster(rosterDetails)
          }
          case ROSTER_DATA_ADD:
            const rosters = addNewRoster(state, data)
            return {
              ...state,
              id,
              ...rosters
            }
            case FETCHING_USER_LIST:
              return {
                ...state,
                id,
                isFetchingUserList: data
              }
              default:
                return state;
  }
}