const { hashTest, hashTests } = require('./aria');

describe('Verify test hashes are matching as expected', () => {
    it('should have a matching hash for with the same test, but with ids excluded for one', () => {
        const testHashA = hashTest(singleTest);
        const testHashB = hashTest(singleTestWithoutIds);

        expect(testHashA).toEqual(testHashB);
    });

    it('should have a matching hash with the same test, but having a changed id', () => {
        const testHashA = hashTest(singleTest);
        const testHashB = hashTest(singleTestWithChangedId);

        expect(testHashA).toEqual(testHashB);
    });

    it('should not have a matching has with the same test, but different test content (title)', () => {
        const testHashA = hashTest(singleTest);
        const testHashB = hashTest(singleTestWithChangedTitle);

        expect(testHashA).not.toEqual(testHashB);
    });

    it('should have matching hashes for collections of matching tests, but different ids', () => {
        const testsHashA = hashTests(testsWithInstructionsSayingInsureA);
        const testsHashB = hashTests(testsWithInstructionsSayingInsureB);

        expect(testsHashA).toEqual(testsHashB);
    });

    it('should not have matching hashes for collections of non-matching tests', () => {
        const testsHashA = hashTests(testsWithInstructionsSayingInsureA);
        const testsHashB = hashTests(testsWithInstructionsSayingEnsureA);

        expect(testsHashA).not.toEqual(testsHashB);
    });
});

// Based on Alert 252
const testsWithInstructionsSayingInsureA = [
    {
        id: 'NjJkOeyIyIjoiMjUyIn0GJkMG',
        atIds: [1, 2],
        title: 'Trigger an alert in reading mode',
        atMode: 'READING',
        viewers: [],
        rowNumber: '1',
        scenarios: [
            {
                id: 'ZTVhNeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9WVlNj',
                atId: 1,
                commandIds: ['SPACE']
            },
            {
                id: 'ZGY2NeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9TVlMz',
                atId: 1,
                commandIds: ['ENTER']
            },
            {
                id: 'YWIyMeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DIyYj',
                atId: 2,
                commandIds: ['SPACE']
            },
            {
                id: 'OWI0MeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ92RkMT',
                atId: 2,
                commandIds: ['ENTER']
            }
        ],
        assertions: [
            {
                id: 'MDEyZeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DIzZj',
                text: "Role 'alert' is conveyed",
                priority: 'REQUIRED'
            },
            {
                id: 'MjEyOeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DUwY2',
                text: "Text 'Hello' is conveyed",
                priority: 'REQUIRED'
            }
        ],
        renderedUrls: {
            1: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
            2: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-01-trigger-alert-reading-nvda.collected.html'
        },
        renderableContent: {
            1: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in reading mode',
                    testId: 1,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'jaws', raw: 'JAWS', name: 'JAWS' },
                    mode: 'reading',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                    user: [
                        "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            },
            2: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in reading mode',
                    testId: 1,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'nvda', raw: 'NVDA', name: 'NVDA' },
                    mode: 'reading',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Insure NVDA is in browse mode by pressing Escape. Note: This command has no effect if NVDA is already in browse mode.',
                    user: [
                        "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            }
        }
    },
    {
        id: 'ODE1YeyIyIjoiMjUyIn0TM2ND',
        atIds: [1, 2],
        title: 'Trigger an alert in interaction mode',
        atMode: 'INTERACTION',
        viewers: [],
        rowNumber: '2',
        scenarios: [
            {
                id: 'YzU3NeyIzIjoiT0RFMVlleUl5SWpvaU1qVXlJbjBUTTJORCJ9TJkZT',
                atId: 1,
                commandIds: ['SPACE']
            },
            {
                id: 'ZWQ1OeyIzIjoiT0RFMVlleUl5SWpvaU1qVXlJbjBUTTJORCJ9WExMT',
                atId: 1,
                commandIds: ['ENTER']
            },
            {
                id: 'MzI5YeyIzIjoiT0RFMVlleUl5SWpvaU1qVXlJbjBUTTJORCJ9TFhOD',
                atId: 2,
                commandIds: ['SPACE']
            },
            {
                id: 'ZjgzNeyIzIjoiT0RFMVlleUl5SWpvaU1qVXlJbjBUTTJORCJ9WE4OT',
                atId: 2,
                commandIds: ['ENTER']
            }
        ],
        assertions: [
            {
                id: 'NGIwNeyIzIjoiT0RFMVlleUl5SWpvaU1qVXlJbjBUTTJORCJ9WI0Mz',
                text: "Role 'alert' is conveyed",
                priority: 'REQUIRED'
            },
            {
                id: 'MmJhOeyIzIjoiT0RFMVlleUl5SWpvaU1qVXlJbjBUTTJORCJ9WM2Nz',
                text: "Text 'Hello' is conveyed",
                priority: 'REQUIRED'
            }
        ],
        renderedUrls: {
            1: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html',
            2: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-02-trigger-alert-interaction-nvda.collected.html'
        },
        renderableContent: {
            1: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in interaction mode',
                    testId: 2,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'jaws', raw: 'JAWS', name: 'JAWS' },
                    mode: 'interaction',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                    user: [
                        "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            },
            2: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in interaction mode',
                    testId: 2,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'nvda', raw: 'NVDA', name: 'NVDA' },
                    mode: 'interaction',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'If NVDA did not make the focus mode sound when the test page loaded, press Insert+Space to turn focus mode on.',
                    user: [
                        "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            }
        }
    },
    {
        id: 'NGMxMeyIyIjoiMjUyIn0zEwNT',
        atIds: [3],
        title: 'Trigger an alert',
        atMode: 'INTERACTION',
        viewers: [],
        rowNumber: '3',
        scenarios: [
            {
                id: 'ZGNhMeyIzIjoiTkdNeE1leUl5SWpvaU1qVXlJbjB6RXdOVCJ9mU2Zm',
                atId: 3,
                commandIds: ['CTRL_OPT_SPACE']
            },
            {
                id: 'NmM1NeyIzIjoiTkdNeE1leUl5SWpvaU1qVXlJbjB6RXdOVCJ92VkMT',
                atId: 3,
                commandIds: ['SPACE']
            },
            {
                id: 'MzQ0YeyIzIjoiTkdNeE1leUl5SWpvaU1qVXlJbjB6RXdOVCJ9jFlOT',
                atId: 3,
                commandIds: ['ENTER']
            }
        ],
        assertions: [
            {
                id: 'NTU0YeyIzIjoiTkdNeE1leUl5SWpvaU1qVXlJbjB6RXdOVCJ9jFmYz',
                text: "Role 'alert' is conveyed",
                priority: 'REQUIRED'
            },
            {
                id: 'MmNiNeyIzIjoiTkdNeE1leUl5SWpvaU1qVXlJbjB6RXdOVCJ9zI1Zj',
                text: "Text 'Hello' is conveyed",
                priority: 'REQUIRED'
            }
        ],
        renderedUrls: {
            3: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-03-trigger-alert-interaction-voiceover_macos.collected.html'
        },
        renderableContent: {
            3: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert',
                    testId: 3,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: {
                        key: 'voiceover_macos',
                        raw: 'voiceover_macos',
                        name: 'VoiceOver for macOS'
                    },
                    mode: 'interaction',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'CTRL_OPT_SPACE',
                        keystroke: 'Control+Option+Space',
                        keypresses: [
                            {
                                id: 'CTRL_OPT_SPACE',
                                keystroke: 'Control+Option+Space'
                            }
                        ]
                    },
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Toggle Quick Nav OFF by pressing the Left Arrow and Right Arrow keys at the same time.',
                    user: [
                        "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            }
        }
    }
];

// Based on Alert 435
const testsWithInstructionsSayingInsureB = [
    {
        id: 'MTRjOeyIyIjoiNDM1In0TVmYT',
        atIds: [1, 2],
        title: 'Trigger an alert in reading mode',
        atMode: 'READING',
        viewers: [],
        rowNumber: '1',
        scenarios: [
            {
                id: 'YWZlNeyIzIjoiTVRSak9leUl5SWpvaU5ETTFJbjBUVm1ZVCJ9mFlMz',
                atId: 1,
                commandIds: ['SPACE']
            },
            {
                id: 'ZjFhZeyIzIjoiTVRSak9leUl5SWpvaU5ETTFJbjBUVm1ZVCJ9mIzOT',
                atId: 1,
                commandIds: ['ENTER']
            },
            {
                id: 'NzJmNeyIzIjoiTVRSak9leUl5SWpvaU5ETTFJbjBUVm1ZVCJ92MxY2',
                atId: 2,
                commandIds: ['SPACE']
            },
            {
                id: 'YmE4YeyIzIjoiTVRSak9leUl5SWpvaU5ETTFJbjBUVm1ZVCJ9Tk4NT',
                atId: 2,
                commandIds: ['ENTER']
            }
        ],
        assertions: [
            {
                id: 'ZmM5NeyIzIjoiTVRSak9leUl5SWpvaU5ETTFJbjBUVm1ZVCJ92U1MW',
                text: "Role 'alert' is conveyed",
                priority: 'REQUIRED'
            },
            {
                id: 'MzFlYeyIzIjoiTVRSak9leUl5SWpvaU5ETTFJbjBUVm1ZVCJ9jE5ND',
                text: "Text 'Hello' is conveyed",
                priority: 'REQUIRED'
            }
        ],
        renderedUrls: {
            1: '/aria-at/0c61f715dcee5ee514abfdc1b1c7f09bbf46278d/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
            2: '/aria-at/0c61f715dcee5ee514abfdc1b1c7f09bbf46278d/build/tests/alert/test-01-trigger-alert-reading-nvda.collected.html'
        },
        renderableContent: {
            1: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in reading mode',
                    testId: 1,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'jaws', raw: 'JAWS', name: 'JAWS' },
                    mode: 'reading',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                    user: [
                        "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            },
            2: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in reading mode',
                    testId: 1,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'nvda', raw: 'NVDA', name: 'NVDA' },
                    mode: 'reading',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Insure NVDA is in browse mode by pressing Escape. Note: This command has no effect if NVDA is already in browse mode.',
                    user: [
                        "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            }
        }
    },
    {
        id: 'NzFjYeyIyIjoiNDM1In0TYzZT',
        atIds: [1, 2],
        title: 'Trigger an alert in interaction mode',
        atMode: 'INTERACTION',
        viewers: [],
        rowNumber: '2',
        scenarios: [
            {
                id: 'YmU4NeyIzIjoiTnpGallleUl5SWpvaU5ETTFJbjBUWXpaVCJ9WM1MW',
                atId: 1,
                commandIds: ['SPACE']
            },
            {
                id: 'NWNlYeyIzIjoiTnpGallleUl5SWpvaU5ETTFJbjBUWXpaVCJ9jA4Yj',
                atId: 1,
                commandIds: ['ENTER']
            },
            {
                id: 'ZWE0MeyIzIjoiTnpGallleUl5SWpvaU5ETTFJbjBUWXpaVCJ92M2Nm',
                atId: 2,
                commandIds: ['SPACE']
            },
            {
                id: 'Mzk0MeyIzIjoiTnpGallleUl5SWpvaU5ETTFJbjBUWXpaVCJ9Dg4MT',
                atId: 2,
                commandIds: ['ENTER']
            }
        ],
        assertions: [
            {
                id: 'NTI3ZeyIzIjoiTnpGallleUl5SWpvaU5ETTFJbjBUWXpaVCJ9GY5OT',
                text: "Role 'alert' is conveyed",
                priority: 'REQUIRED'
            },
            {
                id: 'NGJiNeyIzIjoiTnpGallleUl5SWpvaU5ETTFJbjBUWXpaVCJ9mExYT',
                text: "Text 'Hello' is conveyed",
                priority: 'REQUIRED'
            }
        ],
        renderedUrls: {
            1: '/aria-at/0c61f715dcee5ee514abfdc1b1c7f09bbf46278d/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html',
            2: '/aria-at/0c61f715dcee5ee514abfdc1b1c7f09bbf46278d/build/tests/alert/test-02-trigger-alert-interaction-nvda.collected.html'
        },
        renderableContent: {
            1: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in interaction mode',
                    testId: 2,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'jaws', raw: 'JAWS', name: 'JAWS' },
                    mode: 'interaction',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                    user: [
                        "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            },
            2: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in interaction mode',
                    testId: 2,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'nvda', raw: 'NVDA', name: 'NVDA' },
                    mode: 'interaction',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'If NVDA did not make the focus mode sound when the test page loaded, press Insert+Space to turn focus mode on.',
                    user: [
                        "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            }
        }
    },
    {
        id: 'MDM4NeyIyIjoiNDM1In0zc0Mm',
        atIds: [3],
        title: 'Trigger an alert',
        atMode: 'INTERACTION',
        viewers: [],
        rowNumber: '3',
        scenarios: [
            {
                id: 'ODhiMeyIzIjoiTURNNE5leUl5SWpvaU5ETTFJbjB6YzBNbSJ9zNlMT',
                atId: 3,
                commandIds: ['CTRL_OPT_SPACE']
            },
            {
                id: 'MjA3NeyIzIjoiTURNNE5leUl5SWpvaU5ETTFJbjB6YzBNbSJ9DA0MT',
                atId: 3,
                commandIds: ['SPACE']
            },
            {
                id: 'M2NjMeyIzIjoiTURNNE5leUl5SWpvaU5ETTFJbjB6YzBNbSJ9DlkNj',
                atId: 3,
                commandIds: ['ENTER']
            }
        ],
        assertions: [
            {
                id: 'M2M1NeyIzIjoiTURNNE5leUl5SWpvaU5ETTFJbjB6YzBNbSJ9TgxND',
                text: "Role 'alert' is conveyed",
                priority: 'REQUIRED'
            },
            {
                id: 'ODczMeyIzIjoiTURNNE5leUl5SWpvaU5ETTFJbjB6YzBNbSJ9WIyMz',
                text: "Text 'Hello' is conveyed",
                priority: 'REQUIRED'
            }
        ],
        renderedUrls: {
            3: '/aria-at/0c61f715dcee5ee514abfdc1b1c7f09bbf46278d/build/tests/alert/test-03-trigger-alert-interaction-voiceover_macos.collected.html'
        },
        renderableContent: {
            3: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert',
                    testId: 3,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: {
                        key: 'voiceover_macos',
                        raw: 'voiceover_macos',
                        name: 'VoiceOver for macOS'
                    },
                    mode: 'interaction',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'CTRL_OPT_SPACE',
                        keystroke: 'Control+Option+Space',
                        keypresses: [
                            {
                                id: 'CTRL_OPT_SPACE',
                                keystroke: 'Control+Option+Space'
                            }
                        ]
                    },
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Toggle Quick Nav OFF by pressing the Left Arrow and Right Arrow keys at the same time.',
                    user: [
                        "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            }
        }
    }
];

// Based on Alert 815
const testsWithInstructionsSayingEnsureA = [
    {
        id: 'NWRiZeyIyIjoiODE1In0mUxMD',
        atIds: [1, 2],
        title: 'Trigger an alert in reading mode',
        atMode: 'READING',
        viewers: [],
        rowNumber: '1',
        scenarios: [
            {
                id: 'YTIxNeyIzIjoiTldSaVpleUl5SWpvaU9ERTFJbjBtVXhNRCJ9DY4Zj',
                atId: 1,
                commandIds: ['SPACE']
            },
            {
                id: 'NzY0ZeyIzIjoiTldSaVpleUl5SWpvaU9ERTFJbjBtVXhNRCJ9Dg3Nz',
                atId: 1,
                commandIds: ['ENTER']
            },
            {
                id: 'MGZjYeyIzIjoiTldSaVpleUl5SWpvaU9ERTFJbjBtVXhNRCJ9jc3ZD',
                atId: 2,
                commandIds: ['SPACE']
            },
            {
                id: 'YjdkYeyIzIjoiTldSaVpleUl5SWpvaU9ERTFJbjBtVXhNRCJ9mNjNz',
                atId: 2,
                commandIds: ['ENTER']
            }
        ],
        assertions: [
            {
                id: 'ZDkyYeyIzIjoiTldSaVpleUl5SWpvaU9ERTFJbjBtVXhNRCJ9mFjMm',
                text: "Role 'alert' is conveyed",
                priority: 'REQUIRED'
            },
            {
                id: 'MTllZeyIzIjoiTldSaVpleUl5SWpvaU9ERTFJbjBtVXhNRCJ9mMwNT',
                text: "Text 'Hello' is conveyed",
                priority: 'REQUIRED'
            }
        ],
        renderedUrls: {
            1: '/aria-at/e87df453e65be5c9ad25277b9293bf28f7a1cf2a/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
            2: '/aria-at/e87df453e65be5c9ad25277b9293bf28f7a1cf2a/build/tests/alert/test-01-trigger-alert-reading-nvda.collected.html'
        },
        renderableContent: {
            1: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in reading mode',
                    testId: 1,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'jaws', raw: 'JAWS', name: 'JAWS' },
                    mode: 'reading',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                    user: [
                        "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            },
            2: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in reading mode',
                    testId: 1,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'nvda', raw: 'NVDA', name: 'NVDA' },
                    mode: 'reading',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Ensure NVDA is in browse mode by pressing Escape. Note: This command has no effect if NVDA is already in browse mode.',
                    user: [
                        "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            }
        }
    },
    {
        id: 'M2RlOeyIyIjoiODE1In0TViZT',
        atIds: [1, 2],
        title: 'Trigger an alert in interaction mode',
        atMode: 'INTERACTION',
        viewers: [],
        rowNumber: '2',
        scenarios: [
            {
                id: 'YWQyMeyIzIjoiTTJSbE9leUl5SWpvaU9ERTFJbjBUVmlaVCJ9mJhNz',
                atId: 1,
                commandIds: ['SPACE']
            },
            {
                id: 'Y2M5NeyIzIjoiTTJSbE9leUl5SWpvaU9ERTFJbjBUVmlaVCJ9zc5Mz',
                atId: 1,
                commandIds: ['ENTER']
            },
            {
                id: 'MTY4OeyIzIjoiTTJSbE9leUl5SWpvaU9ERTFJbjBUVmlaVCJ9Tk5Mj',
                atId: 2,
                commandIds: ['SPACE']
            },
            {
                id: 'MzAwZeyIzIjoiTTJSbE9leUl5SWpvaU9ERTFJbjBUVmlaVCJ9DM2ZW',
                atId: 2,
                commandIds: ['ENTER']
            }
        ],
        assertions: [
            {
                id: 'NDM3NeyIzIjoiTTJSbE9leUl5SWpvaU9ERTFJbjBUVmlaVCJ9WNmYz',
                text: "Role 'alert' is conveyed",
                priority: 'REQUIRED'
            },
            {
                id: 'NDVhZeyIzIjoiTTJSbE9leUl5SWpvaU9ERTFJbjBUVmlaVCJ9jIwZD',
                text: "Text 'Hello' is conveyed",
                priority: 'REQUIRED'
            }
        ],
        renderedUrls: {
            1: '/aria-at/e87df453e65be5c9ad25277b9293bf28f7a1cf2a/build/tests/alert/test-02-trigger-alert-interaction-jaws.collected.html',
            2: '/aria-at/e87df453e65be5c9ad25277b9293bf28f7a1cf2a/build/tests/alert/test-02-trigger-alert-interaction-nvda.collected.html'
        },
        renderableContent: {
            1: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in interaction mode',
                    testId: 2,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'jaws', raw: 'JAWS', name: 'JAWS' },
                    mode: 'interaction',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Verify the PC Cursor is active by pressing Alt+Delete. If it is not, turn off the Virtual Cursor by pressing Insert+Z.',
                    user: [
                        "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            },
            2: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert in interaction mode',
                    testId: 2,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: { key: 'nvda', raw: 'NVDA', name: 'NVDA' },
                    mode: 'interaction',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'If NVDA did not make the focus mode sound when the test page loaded, press Insert+Space to turn focus mode on.',
                    user: [
                        "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            }
        }
    },
    {
        id: 'MjVjNeyIyIjoiODE1In0zk3Zm',
        atIds: [3],
        title: 'Trigger an alert',
        atMode: 'INTERACTION',
        viewers: [],
        rowNumber: '3',
        scenarios: [
            {
                id: 'N2Y5NeyIzIjoiTWpWak5leUl5SWpvaU9ERTFJbjB6azNabSJ9GM2M2',
                atId: 3,
                commandIds: ['CTRL_OPT_SPACE']
            },
            {
                id: 'YTE2OeyIzIjoiTWpWak5leUl5SWpvaU9ERTFJbjB6azNabSJ9Dc3M2',
                atId: 3,
                commandIds: ['SPACE']
            },
            {
                id: 'ZjVkNeyIzIjoiTWpWak5leUl5SWpvaU9ERTFJbjB6azNabSJ9GExOG',
                atId: 3,
                commandIds: ['ENTER']
            }
        ],
        assertions: [
            {
                id: 'ZDM0NeyIzIjoiTWpWak5leUl5SWpvaU9ERTFJbjB6azNabSJ9WM5Mj',
                text: "Role 'alert' is conveyed",
                priority: 'REQUIRED'
            },
            {
                id: 'ZDgyMeyIzIjoiTWpWak5leUl5SWpvaU9ERTFJbjB6azNabSJ9Tg3NT',
                text: "Text 'Hello' is conveyed",
                priority: 'REQUIRED'
            }
        ],
        renderedUrls: {
            3: '/aria-at/e87df453e65be5c9ad25277b9293bf28f7a1cf2a/build/tests/alert/test-03-trigger-alert-interaction-voiceover_macos.collected.html'
        },
        renderableContent: {
            3: {
                info: {
                    task: 'trigger alert',
                    title: 'Trigger an alert',
                    testId: 3,
                    references: [
                        {
                            refId: 'example',
                            value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                        },
                        {
                            refId: 'alert',
                            value: 'https://w3c.github.io/aria/#alert'
                        }
                    ]
                },
                target: {
                    at: {
                        key: 'voiceover_macos',
                        raw: 'voiceover_macos',
                        name: 'VoiceOver for macOS'
                    },
                    mode: 'interaction',
                    setupScript: {
                        name: 'setFocusOnButton',
                        source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                        jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                        modulePath: 'scripts/setFocusOnButton.module.js',
                        description: "sets focus on the 'Trigger Alert' button"
                    },
                    referencePage:
                        'reference/2021-10-15_143458/alert.setFocusOnButton.html'
                },
                commands: [
                    {
                        id: 'CTRL_OPT_SPACE',
                        keystroke: 'Control+Option+Space',
                        keypresses: [
                            {
                                id: 'CTRL_OPT_SPACE',
                                keystroke: 'Control+Option+Space'
                            }
                        ]
                    },
                    {
                        id: 'SPACE',
                        keystroke: 'Space',
                        keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                    },
                    {
                        id: 'ENTER',
                        keystroke: 'Enter',
                        keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                    }
                ],
                assertions: [
                    { priority: 1, expectation: "Role 'alert' is conveyed" },
                    { priority: 1, expectation: "Text 'Hello' is conveyed" }
                ],
                instructions: {
                    raw: "With focus on the 'Trigger Alert' button, activate the button to trigger the alert.",
                    mode: 'Toggle Quick Nav OFF by pressing the Left Arrow and Right Arrow keys at the same time.',
                    user: [
                        "With focus on the 'Trigger Alert' button, activate the button to trigger the alert."
                    ]
                }
            }
        }
    }
];

const singleTest = {
    id: 'NjJkOeyIyIjoiMjUyIn0GJkMG',
    atIds: [1, 2],
    title: 'Trigger an alert in reading mode',
    atMode: 'READING',
    viewers: [],
    rowNumber: '1',
    scenarios: [
        {
            id: 'ZTVhNeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9WVlNj',
            atId: 1,
            commandIds: ['SPACE']
        },
        {
            id: 'ZGY2NeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9TVlMz',
            atId: 1,
            commandIds: ['ENTER']
        },
        {
            id: 'YWIyMeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DIyYj',
            atId: 2,
            commandIds: ['SPACE']
        },
        {
            id: 'OWI0MeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ92RkMT',
            atId: 2,
            commandIds: ['ENTER']
        }
    ],
    assertions: [
        {
            id: 'MDEyZeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DIzZj',
            text: "Role 'alert' is conveyed",
            priority: 'REQUIRED'
        },
        {
            id: 'MjEyOeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DUwY2',
            text: "Text 'Hello' is conveyed",
            priority: 'REQUIRED'
        }
    ],
    renderedUrls: {
        1: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
        2: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-01-trigger-alert-reading-nvda.collected.html'
    },
    renderableContent: {
        1: {
            info: {
                task: 'trigger alert',
                title: 'Trigger an alert in reading mode',
                testId: 1,
                references: [
                    {
                        refId: 'example',
                        value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                    },
                    {
                        refId: 'alert',
                        value: 'https://w3c.github.io/aria/#alert'
                    }
                ]
            },
            target: {
                at: { key: 'jaws', raw: 'JAWS', name: 'JAWS' },
                mode: 'reading',
                setupScript: {
                    name: 'setFocusOnButton',
                    source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                    jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                    modulePath: 'scripts/setFocusOnButton.module.js',
                    description: "sets focus on the 'Trigger Alert' button"
                },
                referencePage:
                    'reference/2021-10-15_143458/alert.setFocusOnButton.html'
            },
            commands: [
                {
                    id: 'SPACE',
                    keystroke: 'Space',
                    keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                },
                {
                    id: 'ENTER',
                    keystroke: 'Enter',
                    keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                }
            ],
            assertions: [
                { priority: 1, expectation: "Role 'alert' is conveyed" },
                { priority: 1, expectation: "Text 'Hello' is conveyed" }
            ],
            instructions: {
                raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                mode: 'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                user: [
                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                ]
            }
        },
        2: {
            info: {
                task: 'trigger alert',
                title: 'Trigger an alert in reading mode',
                testId: 1,
                references: [
                    {
                        refId: 'example',
                        value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                    },
                    {
                        refId: 'alert',
                        value: 'https://w3c.github.io/aria/#alert'
                    }
                ]
            },
            target: {
                at: { key: 'nvda', raw: 'NVDA', name: 'NVDA' },
                mode: 'reading',
                setupScript: {
                    name: 'setFocusOnButton',
                    source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                    jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                    modulePath: 'scripts/setFocusOnButton.module.js',
                    description: "sets focus on the 'Trigger Alert' button"
                },
                referencePage:
                    'reference/2021-10-15_143458/alert.setFocusOnButton.html'
            },
            commands: [
                {
                    id: 'SPACE',
                    keystroke: 'Space',
                    keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                },
                {
                    id: 'ENTER',
                    keystroke: 'Enter',
                    keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                }
            ],
            assertions: [
                { priority: 1, expectation: "Role 'alert' is conveyed" },
                { priority: 1, expectation: "Text 'Hello' is conveyed" }
            ],
            instructions: {
                raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                mode: 'Insure NVDA is in browse mode by pressing Escape. Note: This command has no effect if NVDA is already in browse mode.',
                user: [
                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                ]
            }
        }
    }
};

const singleTestWithChangedTitle = {
    id: 'NjJkOeyIyIjoiMjUyIn0GJkMG',
    atIds: [1, 2],
    title: 'This title has been changed for testing purposes',
    atMode: 'READING',
    viewers: [],
    rowNumber: '1',
    scenarios: [
        {
            id: 'ZTVhNeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9WVlNj',
            atId: 1,
            commandIds: ['SPACE']
        },
        {
            id: 'ZGY2NeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9TVlMz',
            atId: 1,
            commandIds: ['ENTER']
        },
        {
            id: 'YWIyMeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DIyYj',
            atId: 2,
            commandIds: ['SPACE']
        },
        {
            id: 'OWI0MeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ92RkMT',
            atId: 2,
            commandIds: ['ENTER']
        }
    ],
    assertions: [
        {
            id: 'MDEyZeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DIzZj',
            text: "Role 'alert' is conveyed",
            priority: 'REQUIRED'
        },
        {
            id: 'MjEyOeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DUwY2',
            text: "Text 'Hello' is conveyed",
            priority: 'REQUIRED'
        }
    ],
    renderedUrls: {
        1: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
        2: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-01-trigger-alert-reading-nvda.collected.html'
    },
    renderableContent: {
        1: {
            info: {
                task: 'trigger alert',
                title: 'Trigger an alert in reading mode',
                testId: 1,
                references: [
                    {
                        refId: 'example',
                        value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                    },
                    {
                        refId: 'alert',
                        value: 'https://w3c.github.io/aria/#alert'
                    }
                ]
            },
            target: {
                at: { key: 'jaws', raw: 'JAWS', name: 'JAWS' },
                mode: 'reading',
                setupScript: {
                    name: 'setFocusOnButton',
                    source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                    jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                    modulePath: 'scripts/setFocusOnButton.module.js',
                    description: "sets focus on the 'Trigger Alert' button"
                },
                referencePage:
                    'reference/2021-10-15_143458/alert.setFocusOnButton.html'
            },
            commands: [
                {
                    id: 'SPACE',
                    keystroke: 'Space',
                    keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                },
                {
                    id: 'ENTER',
                    keystroke: 'Enter',
                    keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                }
            ],
            assertions: [
                { priority: 1, expectation: "Role 'alert' is conveyed" },
                { priority: 1, expectation: "Text 'Hello' is conveyed" }
            ],
            instructions: {
                raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                mode: 'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                user: [
                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                ]
            }
        },
        2: {
            info: {
                task: 'trigger alert',
                title: 'Trigger an alert in reading mode',
                testId: 1,
                references: [
                    {
                        refId: 'example',
                        value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                    },
                    {
                        refId: 'alert',
                        value: 'https://w3c.github.io/aria/#alert'
                    }
                ]
            },
            target: {
                at: { key: 'nvda', raw: 'NVDA', name: 'NVDA' },
                mode: 'reading',
                setupScript: {
                    name: 'setFocusOnButton',
                    source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                    jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                    modulePath: 'scripts/setFocusOnButton.module.js',
                    description: "sets focus on the 'Trigger Alert' button"
                },
                referencePage:
                    'reference/2021-10-15_143458/alert.setFocusOnButton.html'
            },
            commands: [
                {
                    id: 'SPACE',
                    keystroke: 'Space',
                    keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                },
                {
                    id: 'ENTER',
                    keystroke: 'Enter',
                    keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                }
            ],
            assertions: [
                { priority: 1, expectation: "Role 'alert' is conveyed" },
                { priority: 1, expectation: "Text 'Hello' is conveyed" }
            ],
            instructions: {
                raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                mode: 'Insure NVDA is in browse mode by pressing Escape. Note: This command has no effect if NVDA is already in browse mode.',
                user: [
                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                ]
            }
        }
    }
};

const singleTestWithChangedId = {
    id: 'thisisatestid',
    atIds: [1, 2],
    title: 'Trigger an alert in reading mode',
    atMode: 'READING',
    viewers: [],
    rowNumber: '1',
    scenarios: [
        {
            id: 'ZTVhNeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9WVlNj',
            atId: 1,
            commandIds: ['SPACE']
        },
        {
            id: 'ZGY2NeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9TVlMz',
            atId: 1,
            commandIds: ['ENTER']
        },
        {
            id: 'YWIyMeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DIyYj',
            atId: 2,
            commandIds: ['SPACE']
        },
        {
            id: 'OWI0MeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ92RkMT',
            atId: 2,
            commandIds: ['ENTER']
        }
    ],
    assertions: [
        {
            id: 'MDEyZeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DIzZj',
            text: "Role 'alert' is conveyed",
            priority: 'REQUIRED'
        },
        {
            id: 'MjEyOeyIzIjoiTmpKa09leUl5SWpvaU1qVXlJbjBHSmtNRyJ9DUwY2',
            text: "Text 'Hello' is conveyed",
            priority: 'REQUIRED'
        }
    ],
    renderedUrls: {
        1: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
        2: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-01-trigger-alert-reading-nvda.collected.html'
    },
    renderableContent: {
        1: {
            info: {
                task: 'trigger alert',
                title: 'Trigger an alert in reading mode',
                testId: 1,
                references: [
                    {
                        refId: 'example',
                        value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                    },
                    {
                        refId: 'alert',
                        value: 'https://w3c.github.io/aria/#alert'
                    }
                ]
            },
            target: {
                at: { key: 'jaws', raw: 'JAWS', name: 'JAWS' },
                mode: 'reading',
                setupScript: {
                    name: 'setFocusOnButton',
                    source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                    jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                    modulePath: 'scripts/setFocusOnButton.module.js',
                    description: "sets focus on the 'Trigger Alert' button"
                },
                referencePage:
                    'reference/2021-10-15_143458/alert.setFocusOnButton.html'
            },
            commands: [
                {
                    id: 'SPACE',
                    keystroke: 'Space',
                    keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                },
                {
                    id: 'ENTER',
                    keystroke: 'Enter',
                    keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                }
            ],
            assertions: [
                { priority: 1, expectation: "Role 'alert' is conveyed" },
                { priority: 1, expectation: "Text 'Hello' is conveyed" }
            ],
            instructions: {
                raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                mode: 'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                user: [
                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                ]
            }
        },
        2: {
            info: {
                task: 'trigger alert',
                title: 'Trigger an alert in reading mode',
                testId: 1,
                references: [
                    {
                        refId: 'example',
                        value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                    },
                    {
                        refId: 'alert',
                        value: 'https://w3c.github.io/aria/#alert'
                    }
                ]
            },
            target: {
                at: { key: 'nvda', raw: 'NVDA', name: 'NVDA' },
                mode: 'reading',
                setupScript: {
                    name: 'setFocusOnButton',
                    source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                    jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                    modulePath: 'scripts/setFocusOnButton.module.js',
                    description: "sets focus on the 'Trigger Alert' button"
                },
                referencePage:
                    'reference/2021-10-15_143458/alert.setFocusOnButton.html'
            },
            commands: [
                {
                    id: 'SPACE',
                    keystroke: 'Space',
                    keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                },
                {
                    id: 'ENTER',
                    keystroke: 'Enter',
                    keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                }
            ],
            assertions: [
                { priority: 1, expectation: "Role 'alert' is conveyed" },
                { priority: 1, expectation: "Text 'Hello' is conveyed" }
            ],
            instructions: {
                raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                mode: 'Insure NVDA is in browse mode by pressing Escape. Note: This command has no effect if NVDA is already in browse mode.',
                user: [
                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                ]
            }
        }
    }
};

const singleTestWithoutIds = {
    atIds: [1, 2],
    title: 'Trigger an alert in reading mode',
    atMode: 'READING',
    viewers: [],
    rowNumber: '1',
    scenarios: [
        {
            atId: 1,
            commandIds: ['SPACE']
        },
        {
            atId: 1,
            commandIds: ['ENTER']
        },
        {
            atId: 2,
            commandIds: ['SPACE']
        },
        {
            atId: 2,
            commandIds: ['ENTER']
        }
    ],
    assertions: [
        {
            text: "Role 'alert' is conveyed",
            priority: 'REQUIRED'
        },
        {
            text: "Text 'Hello' is conveyed",
            priority: 'REQUIRED'
        }
    ],
    renderedUrls: {
        1: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-01-trigger-alert-reading-jaws.collected.html',
        2: '/aria-at/da10a207390c56d9a11e1e75fc9a1402ec6e95fd/build/tests/alert/test-01-trigger-alert-reading-nvda.collected.html'
    },
    renderableContent: {
        1: {
            info: {
                task: 'trigger alert',
                title: 'Trigger an alert in reading mode',
                testId: 1,
                references: [
                    {
                        refId: 'example',
                        value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                    },
                    {
                        refId: 'alert',
                        value: 'https://w3c.github.io/aria/#alert'
                    }
                ]
            },
            target: {
                at: { key: 'jaws', raw: 'JAWS', name: 'JAWS' },
                mode: 'reading',
                setupScript: {
                    name: 'setFocusOnButton',
                    source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                    jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                    modulePath: 'scripts/setFocusOnButton.module.js',
                    description: "sets focus on the 'Trigger Alert' button"
                },
                referencePage:
                    'reference/2021-10-15_143458/alert.setFocusOnButton.html'
            },
            commands: [
                {
                    id: 'SPACE',
                    keystroke: 'Space',
                    keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                },
                {
                    id: 'ENTER',
                    keystroke: 'Enter',
                    keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                }
            ],
            assertions: [
                { priority: 1, expectation: "Role 'alert' is conveyed" },
                { priority: 1, expectation: "Text 'Hello' is conveyed" }
            ],
            instructions: {
                raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                mode: 'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.',
                user: [
                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                ]
            }
        },
        2: {
            info: {
                task: 'trigger alert',
                title: 'Trigger an alert in reading mode',
                testId: 1,
                references: [
                    {
                        refId: 'example',
                        value: 'https://w3c.github.io/aria-practices/examples/alert/alert.html'
                    },
                    {
                        refId: 'alert',
                        value: 'https://w3c.github.io/aria/#alert'
                    }
                ]
            },
            target: {
                at: { key: 'nvda', raw: 'NVDA', name: 'NVDA' },
                mode: 'reading',
                setupScript: {
                    name: 'setFocusOnButton',
                    source: "// sets focus on the 'Trigger Alert' button\ntestPageDocument.querySelector('#alert-trigger').focus();\n",
                    jsonpPath: 'scripts/setFocusOnButton.jsonp.js',
                    modulePath: 'scripts/setFocusOnButton.module.js',
                    description: "sets focus on the 'Trigger Alert' button"
                },
                referencePage:
                    'reference/2021-10-15_143458/alert.setFocusOnButton.html'
            },
            commands: [
                {
                    id: 'SPACE',
                    keystroke: 'Space',
                    keypresses: [{ id: 'SPACE', keystroke: 'Space' }]
                },
                {
                    id: 'ENTER',
                    keystroke: 'Enter',
                    keypresses: [{ id: 'ENTER', keystroke: 'Enter' }]
                }
            ],
            assertions: [
                { priority: 1, expectation: "Role 'alert' is conveyed" },
                { priority: 1, expectation: "Text 'Hello' is conveyed" }
            ],
            instructions: {
                raw: "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert.",
                mode: 'Insure NVDA is in browse mode by pressing Escape. Note: This command has no effect if NVDA is already in browse mode.',
                user: [
                    "With the reading cursor on the 'Trigger Alert' button, activate the button to trigger the alert."
                ]
            }
        }
    }
};
