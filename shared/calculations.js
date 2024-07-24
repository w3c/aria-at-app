const calculatePercentage = (value, total) => {
  if (total === 0) {
    throw new Error("Unable to divide. 'total' cannot be 0.");
  }
  return (value / total) * 100;
};

const trimDecimals = (number, decimals = 0) => {
  if (decimals === undefined || decimals <= 0) {
    return Math.floor(number);
  } else {
    let factor = Math.pow(10, decimals);
    return Math.floor(number * factor) / factor;
  }
};

module.exports = {
  calculatePercentage,
  trimDecimals
};
