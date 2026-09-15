// Dates

const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

/**
 * Get remaining auction time.
 * @param {string} endsAt
 * @returns {number}
 */
export function getTimeRemaining(endsAt) {
  return new Date(endsAt).getTime() - Date.now();
}

/**
 * Get auction status.
 * @param {string} endsAt
 * @returns {"open"|"ending"|"ended"}
 */
export function getAuctionStatus(endsAt) {
  const remaining = getTimeRemaining(endsAt);

  if (remaining <= 0) {
    return 'ended';
  }

  if (remaining <= HOUR * 3) {
    return 'ending';
  }

  return 'open';
}

/**
 * Format auction time remaining.
 * @param {string} endsAt
 * @returns {string}
 */
export function formatTimeLeft(endsAt) {
  const remaining = getTimeRemaining(endsAt);

  if (remaining <= 0) {
    return 'Ended';
  }

  const days = Math.floor(remaining / DAY);

  const hours = Math.floor((remaining % DAY) / HOUR);

  const minutes = Math.floor((remaining % HOUR) / MINUTE);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${Math.max(minutes, 1)}m`;
}
