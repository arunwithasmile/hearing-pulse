/**
 * Returns the local date and time as a string formatted for a `datetime-local` input.
 * The format is `YYYY-MM-DDTHH:mm`.
 */
export function getLocalISOString(date: Date): string {
    // Adjust for the local timezone offset to get the correct local time for the input default
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    const isoString = localDate.toISOString();
    return isoString.substring(0, isoString.lastIndexOf(':'));
}