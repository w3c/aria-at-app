function getAssertionPhraseOrText(assertion) {
  const assertionText = assertion.phrase || assertion.text;
  return assertionText
    ? assertionText.charAt(0).toUpperCase() + assertionText.slice(1)
    : '';
}

export default getAssertionPhraseOrText;
