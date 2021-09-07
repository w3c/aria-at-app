export const evaluateAtNameKey = atName => {
    // Could probably add back support for AT keys from the database level
    if (atName.toLowerCase().includes('voiceover')) return 'voiceover_macos';
    else return atName.toLowerCase();
};

export const buildTestPageUri = (gitSha, directory, testReferencePath) => {
    const BASE_PATH = '/aria-at';
    return `${BASE_PATH}/${gitSha}/build/tests/${directory}/${testReferencePath}`;
};
