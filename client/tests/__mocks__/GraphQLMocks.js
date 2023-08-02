import {
    ADD_TEST_QUEUE_MUTATION,
    TEST_QUEUE_PAGE_QUERY
} from '../../components/TestQueue/queries';
import { DATA_MANAGEMENT_PAGE_QUERY } from '../../components/DataManagement/queries';

export const TEST_QUEUE_MUTATION_MOCK = [
    {
        request: {
            query: ADD_TEST_QUEUE_MUTATION,
            variables: {
                testPlanVersionId: 5,
                atId: 3,
                browserId: 2
            }
        },
        result: {
            data: {
                findOrCreateTestPlanReport: {
                    populatedData: {
                        testPlanReport: {
                            id: 109,
                            status: 'DRAFT',
                            at: {
                                id: 3
                            },
                            browser: {
                                id: 2
                            }
                        },
                        testPlanVersion: {
                            id: 5
                        }
                    },
                    created: []
                }
            }
        }
    }
];

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
                        at: { id: '1', name: 'JAWS' },
                        browser: { id: '2', name: 'Chrome' },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
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
                        at: { id: '3', name: 'VoiceOver for macOS' },
                        browser: { id: '3', name: 'Safari' },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
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
                        at: { id: '2', name: 'NVDA' },
                        browser: { id: '1', name: 'Firefox' },
                        testPlanVersion: {
                            id: '1',
                            title: 'Checkbox Example (Two State)',
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
                        directory: 'alert',
                        id: 'alert',
                        title: 'Alert Example'
                    },
                    {
                        directory: 'banner',
                        id: 'banner',
                        title: 'Banner Landmark'
                    },
                    {
                        directory: 'breadcrumb',
                        id: 'breadcrumb',
                        title: 'Breadcrumb Example'
                    },
                    {
                        directory: 'checkbox',
                        id: 'checkbox',
                        title: 'Checkbox Example (Two State)'
                    },
                    {
                        directory: 'checkbox-tri-state',
                        id: 'checkbox-tri-state',
                        title: 'Checkbox Example (Mixed-State)'
                    },
                    {
                        directory: 'combobox-autocomplete-both-updated',
                        id: 'combobox-autocomplete-both-updated',
                        title: 'Combobox with Both List and Inline Autocomplete Example'
                    },
                    {
                        directory: 'combobox-select-only',
                        id: 'combobox-select-only',
                        title: 'Select Only Combobox Example'
                    },
                    {
                        directory: 'command-button',
                        id: 'command-button',
                        title: 'Command Button Example'
                    },
                    {
                        directory: 'complementary',
                        id: 'complementary',
                        title: 'Complementary Landmark'
                    },
                    {
                        directory: 'contentinfo',
                        id: 'contentinfo',
                        title: 'Contentinfo Landmark'
                    },
                    {
                        directory: 'datepicker-spin-button',
                        id: 'datepicker-spin-button',
                        title: 'Date Picker Spin Button Example'
                    },
                    {
                        directory: 'disclosure-faq',
                        id: 'disclosure-faq',
                        title: 'Disclosure of Answers to Frequently Asked Questions Example'
                    },
                    {
                        directory: 'disclosure-navigation',
                        id: 'disclosure-navigation',
                        title: 'Disclosure Navigation Menu Example'
                    },
                    {
                        directory: 'form',
                        id: 'form',
                        title: 'Form Landmark'
                    },
                    {
                        directory: 'horizontal-slider',
                        id: 'horizontal-slider',
                        title: 'Color Viewer Slider'
                    },
                    {
                        directory: 'link-css',
                        id: 'link-css',
                        title: 'Link Example 3 (CSS :before content property on a span element)'
                    },
                    {
                        directory: 'link-img-alt',
                        id: 'link-img-alt',
                        title: 'Link Example 2 (img element with alt attribute)'
                    },
                    {
                        directory: 'link-span-text',
                        id: 'link-span-text',
                        title: 'Link Example 1 (span element with text content)'
                    },
                    {
                        directory: 'main',
                        id: 'main',
                        title: 'Main Landmark'
                    },
                    {
                        directory: 'menu-button-actions',
                        id: 'menu-button-actions',
                        title: 'Action Menu Button Example Using element.focus()'
                    },
                    {
                        directory: 'menu-button-actions-active-descendant',
                        id: 'menu-button-actions-active-descendant',
                        title: 'Action Menu Button Example Using aria-activedescendant'
                    },
                    {
                        directory: 'menu-button-navigation',
                        id: 'menu-button-navigation',
                        title: 'Navigation Menu Button'
                    },
                    {
                        directory: 'menubar-editor',
                        id: 'menubar-editor',
                        title: 'Editor Menubar Example'
                    },
                    {
                        directory: 'meter',
                        id: 'meter',
                        title: 'Meter'
                    },
                    {
                        directory: 'minimal-data-grid',
                        id: 'minimal-data-grid',
                        title: 'Data Grid Example 1: Minimal Data Grid'
                    },
                    {
                        directory: 'modal-dialog',
                        id: 'modal-dialog',
                        title: 'Modal Dialog Example'
                    },
                    {
                        directory: 'radiogroup-aria-activedescendant',
                        id: 'radiogroup-aria-activedescendant',
                        title: 'Radio Group Example Using aria-activedescendant'
                    },
                    {
                        directory: 'radiogroup-roving-tabindex',
                        id: 'radiogroup-roving-tabindex',
                        title: 'Radio Group Example Using Roving tabindex'
                    },
                    {
                        directory: 'rating-slider',
                        id: 'rating-slider',
                        title: 'Rating Slider'
                    },
                    {
                        directory: 'seek-slider',
                        id: 'seek-slider',
                        title: 'Media Seek Slider'
                    },
                    {
                        directory: 'slider-multithumb',
                        id: 'slider-multithumb',
                        title: 'Horizontal Multi-Thumb Slider'
                    },
                    {
                        directory: 'switch',
                        id: 'switch',
                        title: 'Switch Example'
                    },
                    {
                        directory: 'tabs-manual-activation',
                        id: 'tabs-manual-activation',
                        title: 'Tabs with Manual Activation'
                    },
                    {
                        directory: 'toggle-button',
                        id: 'toggle-button',
                        title: 'Toggle Button'
                    },
                    {
                        directory: 'vertical-temperature-slider',
                        id: 'vertical-temperature-slider',
                        title: 'Vertical Temperature Slider'
                    }
                ],
                testPlanVersions: [
                    {
                        id: '2347',
                        title: 'Radio Group Example Using Roving tabindex',
                        phase: 'RD',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        updatedAt: '2023-04-10T18:22:22.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-roving-tabindex'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '2245',
                        title: 'Horizontal Multi-Thumb Slider',
                        phase: 'RD',
                        gitSha: 'b5fe3efd569518e449ef9a0978b0dec1f2a08bd6',
                        gitMessage:
                            'Create tests for APG design pattern example: Horizontal Multi-Thumb Slider (#511)',
                        updatedAt: '2023-03-20T21:24:41.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'slider-multithumb'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '2162',
                        title: 'Link Example 3 (CSS :before content property on a span element)',
                        phase: 'RD',
                        gitSha: '7a8454bca6de980199868101431817cea03cce35',
                        gitMessage:
                            'Create tests for APG design pattern example: Link Example 3 (CSS :before content property on a span element) (#518)',
                        updatedAt: '2023-03-13T22:10:13.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'link-css'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '2129',
                        title: 'Link Example 2 (img element with alt attribute)',
                        phase: 'RD',
                        gitSha: 'dc637636cff74b51f5c468ff3b81bd1f38aefbb2',
                        gitMessage:
                            'Create tests for APG design pattern example: Link Example 2 (img element with alt attribute) (#516)',
                        updatedAt: '2023-03-13T19:51:48.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'link-img-alt'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '2107',
                        title: 'Radio Group Example Using Roving tabindex',
                        phase: 'RD',
                        gitSha: '76547989b2a9768df00faa9c8bded8d9ddb58b20',
                        gitMessage:
                            'Additional tests for Radio Group Example Using Roving tabindex - amended (#906)',
                        updatedAt: '2023-03-09T21:02:59.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-roving-tabindex'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1947',
                        title: 'Radio Group Example Using Roving tabindex',
                        phase: 'RD',
                        gitSha: 'af9bb771a871b393fa9c9ad803ea52a1572e5d00',
                        gitMessage:
                            'Additional tests for Radio Group Example Using Roving tabindex (#729)',
                        updatedAt: '2023-03-05T23:29:55.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-roving-tabindex'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1914',
                        title: 'Radio Group Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: '0928bcf530efcf4faa677285439701537674e014',
                        gitMessage:
                            'Alert and Radiogroup/activedescendent updates (#865)',
                        updatedAt: '2022-12-08T21:47:42.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1838',
                        title: 'Disclosure Navigation Menu Example',
                        phase: 'RD',
                        gitSha: 'dac790ee40fe8f55e361a7cf1010d4368d6217cb',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Disclosure Navigation Menu (#821)',
                        updatedAt: '2022-10-28T19:10:50.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-navigation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1798',
                        title: 'Checkbox Example (Mixed-State)',
                        phase: 'RD',
                        gitSha: 'b3d0576a2901ea7f100f49a994b64edbecf81cff',
                        gitMessage:
                            'Modify VoiceOver commands for task 7 (#842)',
                        updatedAt: '2022-10-24T21:33:12.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'checkbox-tri-state'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1764',
                        title: 'Breadcrumb Example',
                        phase: 'RD',
                        gitSha: 'deca9b35acb678018f9f9dda22e1ab01b8127787',
                        gitMessage:
                            'Add support for up to 26 commands in commands.csv files (#832)',
                        updatedAt: '2022-10-11T15:05:13.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1734',
                        title: 'Checkbox Example (Mixed-State)',
                        phase: 'RD',
                        gitSha: 'cd666e9ca00bb94a8c6f0ff3d21d91d8ac82994e',
                        gitMessage:
                            'Update navigation related commands for NVDA and VoiceOver (#831)',
                        updatedAt: '2022-09-28T22:37:00.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'checkbox-tri-state'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1702',
                        title: 'Checkbox Example (Mixed-State)',
                        phase: 'RD',
                        gitSha: '290b2b14b962a5429b14301e3d72207121d341ce',
                        gitMessage:
                            'Create updated tests for APG design pattern example: checkbox (Mixed-State) (#820)',
                        updatedAt: '2022-09-19T16:15:25.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'checkbox-tri-state'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1668',
                        title: 'Breadcrumb Example',
                        phase: 'RD',
                        gitSha: '1aa3b74d24d340362e9f511eae33788d55487d12',
                        gitMessage:
                            'Add down arrow command to the Navigate forwards out of the Breadcrumb navigation landmark task for JAWS (#803)',
                        updatedAt: '2022-08-10T18:44:16.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1636',
                        title: 'Breadcrumb Example',
                        phase: 'RD',
                        gitSha: '914ae408bbfe11bb2bfea45f01c94d9c7e648928',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Breadcrumb (#693)',
                        updatedAt: '2022-08-09T15:42:17.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1618',
                        title: 'Main Landmark',
                        phase: 'RD',
                        gitSha: 'c87a66ea13a2b6fac6d79fe1fb0b7a2f721dcd22',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Main landmark (#707)',
                        updatedAt: '2022-08-05T17:46:37.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'main'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1591',
                        title: 'Meter',
                        phase: 'RD',
                        gitSha: '32d2d9db48becfc008fc566b569ac1563576ceb9',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Meter (#692)',
                        updatedAt: '2022-08-05T17:02:59.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'meter'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1566',
                        title: 'Switch Example',
                        phase: 'RD',
                        gitSha: '9d0e4e3d1040d64d9db69647e615c4ec0be723c2',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Switch (#691)',
                        updatedAt: '2022-08-05T16:13:44.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'switch'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1498',
                        title: 'Radio Group Example Using aria-activedescendant',
                        phase: 'DRAFT',
                        gitSha: '0db9fcf89678e287b09e2d72f6f2724f6b6597c9',
                        gitMessage:
                            'Add issue templates for AT vendor Candidate reviews (#772)',
                        updatedAt: '2022-07-06T17:42:30.000Z',
                        draftPhaseReachedAt: '2022-07-06T17:42:30.000Z',
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        testPlanReports: [
                            {
                                id: '84',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '83',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '82',
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
                        id: '1209',
                        title: 'Modal Dialog Example',
                        phase: 'RD',
                        gitSha: 'ecf05f484292189789f4db8b1ec41b19db38e567',
                        gitMessage:
                            'Tasks 4, 5 and 6: corrected link name "Navigate backwards from here" (#734)',
                        updatedAt: '2022-05-26T16:14:17.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'modal-dialog'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1178',
                        title: 'Radio Group Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: '9d53c205c877970620ff5a13afb1e410ff6f1652',
                        gitMessage:
                            'Add separated tests for navigating to next and previous checked and unchecked radio buttons (macOS VoiceOver) (#717)',
                        updatedAt: '2022-05-18T21:08:05.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1141',
                        title: 'Navigation Menu Button',
                        phase: 'RD',
                        gitSha: '7ec8fa91c8bde5af1fe7ff78698fcf1c737af1b2',
                        gitMessage:
                            'Fixed: delete the word button from assertions for opening a menu (#712)',
                        updatedAt: '2022-05-09T19:04:07.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-navigation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1090',
                        title: 'Alert Example',
                        phase: 'DRAFT',
                        gitSha: '58d4196e8e839673d82de218943cf1e165216a3b',
                        gitMessage:
                            'Remove Up/Down Arrow NVDA commands from certain radiogroup tests (#710)',
                        updatedAt: '2022-05-05T22:03:48.000Z',
                        draftPhaseReachedAt: '2022-05-05T22:03:48.000Z',
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'alert'
                        },
                        testPlanReports: [
                            {
                                id: '62',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '54',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '46',
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
                        id: '1114',
                        title: 'Radio Group Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: '58d4196e8e839673d82de218943cf1e165216a3b',
                        gitMessage:
                            'Remove Up/Down Arrow NVDA commands from certain radiogroup tests (#710)',
                        updatedAt: '2022-05-05T22:03:48.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1045',
                        title: 'Navigation Menu Button',
                        phase: 'RD',
                        gitSha: '97d4bd6c2078849ad4ee01eeeb3667767ca6f992',
                        gitMessage:
                            'Create tests for APG design pattern example: Navigation Menu Button (#524)',
                        updatedAt: '2022-04-15T19:09:53.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-navigation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '995',
                        title: 'Alert Example',
                        phase: 'RD',
                        gitSha: '1c6ef2fbef5fc056c622c802bebedaa14f2c8d40',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Color Viewer Slider (#686)',
                        updatedAt: '2022-04-14T18:06:40.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'alert'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '993',
                        title: 'Toggle Button',
                        phase: 'RD',
                        gitSha: '9904e0e67d156d433ab3cc0a96d6e805e94f22e1',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Toggle Button (#684)',
                        updatedAt: '2022-04-08T19:51:30.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'toggle-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '956',
                        title: 'Modal Dialog Example',
                        phase: 'RD',
                        gitSha: '0063eecc19509139b44536b5f0764114bc8a2fa8',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Modal Dialog (#681)',
                        updatedAt: '2022-04-07T23:05:12.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'modal-dialog'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '957',
                        title: 'Radio Group Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: '0063eecc19509139b44536b5f0764114bc8a2fa8',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Modal Dialog (#681)',
                        updatedAt: '2022-04-07T23:05:12.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '880',
                        title: 'Combobox with Both List and Inline Autocomplete Example',
                        phase: 'RD',
                        gitSha: 'e80d3b771971018a668ad54987e2841392f29180',
                        gitMessage: 'Bump eslint from 7.32.0 to 8.12.0 (#669)',
                        updatedAt: '2022-03-29T16:50:18.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-autocomplete-both-updated'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '832',
                        title: 'Action Menu Button Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-actions-active-descendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '831',
                        title: 'Action Menu Button Example Using element.focus()',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-actions'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '815',
                        title: 'Alert Example',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'alert'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '816',
                        title: 'Banner Landmark',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'banner'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '817',
                        title: 'Breadcrumb Example',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '819',
                        title: 'Checkbox Example (Mixed-State)',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'checkbox-tri-state'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '818',
                        title: 'Checkbox Example (Two State)',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'checkbox'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '829',
                        title: 'Color Viewer Slider',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'horizontal-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '820',
                        title: 'Combobox with Both List and Inline Autocomplete Example',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-autocomplete-both-updated'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '822',
                        title: 'Command Button Example',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'command-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '823',
                        title: 'Complementary Landmark',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'complementary'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '824',
                        title: 'Contentinfo Landmark',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'contentinfo'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '835',
                        title: 'Data Grid Example 1: Minimal Data Grid',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'minimal-data-grid'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '825',
                        title: 'Date Picker Spin Button Example',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'datepicker-spin-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '827',
                        title: 'Disclosure Navigation Menu Example',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-navigation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '826',
                        title: 'Disclosure of Answers to Frequently Asked Questions Example',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-faq'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '833',
                        title: 'Editor Menubar Example',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menubar-editor'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '828',
                        title: 'Form Landmark',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'form'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '830',
                        title: 'Main Landmark',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'main'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '840',
                        title: 'Media Seek Slider',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'seek-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '834',
                        title: 'Meter',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'meter'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '836',
                        title: 'Modal Dialog Example',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'modal-dialog'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '838',
                        title: 'Radio Group Example Using Roving tabindex',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-roving-tabindex'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '837',
                        title: 'Radio Group Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '839',
                        title: 'Rating Slider',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'rating-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '821',
                        title: 'Select Only Combobox Example',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-select-only'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '841',
                        title: 'Switch Example',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'switch'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '842',
                        title: 'Tabs with Manual Activation',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'tabs-manual-activation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '843',
                        title: 'Toggle Button',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'toggle-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '844',
                        title: 'Vertical Temperature Slider',
                        phase: 'RD',
                        gitSha: 'e87df453e65be5c9ad25277b9293bf28f7a1cf2a',
                        gitMessage:
                            'Change "Insure" to "Ensure" in test instructions (#607)',
                        updatedAt: '2022-03-09T22:20:01.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'vertical-temperature-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '790',
                        title: 'Combobox with Both List and Inline Autocomplete Example',
                        phase: 'RD',
                        gitSha: '020a1b8f380a73efd277005c2e09f24864cb4a84',
                        gitMessage:
                            "Update review template to re-number tests' titles and buttons when filtered (#619)",
                        updatedAt: '2022-03-09T22:09:02.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-autocomplete-both-updated'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '805',
                        title: 'Data Grid Example 1: Minimal Data Grid',
                        phase: 'RD',
                        gitSha: '020a1b8f380a73efd277005c2e09f24864cb4a84',
                        gitMessage:
                            "Update review template to re-number tests' titles and buttons when filtered (#619)",
                        updatedAt: '2022-03-09T22:09:02.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'minimal-data-grid'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '791',
                        title: 'Select Only Combobox Example',
                        phase: 'RD',
                        gitSha: '020a1b8f380a73efd277005c2e09f24864cb4a84',
                        gitMessage:
                            "Update review template to re-number tests' titles and buttons when filtered (#619)",
                        updatedAt: '2022-03-09T22:09:02.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-select-only'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '560',
                        title: 'Main Landmark',
                        phase: 'RD',
                        gitSha: '4ed847af15a026c816f2841c1a15d32d466f0b1f',
                        gitMessage:
                            'Create tests for APG design pattern example: Main Landmark (#553)',
                        updatedAt: '2022-01-06T20:50:28.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'main'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '529',
                        title: 'Form Landmark',
                        phase: 'RD',
                        gitSha: '53792c2312ef05be97afcde0d30d3f9547a4cfe1',
                        gitMessage:
                            'Create tests for APG design pattern example: Form Landmark (#551)',
                        updatedAt: '2022-01-06T20:00:03.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'form'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '496',
                        title: 'Complementary Landmark',
                        phase: 'RD',
                        gitSha: '03b8747f557aeae01e25552cfe2016274bbd370d',
                        gitMessage:
                            'Create tests for APG design pattern example: Contentinfo Landmark (#549)',
                        updatedAt: '2022-01-05T23:03:13.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'complementary'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '497',
                        title: 'Contentinfo Landmark',
                        phase: 'RD',
                        gitSha: '03b8747f557aeae01e25552cfe2016274bbd370d',
                        gitMessage:
                            'Create tests for APG design pattern example: Contentinfo Landmark (#549)',
                        updatedAt: '2022-01-05T23:03:13.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'contentinfo'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '469',
                        title: 'Complementary Landmark',
                        phase: 'RD',
                        gitSha: '84b1d22b0d472cc4ecb4f42ae202e6138ddc338d',
                        gitMessage:
                            'Create tests for APG design pattern example: Complementary Landmark (#547)',
                        updatedAt: '2022-01-05T22:09:21.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'complementary'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '436',
                        title: 'Banner Landmark',
                        phase: 'RD',
                        gitSha: '0c61f715dcee5ee514abfdc1b1c7f09bbf46278d',
                        gitMessage:
                            'Revert "Update JAWS commands for banner landmark tests, in line with JAWS 2022 updates" (#602)',
                        updatedAt: '2022-01-05T00:09:54.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'banner'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '410',
                        title: 'Banner Landmark',
                        phase: 'RD',
                        gitSha: '781d6d4d59c5744866a7e477f17b5e4b2a13e640',
                        gitMessage:
                            'Create tests for APG design pattern example: Banner Landmark (#545)',
                        updatedAt: '2022-01-04T21:33:20.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'banner'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '404',
                        title: 'Media Seek Slider',
                        phase: 'RD',
                        gitSha: '22c9895bf274bf42dfa4f8dc73a034f60a19a0fc',
                        gitMessage:
                            'Create tests for APG design pattern example: Media Seek Slider (#488)',
                        updatedAt: '2022-01-04T19:20:46.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'seek-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '380',
                        title: 'Switch Example',
                        phase: 'RD',
                        gitSha: 'd3b6238973c464035b47db8d6e91b176faff4e3b',
                        gitMessage:
                            'Create tests for APG design pattern example: Switch (#543)',
                        updatedAt: '2022-01-04T15:55:50.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'switch'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '351',
                        title: 'Meter',
                        phase: 'RD',
                        gitSha: '0177f9e7db928553cd7fa2c0a71d1e7ff38fe519',
                        gitMessage:
                            'Create tests for APG design pattern example: meter (#571)',
                        updatedAt: '2022-01-03T23:38:49.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'meter'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '322',
                        title: 'Date Picker Spin Button Example',
                        phase: 'RD',
                        gitSha: '0483d7ea6ab524c3b41cdab4946bf77c1b20b4b7',
                        gitMessage:
                            'Create tests for APG design pattern example: Date Picker Spin Button (#411)',
                        updatedAt: '2022-01-03T16:27:56.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'datepicker-spin-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '302',
                        title: 'Disclosure Navigation Menu Example',
                        phase: 'RD',
                        gitSha: 'b2ceec7096f6bfc26fddcb3575091ba35ce2b0bc',
                        gitMessage:
                            'Remove Space from tests 45 and 46 in disclosure navigation test plan (#585)',
                        updatedAt: '2021-12-01T15:06:55.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-navigation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '281',
                        title: 'Disclosure Navigation Menu Example',
                        phase: 'DRAFT',
                        gitSha: 'ddb8b3fad0b416879022831d01c17c13e86f378f',
                        gitMessage:
                            'Fixes for disclosure navigation test plan feedback (attempt #2) (#583)',
                        updatedAt: '2021-11-30T14:51:28.000Z',
                        draftPhaseReachedAt: '2021-11-30T14:51:28.000Z',
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-navigation'
                        },
                        testPlanReports: [
                            {
                                id: '13',
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
                        id: '263',
                        title: 'Action Menu Button Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-actions-active-descendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '262',
                        title: 'Action Menu Button Example Using element.focus()',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-actions'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '252',
                        title: 'Alert Example',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'alert'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '253',
                        title: 'Breadcrumb Example',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '255',
                        title: 'Checkbox Example (Mixed-State)',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'checkbox-tri-state'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '254',
                        title: 'Checkbox Example (Two State)',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'checkbox'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '261',
                        title: 'Color Viewer Slider',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'horizontal-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '256',
                        title: 'Combobox with Both List and Inline Autocomplete Example',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-autocomplete-both-updated'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '258',
                        title: 'Command Button Example',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'command-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '265',
                        title: 'Data Grid Example 1: Minimal Data Grid',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'minimal-data-grid'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '260',
                        title: 'Disclosure Navigation Menu Example',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-navigation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '259',
                        title: 'Disclosure of Answers to Frequently Asked Questions Example',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-faq'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '264',
                        title: 'Editor Menubar Example',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menubar-editor'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '266',
                        title: 'Modal Dialog Example',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'modal-dialog'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '268',
                        title: 'Radio Group Example Using Roving tabindex',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-roving-tabindex'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '267',
                        title: 'Radio Group Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '269',
                        title: 'Rating Slider',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'rating-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '257',
                        title: 'Select Only Combobox Example',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-select-only'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '270',
                        title: 'Tabs with Manual Activation',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'tabs-manual-activation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '271',
                        title: 'Toggle Button',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'toggle-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '272',
                        title: 'Vertical Temperature Slider',
                        phase: 'RD',
                        gitSha: 'da10a207390c56d9a11e1e75fc9a1402ec6e95fd',
                        gitMessage: 'Metric Updates (#578)',
                        updatedAt: '2021-11-18T23:38:39.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'vertical-temperature-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '229',
                        title: 'Rating Slider',
                        phase: 'RD',
                        gitSha: 'fe266d9e34c4fbf640d05e1f4c491ff5d712dc3e',
                        gitMessage:
                            'Create tests for APG design pattern example: Rating Slider (#486)',
                        updatedAt: '2021-10-23T18:56:15.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'rating-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '202',
                        title: 'Color Viewer Slider',
                        phase: 'RD',
                        gitSha: '49e2a0005c08950c04eb28108d0c97ef6d60bb65',
                        gitMessage:
                            'Create tests for APG design pattern example: Color Viewer Slider (#414)',
                        updatedAt: '2021-10-23T17:58:15.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'horizontal-slider'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '176',
                        title: 'Breadcrumb Example',
                        phase: 'RD',
                        gitSha: 'd3bb97cdb437c431986c4d5f8f1fc83b841320af',
                        gitMessage:
                            'Breadcrumb: adding missing keys to keys.mjs (#541)',
                        updatedAt: '2021-10-23T17:05:15.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '158',
                        title: 'Breadcrumb Example',
                        phase: 'RD',
                        gitSha: 'a2434b1e04d0e97b056030cd9e7dddefc7925de4',
                        gitMessage:
                            'Breadcrumb: fix misquoted strings in commands.csv (#540)',
                        updatedAt: '2021-10-22T19:54:44.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '138',
                        title: 'Toggle Button',
                        phase: 'RD',
                        gitSha: '083d3298aa473985511b28265ae476ec5410da7a',
                        gitMessage: 'Add .eslintcache to .gitignore (#533)',
                        updatedAt: '2021-10-20T18:41:35.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'toggle-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '68',
                        title: 'Breadcrumb Example',
                        phase: 'RD',
                        gitSha: '9ccc78883e36d3372225371a6572a10bc90959ef',
                        gitMessage:
                            'Add Alert and Breadcrumb test plan titles (#529)',
                        updatedAt: '2021-10-15T21:23:29.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '33',
                        title: 'Alert Example',
                        phase: 'RD',
                        gitSha: 'd64123608778bbe0b2f1ff86e67c65a5bb4f26ac',
                        gitMessage:
                            'Create tests for APG design pattern example: Alert (#427)',
                        updatedAt: '2021-10-15T19:44:12.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'alert'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '9',
                        title: 'Action Menu Button Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-actions-active-descendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '8',
                        title: 'Action Menu Button Example Using element.focus()',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-actions'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '2',
                        title: 'Checkbox Example (Mixed-State)',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'checkbox-tri-state'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '1',
                        title: 'Checkbox Example (Two State)',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'checkbox'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '3',
                        title: 'Combobox with Both List and Inline Autocomplete Example',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-autocomplete-both-updated'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '5',
                        title: 'Command Button Example',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'command-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '11',
                        title: 'Data Grid Example 1: Minimal Data Grid',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'minimal-data-grid'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '7',
                        title: 'Disclosure Navigation Menu Example',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-navigation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '6',
                        title: 'Disclosure of Answers to Frequently Asked Questions Example',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-faq'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '10',
                        title: 'Editor Menubar Example',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menubar-editor'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '12',
                        title: 'Modal Dialog Example',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'modal-dialog'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '14',
                        title: 'Radio Group Example Using Roving tabindex',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-roving-tabindex'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '13',
                        title: 'Radio Group Example Using aria-activedescendant',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '4',
                        title: 'Select Only Combobox Example',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'combobox-select-only'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '15',
                        title: 'Tabs with Manual Activation',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'tabs-manual-activation'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '16',
                        title: 'Toggle Button',
                        phase: 'RD',
                        gitSha: '091420a186f267d6ed8f581dc0e8e168d194e709',
                        gitMessage:
                            'Add title reference field to each test plan (#521)',
                        updatedAt: '2021-10-13T15:20:58.000Z',
                        draftPhaseReachedAt: null,
                        candidatePhaseReachedAt: null,
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'toggle-button'
                        },
                        testPlanReports: []
                    },
                    {
                        id: '2375',
                        title: 'Action Menu Button Example Using aria-activedescendant',
                        phase: 'CANDIDATE',
                        gitSha: '1bb257e726852ece05c6334921860aa000b5e79e',
                        gitMessage: 'Update cg and wg references in readme',
                        updatedAt: '2023-04-13T16:22:06.000Z',
                        draftPhaseReachedAt: '2023-04-13T16:22:06.000Z',
                        candidatePhaseReachedAt: '2023-07-25T18:42:58.583Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-actions-active-descendant'
                        },
                        testPlanReports: [
                            {
                                id: '201',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '200',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '199',
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
                        id: '2346',
                        title: 'Radio Group Example Using aria-activedescendant',
                        phase: 'CANDIDATE',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        updatedAt: '2023-04-10T18:22:22.000Z',
                        draftPhaseReachedAt: '2023-04-10T18:22:22.000Z',
                        candidatePhaseReachedAt: '2022-04-10T00:00:00.000Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        testPlanReports: [
                            {
                                id: '183',
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
                                id: '181',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '180',
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '179',
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
                                id: '178',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '177',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
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
                        id: '1890',
                        title: 'Alert Example',
                        phase: 'CANDIDATE',
                        gitSha: '0928bcf530efcf4faa677285439701537674e014',
                        gitMessage:
                            'Alert and Radiogroup/activedescendent updates (#865)',
                        updatedAt: '2022-12-08T21:47:42.000Z',
                        draftPhaseReachedAt: '2022-12-08T21:47:42.000Z',
                        candidatePhaseReachedAt: '2022-04-10T00:00:00.000Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'alert'
                        },
                        testPlanReports: [
                            {
                                id: '176',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: []
                            },
                            {
                                id: '175',
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
                                id: '174',
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '156',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '155',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '154',
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
                        id: '1870',
                        title: 'Disclosure Navigation Menu Example',
                        phase: 'CANDIDATE',
                        gitSha: '179ba0f438aaa5781b3ec8a4033d6bf9f757360b',
                        gitMessage:
                            'Delete up arrow command for VoiceOver when navigating backwards to a disclosure button (#845)',
                        updatedAt: '2022-10-31T19:29:17.000Z',
                        draftPhaseReachedAt: '2022-10-31T19:29:17.000Z',
                        candidatePhaseReachedAt: '2022-04-10T00:00:00.000Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'disclosure-navigation'
                        },
                        testPlanReports: [
                            {
                                id: '198',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '197',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '196',
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
                        id: '1241',
                        title: 'Modal Dialog Example',
                        phase: 'CANDIDATE',
                        gitSha: 'd0e16b42179de6f6c070da2310e99de837c71215',
                        gitMessage:
                            'Delete down arrow command for navigating to the beginning of a dialog with JAWS and add the ESC command to exit forms or focus mode (#759)',
                        updatedAt: '2022-06-22T17:56:16.000Z',
                        draftPhaseReachedAt: '2022-06-22T17:56:16.000Z',
                        candidatePhaseReachedAt: '2022-04-10T00:00:00.000Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'modal-dialog'
                        },
                        testPlanReports: [
                            {
                                id: '193',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: []
                            },
                            {
                                id: '190',
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
                                id: '184',
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '159',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '87',
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
                                id: '86',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '85',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
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
                        id: '1205',
                        title: 'Navigation Menu Button',
                        phase: 'CANDIDATE',
                        gitSha: 'ecf05f484292189789f4db8b1ec41b19db38e567',
                        gitMessage:
                            'Tasks 4, 5 and 6: corrected link name "Navigate backwards from here" (#734)',
                        updatedAt: '2022-05-26T16:14:17.000Z',
                        draftPhaseReachedAt: '2022-05-26T16:14:17.000Z',
                        candidatePhaseReachedAt: '2022-04-10T00:00:00.000Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'menu-button-navigation'
                        },
                        testPlanReports: [
                            {
                                id: '194',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: []
                            },
                            {
                                id: '191',
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
                                id: '187',
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '73',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '72',
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
                                id: '71',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
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
                        id: '1184',
                        title: 'Toggle Button',
                        phase: 'CANDIDATE',
                        gitSha: '9d53c205c877970620ff5a13afb1e410ff6f1652',
                        gitMessage:
                            'Add separated tests for navigating to next and previous checked and unchecked radio buttons (macOS VoiceOver) (#717)',
                        updatedAt: '2022-05-18T21:08:05.000Z',
                        draftPhaseReachedAt: '2022-05-18T21:08:05.000Z',
                        candidatePhaseReachedAt: '2022-04-10T00:00:00.000Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'toggle-button'
                        },
                        testPlanReports: [
                            {
                                id: '166',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: []
                            },
                            {
                                id: '164',
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
                                id: '162',
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '147',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '146',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '145',
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
                                id: '81',
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
                                id: '80',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '79',
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
                        id: '1009',
                        title: 'Color Viewer Slider',
                        phase: 'CANDIDATE',
                        gitSha: '1c6ef2fbef5fc056c622c802bebedaa14f2c8d40',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Color Viewer Slider (#686)',
                        updatedAt: '2022-04-14T18:06:40.000Z',
                        draftPhaseReachedAt: '2022-04-14T18:06:40.000Z',
                        candidatePhaseReachedAt: '2022-04-10T00:00:00.000Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'horizontal-slider'
                        },
                        testPlanReports: [
                            {
                                id: '195',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: []
                            },
                            {
                                id: '192',
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
                                id: '188',
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '161',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '65',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '52',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '44',
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
                        id: '1010',
                        title: 'Link Example 1 (span element with text content)',
                        phase: 'CANDIDATE',
                        gitSha: '1c6ef2fbef5fc056c622c802bebedaa14f2c8d40',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Color Viewer Slider (#686)',
                        updatedAt: '2022-04-14T18:06:40.000Z',
                        draftPhaseReachedAt: '2022-04-14T18:06:40.000Z',
                        candidatePhaseReachedAt: '2022-04-10T00:00:00.000Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'link-span-text'
                        },
                        testPlanReports: [
                            {
                                id: '173',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: []
                            },
                            {
                                id: '172',
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
                                id: '171',
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '150',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '149',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '148',
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
                                id: '58',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '50',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '48',
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
                        id: '972',
                        title: 'Command Button Example',
                        phase: 'CANDIDATE',
                        gitSha: '9904e0e67d156d433ab3cc0a96d6e805e94f22e1',
                        gitMessage:
                            'Create updated tests for APG design pattern example: Toggle Button (#684)',
                        updatedAt: '2022-04-08T19:51:30.000Z',
                        draftPhaseReachedAt: '2022-04-08T19:51:30.000Z',
                        candidatePhaseReachedAt: '2022-04-10T00:00:00.000Z',
                        recommendedPhaseReachedAt: null,
                        testPlan: {
                            directory: 'command-button'
                        },
                        testPlanReports: [
                            {
                                id: '167',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '1',
                                    name: 'Firefox'
                                },
                                issues: []
                            },
                            {
                                id: '165',
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
                                id: '163',
                                at: {
                                    id: '3',
                                    name: 'VoiceOver for macOS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '153',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '152',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '151',
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
                                id: '59',
                                at: {
                                    id: '1',
                                    name: 'JAWS'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '57',
                                at: {
                                    id: '2',
                                    name: 'NVDA'
                                },
                                browser: {
                                    id: '2',
                                    name: 'Chrome'
                                },
                                issues: []
                            },
                            {
                                id: '49',
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
                    }
                ]
            }
        }
    }
];
