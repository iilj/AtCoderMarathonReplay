export const dateToString = (
  _date: Date,
  format = 'YYYY-MM-DD hh:mm:ss'
): string => {
  const year = _date.getFullYear().toString();
  const month = `0${1 + _date.getMonth()}`.slice(-2);
  const date = `0${_date.getDate()}`.slice(-2);
  const hours = `0${_date.getHours()}`.slice(-2);
  const minutes = `0${_date.getMinutes()}`.slice(-2);
  const seconds = `0${_date.getSeconds()}`.slice(-2);

  return format
    .replace(/YYYY/g, year)
    .replace(/MM/g, month)
    .replace(/DD/g, date)
    .replace(/hh/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds);
};

export const formatScore = (score: number): string =>
  String(score).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');

export const formatElapsedSec = (elapsedSec: number): string => {
  const days = Math.floor(elapsedSec / (3600 * 24));
  const hours = Math.floor((elapsedSec / 3600) % 24);
  const minutes = Math.floor((elapsedSec / 60) % 60);
  const seconds = Math.floor(elapsedSec % 60);
  const pad = (num: number): string => `0${num}`.slice(-2);
  return `${days > 0 ? `${days}d ` : ''}${hours}:${pad(minutes)}:${pad(
    seconds
  )}`;
};

/**
 * returns suffix string of order, e.g. "st" of "1st".
 *
 * @param {number} i number representing order
 * @returns suffix string of order
 */
export const ordinalSuffixOf = (i: number): 'st' | 'nd' | 'rd' | 'th' => {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
};
