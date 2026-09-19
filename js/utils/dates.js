const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export function getTimeRemaining(endsAt) {
  return new Date(endsAt).getTime() - Date.now();
}

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

export function getAuctionStatusDetails(endsAt) {
  const status = getAuctionStatus(endsAt);

  if (status === 'ending') {
    return {
      status,
      label: 'Ending soon',
      dotClass: 'bg-ending',
    };
  }

  if (status === 'ended') {
    return {
      status,
      label: 'Ended',
      dotClass: 'bg-muted',
    };
  }

  return {
    status,
    label: 'Open',
    dotClass: 'bg-open',
  };
}

export function formatTimeLeft(endsAt) {
  const remaining = getTimeRemaining(endsAt);

  if (remaining <= 0) {
    return 'Ended';
  }

  const days = Math.floor(remaining / DAY);
  const hours = Math.floor((remaining % DAY) / HOUR);
  const minutes = Math.max(1, Math.floor((remaining % HOUR) / MINUTE));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}
