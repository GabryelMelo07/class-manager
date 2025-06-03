export const requiredFieldMessage = "Este campo é obrigatório";

export const groupColors = [
  { name: "red", bgClass: "bg-red-100", borderClass: "border-red-500" },
  { name: "green", bgClass: "bg-green-100", borderClass: "border-green-500" },
  { name: "blue", bgClass: "bg-blue-100", borderClass: "border-blue-500" },
  { name: "yellow", bgClass: "bg-yellow-100", borderClass: "border-yellow-500" },
  { name: "orange", bgClass: "bg-orange-100", borderClass: "border-orange-500" },
  { name: "purple", bgClass: "bg-purple-100", borderClass: "border-purple-500" },
  { name: "pink", bgClass: "bg-pink-100", borderClass: "border-pink-500" },
  { name: "indigo", bgClass: "bg-indigo-100", borderClass: "border-indigo-500" },
  { name: "cyan", bgClass: "bg-cyan-100", borderClass: "border-cyan-500" },
  { name: "teal", bgClass: "bg-teal-100", borderClass: "border-teal-500" },
  { name: "lime", bgClass: "bg-lime-100", borderClass: "border-lime-500" },
  { name: "emerald", bgClass: "bg-emerald-100", borderClass: "border-emerald-500" },
];

export const getColorClasses = (colorName: string) => {
  const color = groupColors.find(c => c.name === colorName);
  return color || { bgClass: '', borderClass: '', name: '' };;
};

export const formatTimeSlot = (startTime: string, endTime: string) => {
  const format = (time: string) => time.slice(0, 5); // Remove os segundos
  return `${format(startTime)}-${format(endTime)}`;
};
