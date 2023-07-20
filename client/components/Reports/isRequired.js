const requiredReports = {
    draft: [
        {
            browser: { name: 'Chrome' },
            at: { name: 'JAWS' }
        },
        {
            browser: { name: 'Chrome' },
            at: { name: 'NVDA' }
        },
        {
            browser: { name: 'Safari' },
            at: { name: 'VoiceOver for macOS' }
        }
    ],
    recommended: [
        {
            browser: { name: 'Chrome' },
            at: { name: 'JAWS' }
        },
        {
            browser: { name: 'Chrome' },
            at: { name: 'NVDA' }
        },
        {
            browser: { name: 'Safari' },
            at: { name: 'VoiceOver for macOS' }
        },
        {
            browser: { name: 'Firefox' },
            at: { name: 'NVDA' }
        },
        {
            browser: { name: 'Firefox' },
            at: { name: 'JAWS' }
        },
        {
            browser: { name: 'Chrome' },
            at: { name: 'VoiceOver for macOS' }
        }
    ]
};

export const getRequiredReports = testPlanPhase => {
    return requiredReports[testPlanPhase] ?? [];
};
