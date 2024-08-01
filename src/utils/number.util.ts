export const toFixedNumber = (num: number, places: number): number => {
  return parseFloat(num.toFixed(places));
};
