const {
  normalizeScreenreaderOutput,
  outputsMatch
} = require('./outputNormalization');
const { NO_OUTPUT_STRING } = require('./constants');

describe('normalizeScreenreaderOutput', () => {
  it('handles null and undefined values', () => {
    expect(normalizeScreenreaderOutput(null)).toBe(null);
    expect(normalizeScreenreaderOutput(undefined)).toBe(undefined);
  });

  it('handles empty string', () => {
    expect(normalizeScreenreaderOutput('')).toBe('');
  });

  it('handles NO_OUTPUT_STRING constant', () => {
    expect(normalizeScreenreaderOutput(NO_OUTPUT_STRING)).toBe(
      NO_OUTPUT_STRING
    );
  });

  it('normalizes whitespace to single spaces', () => {
    expect(normalizeScreenreaderOutput('hello  world')).toBe('hello world');
    expect(normalizeScreenreaderOutput('hello\t\tworld')).toBe('hello world');
    expect(normalizeScreenreaderOutput('hello\n\nworld')).toBe('hello world');
    expect(normalizeScreenreaderOutput('hello   \t \n  world')).toBe(
      'hello world'
    );
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeScreenreaderOutput('  hello world  ')).toBe('hello world');
    expect(normalizeScreenreaderOutput('\t\nhello world\n\t')).toBe(
      'hello world'
    );
    expect(normalizeScreenreaderOutput('   \t  hello world   \n  ')).toBe(
      'hello world'
    );
  });

  it('normalizes capitalization to lowercase', () => {
    expect(normalizeScreenreaderOutput('HeLLo WoRLd')).toBe('hello world');
  });

  it('preserves punctuation', () => {
    expect(normalizeScreenreaderOutput('Hello, World!')).toBe('hello, world!');
    expect(normalizeScreenreaderOutput('Button "Click Me"')).toBe(
      'button "click me"'
    );
    expect(normalizeScreenreaderOutput('Press Enter.')).toBe('press enter.');
  });

  it('normalizes spaces around hyphens', () => {
    expect(normalizeScreenreaderOutput('Control - Option - Space')).toBe(
      'control-option-space'
    );
    expect(normalizeScreenreaderOutput('Control-Option-Space')).toBe(
      'control-option-space'
    );
    expect(normalizeScreenreaderOutput('Control  -  Option  -  Space')).toBe(
      'control-option-space'
    );
  });

  it('removes JAWS separator tokens', () => {
    expect(normalizeScreenreaderOutput('Text\u001dSeparator\u001eMore')).toBe(
      'text separator more'
    );
    expect(normalizeScreenreaderOutput('Start\u001dMiddle\u001eEnd')).toBe(
      'start middle end'
    );
  });

  it('handles complex screenreader output', () => {
    const input =
      '  \n\tButton   "Click  Me"\n  You are currently on a button.\n\n  ';
    const expected = 'button "click me" you are currently on a button.';
    expect(normalizeScreenreaderOutput(input)).toBe(expected);
  });

  it('handles newlines within text', () => {
    expect(normalizeScreenreaderOutput('Line 1\nLine 2\nLine 3')).toBe(
      'line 1 line 2 line 3'
    );
    expect(normalizeScreenreaderOutput('Text\n\n\nMore text')).toBe(
      'text more text'
    );
    expect(normalizeScreenreaderOutput('Start\r\nMiddle\r\nEnd')).toBe(
      'start middle end'
    );
  });

  it('handles mixed whitespace characters', () => {
    const input =
      'Start\u00A0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000End';
    expect(normalizeScreenreaderOutput(input)).toBe('start end');
  });

  it('handles hyphenated keyboard shortcuts', () => {
    expect(
      normalizeScreenreaderOutput('Press Control-Option-Shift-Down Arrow')
    ).toBe('press control-option-shift-down arrow');
    expect(
      normalizeScreenreaderOutput('Press Control - Option - Shift - Down Arrow')
    ).toBe('press control-option-shift-down arrow');
  });
});

describe('outputsMatch', () => {
  it('returns true for identical strings', () => {
    expect(outputsMatch('hello world', 'hello world')).toBe(true);
    expect(outputsMatch('', '')).toBe(true);
  });

  it('returns true for strings that normalize to the same value', () => {
    expect(outputsMatch('  hello   world  ', 'hello world')).toBe(true);
    expect(outputsMatch('hello\nworld', 'hello world')).toBe(true);
    expect(outputsMatch('Hello\t\tWorld', 'hello world')).toBe(true);
  });

  it('returns false for strings with different punctuation', () => {
    expect(outputsMatch('Hello, World!', 'Hello World')).toBe(false);
    expect(outputsMatch('Button "Save"', 'Button Save')).toBe(false);
    expect(outputsMatch('Press Enter.', 'Press Enter')).toBe(false);
  });

  it('returns true for strings with different hyphen spacing', () => {
    expect(
      outputsMatch('Control-Option-Space', 'Control - Option - Space')
    ).toBe(true);
    expect(
      outputsMatch('Control  -  Option  -  Space', 'Control-Option-Space')
    ).toBe(true);
  });

  it('returns true for strings with different capitalization patterns', () => {
    expect(outputsMatch('Hello World', 'hello world')).toBe(true);
    expect(outputsMatch('HeLLo WoRLd', 'heLLo woRLd')).toBe(true);
  });

  it('returns true for strings with JAWS separator tokens', () => {
    expect(
      outputsMatch('Text\u001dSeparator\u001eMore', 'Text Separator More')
    ).toBe(true);
    expect(outputsMatch('Start\u001dMiddle\u001eEnd', 'Start Middle End')).toBe(
      true
    );
    expect(
      outputsMatch('Start \u001d Middle \u001e End', 'Start Middle End')
    ).toBe(true);
  });

  it('returns false for different content', () => {
    expect(outputsMatch('hello world', 'goodbye world')).toBe(false);
    expect(outputsMatch('hello', 'hello world')).toBe(false);
    expect(outputsMatch('world hello', 'hello world')).toBe(false);
  });

  it('handles null and undefined values', () => {
    expect(outputsMatch(null, null)).toBe(true);
    expect(outputsMatch(undefined, undefined)).toBe(true);
    expect(outputsMatch(null, undefined)).toBe(false);
    expect(outputsMatch(null, 'hello')).toBe(false);
    expect(outputsMatch('hello', null)).toBe(false);
  });

  it('handles NO_OUTPUT_STRING constant', () => {
    expect(outputsMatch(NO_OUTPUT_STRING, NO_OUTPUT_STRING)).toBe(true);
    expect(outputsMatch(NO_OUTPUT_STRING, 'hello')).toBe(false);
    expect(outputsMatch('hello', NO_OUTPUT_STRING)).toBe(false);
  });

  it('handles empty strings', () => {
    expect(outputsMatch('', '')).toBe(true);
    expect(outputsMatch('', '   ')).toBe(true);
    expect(outputsMatch('', 'hello')).toBe(false);
  });

  it('handles complex screenreader scenarios with full normalization', () => {
    const output1 =
      '  Button "Save"\n  You are currently on a button.\n  To activate press Enter.  ';
    const output2 =
      'Button "Save" You are currently on a button. To activate press Enter.';

    expect(outputsMatch(output1, output2)).toBe(true);
  });

  it('detects meaningful differences despite formatting similarities', () => {
    const output1 = 'Button Save clickable';
    const output2 = 'Button Submit clickable';
    const output3 = 'Link Save clickable';

    expect(outputsMatch(output1, output2)).toBe(false);
    expect(outputsMatch(output1, output3)).toBe(false);
  });

  it('handles the original W3C website example', () => {
    const output1 =
      ', W3C website\n link\nYou are currently on a link. To click this link, press Control -Option -Space. ';
    const output2 =
      'W3C website link\nYou are currently on a link. To click this link, press Control-Option-Space.';

    expect(outputsMatch(output1, output2)).toBe(false);
  });
});
