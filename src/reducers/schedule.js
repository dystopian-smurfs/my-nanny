const ScheduleReducer = (state = {
  isFetching: false,
  list: {}
}, action) => {
  if ( action.type === 'REQUEST_SCHEDULE' ) {
    return Object.assign({}, state, {
      isFetching: true
    });
  } else if ( action.type === 'RECEIVE_SCHEDULE' ) {
    let newSchedule = {};
    for (let i = 0; i < action.payload.childList.length; i++) {
      newSchedule[action.payload.childList[i]] = action.payload.schedule[i].schedule;
    }
    return Object.assign({}, state, {
      isFetching: false,
      list: newSchedule
    });
  } else {
    return state;
  }
};

export default ScheduleReducer;
