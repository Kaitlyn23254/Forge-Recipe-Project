// Converts a Firebase Timestamp object into a 'MM/DD/YYYY' string
export function timestampToString(firebaseTimestamp) {
  const date = new Date(firebaseTimestamp.seconds * 1000);

  // Convert to String
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}
