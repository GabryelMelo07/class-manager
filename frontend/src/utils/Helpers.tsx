export const formatTimeSlot = (startTime: string, endTime: string) => {
  const format = (time: string) => time.slice(0, 5); // Remove os segundos
  return `${format(startTime)}-${format(endTime)}`;
};
