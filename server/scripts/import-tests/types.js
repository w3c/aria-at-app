/**
 * @typedef Reference
 * @property {string} refId
 * @property {string} value
 * @property {string} type - Available in v2
 * @property {string} linkText - Available in v2
 */

/**
 * @typedef AtSetting
 * @property {string} screenText
 * @property {string[]} instructions
 */

/**
 * @typedef AssertionToken
 * @property {string} readingMode
 * @property {string} screenReader
 * @property {string} interactionMode
 */

/**
 * @typedef SetupScript
 * @property {string} name
 * @property {string} script
 * @property {string} source
 * @property {string} jsonpPath
 * @property {string} modulePath
 * @property {string} scriptDescription
 */

/**
 * @typedef Keypress
 * @property {string} id
 * @property {string} keystroke
 */

/**
 * @typedef AssertionException
 * @property {number} priority
 * @property {string} assertionId
 */

/**
 * @typedef Command
 * @property {string} id
 * @property {string} keystroke
 * @property {Keypress[]} keypresses
 * @property {string} settings - Available in v2
 * @property {number} presentationNumber - Available in v2
 * @property {AssertionException[]} assertionExceptions - Available in v2
 */

/**
 * @typedef Assertion
 * @property {number} priority
 * @property {string} expectation - Available in v1
 * @property {string} refIds - Available in v2
 * @property {string} assertionId - Available in v2
 * @property {string} assertionPhrase - Available in v2
 * @property {string} assertionStatement - Available in v2
 */

/**
 * @typedef Instructions
 * @property {string|Object<key, string[]>} instructions.mode - {string} in v1, {Object<key, string[]>} in v2
 * @property {string} instructions.raw - Available in v1
 * @property {string[]} instructions.user - Available in v2
 * @property {string} instructions.instructions - Available in v2 (should be same as {instructions.raw} in v1)
 */

/**
 * @typedef RenderableContent
 *
 * @property {Object} info
 * @property {string} info.task - Available in v1
 * @property {string} info.title
 * @property {number|string} info.testId - {number} in v1, {string} in v2
 * @property {Reference[]} info.references
 * @property {number} info.presentationNumber - Available in v2
 *
 * @property {Object} target
 * @property {Object} target.at
 * @property {string} target.at.key
 * @property {string} target.name
 * @property {string|Object} target.at.raw - {string} in v1, {Object} in v2
 * @property {string} target.settings - Available in v2
 * @property {string} target.at.raw.key - Available in v2
 * @property {string} target.at.raw.name - Available in v2
 * @property {Object<key, AtSetting>} target.at.raw.settings - Available in v2
 * @property {AssertionToken} target.at.raw.assertionTokens - Available in v2
 * @property {string} target.at.raw.defaultConfigurationInstructionsHTML - Available in v2
 * @property {SetupScript} target.setupScript
 * @property {string} target.referencePage
 *
 * @property {Command[]} commands
 *
 * @property {Assertion[]} assertions
 *
 * @property {Instructions} instructions
 */

module.exports = {};
