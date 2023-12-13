const convertAssertionPriority = priority => {
    if (priority === 'REQUIRED') return 'MUST';
    if (priority === 'OPTIONAL') return 'SHOULD';
    return priority;
};

module.exports = convertAssertionPriority;
