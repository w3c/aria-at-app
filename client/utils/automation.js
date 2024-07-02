/**
 * Checks if the AT, browser, and AT version requirements are supported by the automation
 * @param {object} ctx
 * @param {object} ctx.at
 * @param {object} ctx.browser
 * @param {object} ctx.minimumAtVersion optional
 * @param {object} ctx.exactAtVersion optional
 * @returns {boolean}
 */
export const isSupportedByResponseCollector = ctx => {
  if (!ctx || !ctx.at || !ctx.browser) {
    return false;
  }

  const { at, browser } = ctx;
  const { key: atKey } = at;
  const { key: browserKey } = browser;

  // Check if the AT and browser are supported by the automation
  if (
    !(
      atKey === 'nvda' &&
      (browserKey === 'chrome' || browserKey === 'firefox')
    ) &&
    !(atKey === 'voiceover_macos' && browserKey === 'safari_macos')
  ) {
    return false;
  }

  // If there are version requirements, check if they are supported by automation
  if (ctx.minimumAtVersion || ctx.exactAtVersion) {
    return atVersionRequirementsSupportedByAutomation(ctx);
  }
  return true;
};

/**
 * Checks if the version requirements are supported by automation
 * @param {object} ctx
 * @param {object} ctx.at
 * @param {object} ctx.minimumAtVersion
 * @param {object} ctx.exactAtVersion
 * @returns {boolean}
 */
const atVersionRequirementsSupportedByAutomation = ({
  at,
  minimumAtVersion,
  exactAtVersion
}) => {
  if (!at || !(exactAtVersion || minimumAtVersion)) {
    return false;
  }

  if (minimumAtVersion && exactAtVersion) {
    console.warn(
      'Both minimumAtVersion and exactAtVersion are set. This is invalid. Using exactAtVersion'
    );
    minimumAtVersion = null;
  }

  const { atVersions } = at;
  if (!atVersions) {
    console.warn(
      'Version requirements check was done without atVersions in the supplied at object'
    );
    return false;
  }

  if (exactAtVersion) {
    return exactAtVersion.supportedByAutomation;
  } else {
    return atVersions.some(
      version =>
        version.supportedByAutomation &&
        new Date(version.releasedAt) >= new Date(minimumAtVersion.releasedAt)
    );
  }
};

/**
 * @param {} [at]
 * @param {} [browser]
 *
 * @returns {string|undefined}
 */
export const getBotUsernameFromAtBrowser = (at, browser) => {
  if (
    at?.key === 'nvda' &&
    (browser?.key === 'chrome' || browser?.key === 'firefox')
  ) {
    return 'NVDA Bot';
  }
  if (at?.key === 'voiceover_macos' && browser?.key === 'safari_macos') {
    return 'VoiceOver Bot';
  }
};
