import { Button } from "@/components/ui/button"

interface GenericModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

export function GenericModal({ title, isOpen, onClose, onSave, children }: GenericModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>
        <div className="mb-6 text-gray-700">
          {children}
        </div>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            className="text-gray-900 hover:bg-gray-100"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={onSave}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
