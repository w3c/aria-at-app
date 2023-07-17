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
                        title: 'Alert Example',
                        latestTestPlanVersion: {
                            id: '1',
                            title: 'Alert Example'
                        }
                    },
                    {
                        directory: 'banner',
                        id: 'banner',
                        title: 'Banner Landmark',
                        latestTestPlanVersion: {
                            id: '2',
                            title: 'Banner Landmark'
                        }
                    },
                    {
                        directory: 'breadcrumb',
                        id: 'breadcrumb',
                        title: 'Breadcrumb Example',
                        latestTestPlanVersion: {
                            id: '3',
                            title: 'Breadcrumb Example'
                        }
                    },
                    {
                        directory: 'checkbox',
                        id: 'checkbox',
                        title: 'Checkbox Example (Two State)',
                        latestTestPlanVersion: {
                            id: '4',
                            title: 'Checkbox Example (Two State)'
                        }
                    },
                    {
                        directory: 'checkbox-tri-state',
                        id: 'checkbox-tri-state',
                        title: 'Checkbox Example (Mixed-State)',
                        latestTestPlanVersion: {
                            id: '5',
                            title: 'Checkbox Example (Mixed-State)'
                        }
                    },
                    {
                        directory: 'combobox-autocomplete-both-updated',
                        id: 'combobox-autocomplete-both-updated',
                        title: 'Combobox with Both List and Inline Autocomplete Example',
                        latestTestPlanVersion: {
                            id: '6',
                            title: 'Combobox with Both List and Inline Autocomplete Example'
                        }
                    },
                    {
                        directory: 'combobox-select-only',
                        id: 'combobox-select-only',
                        title: 'Select Only Combobox Example',
                        latestTestPlanVersion: {
                            id: '7',
                            title: 'Select Only Combobox Example'
                        }
                    },
                    {
                        directory: 'command-button',
                        id: 'command-button',
                        title: 'Command Button Example',
                        latestTestPlanVersion: {
                            id: '8',
                            title: 'Command Button Example'
                        }
                    },
                    {
                        directory: 'complementary',
                        id: 'complementary',
                        title: 'Complementary Landmark',
                        latestTestPlanVersion: {
                            id: '9',
                            title: 'Complementary Landmark'
                        }
                    },
                    {
                        directory: 'contentinfo',
                        id: 'contentinfo',
                        title: 'Contentinfo Landmark',
                        latestTestPlanVersion: {
                            id: '10',
                            title: 'Contentinfo Landmark'
                        }
                    },
                    {
                        directory: 'datepicker-spin-button',
                        id: 'datepicker-spin-button',
                        title: 'Date Picker Spin Button Example',
                        latestTestPlanVersion: {
                            id: '11',
                            title: 'Date Picker Spin Button Example'
                        }
                    },
                    {
                        directory: 'disclosure-faq',
                        id: 'disclosure-faq',
                        title: 'Disclosure of Answers to Frequently Asked Questions Example',
                        latestTestPlanVersion: {
                            id: '12',
                            title: 'Disclosure of Answers to Frequently Asked Questions Example'
                        }
                    },
                    {
                        directory: 'disclosure-navigation',
                        id: 'disclosure-navigation',
                        title: 'Disclosure Navigation Menu Example',
                        latestTestPlanVersion: {
                            id: '13',
                            title: 'Disclosure Navigation Menu Example'
                        }
                    },
                    {
                        directory: 'form',
                        id: 'form',
                        title: 'Form Landmark',
                        latestTestPlanVersion: {
                            id: '14',
                            title: 'Form Landmark'
                        }
                    },
                    {
                        directory: 'horizontal-slider',
                        id: 'horizontal-slider',
                        title: 'Color Viewer Slider',
                        latestTestPlanVersion: {
                            id: '15',
                            title: 'Color Viewer Slider'
                        }
                    },
                    {
                        directory: 'link-css',
                        id: 'link-css',
                        title: 'Link Example 3 (CSS :before content property on a span element)',
                        latestTestPlanVersion: {
                            id: '16',
                            title: 'Link Example 3 (CSS :before content property on a span element)'
                        }
                    },
                    {
                        directory: 'link-img-alt',
                        id: 'link-img-alt',
                        title: 'Link Example 2 (img element with alt attribute)',
                        latestTestPlanVersion: {
                            id: '17',
                            title: 'Link Example 2 (img element with alt attribute)'
                        }
                    },
                    {
                        directory: 'link-span-text',
                        id: 'link-span-text',
                        title: 'Link Example 1 (span element with text content)',
                        latestTestPlanVersion: {
                            id: '18',
                            title: 'Link Example 1 (span element with text content)'
                        }
                    },
                    {
                        directory: 'main',
                        id: 'main',
                        title: 'Main Landmark',
                        latestTestPlanVersion: {
                            id: '19',
                            title: 'Main Landmark'
                        }
                    },
                    {
                        directory: 'menu-button-actions',
                        id: 'menu-button-actions',
                        title: 'Action Menu Button Example Using element.focus()',
                        latestTestPlanVersion: {
                            id: '20',
                            title: 'Action Menu Button Example Using element.focus()'
                        }
                    },
                    {
                        directory: 'menu-button-actions-active-descendant',
                        id: 'menu-button-actions-active-descendant',
                        title: 'Action Menu Button Example Using aria-activedescendant',
                        latestTestPlanVersion: {
                            id: '21',
                            title: 'Action Menu Button Example Using aria-activedescendant'
                        }
                    },
                    {
                        directory: 'menu-button-navigation',
                        id: 'menu-button-navigation',
                        title: 'Navigation Menu Button',
                        latestTestPlanVersion: {
                            id: '22',
                            title: 'Navigation Menu Button'
                        }
                    },
                    {
                        directory: 'menubar-editor',
                        id: 'menubar-editor',
                        title: 'Editor Menubar Example',
                        latestTestPlanVersion: {
                            id: '23',
                            title: 'Editor Menubar Example'
                        }
                    },
                    {
                        directory: 'meter',
                        id: 'meter',
                        title: 'Meter',
                        latestTestPlanVersion: {
                            id: '24',
                            title: 'Meter'
                        }
                    },
                    {
                        directory: 'minimal-data-grid',
                        id: 'minimal-data-grid',
                        title: 'Data Grid Example 1: Minimal Data Grid',
                        latestTestPlanVersion: {
                            id: '25',
                            title: 'Data Grid Example 1: Minimal Data Grid'
                        }
                    },
                    {
                        directory: 'modal-dialog',
                        id: 'modal-dialog',
                        title: 'Modal Dialog Example',
                        latestTestPlanVersion: {
                            id: '26',
                            title: 'Modal Dialog Example'
                        }
                    },
                    {
                        directory: 'radiogroup-aria-activedescendant',
                        id: 'radiogroup-aria-activedescendant',
                        title: 'Radio Group Example Using aria-activedescendant',
                        latestTestPlanVersion: {
                            id: '27',
                            title: 'Radio Group Example Using aria-activedescendant'
                        }
                    },
                    {
                        directory: 'radiogroup-roving-tabindex',
                        id: 'radiogroup-roving-tabindex',
                        title: 'Radio Group Example Using Roving tabindex',
                        latestTestPlanVersion: {
                            id: '28',
                            title: 'Radio Group Example Using Roving tabindex'
                        }
                    },
                    {
                        directory: 'rating-slider',
                        id: 'rating-slider',
                        title: 'Rating Slider',
                        latestTestPlanVersion: {
                            id: '29',
                            title: 'Rating Slider'
                        }
                    },
                    {
                        directory: 'seek-slider',
                        id: 'seek-slider',
                        title: 'Media Seek Slider',
                        latestTestPlanVersion: {
                            id: '30',
                            title: 'Media Seek Slider'
                        }
                    },
                    {
                        directory: 'slider-multithumb',
                        id: 'slider-multithumb',
                        title: 'Horizontal Multi-Thumb Slider',
                        latestTestPlanVersion: {
                            id: '31',
                            title: 'Horizontal Multi-Thumb Slider'
                        }
                    },
                    {
                        directory: 'switch',
                        id: 'switch',
                        title: 'Switch Example',
                        latestTestPlanVersion: {
                            id: '32',
                            title: 'Switch Example'
                        }
                    },
                    {
                        directory: 'tabs-manual-activation',
                        id: 'tabs-manual-activation',
                        title: 'Tabs with Manual Activation',
                        latestTestPlanVersion: {
                            id: '33',
                            title: 'Tabs with Manual Activation'
                        }
                    },
                    {
                        directory: 'toggle-button',
                        id: 'toggle-button',
                        title: 'Toggle Button',
                        latestTestPlanVersion: {
                            id: '34',
                            title: 'Toggle Button'
                        }
                    },
                    {
                        directory: 'vertical-temperature-slider',
                        id: 'vertical-temperature-slider',
                        title: 'Vertical Temperature Slider',
                        latestTestPlanVersion: {
                            id: '35',
                            title: 'Vertical Temperature Slider'
                        }
                    }
                ],
                testPlanVersions: [
                    {
                        id: '21',
                        title: 'Action Menu Button Example Using aria-activedescendant',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'menu-button-actions-active-descendant'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '20',
                        title: 'Action Menu Button Example Using element.focus()',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'menu-button-actions'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '1',
                        title: 'Alert Example',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'alert'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '2',
                        title: 'Banner Landmark',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'banner'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '3',
                        title: 'Breadcrumb Example',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'breadcrumb'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '5',
                        title: 'Checkbox Example (Mixed-State)',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'checkbox-tri-state'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '4',
                        title: 'Checkbox Example (Two State)',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'checkbox'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '15',
                        title: 'Color Viewer Slider',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'horizontal-slider'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '6',
                        title: 'Combobox with Both List and Inline Autocomplete Example',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'combobox-autocomplete-both-updated'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '8',
                        title: 'Command Button Example',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'command-button'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '9',
                        title: 'Complementary Landmark',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'complementary'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '10',
                        title: 'Contentinfo Landmark',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'contentinfo'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '25',
                        title: 'Data Grid Example 1: Minimal Data Grid',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'minimal-data-grid'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '11',
                        title: 'Date Picker Spin Button Example',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'datepicker-spin-button'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '13',
                        title: 'Disclosure Navigation Menu Example',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'disclosure-navigation'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '12',
                        title: 'Disclosure of Answers to Frequently Asked Questions Example',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'disclosure-faq'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '23',
                        title: 'Editor Menubar Example',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'menubar-editor'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '14',
                        title: 'Form Landmark',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'form'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '31',
                        title: 'Horizontal Multi-Thumb Slider',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'slider-multithumb'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '18',
                        title: 'Link Example 1 (span element with text content)',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'link-span-text'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '17',
                        title: 'Link Example 2 (img element with alt attribute)',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'link-img-alt'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '16',
                        title: 'Link Example 3 (CSS :before content property on a span element)',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'link-css'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '19',
                        title: 'Main Landmark',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'main'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '30',
                        title: 'Media Seek Slider',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'seek-slider'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '24',
                        title: 'Meter',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'meter'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '26',
                        title: 'Modal Dialog Example',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'modal-dialog'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '22',
                        title: 'Navigation Menu Button',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'menu-button-navigation'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '28',
                        title: 'Radio Group Example Using Roving tabindex',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'radiogroup-roving-tabindex'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '27',
                        title: 'Radio Group Example Using aria-activedescendant',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'radiogroup-aria-activedescendant'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '29',
                        title: 'Rating Slider',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'rating-slider'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '7',
                        title: 'Select Only Combobox Example',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'combobox-select-only'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '32',
                        title: 'Switch Example',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'switch'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '33',
                        title: 'Tabs with Manual Activation',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'tabs-manual-activation'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '34',
                        title: 'Toggle Button',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'toggle-button'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    },
                    {
                        id: '35',
                        title: 'Vertical Temperature Slider',
                        gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                        gitMessage:
                            'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                        testPlan: {
                            directory: 'vertical-temperature-slider'
                        },
                        updatedAt: '2023-04-10T18:22:22.000Z'
                    }
                ],
                testPlanReports: [
                    {
                        id: '2',
                        status: 'DRAFT',
                        at: {
                            id: '2',
                            name: 'NVDA'
                        },
                        latestAtVersionReleasedAt: {
                            id: '2',
                            name: '2020.4',
                            releasedAt: '2021-02-19T05:00:00.000Z'
                        },
                        browser: {
                            id: '1',
                            name: 'Firefox'
                        },
                        testPlanVersion: {
                            id: '7',
                            title: 'Select Only Combobox Example',
                            gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                            gitMessage:
                                'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                            testPlan: {
                                directory: 'combobox-select-only'
                            },
                            updatedAt: '2023-04-10T18:22:22.000Z'
                        }
                    },
                    {
                        id: '4',
                        status: 'CANDIDATE',
                        at: {
                            id: '2',
                            name: 'NVDA'
                        },
                        latestAtVersionReleasedAt: {
                            id: '2',
                            name: '2020.4',
                            releasedAt: '2021-02-19T05:00:00.000Z'
                        },
                        browser: {
                            id: '1',
                            name: 'Firefox'
                        },
                        testPlanVersion: {
                            id: '26',
                            title: 'Modal Dialog Example',
                            gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                            gitMessage:
                                'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                            testPlan: {
                                directory: 'modal-dialog'
                            },
                            updatedAt: '2023-04-10T18:22:22.000Z'
                        }
                    },
                    {
                        id: '3',
                        status: 'CANDIDATE',
                        at: {
                            id: '1',
                            name: 'JAWS'
                        },
                        latestAtVersionReleasedAt: {
                            id: '1',
                            name: '2021.2111.13',
                            releasedAt: '2021-11-01T04:00:00.000Z'
                        },
                        browser: {
                            id: '2',
                            name: 'Chrome'
                        },
                        testPlanVersion: {
                            id: '26',
                            title: 'Modal Dialog Example',
                            gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                            gitMessage:
                                'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                            testPlan: {
                                directory: 'modal-dialog'
                            },
                            updatedAt: '2023-04-10T18:22:22.000Z'
                        }
                    },
                    {
                        id: '1',
                        status: 'DRAFT',
                        at: {
                            id: '1',
                            name: 'JAWS'
                        },
                        latestAtVersionReleasedAt: {
                            id: '1',
                            name: '2021.2111.13',
                            releasedAt: '2021-11-01T04:00:00.000Z'
                        },
                        browser: {
                            id: '2',
                            name: 'Chrome'
                        },
                        testPlanVersion: {
                            id: '34',
                            title: 'Toggle Button',
                            gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                            gitMessage:
                                'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                            testPlan: {
                                directory: 'toggle-button'
                            },
                            updatedAt: '2023-04-10T18:22:22.000Z'
                        }
                    },
                    {
                        id: '6',
                        status: 'CANDIDATE',
                        at: {
                            id: '3',
                            name: 'VoiceOver for macOS'
                        },
                        latestAtVersionReleasedAt: {
                            id: '3',
                            name: '11.6 (20G165)',
                            releasedAt: '2019-09-01T04:00:00.000Z'
                        },
                        browser: {
                            id: '3',
                            name: 'Safari'
                        },
                        testPlanVersion: {
                            id: '5',
                            title: 'Checkbox Example (Mixed-State)',
                            gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                            gitMessage:
                                'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                            testPlan: {
                                directory: 'checkbox-tri-state'
                            },
                            updatedAt: '2023-04-10T18:22:22.000Z'
                        }
                    },
                    {
                        id: '5',
                        status: 'CANDIDATE',
                        at: {
                            id: '3',
                            name: 'VoiceOver for macOS'
                        },
                        latestAtVersionReleasedAt: {
                            id: '3',
                            name: '11.6 (20G165)',
                            releasedAt: '2019-09-01T04:00:00.000Z'
                        },
                        browser: {
                            id: '3',
                            name: 'Safari'
                        },
                        testPlanVersion: {
                            id: '26',
                            title: 'Modal Dialog Example',
                            gitSha: '1768070bd68beefef29284b568d2da910b449c14',
                            gitMessage:
                                'Remove Tab and Shift+Tab from radiogroup tests when navigating out of the start and end of a radio group (reading mode and VoiceOver only) (#928)',
                            testPlan: {
                                directory: 'modal-dialog'
                            },
                            updatedAt: '2023-04-10T18:22:22.000Z'
                        }
                    }
                ]
            }
        }
    }
];
