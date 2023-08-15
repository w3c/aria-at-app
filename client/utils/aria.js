export const evaluateAtNameKey = atName => {
    // Could probably add back support for AT keys from the database level
    if (atName.toLowerCase().includes('voiceover')) return 'voiceover_macos';
    else return atName.toLowerCase();
};

export const buildTestPageUrl = (gitSha, directory, testReferencePath) => {
    const BASE_PATH = '/aria-at';
    return `${BASE_PATH}/${gitSha}/build/tests/${directory}/${testReferencePath}`;
};

export const derivePhaseName = name => {
    switch (name) {
        case 'RD':
            return 'R&D';
        case 'DRAFT':
            return 'Draft';
        case 'CANDIDATE':
            return 'Candidate';
        case 'RECOMMENDED':
            return 'Recommended';
    }
};
