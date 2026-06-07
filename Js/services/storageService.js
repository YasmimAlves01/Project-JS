function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function get(key) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

function remove(key) {
  localStorage.removeItem(key);
}

export { save, get, remove };
