# Voice Flow

## Primary User Journey
1. User opens Voice Input screen.
2. User taps mic and speaks in Hindi/English.
3. App displays live transcript.
4. App submits transcript to backend extraction API.
5. Backend enforces daily limit and calls OpenAI extraction.
6. App displays extracted fields on confirmation sheet.
7. User edits fields if needed.
8. User confirms and saves.
9. Success toast + dashboard/list refresh.

## Screen States
- Idle: mic ready.
- Recording: visual waveform/timer.
- Transcript ready: editable text.
- Extracting: loader, disable duplicate submit.
- Confirm/edit: amount, category, item, date, notes.
- Saved: success feedback.
- Error states:
  - speech recognition failure
  - extraction parse failure
  - daily limit reached (upgrade CTA)
  - network failure

## Validation Rules Before Save
- Amount required and > 0.
- Category required from supported list.
- Date required and parsable.
- If extraction confidence is low (future enhancement), force manual confirmation.

## Edge Cases
- Empty transcript.
- Ambiguous amount (“paanch sau ya chhe sau”).
- Multi-expense sentence (“petrol aur chai”).
- Relative date words (“kal”, “aaj”, “last Monday”).

## Fallback Strategy
- If extraction fails, prefill manual form with transcript text.
- If limit reached, allow manual entry while prompting upgrade.
