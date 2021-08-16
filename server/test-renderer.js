const input = {
    testPageUri:
        'https://w3c.github.io/aria-at/build/tests/checkbox/reference/2020-11-23_175030/checkbox-1/checkbox-1.html',
    title: 'Navigate to an unchecked checkbox in reading mode',
    support: {
        ats: [
            {
                name: 'JAWS',
                key: 'jaws'
            },
            {
                name: 'NVDA',
                key: 'nvda'
            },
            {
                name: 'VoiceOver for macOS',
                key: 'voiceover_macos'
            }
        ],
        applies_to: {
            'Desktop Screen Readers': ['VoiceOver for macOS', 'NVDA', 'JAWS'],
            'Screen Readers': ['VoiceOver for macOS', 'NVDA', 'JAWS']
        },
        examples: [
            {
                directory: 'checkbox',
                name: 'Checkbox Example (Two State)'
            },
            {
                directory: 'menubar-editor',
                name: 'Editor Menubar Example'
            }
        ]
    },
    configQueryParams: [['at', 'nvda']],
    commands: {
        'navigate to unchecked checkbox': {
            reading: {
                jaws: [
                    ['X_AND_SHIFT_X'],
                    ['F_AND_SHIFT_F'],
                    ['TAB_AND_SHIFT_TAB'],
                    ['UP_AND_DOWN'],
                    ['LEFT_AND_RIGHT', '(with Smart Navigation on)']
                ],
                nvda: [
                    ['X_AND_SHIFT_X'],
                    ['F_AND_SHIFT_F'],
                    ['TAB_AND_SHIFT_TAB'],
                    ['UP_AND_DOWN']
                ]
            },
            interaction: {
                jaws: [['TAB_AND_SHIFT_TAB']],
                nvda: [['TAB_AND_SHIFT_TAB']],
                voiceover_macos: [
                    ['TAB_AND_SHIFT_TAB'],
                    ['CTRL_OPT_RIGHT_AND_CTRL_OPT_LEFT'],
                    ['CTRL_OPT_CMD_J_AND_SHIFT_CTRL_OPT_CMD_J']
                ]
            }
        }
    },
    behavior: {
        setup_script_description: '',
        setupTestPage: '',
        applies_to: ['jaws', 'nvda'],
        mode: 'reading',
        task: 'navigate to unchecked checkbox',
        specific_user_instruction:
            'Navigate to the first checkbox. Note: it should be in the unchecked state.',
        output_assertions: [
            ['1', "Role 'checkbox' is conveyed"],
            ['1', "Name 'Lettuce' is conveyed"],
            ['1', 'State of the checkbox (not checked) is conveyed']
        ]
    }
};

const results = {
    results: {
        header: 'Navigate to an unchecked checkbox in reading mode',
        status: {
            header: ['Test result: ', 'PASS']
        },
        table: {
            headers: {
                description: 'Command',
                support: 'Support',
                details: 'Details'
            },
            commands: [
                {
                    description: 'X / Shift+X',
                    support: 'FULL',
                    details: {
                        output: [
                            'output:',
                            {
                                whitespace: 'lineBreak'
                            },
                            ' ',
                            'vsdv'
                        ],
                        passingAssertions: {
                            description: 'Passing Assertions:',
                            items: [
                                "Role 'checkbox' is conveyed",
                                "Name 'Lettuce' is conveyed",
                                'State of the checkbox (not checked) is conveyed'
                            ]
                        },
                        failingAssertions: {
                            description: 'Failing Assertions:',
                            items: ['No failing assertions.']
                        },
                        unexpectedBehaviors: {
                            description: 'Unexpected Behavior',
                            items: ['No unexpect behaviors.']
                        }
                    }
                }
            ]
        }
    },
    resultsJSON: {
        test: 'Navigate to an unchecked checkbox in reading mode',
        details: {
            name: 'Navigate to an unchecked checkbox in reading mode',
            task: 'navigate to unchecked checkbox',
            specific_user_instruction:
                'Navigate to the first checkbox. Note: it should be in the unchecked state.',
            summary: {
                '1': {
                    pass: 3,
                    fail: 0
                },
                '2': {
                    pass: 0,
                    fail: 0
                },
                unexpectedCount: 0
            },
            commands: [
                {
                    command: 'X / Shift+X',
                    output: 'vsdv',
                    support: 'FULL',
                    assertions: [
                        {
                            assertion: "Role 'checkbox' is conveyed",
                            priority: '1',
                            pass: 'Good Output'
                        },
                        {
                            assertion: "Name 'Lettuce' is conveyed",
                            priority: '1',
                            pass: 'Good Output'
                        },
                        {
                            assertion:
                                'State of the checkbox (not checked) is conveyed',
                            priority: '1',
                            pass: 'Good Output'
                        }
                    ],
                    unexpected_behaviors: []
                }
            ]
        },
        status: 'PASS'
    }
};

const state = {
    errors: [],
    info: {
        description: 'Navigate to an unchecked checkbox in reading mode',
        task: 'navigate to unchecked checkbox',
        mode: 'reading',
        modeInstructions:
            'Insure NVDA is in browse mode by pressing Escape. Note: This command has no effect if NVDA is already in browse mode.',
        userInstructions: [
            'Navigate to the first checkbox. Note: it should be in the unchecked state.'
        ],
        setupScriptDescription: ''
    },
    config: {
        at: {
            name: 'NVDA',
            key: 'nvda'
        },
        displaySubmitButton: true,
        renderResultsAfterSubmit: true
    },
    currentUserAction: 'loadPage',
    openTest: {
        enabled: true
    },
    commands: [
        {
            description: 'X / Shift+X',
            atOutput: {
                highlightRequired: false,
                value: ''
            },
            assertions: [
                {
                    description: "Role 'checkbox' is conveyed",
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                },
                {
                    description: "Name 'Lettuce' is conveyed",
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                },
                {
                    description:
                        'State of the checkbox (not checked) is conveyed',
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                }
            ],
            additionalAssertions: [],
            unexpected: {
                highlightRequired: false,
                hasUnexpected: 'notSet',
                tabbedBehavior: 0,
                behaviors: [
                    {
                        description:
                            'Output is excessively verbose, e.g., includes redundant and/or irrelevant speech',
                        checked: false,
                        more: null
                    },
                    {
                        description:
                            'Reading cursor position changed in an unexpected manner',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Screen reader became extremely sluggish',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Screen reader crashed',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Browser crashed',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Other',
                        checked: false,
                        more: {
                            highlightRequired: false,
                            value: ''
                        }
                    }
                ]
            }
        },
        {
            description: 'F / Shift+F',
            atOutput: {
                highlightRequired: false,
                value: ''
            },
            assertions: [
                {
                    description: "Role 'checkbox' is conveyed",
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                },
                {
                    description: "Name 'Lettuce' is conveyed",
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                },
                {
                    description:
                        'State of the checkbox (not checked) is conveyed',
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                }
            ],
            additionalAssertions: [],
            unexpected: {
                highlightRequired: false,
                hasUnexpected: 'notSet',
                tabbedBehavior: 0,
                behaviors: [
                    {
                        description:
                            'Output is excessively verbose, e.g., includes redundant and/or irrelevant speech',
                        checked: false,
                        more: null
                    },
                    {
                        description:
                            'Reading cursor position changed in an unexpected manner',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Screen reader became extremely sluggish',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Screen reader crashed',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Browser crashed',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Other',
                        checked: false,
                        more: {
                            highlightRequired: false,
                            value: ''
                        }
                    }
                ]
            }
        },
        {
            description: 'Tab / Shift+Tab',
            atOutput: {
                highlightRequired: false,
                value: ''
            },
            assertions: [
                {
                    description: "Role 'checkbox' is conveyed",
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                },
                {
                    description: "Name 'Lettuce' is conveyed",
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                },
                {
                    description:
                        'State of the checkbox (not checked) is conveyed',
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                }
            ],
            additionalAssertions: [],
            unexpected: {
                highlightRequired: false,
                hasUnexpected: 'notSet',
                tabbedBehavior: 0,
                behaviors: [
                    {
                        description:
                            'Output is excessively verbose, e.g., includes redundant and/or irrelevant speech',
                        checked: false,
                        more: null
                    },
                    {
                        description:
                            'Reading cursor position changed in an unexpected manner',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Screen reader became extremely sluggish',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Screen reader crashed',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Browser crashed',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Other',
                        checked: false,
                        more: {
                            highlightRequired: false,
                            value: ''
                        }
                    }
                ]
            }
        },
        {
            description: 'Up Arrow / Down Arrow',
            atOutput: {
                highlightRequired: false,
                value: ''
            },
            assertions: [
                {
                    description: "Role 'checkbox' is conveyed",
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                },
                {
                    description: "Name 'Lettuce' is conveyed",
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                },
                {
                    description:
                        'State of the checkbox (not checked) is conveyed',
                    highlightRequired: false,
                    priority: 1,
                    result: 'notSet'
                }
            ],
            additionalAssertions: [],
            unexpected: {
                highlightRequired: false,
                hasUnexpected: 'notSet',
                tabbedBehavior: 0,
                behaviors: [
                    {
                        description:
                            'Output is excessively verbose, e.g., includes redundant and/or irrelevant speech',
                        checked: false,
                        more: null
                    },
                    {
                        description:
                            'Reading cursor position changed in an unexpected manner',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Screen reader became extremely sluggish',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Screen reader crashed',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Browser crashed',
                        checked: false,
                        more: null
                    },
                    {
                        description: 'Other',
                        checked: false,
                        more: {
                            highlightRequired: false,
                            value: ''
                        }
                    }
                ]
            }
        }
    ]
};

// eslint-disable-next-line
console.log(input, state, results);
