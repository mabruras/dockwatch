export default function goBack(path) {
  const split = path.split('/');
  split.pop(split.length - 1);

  return split.join('/');
}
