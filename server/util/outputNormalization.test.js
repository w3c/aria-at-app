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

  it('converts to lowercase', () => {
    expect(normalizeScreenreaderOutput('Hello World')).toBe('hello world');
    expect(normalizeScreenreaderOutput('HELLO WORLD')).toBe('hello world');
    expect(normalizeScreenreaderOutput('HeLLo WoRLd')).toBe('hello world');
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
});

describe('outputsMatch', () => {
  it('returns true for identical strings', () => {
    expect(outputsMatch('hello world', 'hello world')).toBe(true);
    expect(outputsMatch('', '')).toBe(true);
  });

  it('returns true for strings that normalize to the same value', () => {
    expect(outputsMatch('Hello World', 'hello world')).toBe(true);
    expect(outputsMatch('  hello   world  ', 'hello world')).toBe(true);
    expect(outputsMatch('hello\nworld', 'hello world')).toBe(true);
    expect(outputsMatch('HELLO\t\tWORLD', 'hello world')).toBe(true);
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

  it('handles complex screenreader scenarios', () => {
    const output1 =
      '  Button "Save"\n  You are currently on a button.\n  To activate press Enter.  ';
    const output2 =
      'button "save" you are currently on a button. to activate press enter.';
    const output3 =
      'BUTTON\t"SAVE"\nYou Are Currently On A Button.\nTo Activate Press Enter.';

    expect(outputsMatch(output1, output2)).toBe(true);
    expect(outputsMatch(output1, output3)).toBe(true);
    expect(outputsMatch(output2, output3)).toBe(true);
  });

  it('detects meaningful differences despite formatting similarities', () => {
    const output1 = 'Button "Save" clickable';
    const output2 = 'Button "Submit" clickable';
    const output3 = 'Link "Save" clickable';

    expect(outputsMatch(output1, output2)).toBe(false);
    expect(outputsMatch(output1, output3)).toBe(false);
  });
});
