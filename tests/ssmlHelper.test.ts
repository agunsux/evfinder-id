import { injectSSML } from '../src/lib/ssmlHelper';

describe('injectSSML', () => {
  test('wraps text with speak and prosody tags and replaces breaks', () => {
    const input = 'Hello world.\n\nTHIS IS TEST.';
    const output = injectSSML(input);
    // Verify wrapper tags
    expect(output).toContain('<speak>');
    expect(output).toContain('<prosody rate="0.94" pitch="-1.5st">');
    // Verify period break
    expect(output).toContain('<break time="450ms"/>');
    // Verify double newline break
    expect(output).toContain('<break time="850ms"/>');
    // Verify ALL-CAPS emphasis (THIS)
    expect(output).toContain('<emphasis level="strong">THIS</emphasis>');
  });
});
