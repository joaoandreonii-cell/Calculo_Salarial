export const formatTimeInput = (value: string): string => {
  // Remove non-digits
  const numbers = value.replace(/\D/g, '');
  
  // Prevent typing more than 4 digits (HHMM)
  let truncated = numbers.slice(0, 4);

  // Validate minutes constraint: Minutes part cannot be >= 60.
  // In HHMM format, the minutes are the last 2 digits if length is 4, or just the 3rd digit (tens) if length is 3.
  // The tens digit of minutes (3rd char) cannot be > 5.
  if (truncated.length >= 3) {
    const minutesTens = parseInt(truncated[2], 10);
    if (minutesTens > 5) {
      // If user tries to type a number > 5 for the first digit of minutes, we discard the new input part.
      // This enforces that minutes must be 00-59.
      truncated = truncated.slice(0, 2);
    }
  }

  // Format
  if (truncated.length > 2) {
    return `${truncated.slice(0, 2)}:${truncated.slice(2, 4)}`;
  }
  return truncated;
};

export const timeToDecimal = (timeString: string): number => {
  if (!timeString) return 0;
  
  const parts = timeString.split(':');
  
  // If user just typed "10", treat as 10 hours
  // If "10:30", treat as 10.5 hours
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1] ? parseInt(parts[1], 10) : 0;

  if (isNaN(hours)) return 0;
  
  // Standard conversion: hours + (minutes / 60)
  return hours + (minutes / 60);
};