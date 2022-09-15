export function sum(a, b) {
  return a + b;
}

export function slicePath(path) {
  const index = path.indexOf('/')
  return path.slice(index).replace('/upload', '');
}