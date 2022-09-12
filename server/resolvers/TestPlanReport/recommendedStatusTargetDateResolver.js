const recommendedStatusTargetDateResolver = ({
    candidateStatusReachedAt,
    recommendedStatusTargetDate
}) => {
    // Dependent on working mode and role of user as outlined at:
    // https://github.com/w3c/aria-at/wiki/Working-Mode
    if (!candidateStatusReachedAt) return null;
    if (recommendedStatusTargetDate) return recommendedStatusTargetDate;

    const targetDate = new Date(candidateStatusReachedAt);
    targetDate.setDate(candidateStatusReachedAt.getDate() + 180);
    return targetDate;
};

module.exports = recommendedStatusTargetDateResolver;
