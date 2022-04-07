/**
 * Get element from array by property
 *
 * @param array
 * @param mixed
 * @param string
 * @return mixed
 */
export const ls =
  typeof localStorage !== "undefined" && localStorage
    ? localStorage
    : {
        _data: {},
        setItem: (id, val) => (ls._data[id] = String(val)),
        getItem: id => (ls._data.hasOwnProperty(id) ? ls._data[id] : undefined),
        removeItem: id => delete ls._data[id],
        clear: () => (ls._data = {})
      };
