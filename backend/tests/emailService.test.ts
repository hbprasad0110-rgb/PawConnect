import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { emailTemplateUtils } from '../src/services/emailService.ts';

describe('email templates', () => {
  it('escapes user-controlled values before placing them in HTML', () => {
    assert.equal(
      emailTemplateUtils.escapeHtml('<script>alert("x")</script> & test'),
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; test',
    );
  });

  it('formats appointment times in the shelter timezone', () => {
    const formatted = emailTemplateUtils.dateTime('2026-10-26T16:00:00.000Z');
    assert.match(formatted, /October 26, 2026/);
    assert.match(formatted, /11:00 AM/);
  });
});
