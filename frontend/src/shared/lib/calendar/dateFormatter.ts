export function formatToUserDate(isoDateString: string): string {
  if (!isoDateString || !isoDateString.includes('-')) return isoDateString;

  const [year, month, day] = isoDateString.split('T')[0].split('-');
  return `${day}.${month}.${year}`;
}
