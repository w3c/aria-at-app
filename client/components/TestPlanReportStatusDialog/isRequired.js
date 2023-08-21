const requiredReports = {
    DRAFT: [
        {
            browser: { name: 'Chrome', id: '2' },
            at: { name: 'JAWS', id: '1' }
        },
        {
            browser: { name: 'Chrome', id: '2' },
            at: { name: 'NVDA', id: '2' }
        },
        {
            browser: { name: 'Safari', id: '3' },
            at: { name: 'VoiceOver for macOS', id: '3' }
        }
    ],
    CANDIDATE: [
        {
            browser: { name: 'Chrome', id: '2' },
            at: { name: 'JAWS', id: '1' }
        },
        {
            browser: { name: 'Chrome', id: '2' },
            at: { name: 'NVDA', id: '2' }
        },
        {
            browser: { name: 'Safari', id: '3' },
            at: { name: 'VoiceOver for macOS', id: '3' }
        },
        {
            browser: { name: 'Firefox', id: '1' },
            at: { name: 'NVDA', id: '2' }
        },
        {
            browser: { name: 'Firefox', id: '1' },
            at: { name: 'JAWS', id: '1' }
        },
        {
            browser: { name: 'Chrome', id: '2' },
            at: { name: 'VoiceOver for macOS', id: '3' }
        }
    ]
};

export const getRequiredReports = testPlanPhase => {
    return requiredReports[testPlanPhase] ?? [];
};
