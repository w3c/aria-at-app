export default (
    meQuery,
    dataManagementPageQuery,
    testPlanReportStatusDialogQuery
) => [
    {
        request: {
            query: meQuery
        },
        result: {
            data: {
                me: {
                    id: '1',
                    username: 'foo-bar',
                    roles: ['ADMIN', 'TESTER']
                }
            }
        }
    },
    {
        request: {
            query: dataManagementPageQuery
        },
        result: {
            data: {
                me: {
                    id: '1',
                    username: 'foo-bar',
                    roles: ['ADMIN', 'TESTER']
                },
                ats: [
                    {
                        id: '1',
                        key: 'jaws',
                        name: 'JAWS',
                        atVersions: [
                            {
                                id: '1',
                                name: '2021.2111.13',
                                releasedAt: '2021-11-01T04:00:00.000Z'
                            }
                        ],
                        browsers: [
                            {
                                id: '2',
                                name: 'Chrome'
                            },
                            {
                                id: '1',
                                name: 'Firefox'
                            }
                        ],
                        candidateBrowsers: [{ id: '2' }],
                        recommendedBrowsers: [{ id: '1' }, { id: '2' }]
                    },
                    {
                        id: '2',
                        key: 'nvda',
                        name: 'NVDA',
                        atVersions: [
                            {
                                id: '2',
                                name: '2020.4',
                                releasedAt: '2021-02-19T05:00:00.000Z'
                            }
                        ],
                        browsers: [
                            {
                                id: '2',
                                name: 'Chrome'
                            },
                            {
                                id: '1',
                                name: 'Firefox'
                            }
                        ],
                        candidateBrowsers: [{ id: '2' }],
                        recommendedBrowsers: [{ id: '1' }, { id: '2' }]
                    },
                    {
                        id: '3',
                        key: 'voiceover_macos',
                        name: 'VoiceOver for macOS',
                        atVersions: [
                            {
                                id: '3',
                                name: '11.6 (20G165)',
                                releasedAt: '2019-09-01T04:00:00.000Z'
                            }
                        ],
                        browsers: [
                            {
                                id: '2',
                                name: 'Chrome'
                            },
                            {
                                id: '1',
                                name: 'Firefox'
                            },
                            {
                                id: '3',
                                name: 'Safari'
                            }
                        ],
                        candidateBrowsers: [{ id: '3' }],
                        recommendedBrowsers: [{ id: '2' }, { id: '3' }]
                    }
                ],
                testPlans: [
                    {
                        id: '27',
                        directory: 'radiogroup-aria-activedescendant',
                        title: 'Radio Group Example Using aria-activedescendant'
                    },
                    {
                        id: '28',
                        directory: 'radiogroup-roving-tabindex',
                        title: 'Radio Group Example Using Roving tabindex'
                    },
                    {
                        id: '31',
                        directory: 'slider-multithumb',
                        title: 'Horizontal Multi-Thumb Slider'
                    },
                    {
                        id: '16',
                        directory: 'link-css',
                        title: 'Link Example 3 (CSS :before content property on a span element)'
                    },
                    {
                        id: '17',
                        directory: 'link-img-alt',
                        title: 'Link Example 2 (img element with alt attribute)'
                    },
                    {
                        id: '1',
                        directory: 'alert',
                        title: 'Alert Example'
                    },
                    {
                        id: '13',
                        directory: 'disclosure-navigation',
                        title: 'Disclosure Navigation Menu Example'
                    },
                    {
                        id: '5',
                        directory: 'checkbox-tri-state',
                        title: 'Checkbox Example (Mixed-State)'
                    },
                    {
                        id: '3',
                        directory: 'breadcrumb',
                        title: 'Breadcrumb Example'
                    },
                    {
                        id: '19',
                        directory: 'main',
                        title: 'Main Landmark'
                    },
                    {
                        id: '24',
                        directory: 'meter',
                        title: 'Meter'
                    },
                    {
                        id: '32',
                        directory: 'switch',
                        title: 'Switch Example'
                    },
                    {
                        id: '26',
                        directory: 'modal-dialog',
                        title: 'Modal Dialog Example'
                    },
                    {
                        id: '22',
                        directory: 'menu-button-navigation',
                        title: 'Navigation Menu Button'
                    },
                    {
                        id: '34',
                        directory: 'toggle-button',
                        title: 'Toggle Button'
                    },
                    {
                        id: '18',
                        directory: 'link-span-text',
                        title: 'Link Example 1 (span element with text content)'
                    },
                    {
                        id: '8',
                        directory: 'command-button',
                        title: 'Command Button Example'
                    },
                    {
                        id: '15',
                        directory: 'horizontal-slider',
                        title: 'Color Viewer Slider'
                    },
                    {
                        id: '6',
                        directory: 'combobox-autocomplete-both-updated',
                        title: 'Combobox with Both List and Inline Autocomplete Example'
                    },
                    {
                        id: '7',
                        directory: 'combobox-select-only',
                        title: 'Select Only Combobox Example'
                    },
                    {
                        id: '4',
                        directory: 'checkbox',
                        title: 'Checkbox Example (Two State)'
                    },
                    {
                        id: '9',
                        directory: 'complementary',
                        title: 'Complementary Landmark'
                    },
                    {
                        id: '10',
                        directory: 'contentinfo',
                        title: 'Contentinfo Landmark'
                    },
                    {
                        id: '11',
                        directory: 'datepicker-spin-button',
                        title: 'Date Picker Spin Button Example'
                    },
                    {
                        id: '12',
                        directory: 'disclosure-faq',
                        title: 'Disclosure of Answers to Frequently Asked Questions Example'
                    },
                    {
                        id: '14',
                        directory: 'form',
                        title: 'Form Landmark'
                    },
                    {
                        id: '20',
                        directory: 'menu-button-actions',
                        title: 'Action Menu Button Example Using element.focus()'
                    },
                    {
                        id: '21',
                        directory: 'menu-button-actions-active-descendant',
                        title: 'Action Menu Button Example Using aria-activedescendant'
                    },
                    {
                        id: '23',
                        directory: 'menubar-editor',
                        title: 'Editor Menubar Example'
                    },
                    {
                        id: '25',
                        directory: 'minimal-data-grid',
                        title: 'Data Grid Example 1: Minimal Data Grid'
                    },
                    {
                        id: '29',
                        directory: 'rating-slider',
                        title: 'Rating Slider'
                    },
                    {
                        id: '30',
                        directory: 'seek-slider',
                        title: 'Media Seek Slider'
                    },
                    {
                        id: '33',
                        directory: 'tabs-manual-activation',
                        title: 'Tabs with Manual Activation'
                    },
                    {
                        id: '35',
                        directory: 'vertical-temperature-slider',
                        title: 'Vertical Temperature Slider'
                    },
                    {
                        id: '2',
                        directory: 'banner',
                        title: 'Banner Landmark'
                    }
                ],
                deprecatedTestPlanVersions: [],
                testPlanVersions: [
                    {
                        id: '28',
                        title: 'Radio Group Example Using Roving tabindex',
                        phase: 'RD',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        updatedAt: '2023-04-10T18:22:22.000Z',
                        versionString: 'V23.04.10',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-roving-tabindex'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '27',
                        title: 'Radio Group Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        updatedAt: '2023-04-10T18:22:22.000Z',
                        versionString: 'V23.04.10',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '31',
                        title: 'Horizontal Multi-Thumb Slider',
                        phase: 'RD',
                        gitSha: 'b5fe3efd569518e449ef9a0978b0dec1f2a08bd6',
                        gitMessage:
                            'Create tests for APG design pattern example: Horizontal Multi-Thumb Slider (#511)',
                        updatedAt: '2023-03-20T21:24:41.000Z',
                        versionString: 'V23.03.20',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'slider-multithumb'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '16',
                        title: 'Link Example 3 (CSS :before content property on a span element)',
                        phase: 'RD',
                        gitSha: '7a8454bca6de980199868101431817cea03cce35',
                        gitMessage:
                            'Create tests for APG design pattern example: Link Example 3 (CSS :before content property on a span element) (#518)',
                        updatedAt: '2023-03-13T22:10:13.000Z',
                        versionString: 'V23.03.13',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'link-css'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '17',
                        title: 'Link Example 2 (img element with alt attribute)',
                        phase: 'RD',
                        gitSha: 'dc637636cff74b51f5c468ff3b81bd1f38aefbb2',
                        gitMessage:
                            'Create tests for APG design pattern example: Link Example 2 (img element with alt attribute) (#516)',
                        updatedAt: '2023-03-13T19:51:48.000Z',
                        versionString: 'V23.03.13',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'link-img-alt'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '1',
                        title: 'Alert Example',
                        phase: 'DRAFT',
                        gitSha: '0928bcf530efcf4faa677285439701537674e014',
                        gitMessage:
                            'Alert and Radiogroup/activedescendent updates (#865)',
                        updatedAt: '2022-12-08T21:47:42.000Z',
                        versionString: 'V22.12.08',
                        draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'alert'
                        },
                        testPlanReports: [
                            {
                                id: '7',
                                metrics: {},
                                markedFinalAt: null,
                                isFinal: false,
                                at: {
                                    id: '3',
                                    key: 'voiceover_macos',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '1',
                                    key: 'firefox',
                                    name: 'Firefox'
                                },
                                issues: [],
                                draftTestPlanRuns: []
                            }
                        ],
                        metadata: {}
                    },
                    {
                        id: '13',
                        title: 'Disclosure Navigation Menu Example',
                        phase: 'RD',
                        gitSha: '179ba0f438aaa5781b3ec8a4033d6bf9f757360b',
                        gitMessage:
                            'Delete up arrow command for VoiceOver when navigating backwards to a disclosure button (#845)',
                        updatedAt: '2022-10-31T19:29:17.000Z',
                        versionString: 'V22.10.31',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-navigation'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '3',
                        title: 'Breadcrumb Example',
                        phase: 'RD',
                        gitSha: '1aa3b74d24d340362e9f511eae33788d55487d12',
                        gitMessage:
                            'Add down arrow command to the Navigate forwards out of the Breadcrumb navigation landmark task for JAWS (#803)',
                        updatedAt: '2022-08-10T18:44:16.000Z',
                        versionString: 'V22.08.10',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '19',
                        title: 'Main Landmark',
                        phase: 'RD',
                        gitSha: 'c87a66ea13a2b6fac6d79fe1fb0b7a2f721dcd22',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Main landmark (#707)',
                        updatedAt: '2022-08-05T17:46:37.000Z',
                        versionString: 'V22.08.05',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'main'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '24',
                        title: 'Meter',
                        phase: 'RD',
                        gitSha: '32d2d9db48becfc008fc566b569ac1563576ceb9',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Meter (#692)',
                        updatedAt: '2022-08-05T17:02:59.000Z',
                        versionString: 'V22.08.05',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'meter'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '32',
                        title: 'Switch Example',
                        phase: 'RD',
                        gitSha: '9d0e4e3d1040d64d9db69647e615c4ec0be723c2',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Switch (#691)',
                        updatedAt: '2022-08-05T16:13:44.000Z',
                        versionString: 'V22.08.05',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'switch'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '22',
                        title: 'Navigation Menu Button',
                        phase: 'RD',
                        gitSha: 'ecf05f484292189789f4db8b1ec41b19db38e567',
                        gitMessage:
                            'Tasks 4, 5 and 6: corrected link name "Navigate backwards from here" (#734)',
                        updatedAt: '2022-05-26T16:14:17.000Z',
                        versionString: 'V22.05.26',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-navigation'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '34',
                        title: 'Toggle Button',
                        phase: 'DRAFT',
                        gitSha: '022340081280b8cafb8ae0716a5b67e9ab942ef4',
                        gitMessage:
                            'Delete duplicated assertion for operating a not pressed togle button (VoiceOver) (#716)',
                        updatedAt: '2022-05-18T20:51:40.000Z',
                        versionString: 'V22.05.18',
                        draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'toggle-button'
                        },
                        testPlanReports: [
                            {
                                id: '1',
                                metrics: {
                                    testsCount: 16,
                                    supportLevel: 'FAILING',
                                    conflictsCount: 0,
                                    supportPercent: 93,
                                    testsFailedCount: 14,
                                    testsPassedCount: 2,
                                    shouldFormatted: false,
                                    mustFormatted: '28 of 30 passed',
                                    shouldAssertionsCount: 0,
                                    mustAssertionsCount: 30,
                                    unexpectedBehaviorCount: 1,
                                    unexpectedBehaviorsFormatted: '1 found',
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 0,
                                    mustAssertionsFailedCount: 2,
                                    mustAssertionsPassedCount: 28
                                },
                                markedFinalAt: null,
                                isFinal: false,
                                at: {
                                    id: '1',
                                    key: 'jaws',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    key: 'chrome',
                                    name: 'Chrome'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'esmeralda-baggins'
                                        },
                                        testPlanReport: {
                                            id: '1'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'OWY5NeyIyIjoiMzQifQTRmOD'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:07.154Z'
                                            },
                                            {
                                                test: {
                                                    id: 'NGFjMeyIyIjoiMzQifQjQxY2'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt: null
                                            },
                                            {
                                                test: {
                                                    id: 'NTAwOeyIyIjoiMzQifQWI5YT'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt: null
                                            },
                                            {
                                                test: {
                                                    id: 'YThjMeyIyIjoiMzQifQzIyYT'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt: null
                                            },
                                            {
                                                test: {
                                                    id: 'YTgxMeyIyIjoiMzQifQzExOW'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:07.381Z'
                                            },
                                            {
                                                test: {
                                                    id: 'NGMwNeyIyIjoiMzQifQ2IwN2'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:07.464Z'
                                            },
                                            {
                                                test: {
                                                    id: 'YzQxNeyIyIjoiMzQifQjY5ND'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:07.537Z'
                                            },
                                            {
                                                test: {
                                                    id: 'MjgwNeyIyIjoiMzQifQzk3YT'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:07.610Z'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        metadata: {}
                    },
                    {
                        id: '8',
                        title: 'Command Button Example',
                        phase: 'RD',
                        gitSha: '0c466eec96c8cafc9961232c85e14758c4589525',
                        gitMessage:
                            'Fix navigation link positions in three test plans: link, command button and toggle button (#709)',
                        updatedAt: '2022-05-04T21:33:31.000Z',
                        versionString: 'V22.05.04',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'command-button'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '18',
                        title: 'Link Example 1 (span element with text content)',
                        phase: 'RD',
                        gitSha: '0c466eec96c8cafc9961232c85e14758c4589525',
                        gitMessage:
                            'Fix navigation link positions in three test plans: link, command button and toggle button (#709)',
                        updatedAt: '2022-05-04T21:33:31.000Z',
                        versionString: 'V22.05.04',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'link-span-text'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '15',
                        title: 'Color Viewer Slider',
                        phase: 'RD',
                        gitSha: '1c6ef2fbef5fc056c622c802bebedaa14f2c8d40',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Color Viewer Slider (#686)',
                        updatedAt: '2022-04-14T18:06:40.000Z',
                        versionString: 'V22.04.14',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'horizontal-slider'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '6',
                        title: 'Combobox with Both List and Inline Autocomplete Example',
                        phase: 'RD',
                        gitSha: '6b2cbcbdbd5f6867cd3c9e96362817c353335187',
                        gitMessage: "typo: double word 'the' (#595)",
                        updatedAt: '2022-03-29T16:02:56.000Z',
                        versionString: 'V22.03.29',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-autocomplete-both-updated'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '21',
                        title: 'Action Menu Button Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-actions-active-descendant'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '20',
                        title: 'Action Menu Button Example Using element.focus()',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-actions'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '2',
                        title: 'Banner Landmark',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'banner'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '4',
                        title: 'Checkbox Example (Two State)',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'checkbox'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '9',
                        title: 'Complementary Landmark',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'complementary'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '10',
                        title: 'Contentinfo Landmark',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'contentinfo'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '25',
                        title: 'Data Grid Example 1: Minimal Data Grid',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'minimal-data-grid'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '11',
                        title: 'Date Picker Spin Button Example',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'datepicker-spin-button'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '12',
                        title: 'Disclosure of Answers to Frequently Asked Questions Example',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-faq'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '23',
                        title: 'Editor Menubar Example',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menubar-editor'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '14',
                        title: 'Form Landmark',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'form'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '30',
                        title: 'Media Seek Slider',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'seek-slider'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '29',
                        title: 'Rating Slider',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'rating-slider'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '7',
                        title: 'Select Only Combobox Example',
                        phase: 'DRAFT',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-select-only'
                        },
                        testPlanReports: [
                            {
                                id: '2',
                                metrics: {
                                    testsCount: 21,
                                    supportLevel: 'FAILING',
                                    conflictsCount: 5,
                                    supportPercent: 96,
                                    testsFailedCount: 16,
                                    testsPassedCount: 5,
                                    shouldFormatted: '3 of 3 passed',
                                    mustFormatted: '48 of 50 passed',
                                    shouldAssertionsCount: 3,
                                    mustAssertionsCount: 50,
                                    unexpectedBehaviorCount: 3,
                                    unexpectedBehaviorsFormatted: '3 found',
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 3,
                                    mustAssertionsFailedCount: 2,
                                    mustAssertionsPassedCount: 48
                                },
                                markedFinalAt: null,
                                isFinal: false,
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'tom-proudfeet'
                                        },
                                        testPlanReport: {
                                            id: '2'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'Nzg5NeyIyIjoiNyJ9zNjZj'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:08.240Z'
                                            },
                                            {
                                                test: {
                                                    id: 'MmY0YeyIyIjoiNyJ9jRkZD'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:08.332Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ZjUwNeyIyIjoiNyJ9mE2ZT'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:08.412Z'
                                            },
                                            {
                                                test: {
                                                    id: 'MDNiMeyIyIjoiNyJ9Dk1MT'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:08.501Z'
                                            },
                                            {
                                                test: {
                                                    id: 'MjRmNeyIyIjoiNyJ92MyMT'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:08.593Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ZmVlMeyIyIjoiNyJ9mUyYj'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt: null
                                            },
                                            {
                                                test: {
                                                    id: 'YWFiNeyIyIjoiNyJ9zE2Zj'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:08.811Z'
                                            },
                                            {
                                                test: {
                                                    id: 'YjZkYeyIyIjoiNyJ9WIxZm'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:08.902Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ZmIzMeyIyIjoiNyJ9TQ1NW'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:08.996Z'
                                            }
                                        ]
                                    },
                                    {
                                        tester: {
                                            username: 'esmeralda-baggins'
                                        },
                                        testPlanReport: {
                                            id: '2'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'Nzg5NeyIyIjoiNyJ9zNjZj'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:07.718Z'
                                            },
                                            {
                                                test: {
                                                    id: 'MmY0YeyIyIjoiNyJ9jRkZD'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:07.813Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ZjUwNeyIyIjoiNyJ9mE2ZT'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:07.914Z'
                                            },
                                            {
                                                test: {
                                                    id: 'MDNiMeyIyIjoiNyJ9Dk1MT'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:07.988Z'
                                            },
                                            {
                                                test: {
                                                    id: 'MjRmNeyIyIjoiNyJ92MyMT'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:08.074Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ZmVlMeyIyIjoiNyJ9mUyYj'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt: null
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        metadata: {}
                    },
                    {
                        id: '33',
                        title: 'Tabs with Manual Activation',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'tabs-manual-activation'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '35',
                        title: 'Vertical Temperature Slider',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        versionString: 'V22.03.17',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'vertical-temperature-slider'
                        },
                        testPlanReports: [],
                        metadata: {}
                    },
                    {
                        id: '5',
                        title: 'Checkbox Example (Mixed-State)',
                        phase: 'RECOMMENDED',
                        gitSha: 'b3d0576a2901ea7f100f49a994b64edbecf81cff',
                        gitMessage:
                            'Modify VoiceOver commands for task 7 (#842)',
                        updatedAt: '2022-10-24T21:33:12.000Z',
                        versionString: 'V22.10.24',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: '2022-07-06T00:00:00.000Z',
                        recommendedPhaseTargetDate: '2023-01-02T00:00:00.000Z',
                        recommendedPhaseReachedAt: '2023-01-03T00:00:00.000Z',
                        testPlan: {
                            directory: 'checkbox-tri-state'
                        },
                        testPlanReports: [
                            {
                                id: '6',
                                metrics: {
                                    testsCount: 7,
                                    supportLevel: 'FAILING',
                                    conflictsCount: 0,
                                    supportPercent: 96,
                                    testsFailedCount: 3,
                                    testsPassedCount: 4,
                                    shouldFormatted: '4 of 4 passed',
                                    mustFormatted: '44 of 46 passed',
                                    shouldAssertionsCount: 4,
                                    mustAssertionsCount: 46,
                                    unexpectedBehaviorCount: 0,
                                    unexpectedBehaviorsFormatted: false,
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 4,
                                    mustAssertionsFailedCount: 2,
                                    mustAssertionsPassedCount: 44
                                },
                                markedFinalAt: '2022-07-06T00:00:00.000Z',
                                isFinal: true,
                                at: {
                                    id: '3',
                                    key: 'voiceover_macos',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '3',
                                    key: 'safari',
                                    name: 'Safari'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'tom-proudfeet'
                                        },
                                        testPlanReport: {
                                            id: '6'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'YTE3NeyIyIjoiNSJ9WJlMj'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.341Z'
                                            },
                                            {
                                                test: {
                                                    id: 'YWJiOeyIyIjoiNSJ9GQ5Zm'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.405Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ZGFlYeyIyIjoiNSJ9TJlMW'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.474Z'
                                            },
                                            {
                                                test: {
                                                    id: 'YjI2MeyIyIjoiNSJ9WE1OT'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.537Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ZjAwZeyIyIjoiNSJ9TZmZj'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.605Z'
                                            },
                                            {
                                                test: {
                                                    id: 'MGRjZeyIyIjoiNSJ9WNiZD'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.670Z'
                                            },
                                            {
                                                test: {
                                                    id: 'OTZmYeyIyIjoiNSJ9TU5Ym'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.739Z'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '12',
                                metrics: {
                                    testsCount: 14,
                                    supportLevel: 'FULL',
                                    conflictsCount: 0,
                                    supportPercent: 100,
                                    testsFailedCount: 12,
                                    testsPassedCount: 2,
                                    shouldFormatted: false,
                                    mustFormatted: '25 of 25 passed',
                                    shouldAssertionsCount: 0,
                                    mustAssertionsCount: 25,
                                    unexpectedBehaviorCount: 0,
                                    unexpectedBehaviorsFormatted: false,
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 0,
                                    mustAssertionsFailedCount: 0,
                                    mustAssertionsPassedCount: 25
                                },
                                markedFinalAt: null,
                                isFinal: false,
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'esmeralda-baggins'
                                        },
                                        testPlanReport: {
                                            id: '12'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'MTVlZeyIyIjoiNSJ9DUzMz'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.764Z'
                                            },
                                            {
                                                test: {
                                                    id: 'OThhMeyIyIjoiNSJ9WMxM2'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.828Z'
                                            },
                                            {
                                                test: {
                                                    id: 'YWNhNeyIyIjoiNSJ9TliN2'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.892Z'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '13',
                                metrics: {
                                    testsCount: 14,
                                    supportLevel: 'FULL',
                                    conflictsCount: 0,
                                    supportPercent: 100,
                                    testsFailedCount: 12,
                                    testsPassedCount: 2,
                                    shouldFormatted: false,
                                    mustFormatted: '25 of 25 passed',
                                    shouldAssertionsCount: 0,
                                    mustAssertionsCount: 25,
                                    unexpectedBehaviorCount: 0,
                                    unexpectedBehaviorsFormatted: false,
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 0,
                                    mustAssertionsFailedCount: 0,
                                    mustAssertionsPassedCount: 25
                                },
                                markedFinalAt: null,
                                isFinal: false,
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'esmeralda-baggins'
                                        },
                                        testPlanReport: {
                                            id: '13'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'MTVlZeyIyIjoiNSJ9DUzMz'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.955Z'
                                            },
                                            {
                                                test: {
                                                    id: 'OThhMeyIyIjoiNSJ9WMxM2'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:12.017Z'
                                            },
                                            {
                                                test: {
                                                    id: 'YWNhNeyIyIjoiNSJ9TliN2'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:12.083Z'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        metadata: {}
                    },
                    {
                        id: '26',
                        title: 'Modal Dialog Example',
                        phase: 'CANDIDATE',
                        gitSha: 'd0e16b42179de6f6c070da2310e99de837c71215',
                        gitMessage:
                            'Delete down arrow command for navigating to the beginning of a dialog with JAWS and add the ESC command to exit forms or focus mode (#759)',
                        updatedAt: '2022-06-22T17:56:16.000Z',
                        versionString: 'V22.06.22',
                        draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
                        candidatePhaseReachedAt: '2022-07-06T00:00:00.000Z',
                        recommendedPhaseTargetDate: '2023-01-02T00:00:00.000Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'modal-dialog'
                        },
                        testPlanReports: [
                            {
                                id: '10',
                                metrics: {
                                    testsCount: 11,
                                    supportLevel: 'FULL',
                                    conflictsCount: 0,
                                    supportPercent: 100,
                                    testsFailedCount: 9,
                                    testsPassedCount: 2,
                                    shouldFormatted: false,
                                    mustFormatted: '14 of 14 passed',
                                    shouldAssertionsCount: 0,
                                    mustAssertionsCount: 14,
                                    unexpectedBehaviorCount: 0,
                                    unexpectedBehaviorsFormatted: false,
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 0,
                                    mustAssertionsFailedCount: 0,
                                    mustAssertionsPassedCount: 14
                                },
                                markedFinalAt: null,
                                isFinal: false,
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'esmeralda-baggins'
                                        },
                                        testPlanReport: {
                                            id: '10'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'MzlmYeyIyIjoiMjYifQzIxY2'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.295Z'
                                            },
                                            {
                                                test: {
                                                    id: 'N2FkZeyIyIjoiMjYifQDQ5NT'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.369Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ZDJkYeyIyIjoiMjYifQzRkYj'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.450Z'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '9',
                                metrics: {
                                    testsCount: 18,
                                    supportLevel: 'FULL',
                                    conflictsCount: 0,
                                    supportPercent: 100,
                                    testsFailedCount: 16,
                                    testsPassedCount: 2,
                                    shouldFormatted: false,
                                    mustFormatted: '16 of 16 passed',
                                    shouldAssertionsCount: 0,
                                    mustAssertionsCount: 16,
                                    unexpectedBehaviorCount: 0,
                                    unexpectedBehaviorsFormatted: false,
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 0,
                                    mustAssertionsFailedCount: 0,
                                    mustAssertionsPassedCount: 16
                                },
                                markedFinalAt: null,
                                isFinal: false,
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'esmeralda-baggins'
                                        },
                                        testPlanReport: {
                                            id: '9'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'MThhNeyIyIjoiMjYifQmEyMj'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.059Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ODY5MeyIyIjoiMjYifQzhmNW'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.137Z'
                                            },
                                            {
                                                test: {
                                                    id: 'NWVkNeyIyIjoiMjYifQTZkOT'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.218Z'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '3',
                                metrics: {
                                    testsCount: 18,
                                    supportLevel: 'FAILING',
                                    conflictsCount: 0,
                                    supportPercent: 88,
                                    testsFailedCount: 16,
                                    testsPassedCount: 2,
                                    shouldFormatted: false,
                                    mustFormatted: '14 of 16 passed',
                                    shouldAssertionsCount: 0,
                                    mustAssertionsCount: 16,
                                    unexpectedBehaviorCount: 1,
                                    unexpectedBehaviorsFormatted: '1 found',
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 0,
                                    mustAssertionsFailedCount: 2,
                                    mustAssertionsPassedCount: 14
                                },
                                markedFinalAt: '2022-07-06T00:00:00.000Z',
                                isFinal: true,
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'esmeralda-baggins'
                                        },
                                        testPlanReport: {
                                            id: '3'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'MThhNeyIyIjoiMjYifQmEyMj'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.074Z'
                                            },
                                            {
                                                test: {
                                                    id: 'NWVkNeyIyIjoiMjYifQTZkOT'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.134Z'
                                            },
                                            {
                                                test: {
                                                    id: 'NWM4NeyIyIjoiMjYifQDEwM2'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.202Z'
                                            },
                                            {
                                                test: {
                                                    id: 'NGFiZeyIyIjoiMjYifQWZiYW'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.268Z'
                                            },
                                            {
                                                test: {
                                                    id: 'MzQzYeyIyIjoiMjYifQzU5Zm'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.336Z'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '11',
                                metrics: {
                                    testsCount: 11,
                                    supportLevel: 'FULL',
                                    conflictsCount: 0,
                                    supportPercent: 100,
                                    testsFailedCount: 9,
                                    testsPassedCount: 2,
                                    shouldFormatted: false,
                                    mustFormatted: '14 of 14 passed',
                                    shouldAssertionsCount: 0,
                                    mustAssertionsCount: 14,
                                    unexpectedBehaviorCount: 0,
                                    unexpectedBehaviorsFormatted: false,
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 0,
                                    mustAssertionsFailedCount: 0,
                                    mustAssertionsPassedCount: 14
                                },
                                markedFinalAt: null,
                                isFinal: false,
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'esmeralda-baggins'
                                        },
                                        testPlanReport: {
                                            id: '11'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'MzlmYeyIyIjoiMjYifQzIxY2'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.532Z'
                                            },
                                            {
                                                test: {
                                                    id: 'N2FkZeyIyIjoiMjYifQDQ5NT'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.611Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ZDJkYeyIyIjoiMjYifQzRkYj'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:11.696Z'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '4',
                                metrics: {
                                    testsCount: 18,
                                    supportLevel: 'FAILING',
                                    conflictsCount: 0,
                                    supportPercent: 91,
                                    testsFailedCount: 14,
                                    testsPassedCount: 4,
                                    shouldFormatted: false,
                                    mustFormatted: '20 of 22 passed',
                                    shouldAssertionsCount: 0,
                                    mustAssertionsCount: 22,
                                    unexpectedBehaviorCount: 1,
                                    unexpectedBehaviorsFormatted: '1 found',
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 0,
                                    mustAssertionsFailedCount: 2,
                                    mustAssertionsPassedCount: 20
                                },
                                markedFinalAt: '2022-07-06T00:00:00.000Z',
                                isFinal: true,
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'esmeralda-baggins'
                                        },
                                        testPlanReport: {
                                            id: '4'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'MThhNeyIyIjoiMjYifQmEyMj'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.409Z'
                                            },
                                            {
                                                test: {
                                                    id: 'NWVkNeyIyIjoiMjYifQTZkOT'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.478Z'
                                            },
                                            {
                                                test: {
                                                    id: 'NWM4NeyIyIjoiMjYifQDEwM2'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.551Z'
                                            },
                                            {
                                                test: {
                                                    id: 'NGFiZeyIyIjoiMjYifQWZiYW'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.629Z'
                                            },
                                            {
                                                test: {
                                                    id: 'MzQzYeyIyIjoiMjYifQzU5Zm'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.704Z'
                                            },
                                            {
                                                test: {
                                                    id: 'MmI1MeyIyIjoiMjYifQmU3Yz'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.777Z'
                                            },
                                            {
                                                test: {
                                                    id: 'YmRmYeyIyIjoiMjYifQjEyMT'
                                                },
                                                atVersion: {
                                                    id: '2',
                                                    name: '2020.4'
                                                },
                                                browserVersion: {
                                                    id: '2',
                                                    name: '99.0.4844.84'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.852Z'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '5',
                                metrics: {
                                    testsCount: 11,
                                    supportLevel: 'FAILING',
                                    conflictsCount: 0,
                                    supportPercent: 92,
                                    testsFailedCount: 8,
                                    testsPassedCount: 3,
                                    shouldFormatted: false,
                                    mustFormatted: '23 of 25 passed',
                                    shouldAssertionsCount: 0,
                                    mustAssertionsCount: 25,
                                    unexpectedBehaviorCount: 1,
                                    unexpectedBehaviorsFormatted: '1 found',
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 0,
                                    mustAssertionsFailedCount: 2,
                                    mustAssertionsPassedCount: 23
                                },
                                markedFinalAt: '2022-07-06T00:00:00.000Z',
                                isFinal: true,
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '3',
                                    name: 'Safari'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'esmeralda-baggins'
                                        },
                                        testPlanReport: {
                                            id: '5'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'MzlmYeyIyIjoiMjYifQzIxY2'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.923Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ZDJkYeyIyIjoiMjYifQzRkYj'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:09.991Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ZmQyNeyIyIjoiMjYifQ2M2ND'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.059Z'
                                            },
                                            {
                                                test: {
                                                    id: 'OGE3YeyIyIjoiMjYifQjU1ND'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.129Z'
                                            },
                                            {
                                                test: {
                                                    id: 'YWI3OeyIyIjoiMjYifQWJlNW'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.198Z'
                                            },
                                            {
                                                test: {
                                                    id: 'M2RiOeyIyIjoiMjYifQGY1Nj'
                                                },
                                                atVersion: {
                                                    id: '3',
                                                    name: '11.6 (20G165)'
                                                },
                                                browserVersion: {
                                                    id: '3',
                                                    name: '14.1.2'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.272Z'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: '8',
                                metrics: {
                                    testsCount: 18,
                                    supportLevel: 'FULL',
                                    conflictsCount: 0,
                                    supportPercent: 100,
                                    testsFailedCount: 16,
                                    testsPassedCount: 2,
                                    shouldFormatted: false,
                                    mustFormatted: '16 of 16 passed',
                                    shouldAssertionsCount: 0,
                                    mustAssertionsCount: 16,
                                    unexpectedBehaviorCount: 0,
                                    unexpectedBehaviorsFormatted: false,
                                    shouldAssertionsFailedCount: 0,
                                    shouldAssertionsPassedCount: 0,
                                    mustAssertionsFailedCount: 0,
                                    mustAssertionsPassedCount: 16
                                },
                                markedFinalAt: null,
                                isFinal: false,
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: [],
                                draftTestPlanRuns: [
                                    {
                                        tester: {
                                            username: 'esmeralda-baggins'
                                        },
                                        testPlanReport: {
                                            id: '8'
                                        },
                                        testResults: [
                                            {
                                                test: {
                                                    id: 'MThhNeyIyIjoiMjYifQmEyMj'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.817Z'
                                            },
                                            {
                                                test: {
                                                    id: 'ODY5MeyIyIjoiMjYifQzhmNW'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.894Z'
                                            },
                                            {
                                                test: {
                                                    id: 'NWVkNeyIyIjoiMjYifQTZkOT'
                                                },
                                                atVersion: {
                                                    id: '1',
                                                    name: '2021.2111.13'
                                                },
                                                browserVersion: {
                                                    id: '1',
                                                    name: '99.0.1'
                                                },
                                                completedAt:
                                                    '2023-08-18T03:17:10.979Z'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        metadata: {}
                    }
                ]
            }
        }
    },
    {
        request: {
            query: testPlanReportStatusDialogQuery,
            variables: { testPlanVersionId: '1' }
        },
        result: {
            data: {
                testPlanVersion: {
                    id: '1',
                    title: 'Alert Example',
                    phase: 'DRAFT',
                    gitSha: '0928bcf530efcf4faa677285439701537674e014',
                    gitMessage:
                        'Alert and Radiogroup/activedescendent updates (#865)',
                    updatedAt: '2022-12-08T21:47:42.000Z',
                    versionString: 'V22.12.08',
                    draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
                    candidatePhaseReachedAt: null,
                    recommendedPhaseTargetDate: null,
                    recommendedPhaseReachedAt: null,
                    testPlan: {
                        directory: 'alert'
                    },
                    testPlanReports: [
                        {
                            id: '7',
                            metrics: {},
                            markedFinalAt: null,
                            isFinal: false,
                            at: {
                                id: '3',
                                name: 'VoiceOver for macOS'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox'
                            },
                            issues: [],
                            draftTestPlanRuns: []
                        }
                    ],
                    metadata: {}
                }
            }
        }
    },
    {
        request: {
            query: testPlanReportStatusDialogQuery,
            variables: { testPlanVersionId: '5' }
        },
        result: {
            data: {
                testPlanVersion: {
                    id: '5',
                    title: 'Checkbox Example (Mixed-State)',
                    phase: 'RECOMMENDED',
                    gitSha: '836fb2a997f5b2844035b8c934f8fda9833cd5b2',
                    gitMessage: 'Validation for test csv formats (#980)',
                    updatedAt: '2023-08-23T20:30:34.000Z',
                    draftPhaseReachedAt: null,
                    candidatePhaseReachedAt: '2022-07-06T00:00:00.000Z',
                    recommendedPhaseTargetDate: '2023-01-02T00:00:00.000Z',
                    recommendedPhaseReachedAt: '2023-01-03T00:00:00.000Z',
                    testPlan: {
                        directory: 'checkbox-tri-state'
                    },
                    testPlanReports: [
                        {
                            id: '6',
                            metrics: {
                                testsCount: 7,
                                supportLevel: 'FAILING',
                                conflictsCount: 0,
                                supportPercent: 96,
                                testsFailedCount: 3,
                                testsPassedCount: 4,
                                shouldFormatted: '4 of 4 passed',
                                mustFormatted: '44 of 46 passed',
                                shouldAssertionsCount: 4,
                                mustAssertionsCount: 46,
                                unexpectedBehaviorCount: 0,
                                unexpectedBehaviorsFormatted: false,
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 4,
                                mustAssertionsFailedCount: 2,
                                mustAssertionsPassedCount: 44
                            },
                            markedFinalAt: '2022-07-06T00:00:00.000Z',
                            isFinal: true,
                            at: {
                                id: '3',
                                name: 'VoiceOver for macOS'
                            },
                            browser: {
                                id: '3',
                                name: 'Safari'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'tom-proudfeet'
                                    },
                                    testPlanReport: {
                                        id: '6'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'YTE3NeyIyIjoiNSJ9WJlMj'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:57.070Z'
                                        },
                                        {
                                            test: {
                                                id: 'YWJiOeyIyIjoiNSJ9GQ5Zm'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:57.142Z'
                                        },
                                        {
                                            test: {
                                                id: 'ZGFlYeyIyIjoiNSJ9TJlMW'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:57.204Z'
                                        },
                                        {
                                            test: {
                                                id: 'YjI2MeyIyIjoiNSJ9WE1OT'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:57.275Z'
                                        },
                                        {
                                            test: {
                                                id: 'ZjAwZeyIyIjoiNSJ9TZmZj'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:57.330Z'
                                        },
                                        {
                                            test: {
                                                id: 'MGRjZeyIyIjoiNSJ9WNiZD'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:57.382Z'
                                        },
                                        {
                                            test: {
                                                id: 'OTZmYeyIyIjoiNSJ9TU5Ym'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:57.439Z'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: '12',
                            metrics: {
                                testsCount: 14,
                                supportLevel: 'FULL',
                                conflictsCount: 0,
                                supportPercent: 100,
                                testsFailedCount: 12,
                                testsPassedCount: 2,
                                shouldFormatted: false,
                                mustFormatted: '25 of 25 passed',
                                shouldAssertionsCount: 0,
                                mustAssertionsCount: 25,
                                unexpectedBehaviorCount: 0,
                                unexpectedBehaviorsFormatted: false,
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 0,
                                mustAssertionsFailedCount: 0,
                                mustAssertionsPassedCount: 25
                            },
                            markedFinalAt: '2022-07-06T00:00:00.000Z',
                            isFinal: true,
                            at: {
                                id: '1',
                                name: 'JAWS'
                            },
                            browser: {
                                id: '2',
                                name: 'Chrome'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'esmeralda-baggins'
                                    },
                                    testPlanReport: {
                                        id: '12'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'MTVlZeyIyIjoiNSJ9DUzMz'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:58.343Z'
                                        },
                                        {
                                            test: {
                                                id: 'OThhMeyIyIjoiNSJ9WMxM2'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:58.404Z'
                                        },
                                        {
                                            test: {
                                                id: 'YWNhNeyIyIjoiNSJ9TliN2'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:58.472Z'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: '13',
                            metrics: {
                                testsCount: 14,
                                supportLevel: 'FULL',
                                conflictsCount: 0,
                                supportPercent: 100,
                                testsFailedCount: 12,
                                testsPassedCount: 2,
                                shouldFormatted: false,
                                mustFormatted: '25 of 25 passed',
                                shouldAssertionsCount: 0,
                                mustAssertionsCount: 25,
                                unexpectedBehaviorCount: 0,
                                unexpectedBehaviorsFormatted: false,
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 0,
                                mustAssertionsFailedCount: 0,
                                mustAssertionsPassedCount: 25
                            },
                            markedFinalAt: '2022-07-07T00:00:00.000Z',
                            isFinal: true,
                            at: {
                                id: '2',
                                name: 'NVDA'
                            },
                            browser: {
                                id: '2',
                                name: 'Chrome'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'esmeralda-baggins'
                                    },
                                    testPlanReport: {
                                        id: '13'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'MTVlZeyIyIjoiNSJ9DUzMz'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:58.531Z'
                                        },
                                        {
                                            test: {
                                                id: 'OThhMeyIyIjoiNSJ9WMxM2'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:58.593Z'
                                        },
                                        {
                                            test: {
                                                id: 'YWNhNeyIyIjoiNSJ9TliN2'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-30T13:23:58.655Z'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    metadata: {}
                }
            }
        }
    },
    {
        request: {
            query: testPlanReportStatusDialogQuery,
            variables: { testPlanVersionId: '7' }
        },
        result: {
            data: {
                testPlanVersion: {
                    id: '7',
                    title: 'Select Only Combobox Example',
                    phase: 'DRAFT',
                    gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                    gitMessage:
                        'Generate html source script to support aria-at-app (#646)',
                    updatedAt: '2022-03-17T18:34:51.000Z',
                    draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
                    candidatePhaseReachedAt: null,
                    recommendedPhaseTargetDate: null,
                    recommendedPhaseReachedAt: null,
                    testPlan: {
                        directory: 'combobox-select-only'
                    },
                    testPlanReports: [
                        {
                            id: '2',
                            metrics: {
                                testsCount: 21,
                                supportLevel: 'FAILING',
                                conflictsCount: 5,
                                supportPercent: 96,
                                testsFailedCount: 16,
                                testsPassedCount: 5,
                                shouldFormatted: '3 of 3 passed',
                                mustFormatted: '48 of 50 passed',
                                shouldAssertionsCount: 3,
                                mustAssertionsCount: 50,
                                unexpectedBehaviorCount: 3,
                                unexpectedBehaviorsFormatted: '3 found',
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 3,
                                mustAssertionsFailedCount: 2,
                                mustAssertionsPassedCount: 48
                            },
                            markedFinalAt: null,
                            isFinal: false,
                            at: {
                                id: '2',
                                name: 'NVDA'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'tom-proudfeet'
                                    },
                                    testPlanReport: {
                                        id: '2'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'Nzg5NeyIyIjoiNyJ9zNjZj'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:08.240Z'
                                        },
                                        {
                                            test: {
                                                id: 'MmY0YeyIyIjoiNyJ9jRkZD'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:08.332Z'
                                        },
                                        {
                                            test: {
                                                id: 'ZjUwNeyIyIjoiNyJ9mE2ZT'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:08.412Z'
                                        },
                                        {
                                            test: {
                                                id: 'MDNiMeyIyIjoiNyJ9Dk1MT'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:08.501Z'
                                        },
                                        {
                                            test: {
                                                id: 'MjRmNeyIyIjoiNyJ92MyMT'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:08.593Z'
                                        },
                                        {
                                            test: {
                                                id: 'ZmVlMeyIyIjoiNyJ9mUyYj'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt: null
                                        },
                                        {
                                            test: {
                                                id: 'YWFiNeyIyIjoiNyJ9zE2Zj'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:08.811Z'
                                        },
                                        {
                                            test: {
                                                id: 'YjZkYeyIyIjoiNyJ9WIxZm'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:08.902Z'
                                        },
                                        {
                                            test: {
                                                id: 'ZmIzMeyIyIjoiNyJ9TQ1NW'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:08.996Z'
                                        }
                                    ]
                                },
                                {
                                    tester: {
                                        username: 'esmeralda-baggins'
                                    },
                                    testPlanReport: {
                                        id: '2'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'Nzg5NeyIyIjoiNyJ9zNjZj'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:07.718Z'
                                        },
                                        {
                                            test: {
                                                id: 'MmY0YeyIyIjoiNyJ9jRkZD'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:07.813Z'
                                        },
                                        {
                                            test: {
                                                id: 'ZjUwNeyIyIjoiNyJ9mE2ZT'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:07.914Z'
                                        },
                                        {
                                            test: {
                                                id: 'MDNiMeyIyIjoiNyJ9Dk1MT'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:07.988Z'
                                        },
                                        {
                                            test: {
                                                id: 'MjRmNeyIyIjoiNyJ92MyMT'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:08.074Z'
                                        },
                                        {
                                            test: {
                                                id: 'ZmVlMeyIyIjoiNyJ9mUyYj'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt: null
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    metadata: {}
                }
            }
        }
    },
    {
        request: {
            query: testPlanReportStatusDialogQuery,
            variables: { testPlanVersionId: '26' }
        },
        result: {
            data: {
                testPlanVersion: {
                    id: '26',
                    title: 'Modal Dialog Example',
                    phase: 'CANDIDATE',
                    gitSha: 'd0e16b42179de6f6c070da2310e99de837c71215',
                    gitMessage:
                        'Delete down arrow command for navigating to the beginning of a dialog with JAWS and add the ESC command to exit forms or focus mode (#759)',
                    updatedAt: '2022-06-22T17:56:16.000Z',
                    draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
                    candidatePhaseReachedAt: '2022-07-06T00:00:00.000Z',
                    recommendedPhaseTargetDate: '2023-01-02T00:00:00.000Z',
                    recommendedPhaseReachedAt: null,
                    testPlan: {
                        directory: 'modal-dialog'
                    },
                    testPlanReports: [
                        {
                            id: '10',
                            metrics: {
                                testsCount: 11,
                                supportLevel: 'FULL',
                                conflictsCount: 0,
                                supportPercent: 100,
                                testsFailedCount: 9,
                                testsPassedCount: 2,
                                shouldFormatted: false,
                                mustFormatted: '14 of 14 passed',
                                shouldAssertionsCount: 0,
                                mustAssertionsCount: 14,
                                unexpectedBehaviorCount: 0,
                                unexpectedBehaviorsFormatted: false,
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 0,
                                mustAssertionsFailedCount: 0,
                                mustAssertionsPassedCount: 14
                            },
                            markedFinalAt: null,
                            isFinal: false,
                            at: {
                                id: '3',
                                name: 'VoiceOver for macOS'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'esmeralda-baggins'
                                    },
                                    testPlanReport: {
                                        id: '10'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'MzlmYeyIyIjoiMjYifQzIxY2'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:11.295Z'
                                        },
                                        {
                                            test: {
                                                id: 'N2FkZeyIyIjoiMjYifQDQ5NT'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:11.369Z'
                                        },
                                        {
                                            test: {
                                                id: 'ZDJkYeyIyIjoiMjYifQzRkYj'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:11.450Z'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: '9',
                            metrics: {
                                testsCount: 18,
                                supportLevel: 'FULL',
                                conflictsCount: 0,
                                supportPercent: 100,
                                testsFailedCount: 16,
                                testsPassedCount: 2,
                                shouldFormatted: false,
                                mustFormatted: '16 of 16 passed',
                                shouldAssertionsCount: 0,
                                mustAssertionsCount: 16,
                                unexpectedBehaviorCount: 0,
                                unexpectedBehaviorsFormatted: false,
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 0,
                                mustAssertionsFailedCount: 0,
                                mustAssertionsPassedCount: 16
                            },
                            markedFinalAt: null,
                            isFinal: false,
                            at: {
                                id: '2',
                                name: 'NVDA'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'esmeralda-baggins'
                                    },
                                    testPlanReport: {
                                        id: '9'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'MThhNeyIyIjoiMjYifQmEyMj'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:11.059Z'
                                        },
                                        {
                                            test: {
                                                id: 'ODY5MeyIyIjoiMjYifQzhmNW'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:11.137Z'
                                        },
                                        {
                                            test: {
                                                id: 'NWVkNeyIyIjoiMjYifQTZkOT'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:11.218Z'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: '3',
                            metrics: {
                                testsCount: 18,
                                supportLevel: 'FAILING',
                                conflictsCount: 0,
                                supportPercent: 88,
                                testsFailedCount: 16,
                                testsPassedCount: 2,
                                shouldFormatted: false,
                                mustFormatted: '14 of 16 passed',
                                shouldAssertionsCount: 0,
                                mustAssertionsCount: 16,
                                unexpectedBehaviorCount: 1,
                                unexpectedBehaviorsFormatted: '1 found',
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 0,
                                mustAssertionsFailedCount: 2,
                                mustAssertionsPassedCount: 14
                            },
                            markedFinalAt: '2022-07-06T00:00:00.000Z',
                            isFinal: true,
                            at: {
                                id: '1',
                                name: 'JAWS'
                            },
                            browser: {
                                id: '2',
                                name: 'Chrome'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'esmeralda-baggins'
                                    },
                                    testPlanReport: {
                                        id: '3'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'MThhNeyIyIjoiMjYifQmEyMj'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.074Z'
                                        },
                                        {
                                            test: {
                                                id: 'NWVkNeyIyIjoiMjYifQTZkOT'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.134Z'
                                        },
                                        {
                                            test: {
                                                id: 'NWM4NeyIyIjoiMjYifQDEwM2'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.202Z'
                                        },
                                        {
                                            test: {
                                                id: 'NGFiZeyIyIjoiMjYifQWZiYW'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.268Z'
                                        },
                                        {
                                            test: {
                                                id: 'MzQzYeyIyIjoiMjYifQzU5Zm'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.336Z'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: '11',
                            metrics: {
                                testsCount: 11,
                                supportLevel: 'FULL',
                                conflictsCount: 0,
                                supportPercent: 100,
                                testsFailedCount: 9,
                                testsPassedCount: 2,
                                shouldFormatted: false,
                                mustFormatted: '14 of 14 passed',
                                shouldAssertionsCount: 0,
                                mustAssertionsCount: 14,
                                unexpectedBehaviorCount: 0,
                                unexpectedBehaviorsFormatted: false,
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 0,
                                mustAssertionsFailedCount: 0,
                                mustAssertionsPassedCount: 14
                            },
                            markedFinalAt: null,
                            isFinal: false,
                            at: {
                                id: '3',
                                name: 'VoiceOver for macOS'
                            },
                            browser: {
                                id: '2',
                                name: 'Chrome'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'esmeralda-baggins'
                                    },
                                    testPlanReport: {
                                        id: '11'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'MzlmYeyIyIjoiMjYifQzIxY2'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:11.532Z'
                                        },
                                        {
                                            test: {
                                                id: 'N2FkZeyIyIjoiMjYifQDQ5NT'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:11.611Z'
                                        },
                                        {
                                            test: {
                                                id: 'ZDJkYeyIyIjoiMjYifQzRkYj'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:11.696Z'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: '4',
                            metrics: {
                                testsCount: 18,
                                supportLevel: 'FAILING',
                                conflictsCount: 0,
                                supportPercent: 91,
                                testsFailedCount: 14,
                                testsPassedCount: 4,
                                shouldFormatted: false,
                                mustFormatted: '20 of 22 passed',
                                shouldAssertionsCount: 0,
                                mustAssertionsCount: 22,
                                unexpectedBehaviorCount: 1,
                                unexpectedBehaviorsFormatted: '1 found',
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 0,
                                mustAssertionsFailedCount: 2,
                                mustAssertionsPassedCount: 20
                            },
                            markedFinalAt: '2022-07-06T00:00:00.000Z',
                            isFinal: true,
                            at: {
                                id: '2',
                                name: 'NVDA'
                            },
                            browser: {
                                id: '2',
                                name: 'Chrome'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'esmeralda-baggins'
                                    },
                                    testPlanReport: {
                                        id: '4'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'MThhNeyIyIjoiMjYifQmEyMj'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.409Z'
                                        },
                                        {
                                            test: {
                                                id: 'NWVkNeyIyIjoiMjYifQTZkOT'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.478Z'
                                        },
                                        {
                                            test: {
                                                id: 'NWM4NeyIyIjoiMjYifQDEwM2'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.551Z'
                                        },
                                        {
                                            test: {
                                                id: 'NGFiZeyIyIjoiMjYifQWZiYW'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.629Z'
                                        },
                                        {
                                            test: {
                                                id: 'MzQzYeyIyIjoiMjYifQzU5Zm'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.704Z'
                                        },
                                        {
                                            test: {
                                                id: 'MmI1MeyIyIjoiMjYifQmU3Yz'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.777Z'
                                        },
                                        {
                                            test: {
                                                id: 'YmRmYeyIyIjoiMjYifQjEyMT'
                                            },
                                            atVersion: {
                                                id: '2',
                                                name: '2020.4'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.852Z'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: '5',
                            metrics: {
                                testsCount: 11,
                                supportLevel: 'FAILING',
                                conflictsCount: 0,
                                supportPercent: 92,
                                testsFailedCount: 8,
                                testsPassedCount: 3,
                                shouldFormatted: false,
                                mustFormatted: '23 of 25 passed',
                                shouldAssertionsCount: 0,
                                mustAssertionsCount: 25,
                                unexpectedBehaviorCount: 1,
                                unexpectedBehaviorsFormatted: '1 found',
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 0,
                                mustAssertionsFailedCount: 2,
                                mustAssertionsPassedCount: 23
                            },
                            markedFinalAt: '2022-07-06T00:00:00.000Z',
                            isFinal: true,
                            at: {
                                id: '3',
                                name: 'VoiceOver for macOS'
                            },
                            browser: {
                                id: '3',
                                name: 'Safari'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'esmeralda-baggins'
                                    },
                                    testPlanReport: {
                                        id: '5'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'MzlmYeyIyIjoiMjYifQzIxY2'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.923Z'
                                        },
                                        {
                                            test: {
                                                id: 'ZDJkYeyIyIjoiMjYifQzRkYj'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:09.991Z'
                                        },
                                        {
                                            test: {
                                                id: 'ZmQyNeyIyIjoiMjYifQ2M2ND'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:10.059Z'
                                        },
                                        {
                                            test: {
                                                id: 'OGE3YeyIyIjoiMjYifQjU1ND'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:10.129Z'
                                        },
                                        {
                                            test: {
                                                id: 'YWI3OeyIyIjoiMjYifQWJlNW'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:10.198Z'
                                        },
                                        {
                                            test: {
                                                id: 'M2RiOeyIyIjoiMjYifQGY1Nj'
                                            },
                                            atVersion: {
                                                id: '3',
                                                name: '11.6 (20G165)'
                                            },
                                            browserVersion: {
                                                id: '3',
                                                name: '14.1.2'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:10.272Z'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: '8',
                            metrics: {
                                testsCount: 18,
                                supportLevel: 'FULL',
                                conflictsCount: 0,
                                supportPercent: 100,
                                testsFailedCount: 16,
                                testsPassedCount: 2,
                                shouldFormatted: false,
                                mustFormatted: '16 of 16 passed',
                                shouldAssertionsCount: 0,
                                mustAssertionsCount: 16,
                                unexpectedBehaviorCount: 0,
                                unexpectedBehaviorsFormatted: false,
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 0,
                                mustAssertionsFailedCount: 0,
                                mustAssertionsPassedCount: 16
                            },
                            markedFinalAt: null,
                            isFinal: false,
                            at: {
                                id: '1',
                                name: 'JAWS'
                            },
                            browser: {
                                id: '1',
                                name: 'Firefox'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'esmeralda-baggins'
                                    },
                                    testPlanReport: {
                                        id: '8'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'MThhNeyIyIjoiMjYifQmEyMj'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:10.817Z'
                                        },
                                        {
                                            test: {
                                                id: 'ODY5MeyIyIjoiMjYifQzhmNW'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:10.894Z'
                                        },
                                        {
                                            test: {
                                                id: 'NWVkNeyIyIjoiMjYifQTZkOT'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '1',
                                                name: '99.0.1'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:10.979Z'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    metadata: {}
                }
            }
        }
    },
    {
        request: {
            query: testPlanReportStatusDialogQuery,
            variables: { testPlanVersionId: '34' }
        },
        result: {
            data: {
                testPlanVersion: {
                    id: '34',
                    title: 'Toggle Button',
                    phase: 'DRAFT',
                    gitSha: '022340081280b8cafb8ae0716a5b67e9ab942ef4',
                    gitMessage:
                        'Delete duplicated assertion for operating a not pressed togle button (VoiceOver) (#716)',
                    updatedAt: '2022-05-18T20:51:40.000Z',
                    draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
                    candidatePhaseReachedAt: null,
                    recommendedPhaseTargetDate: null,
                    recommendedPhaseReachedAt: null,
                    testPlan: {
                        directory: 'toggle-button'
                    },
                    testPlanReports: [
                        {
                            id: '1',
                            metrics: {
                                testsCount: 16,
                                supportLevel: 'FAILING',
                                conflictsCount: 0,
                                supportPercent: 93,
                                testsFailedCount: 14,
                                testsPassedCount: 2,
                                shouldFormatted: false,
                                mustFormatted: '28 of 30 passed',
                                shouldAssertionsCount: 0,
                                mustAssertionsCount: 30,
                                unexpectedBehaviorCount: 1,
                                unexpectedBehaviorsFormatted: '1 found',
                                shouldAssertionsFailedCount: 0,
                                shouldAssertionsPassedCount: 0,
                                mustAssertionsFailedCount: 2,
                                mustAssertionsPassedCount: 28
                            },
                            markedFinalAt: null,
                            isFinal: false,
                            at: {
                                id: '1',
                                name: 'JAWS'
                            },
                            browser: {
                                id: '2',
                                name: 'Chrome'
                            },
                            issues: [],
                            draftTestPlanRuns: [
                                {
                                    tester: {
                                        username: 'esmeralda-baggins'
                                    },
                                    testPlanReport: {
                                        id: '1'
                                    },
                                    testResults: [
                                        {
                                            test: {
                                                id: 'OWY5NeyIyIjoiMzQifQTRmOD'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:07.154Z'
                                        },
                                        {
                                            test: {
                                                id: 'NGFjMeyIyIjoiMzQifQjQxY2'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt: null
                                        },
                                        {
                                            test: {
                                                id: 'NTAwOeyIyIjoiMzQifQWI5YT'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt: null
                                        },
                                        {
                                            test: {
                                                id: 'YThjMeyIyIjoiMzQifQzIyYT'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt: null
                                        },
                                        {
                                            test: {
                                                id: 'YTgxMeyIyIjoiMzQifQzExOW'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:07.381Z'
                                        },
                                        {
                                            test: {
                                                id: 'NGMwNeyIyIjoiMzQifQ2IwN2'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:07.464Z'
                                        },
                                        {
                                            test: {
                                                id: 'YzQxNeyIyIjoiMzQifQjY5ND'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:07.537Z'
                                        },
                                        {
                                            test: {
                                                id: 'MjgwNeyIyIjoiMzQifQzk3YT'
                                            },
                                            atVersion: {
                                                id: '1',
                                                name: '2021.2111.13'
                                            },
                                            browserVersion: {
                                                id: '2',
                                                name: '99.0.4844.84'
                                            },
                                            completedAt:
                                                '2023-08-18T03:17:07.610Z'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    metadata: {}
                }
            }
        }
    }
];
