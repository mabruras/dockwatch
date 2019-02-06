export default function determineInitials(name) {
  const nameSplit = name.split(' ');
  return nameSplit.map(name => name.substr(0, 1).toUpperCase()).join('');
}
