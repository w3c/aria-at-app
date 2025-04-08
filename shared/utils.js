/**
 * Sort AtVersions by major version, then by releasedAt date, both in descending
 * order by default.
 *
 * @param {AtVersion[]} atVersions
 * @returns {*[]}
 */
const sortAtVersions = (atVersions = []) => {
  return atVersions.sort((a, b) => {
    // Compare versions as strings in descending order
    const versionCompare = b.name.localeCompare(a.name);
    if (versionCompare !== 0) return versionCompare;

    // Compare by release date
    const dateA = new Date(a.releasedAt);
    const dateB = new Date(b.releasedAt);
    return dateB - dateA;
  });
};

module.exports = {
  sortAtVersions
};
