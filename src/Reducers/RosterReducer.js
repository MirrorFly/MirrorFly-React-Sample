import { ROSTER_DATA, ROSTER_DATA_UPDATE, ROSTER_DATA_ADD } from '../Actions/Constants';

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

const getDisplayNamefromRoster =( roster=[] )=>{
   const  getAllNames =  roster.map(profile=>{
     const jid = (profile.username) ? profile.username : profile.userId;
     return [jid,profile]
   })
   return new Map(getAllNames)
}

const addNewRoster = (state, newData = {}) => {
  let { data = [], rosterNames } = state;
  if(newData.userId && !rosterNames.has(newData.userId)){
    data = [...data, newData];
    rosterNames = getDisplayNamefromRoster(data);
  }
  return {
    rosterNames,
    data
  }
}

export default function RosterReducer(state = [], action = {}) {
  const { payload: { id, data } = {} } = action
  switch (action.type) {
    case ROSTER_DATA:
      return {
        ...action.payload,
        rosterNames: getDisplayNamefromRoster(action.payload.data)
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
    default:
      return state;
  }
}
