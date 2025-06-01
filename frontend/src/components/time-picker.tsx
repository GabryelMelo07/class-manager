import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export const TimePicker = ({
  name,
  control,
  label,
}: {
  name: string;
  control: any;
  label: string;
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
          <FormLabel className="flex shrink-0">{label}</FormLabel>
          <div className="w-full">
            <FormControl>
              <div className="flex items-center gap-2">
                <Select
                  value={field.value?.hours?.toString() || '0'}
                  onValueChange={(value) => {
                    field.onChange({
                      ...field.value,
                      hours: parseInt(value, 10),
                    });
                  }}
                >
                  <SelectTrigger className="h-12 text-lg font-mono">
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem
                        key={hour}
                        value={hour.toString()}
                        className="hover:bg-accent hover:text-accent-foreground"
                      >
                        {hour.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-xl font-bold">:</span>

                <Select
                  value={field.value?.minutes?.toString() || '0'}
                  onValueChange={(value) => {
                    field.onChange({
                      ...field.value,
                      minutes: parseInt(value, 10),
                    });
                  }}
                >
                  <SelectTrigger className="h-12 text-lg font-mono">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem
                        key={minute}
                        value={minute.toString()}
                        className="hover:bg-accent hover:text-accent-foreground"
                      >
                        {minute.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};
