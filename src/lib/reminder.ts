// Daily practice reminder as a calendar event (.ics). Works on iPhone and Android without a server:
// the phone's calendar shows the notification every day at the chosen time.

const pad = (n: number) => String(n).padStart(2, '0');

export function reminderIcs(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const start = new Date();
  start.setDate(start.getDate() + (start.getHours() * 60 + start.getMinutes() >= h * 60 + m ? 1 : 0));
  const day = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}`;
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  const url = location.origin + location.pathname;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ajna//Daily reminder//CS',
    'BEGIN:VEVENT',
    `UID:ajna-daily-${Date.now()}@ajna`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${day}T${pad(h)}${pad(m)}00`,
    'DURATION:PT10M',
    'RRULE:FREQ=DAILY',
    'SUMMARY:Ajna: 10 minut angličtiny',
    `DESCRIPTION:Udrž svou sérii! Otevři Ajnu: ${url}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Čas na angličtinu',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadReminder(time: string) {
  const blob = new Blob([reminderIcs(time)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ajna-pripominka.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
