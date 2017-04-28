import fetch from 'isomorphic-fetch';
import Promise from 'bluebird';

const apiEndpoint = 'https://api.my-nanny.org/api/';

var date = new Date();
var day = date.getDate();
var month = date.getMonth();
var year = date.getFullYear();
var fullDate = year + '-' + month + '-' + day;

const url = (endpoint, id, startDate, endDate, page) => {
  startDate = startDate || '';
  endDate = endDate || '';
  page = page || 1;

  if (endpoint === 'getAccount') {
    return apiEndpoint + 'account?access_token=';
  } else if (endpoint === 'getChores') {
    return apiEndpoint + 'children/' + id + '/chores?' + 
    'start_date=' + startDate + '&end_date=' + endDate + '&page=' + 
    page + '&access_token=';
  } else if (endpoint === 'getChildren') {
    return apiEndpoint + 'children?access_token=';
  } else if (endpoint === 'getSchedule') {
    return apiEndpoint + 'children/' + id +
      '/schedule?access_token=';
  } else if (endpoint === 'addChild') {
    return apiEndpoint + 'children?access_token=';
  }
};

export const requestAccount = (token) => {
  return {
    type: 'REQUEST_ACCOUNT',
    payload: token
  };
};

export const receiveAccount = (account) => {
  return {
    type: 'RECEIVE_ACCOUNT',
    payload: account
  };
};

export const requestChildren = (token) => {
  return {
    type: 'REQUEST_CHILDREN',
    payload: token
  };
};

export const receiveChildren = (children) => {
  return {
    type: 'RECEIVE_CHILDREN',
    payload: children
  };
};

export const requestChores = (date) => {
  return {
    type: 'REQUEST_CHORES',
    payload: {
      date: date
    }
  };
};

export const receiveChores = (childList, chores) => {
  return {
    type: 'RECEIVE_CHORES',
    payload: {
      childList: childList,
      chores: chores
    }
  };
};

export const requestSchedule = () => {
  return {
    type: 'REQUEST_SCHEDULE'
  };
};

export const receiveSchedule = (childList, schedule) => {
  return {
    type: 'RECEIVE_SCHEDULE',
    payload: {
      childList: childList,
      schedule: schedule
    }
  };
};

export const toggleEditable = () => {
  return {
    type: 'TOGGLE_EDITABLE'
  };
};

export const toggleEditChild = (id, name, phone, show, editable) => {
  const obj = {
    id: id,
    name: name,
    phone: phone,
    show: show,
    editable: editable
  };
  return {
    type: 'TOGGLE_CHILD_EDIT',
    payload: obj
  };
};

export const toggleShowChild = (id) => {
  return {
    type: 'TOGGLE_CHILD_SHOW',
    payload: id
  };
};

const getChildDetails = (list) => {
  let childIds = [];
  list.children.forEach((child) => {
    childIds.push(child.id);
  });
  return dispatch => Promise.all([
    dispatch(receiveChildren(list)),
    dispatch(requestSchedule()),
    dispatch(requestChores(fullDate))
  ]);
};

export const updateAccountInStore = (username, phone, timezone, email) => {
  const newAccountData = {
    username: username,
    phone: phone,
    timezone: timezone, 
    email: email
  };
  return function(dispatch) {
    dispatch(receiveAccount(newAccountData));
  };
};

export const getAccountShallow = (token) => {
  return function(dispatch) {
    dispatch(requestAccount(token));
    return fetch(url('getAccount') + token)
    .then((res) => {
      if (res.status >= 400) {
        throw new Error('Error getting account');
      }
      return res.json();
    })
    .then((account) => {
      dispatch(receiveAccount(account));
    })
    .catch((error) => {
      console.error('You done messed up:', error);
    });
  };
};

export const getChildren = (token) => {
  let childIds = [];
  return function(dispatch) {
    dispatch(requestChildren(token));
    return fetch(url('getChildren') + token)
    .then((res) => {
      if (res.status >= 400) {
        throw new Error('Error getting children');
      }
      return res.json();
    })
    .then((list) => {
      dispatch(receiveChildren(list));
      dispatch(requestSchedule());
      dispatch(requestChores(fullDate));
      list.children.forEach((child) => {
        childIds.push(child.id);
      });
      var store = [];
      childIds.forEach((id) => {
        store.push([
          fetch(url('getChores', id, fullDate) + token)
          .then(function(res) { 
            res = res.json();
            return res;
          }),
          fetch(url('getSchedule', id) + token)
          .then(function(res) {
            if (res.status === 500) {
              return { schedule: {} };
            }
            return res.json();
          })
        ]);
      });
      return Promise.all(store.reduce((a,b) => { return a.concat(b); }, []));
    })
    .then((list) => {
      console.log('here is list', list);
      var chores = [];
      var schedules = [];
      for (var i = 0; i < list.length; i++) {
        if (i % 2 === 0) {
          chores.push(list[i]);
        } else {
          schedules.push(list[i]);
        }
      }
      // console.log('chores', chores);
      // console.log('schedules', schedules);
      dispatch(receiveChores(childIds, chores));
      dispatch(receiveSchedule(childIds, schedules));
    })
    .catch((error) => {
      console.error('You done messed up:', error);
    });
  };
};

export const getAccount = (token, date) => {
  let childIds = [];
  return function(dispatch) {
    dispatch(requestAccount(token));
    return fetch(url('getAccount') + token)
    .then((res) => {
      if (res.status >= 400) {
        throw new Error('Bad res from server.');
      }
      return res.json();
    })
    .then((account) => {
      dispatch(receiveAccount(account));
      dispatch(requestChildren(token));
      return fetch(url('getChildren') + token);
    })
    .then((res) => {
      if (res.status >= 400) {
        throw new Error('Bad res from server.');
      }
      return res.json();
    })
    .then(function(list) {
      dispatch(receiveChildren(list));
      list.children.forEach((child) => {
        childIds.push(child.id);
      });
      dispatch(requestChores(date));
      var store = [];
      childIds.forEach((id) => {
        store.push(
          fetch(url('getChores', id, date) + token)
          .then(function(res) { 
            res = res.json();
            return res;
          })
        );
      });
      return Promise.all(store);
    })
    .then(function(chores) {
      dispatch(receiveChores(childIds, chores));
      dispatch(requestSchedule());
      var store = [];
      childIds.forEach((id) => {
        store.push(
          fetch(url('getSchedule', id) + token)
          .then(function(res) {
            if (res.status === 500) {
              return { schedule: {} };
            }
            return res.json();
          })
        );
      });
      return Promise.all(store);
    })
    .then(function(schedules) {
      console.log('schedules from promises', schedules);
      dispatch(receiveSchedule(childIds, schedules));
    })
    .catch(function(err) {
      console.log('Error fetching account:', err);
    });
  };
};

export const addChild = (token, child) => {
  let childIds = [];
  return function(dispatch) {
    return fetch(url('addChild') + token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(child)
    })
    .then((res) => {
      if (res.status >= 400) {
        throw new Error('Bad res from server.');
      }
      return res;
    })
    .then(() => {
      dispatch(requestAccount(token));
      return fetch(url('getAccount') + token);
    })
    .then((res) => {
      if (res.status >= 400) {
        throw new Error('Bad res from server.');
      }
      return res.json();
    })
    .then((account) => {
      dispatch(receiveAccount(account));
      dispatch(requestChildren(token));
      return fetch(url('getChildren') + token);
    })
    .then((res) => {
      if (res.status >= 400) {
        throw new Error('Bad res from server.');
      }
      return res.json();
    })
    .then(function(list) {
      dispatch(receiveChildren(list));
      list.children.forEach((child) => {
        childIds.push(child.id);
      });
      dispatch(requestChores(fullDate));
      var store = [];
      childIds.forEach((id) => {
        store.push(
          fetch(url('getChores', id, fullDate) + token)
          .then(function(res) { 
            res = res.json();
            return res;
          })
        );
      });
      return Promise.all(store);
    })
    .then(function(chores) {
      dispatch(receiveChores(childIds, chores));
      dispatch(requestSchedule());
      var store = [];
      childIds.forEach((id) => {
        store.push(
          fetch(url('getSchedule', id) + token)
          .then(function(res) {
            if (res.status === 500) {
              return { schedule: {} };
            }
            return res.json();
          })
        );
      });
      return Promise.all(store);
    })
    .then(function(schedules) {
      console.log('schedules from promises', schedules);
      dispatch(receiveSchedule(childIds, schedules));
    })
    .catch(function(err) {
      console.log('Error fetching account:', err);
    });
  };
};
