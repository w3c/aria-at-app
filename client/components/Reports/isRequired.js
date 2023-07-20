const requiredReports = {
    recommended: [
        {
            browser: 'Chrome',
            at: 'JAWS'
        },
        {
            browser: 'Chrome',
            at: 'NVDA'
        },
        {
            browser: 'Safari',
            at: 'VoiceOver for macOS'
        }
    ],
    draft: [
        {
            browser: 'Chrome',
            at: 'JAWS'
        },
        {
            browser: 'Chrome',
            at: 'NVDA'
        },
        {
            browser: 'Safari',
            at: 'VoiceOver for macOS'
        },
        {
            browser: 'Firefox',
            at: 'NVDA'
        },
        {
            browser: 'Firefox',
            at: 'JAWS'
        },
        {
            browser: 'Chrome',
            at: 'VoiceOver for macOS'
        }
    ]
};

export const getRequiredReports = testPlanPhase => {
    return requiredReports[testPlanPhase] ?? [];
};
