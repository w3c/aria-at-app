const phaseTargetDateResolver = ({ phaseChangeUpdate }) => {
    // Dependent on working mode and role of user as outlined at:
    // https://github.com/w3c/aria-at/wiki/Working-Mode
    if (!phaseChangeUpdate) return null;

    const phaseTargetDate = new Date(phaseChangeUpdate);
    phaseTargetDate.setDate(phaseChangeUpdate.getDate() + 180);
    return phaseTargetDate;
};

module.exports = phaseTargetDateResolver;
