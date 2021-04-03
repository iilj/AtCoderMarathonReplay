export const formatScore = (score: number): string =>
  String(score).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');

export const formatElapsedSec = (elapsedSec: number): string => {
  const sign = elapsedSec < 0 ? '-' : '';
  if (elapsedSec < 0) elapsedSec *= -1;
  const days = Math.floor(elapsedSec / (3600 * 24));
  const hours = Math.floor((elapsedSec / 3600) % 24);
  const minutes = Math.floor((elapsedSec / 60) % 60);
  const seconds = Math.floor(elapsedSec % 60);
  const pad = (num: number): string => `0${num}`.slice(-2);
  return `${sign}${days > 0 ? `${days}d ` : ''}${
    days > 0 ? pad(hours) : hours
  }:${pad(minutes)}:${pad(seconds)}`;
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

/**
 * returns array [start, start+1, ..., end].
 *
 * @param {number} start start number
 * @param {number} end end number
 * @returns {number[]} array
 */
export const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (v, k) => k + start);
