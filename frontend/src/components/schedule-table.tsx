import { DAY_ORDER, formatTimeSlot } from "@/utils/Helpers";
import { AlertCircle, Loader } from "lucide-react";
import { TableCell } from "@/components/table-cell";
import { IScheduleItem } from "@/lib/types";
import ScheduleItem from "@/components/schedule-item";

export default function ScheduleTable({
  schedules,
  droppable,
  daysMap,
  generatedTimeSlots,
  onDeleteSchedule,
  timeSlotsError,
  scheduleTableRef,
}: {
  schedules: IScheduleItem[];
  droppable: boolean;
  daysMap: Record<string, string>;
  generatedTimeSlots: string[];
  onDeleteSchedule: (id: number) => void;
  timeSlotsError: boolean;
  scheduleTableRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sortedDays = Object.entries(daysMap).sort(([a], [b]) => {
    return DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b);
  });

  return (
    <div
      ref={scheduleTableRef}
      className="overflow-x-visible print:p-4 print:bg-white"
    >
      <table className="w-full table-fixed print:w-full">
        <thead>
          {!timeSlotsError && (
            <tr className="border-b">
              <th className="w-24 py-3 text-center font-medium text-gray-500 dark:text-gray-300">
                Dia
              </th>
              {sortedDays.map(([apiDay, ptDay]) => (
                <th
                  key={apiDay}
                  className="py-3 text-center font-medium text-gray-500 min-w-[200px] dark:text-gray-300"
                >
                  {ptDay}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {timeSlotsError ? (
            <tr>
              <td colSpan={sortedDays.length + 1} className="text-center py-12">
                <div className="max-w-md mx-auto p-4 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-indigo-100 p-4 mb-6">
                      <AlertCircle className="h-12 w-12 text-indigo-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1 text-secondary-foreground">
                      Horários não cadastrados
                    </h3>
                    <p className="text-muted-foreground text-center">
                      Este curso não possui horários cadastrados. Por favor,
                      cadastre os horários disponíveis para este curso.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          ) : generatedTimeSlots.length === 0 ? (
            <tr>
              <td colSpan={sortedDays.length + 1} className="text-center py-12">
                <Loader className="animate-spin mx-auto text-gray-500" />
              </td>
            </tr>
          ) : (
            generatedTimeSlots.map((timeSlot) => (
              <tr key={timeSlot} className="border-b">
                <td className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {timeSlot}
                </td>

                {sortedDays.map(([apiDay, ptDay]) => {
                  const cellSchedules = schedules.filter(
                    (s) =>
                      s.dayOfWeek === apiDay &&
                      formatTimeSlot(s.startTime, s.endTime) === timeSlot
                  );

                  return (
                    <TableCell
                      key={`${ptDay}-${timeSlot}`}
                      id={`${apiDay}|${timeSlot}`}
                      droppable={droppable}
                    >
                      {cellSchedules.map((schedule) => (
                        <ScheduleItem
                          key={schedule.id}
                          schedule={schedule}
                          draggable={droppable}
                          onDeleteSchedule={onDeleteSchedule}
                        />
                      ))}
                    </TableCell>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
