export const sortAtBrowserCombinations = combinations => {
  return combinations.sort((a, b) => {
    if (a.phase < b.phase) return -1;
    if (a.phase > b.phase) return 1;
    return a.at.name.localeCompare(b.at.name);
  });
};

export const filterAtBrowserCombinations = (
  combinations,
  { atId, browserId, phase }
) => {
  return combinations.filter(row => {
    return !(
      row.at.id === atId &&
      row.browser.id === browserId &&
      row.phase === phase
    );
  });
};
