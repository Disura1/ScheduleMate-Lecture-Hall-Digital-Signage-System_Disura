export function startOfToday(): Date {
  const now = new Date();
  // Use LOCAL calendar date (matches what an admin actually picked in the date field),
  // but represent it as UTC midnight (matches how session dates are stored — see Session.sessionDate).
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function combineDateAndTime(date: Date, time: Date): Date {
  // `date` holds the correct calendar day (from startOfToday()); `time` holds the literal
  // HH:mm the admin entered (stored via UTC digits — see Session.startTime/endTime).
  // Building this as a LOCAL date-time (no Date.UTC here) makes the resulting instant match
  // what the admin actually meant: "this clock time, in the server's own timezone" — which is
  // what we need to compare correctly against the real current instant (`new Date()`).
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    time.getUTCHours(),
    time.getUTCMinutes(),
  );
}