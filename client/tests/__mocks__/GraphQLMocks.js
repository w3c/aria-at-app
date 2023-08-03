import { TEST_QUEUE_PAGE_QUERY } from '../../components/TestQueue/queries';
import { DATA_MANAGEMENT_PAGE_QUERY } from '../../components/DataManagement/queries';

export const TEST_QUEUE_PAGE_NOT_POPULATED_MOCK_ADMIN = [
    {
        request: {
            query: TEST_QUEUE_PAGE_QUERY
        },
        result: {
            data: {
                me: {
                    id: '1',
                    username: 'foo-bar',
                    roles: ['ADMIN', 'TESTER'],
                    __typename: 'User'
                },
                ats: [],
                browsers: [],
                users: [
                    {
                        id: '1',
                        username: 'foo-bar',
                        roles: ['ADMIN', 'TESTER']
                    },
                    {
                        id: '4',
                        username: 'bar-foo',
                        roles: ['TESTER']
                    },
                    {
                        id: '5',
                        username: 'boo-far',
                        roles: ['TESTER']
                    }
                ],
                testPlanVersions: [],
                testPlanReports: [],
                testPlans: []
            }
        }
    }
];

export const TEST_QUEUE_PAGE_NOT_POPULATED_MOCK_TESTER = [
    {
        request: {
            query: TEST_QUEUE_PAGE_QUERY
        },
        result: {
            data: {
                me: {
                    id: '4',
                    username: 'bar-foo',
                    roles: ['TESTER'],
                    __typename: 'User'
                },
                ats: [],
                browsers: [],
                users: [
                    {
                        id: '1',
                        username: 'foo-bar',
                        roles: ['ADMIN', 'TESTER'],
                        __typename: 'User'
                    },
                    {
                        id: '4',
                        username: 'bar-foo',
                        roles: ['TESTER'],
                        __typename: 'User'
                    },
                    {
                        id: '5',
                        username: 'boo-far',
                        roles: ['TESTER'],
                        __typename: 'User'
                    }
                ],
                testPlanVersions: [],
                testPlanReports: [],
                testPlans: []
            }
        }
    }
];

export const TEST_QUEUE_PAGE_POPULATED_MOCK_ADMIN = [
    {
        request: {
            query: TEST_QUEUE_PAGE_QUERY
        },
        result: {
            data: {
                me: {
                    id: '101',
                    username: 'alflennik',
                    roles: ['ADMIN', 'TESTER']
                },
                ats: [
                    {
                        id: '1',
                        name: 'JAWS',
                        atVersions: [
                            {
                                id: '6',
                                name: '2021.2103.174',
                                releasedAt: '2022-08-02T14:36:02.659Z'
                            }
                        ]
                    },
                    {
                        id: '2',
                        name: 'NVDA',
                        atVersions: [
                            {
                                id: '5',
                                name: '2020.4',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '4',
                                name: '2020.3',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '3',
                                name: '2020.2',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '2',
                                name: '2020.1',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '1',
                                name: '2019.3',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            }
                        ]
                    },
                    {
                        id: '3',
                        name: 'VoiceOver for macOS',
                        atVersions: [
                            {
                                id: '7',
                                name: '11.5.2',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            }
                        ]
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
                users: [
                    {
                        id: '1',
                        username: 'esmeralda-baggins',
                        roles: ['TESTER', 'ADMIN']
                    },
                    { id: '2', username: 'tom-proudfeet', roles: ['TESTER'] },
                    {
                        id: '101',
                        username: 'alflennik',
                        roles: ['TESTER', 'ADMIN']
                    }
                ],
                testPlanVersions: [
                    {
                        id: '1',
                        title: 'Alert Example',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'alert'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    },
                    {
                        id: '2',
                        title: 'Banner Landmark',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'banner'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    },
                    {
                        id: '3',
                        title: 'Breadcrumb Example',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    }
                ],
                testPlanReports: [
                    {
                        id: '1',
                        status: 'DRAFT',
                        conflictsLength: 0,
                        runnableTestsLength: 17,
                        approvedAt: null,
                        at: { id: '1', name: 'JAWS' },
                        browser: { id: '2', name: 'Chrome' },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            phase: 'DRAFT',
                            gitSha: 'b7078039f789c125e269cb8f8632f57a03d4c50b',
                            gitMessage: 'The message for this SHA',
                            testPlan: { directory: 'checkbox' },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '1',
                                tester: {
                                    id: '1',
                                    username: 'esmeralda-baggins'
                                },
                                testResultsLength: 0
                            }
                        ]
                    },
                    {
                        id: '2',
                        status: 'DRAFT',
                        conflictsLength: 0,
                        runnableTestsLength: 17,
                        approvedAt: null,
                        at: { id: '3', name: 'VoiceOver for macOS' },
                        browser: { id: '3', name: 'Safari' },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            phase: 'DRAFT',
                            gitSha: 'b7078039f789c125e269cb8f8632f57a03d4c50b',
                            gitMessage: 'The message for this SHA',
                            testPlan: { directory: 'checkbox' },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '1',
                                tester: {
                                    id: '1',
                                    username: 'esmeralda-baggins'
                                },
                                testResultsLength: 0
                            }
                        ]
                    },
                    {
                        id: '3',
                        status: 'DRAFT',
                        conflictsLength: 3,
                        runnableTestsLength: 17,
                        approvedAt: null,
                        at: { id: '2', name: 'NVDA' },
                        browser: { id: '1', name: 'Firefox' },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
                            phase: 'DRAFT',
                            gitSha: 'b7078039f789c125e269cb8f8632f57a03d4c50b',
                            gitMessage: 'The message for this SHA',
                            testPlan: { directory: 'checkbox' },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '3',
                                tester: { id: '2', username: 'tom-proudfeet' },
                                testResultsLength: 3
                            },
                            {
                                id: '101',
                                tester: { id: '101', username: 'alflennik' },
                                testResultsLength: 1
                            },
                            {
                                id: '2',
                                tester: {
                                    id: '1',
                                    username: 'esmeralda-baggins'
                                },
                                testResultsLength: 3
                            }
                        ]
                    }
                ],
                testPlans: []
            }
        }
    }
];

export const TEST_QUEUE_PAGE_POPULATED_MOCK_TESTER = [
    {
        request: {
            query: TEST_QUEUE_PAGE_QUERY
        },
        result: {
            data: {
                me: {
                    id: '4',
                    username: 'bar-foo',
                    roles: ['TESTER'],
                    __typename: 'User'
                },
                ats: [
                    {
                        id: '1',
                        name: 'JAWS',
                        atVersions: [
                            {
                                id: '6',
                                name: '2021.2103.174',
                                releasedAt: '2022-08-02T14:36:02.659Z'
                            }
                        ]
                    },
                    {
                        id: '2',
                        name: 'NVDA',
                        atVersions: [
                            {
                                id: '5',
                                name: '2020.4',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '4',
                                name: '2020.3',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '3',
                                name: '2020.2',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '2',
                                name: '2020.1',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            },
                            {
                                id: '1',
                                name: '2019.3',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            }
                        ]
                    },
                    {
                        id: '3',
                        name: 'VoiceOver for macOS',
                        atVersions: [
                            {
                                id: '7',
                                name: '11.5.2',
                                releasedAt: '2022-01-01T12:00:00.000Z'
                            }
                        ]
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
                users: [
                    {
                        id: '1',
                        username: 'foo-bar',
                        roles: ['ADMIN', 'TESTER']
                    },
                    {
                        id: '4',
                        username: 'bar-foo',
                        roles: ['TESTER']
                    },
                    {
                        id: '5',
                        username: 'boo-far',
                        roles: ['TESTER']
                    }
                ],
                testPlanVersions: [
                    {
                        id: '1',
                        title: 'Alert Example',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'alert'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    },
                    {
                        id: '2',
                        title: 'Banner Landmark',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'banner'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    },
                    {
                        id: '3',
                        title: 'Breadcrumb Example',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        updatedAt: '2022-04-15T19:09:53.000Z'
                    }
                ],
                testPlanReports: [
                    {
                        id: '10',
                        status: 'DRAFT',
                        conflictsLength: 0,
                        runnableTestsLength: 17,
                        approvedAt: null,
                        at: {
                            id: '2',
                            name: 'NVDA'
                        },
                        browser: {
                            id: '1',
                            name: 'Firefox'
                        },
                        testPlanVersion: {
                            id: '65',
                            title: 'Checkbox Example (Two State)',
                            phase: 'DRAFT',
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
                            gitMessage: 'The message for this SHA',
                            testPlan: {
                                directory: 'checkbox'
                            },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '18',
                                tester: {
                                    id: '1',
                                    username: 'foo-bar'
                                },
                                testResultsLength: 0
                            },
                            {
                                id: '19',
                                tester: {
                                    id: '4',
                                    username: 'bar-foo'
                                },
                                testResultsLength: 0
                            }
                        ]
                    },
                    {
                        id: '11',
                        status: 'DRAFT',
                        conflictsLength: 0,
                        runnableTestsLength: 17,
                        approvedAt: null,
                        at: {
                            id: '2',
                            name: 'JAWS'
                        },
                        browser: {
                            id: '1',
                            name: 'Firefox'
                        },
                        testPlanVersion: {
                            id: '65',
                            title: 'Checkbox Example (Two State)',
                            phase: 'DRAFT',
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
                            gitMessage: 'The message for this SHA',
                            testPlan: {
                                directory: 'checkbox'
                            },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: [
                            {
                                id: '20',
                                tester: {
                                    id: '5',
                                    username: 'boo-far'
                                },
                                testResultsLength: 0
                            }
                        ]
                    },
                    {
                        id: '12',
                        status: 'DRAFT',
                        conflictsLength: 0,
                        runnableTestsLength: 15,
                        approvedAt: null,
                        at: {
                            id: '3',
                            name: 'VoiceOver for macOS'
                        },
                        browser: {
                            id: '1',
                            name: 'Firefox'
                        },
                        testPlanVersion: {
                            id: '74',
                            title: 'Editor Menubar Example',
                            phase: 'DRAFT',
                            gitSha: 'aea64f84b8fa8b21e94f5d9afd7035570bc1bed3',
                            gitMessage: 'The message for this SHA',
                            testPlan: {
                                directory: 'menubar-editor'
                            },
                            updatedAt: '2021-11-30T14:51:28.000Z'
                        },
                        draftTestPlanRuns: []
                    }
                ],
                testPlans: []
            }
        }
    }
];

export const DATA_MANAGEMENT_PAGE_POPULATED = [
    {
        request: {
            query: DATA_MANAGEMENT_PAGE_QUERY
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
                        name: 'JAWS',
                        atVersions: [
                            {
                                id: '1',
                                name: '2021.2111.13',
                                releasedAt: '2021-11-01T04:00:00.000Z'
                            }
                        ]
                    },
                    {
                        id: '2',
                        name: 'NVDA',
                        atVersions: [
                            {
                                id: '2',
                                name: '2020.4',
                                releasedAt: '2021-02-19T05:00:00.000Z'
                            }
                        ]
                    },
                    {
                        id: '3',
                        name: 'VoiceOver for macOS',
                        atVersions: [
                            {
                                id: '3',
                                name: '11.6 (20G165)',
                                releasedAt: '2019-09-01T04:00:00.000Z'
                            }
                        ]
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
                testPlanVersions: [
                    {
                        id: '28',
                        title: 'Radio Group Example Using Roving tabindex',
                        phase: 'RD',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        updatedAt: '2023-04-10T18:22:22.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-roving-tabindex'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '27',
                        title: 'Radio Group Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        updatedAt: '2023-04-10T18:22:22.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '31',
                        title: 'Horizontal Multi-Thumb Slider',
                        phase: 'RD',
                        gitSha: 'b5fe3efd569518e449ef9a0978b0dec1f2a08bd6',
                        gitMessage:
                            'Create tests for APG design pattern example: Horizontal Multi-Thumb Slider (#511)',
                        updatedAt: '2023-03-20T21:24:41.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'slider-multithumb'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '16',
                        title: 'Link Example 3 (CSS :before content property on a span element)',
                        phase: 'RD',
                        gitSha: '7a8454bca6de980199868101431817cea03cce35',
                        gitMessage:
                            'Create tests for APG design pattern example: Link Example 3 (CSS :before content property on a span element) (#518)',
                        updatedAt: '2023-03-13T22:10:13.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'link-css'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '17',
                        title: 'Link Example 2 (img element with alt attribute)',
                        phase: 'RD',
                        gitSha: 'dc637636cff74b51f5c468ff3b81bd1f38aefbb2',
                        gitMessage:
                            'Create tests for APG design pattern example: Link Example 2 (img element with alt attribute) (#516)',
                        updatedAt: '2023-03-13T19:51:48.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'link-img-alt'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1',
                        title: 'Alert Example',
                        phase: 'DRAFT',
                        gitSha: '0928bcf530efcf4faa677285439701537674e014',
                        gitMessage:
                            'Alert and Radiogroup/activedescendent updates (#865)',
                        updatedAt: '2022-12-08T21:47:42.000Z',
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
                                approvedAt: null,
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: []
                            }
                        ]
                    },
                    {
                        id: '13',
                        title: 'Disclosure Navigation Menu Example',
                        phase: 'RD',
                        gitSha: '179ba0f438aaa5781b3ec8a4033d6bf9f757360b',
                        gitMessage:
                            'Delete up arrow command for VoiceOver when navigating backwards to a disclosure button (#845)',
                        updatedAt: '2022-10-31T19:29:17.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-navigation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '3',
                        title: 'Breadcrumb Example',
                        phase: 'RD',
                        gitSha: '1aa3b74d24d340362e9f511eae33788d55487d12',
                        gitMessage:
                            'Add down arrow command to the Navigate forwards out of the Breadcrumb navigation landmark task for JAWS (#803)',
                        updatedAt: '2022-08-10T18:44:16.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '19',
                        title: 'Main Landmark',
                        phase: 'RD',
                        gitSha: 'c87a66ea13a2b6fac6d79fe1fb0b7a2f721dcd22',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Main landmark (#707)',
                        updatedAt: '2022-08-05T17:46:37.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'main'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '24',
                        title: 'Meter',
                        phase: 'RD',
                        gitSha: '32d2d9db48becfc008fc566b569ac1563576ceb9',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Meter (#692)',
                        updatedAt: '2022-08-05T17:02:59.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'meter'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '32',
                        title: 'Switch Example',
                        phase: 'RD',
                        gitSha: '9d0e4e3d1040d64d9db69647e615c4ec0be723c2',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Switch (#691)',
                        updatedAt: '2022-08-05T16:13:44.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'switch'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '22',
                        title: 'Navigation Menu Button',
                        phase: 'RD',
                        gitSha: 'ecf05f484292189789f4db8b1ec41b19db38e567',
                        gitMessage:
                            'Tasks 4, 5 and 6: corrected link name "Navigate backwards from here" (#734)',
                        updatedAt: '2022-05-26T16:14:17.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-navigation'
                        },
                        testPlanReports: []
                    },
                    {
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
                                approvedAt: null,
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            }
                        ]
                    },
                    {
                        id: '8',
                        title: 'Command Button Example',
                        phase: 'RD',
                        gitSha: '0c466eec96c8cafc9961232c85e14758c4589525',
                        gitMessage:
                            'Fix navigation link positions in three test plans: link, command button and toggle button (#709)',
                        updatedAt: '2022-05-04T21:33:31.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'command-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '18',
                        title: 'Link Example 1 (span element with text content)',
                        phase: 'RD',
                        gitSha: '0c466eec96c8cafc9961232c85e14758c4589525',
                        gitMessage:
                            'Fix navigation link positions in three test plans: link, command button and toggle button (#709)',
                        updatedAt: '2022-05-04T21:33:31.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'link-span-text'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '15',
                        title: 'Color Viewer Slider',
                        phase: 'RD',
                        gitSha: '1c6ef2fbef5fc056c622c802bebedaa14f2c8d40',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Color Viewer Slider (#686)',
                        updatedAt: '2022-04-14T18:06:40.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'horizontal-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '6',
                        title: 'Combobox with Both List and Inline Autocomplete Example',
                        phase: 'RD',
                        gitSha: '6b2cbcbdbd5f6867cd3c9e96362817c353335187',
                        gitMessage: "typo: double word 'the' (#595)",
                        updatedAt: '2022-03-29T16:02:56.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-autocomplete-both-updated'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '21',
                        title: 'Action Menu Button Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-actions-active-descendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '20',
                        title: 'Action Menu Button Example Using element.focus()',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-actions'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '2',
                        title: 'Banner Landmark',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'banner'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '4',
                        title: 'Checkbox Example (Two State)',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'checkbox'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '9',
                        title: 'Complementary Landmark',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'complementary'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '10',
                        title: 'Contentinfo Landmark',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'contentinfo'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '25',
                        title: 'Data Grid Example 1: Minimal Data Grid',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'minimal-data-grid'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '11',
                        title: 'Date Picker Spin Button Example',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'datepicker-spin-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '12',
                        title: 'Disclosure of Answers to Frequently Asked Questions Example',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-faq'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '23',
                        title: 'Editor Menubar Example',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menubar-editor'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '14',
                        title: 'Form Landmark',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'form'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '30',
                        title: 'Media Seek Slider',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'seek-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '29',
                        title: 'Rating Slider',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'rating-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '33',
                        title: 'Tabs with Manual Activation',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'tabs-manual-activation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '35',
                        title: 'Vertical Temperature Slider',
                        phase: 'RD',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseTargetDate: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'vertical-temperature-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '7',
                        title: 'Select Only Combobox Example',
                        phase: 'CANDIDATE',
                        gitSha: '7c4b5dce23c74fcf280ed164bdb903e02e0e7726',
                        gitMessage:
                            'Generate html source script to support aria-at-app (#646)',
                        updatedAt: '2022-03-17T18:34:51.000Z',
                        draftPhaseReachedAt: '2022-07-06T00:00:00.000Z',
                        candidatePhaseReachedAt: '2023-08-03T20:22:51.263Z',
                        recommendedPhaseTargetDate: '2024-01-30T21:22:51.263Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-select-only'
                        },
                        testPlanReports: [
                            {
                                id: '2',
                                approvedAt: '2023-08-03T20:20:48.535Z',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: []
                            }
                        ]
                    },
                    {
                        id: '5',
                        title: 'Checkbox Example (Mixed-State)',
                        phase: 'RECOMMENDED',
                        gitSha: 'b3d0576a2901ea7f100f49a994b64edbecf81cff',
                        gitMessage:
                            'Modify VoiceOver commands for task 7 (#842)',
                        updatedAt: '2022-10-24T21:33:12.000Z',
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
                                approvedAt: '2022-07-06T00:00:00.000Z',
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '3',
                                    name: 'Safari'
                                },
                                issues: []
                            }
                        ]
                    },
                    {
                        id: '26',
                        title: 'Modal Dialog Example',
                        phase: 'CANDIDATE',
                        gitSha: 'd0e16b42179de6f6c070da2310e99de837c71215',
                        gitMessage:
                            'Delete down arrow command for navigating to the beginning of a dialog with JAWS and add the ESC command to exit forms or focus mode (#759)',
                        updatedAt: '2022-06-22T17:56:16.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: '2022-07-06T00:00:00.000Z',
                        recommendedPhaseTargetDate: '2023-01-02T00:00:00.000Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'modal-dialog'
                        },
                        testPlanReports: [
                            {
                                id: '5',
                                approvedAt: '2022-07-06T00:00:00.000Z',
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '3',
                                    name: 'Safari'
                                },
                                issues: []
                            },
                            {
                                id: '4',
                                approvedAt: '2022-07-06T00:00:00.000Z',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: []
                            },
                            {
                                id: '3',
                                approvedAt: '2022-07-06T00:00:00.000Z',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            }
                        ]
                    }
                ]
            }
        }
    }
];
