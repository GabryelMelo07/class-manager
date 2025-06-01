// import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Check } from "lucide-react";

interface CustomCheckboxGroupProps {
  options: { value: number; label: string }[];
  selectedValues: number[];
  onChange: (values: number[]) => void;
}

interface CustomCheckboxProps {
  children: React.ReactNode;
  value: string;
  checked: boolean;
  onChange: (value: string, checked: boolean) => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  children,
  value,
  checked,
  onChange,
}) => {
  return (
    <label className="inline-flex items-center">
      <VisuallyHidden>
        <Checkbox
          checked={checked}
          onCheckedChange={(isChecked) => onChange(value, isChecked === true)}
        />
      </VisuallyHidden>
      <Badge
        variant={checked ? "default" : "outline"}
        className={`transition-colors cursor-pointer select-none ${
          checked ? "pl-2" : "px-3"
        }`}
      >
        {checked && <Check className="h-4 w-4 mr-1" />}
        {children}
      </Badge>
    </label>
  );
};

export function CustomCheckboxGroup({ options, selectedValues, onChange  }: CustomCheckboxGroupProps) {
  // const [groupSelected, setGroupSelected] = useState<string[]>(["todos"]);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const numericValue = parseInt(value);
    
    if (value === "todos") {
      onChange([]);
    } else {
      let newSelection = [...selectedValues];
      
      if (checked) {
        newSelection.push(numericValue);
      } else {
        newSelection = newSelection.filter(v => v !== numericValue);
      }
      
      onChange(newSelection);
    }
  };

  const isAllSelected = selectedValues.length === 0;

  return (
    <div className="flex flex-col gap-1 w-full">
      <h2 className="text-sm font-medium">Semestres</h2>
      <div className="flex flex-wrap gap-2">
        <CustomCheckbox
          value="todos"
          checked={isAllSelected}
          onChange={handleCheckboxChange}
        >
          Todos
        </CustomCheckbox>
        
        {options.map((option) => (
          <CustomCheckbox
            key={option.value}
            value={option.value.toString()}
            checked={selectedValues.includes(option.value)}
            onChange={handleCheckboxChange}
          >
            {option.label}
          </CustomCheckbox>
        ))}
      </div>
    </div>
  );
}
