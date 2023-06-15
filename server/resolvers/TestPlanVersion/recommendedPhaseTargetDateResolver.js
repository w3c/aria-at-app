const recommendedPhaseTargetDateResolver = ({
    candidatePhaseReachedAt,
    recommendedPhaseTargetDate
}) => {
    // Dependent on working mode and role of user as outlined at:
    // https://github.com/w3c/aria-at/wiki/Working-Mode
    if (!candidatePhaseReachedAt) return null;
    if (recommendedPhaseTargetDate) return recommendedPhaseTargetDate;

    const targetDate = new Date(candidatePhaseReachedAt);
    targetDate.setDate(candidatePhaseReachedAt.getDate() + 180);
    return targetDate;
};

module.exports = recommendedPhaseTargetDateResolver;
