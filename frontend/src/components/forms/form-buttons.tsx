import { Button } from '@/components/ui/button';

interface FormButtonsProps {
  onCancel: () => void;
  isEditMode?: boolean;
  disabled?: boolean;
}

export default function FormButtons({ 
  onCancel, 
  isEditMode = false,
  disabled = false
}: FormButtonsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button
        className="cursor-pointer hover:text-secondary-foreground"
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={disabled}
      >
        Cancelar
      </Button>
      <Button className="cursor-pointer" type="submit">
        {isEditMode ? "Atualizar" : "Salvar"}
      </Button>
    </div>
  );
}
