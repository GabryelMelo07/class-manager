export const requiredFieldMessage = "Este campo é obrigatório";

export const DAY_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export const groupColors = [
  { name: "red", bgClass: "bg-red-100", darkerBgClass: "bg-red-500", borderClass: "border-red-500" },
  { name: "green", bgClass: "bg-green-100", darkerBgClass: "bg-green-500", borderClass: "border-green-500" },
  { name: "blue", bgClass: "bg-blue-100", darkerBgClass: "bg-blue-500", borderClass: "border-blue-500" },
  { name: "yellow", bgClass: "bg-yellow-100", darkerBgClass: "bg-yellow-500", borderClass: "border-yellow-500" },
  { name: "orange", bgClass: "bg-orange-100", darkerBgClass: "bg-orange-500", borderClass: "border-orange-500" },
  { name: "purple", bgClass: "bg-purple-100", darkerBgClass: "bg-purple-500", borderClass: "border-purple-500" },
  { name: "pink", bgClass: "bg-pink-100", darkerBgClass: "bg-pink-500", borderClass: "border-pink-500" },
  { name: "indigo", bgClass: "bg-indigo-100", darkerBgClass: "bg-indigo-500", borderClass: "border-indigo-500" },
  { name: "cyan", bgClass: "bg-cyan-100", darkerBgClass: "bg-cyan-500", borderClass: "border-cyan-500" },
  { name: "teal", bgClass: "bg-teal-100", darkerBgClass: "bg-teal-500", borderClass: "border-teal-500" },
  { name: "lime", bgClass: "bg-lime-100", darkerBgClass: "bg-lime-500", borderClass: "border-lime-500" },
  { name: "emerald", bgClass: "bg-emerald-100", darkerBgClass: "bg-emerald-500", borderClass: "border-emerald-500" },
];

export const getColorClasses = (colorName: string) => {
  const color = groupColors.find(c => c.name === colorName);
  return color || { bgClass: '', borderClass: '', name: '' };;
};

export const formatTimeSlot = (startTime: string, endTime: string) => {
  const format = (time: string) => time.slice(0, 5); // Remove os segundos
  return `${format(startTime)}-${format(endTime)}`;
};
