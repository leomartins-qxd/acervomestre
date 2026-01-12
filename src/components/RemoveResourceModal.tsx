import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { deleteRecurso } from "../services/api";

interface RemoveResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceTitle: string;
  resourceAuthor: string;
  resourceId?: number;
  onConfirmRemove?: () => void;
}

export function RemoveResourceModal({ 
  isOpen, 
  onClose, 
  resourceTitle,
  resourceAuthor,
  resourceId,
  onConfirmRemove
}: RemoveResourceModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    if (!resourceId) {
      setError('ID do recurso não encontrado');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteRecurso(resourceId);
      
      if (onConfirmRemove) {
        onConfirmRemove();
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover recurso');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl">Remover Recurso</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Tem certeza que deseja remover este recurso ?
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="font-medium text-sm mb-1">{resourceTitle}</div>
            <div className="text-sm text-gray-600">por {resourceAuthor}</div>
          </div>

          <p className="text-sm text-gray-600">
            Esta ação excluirá o recurso permanentemente.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleRemove}
              disabled={isDeleting}
              className="px-6 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Removendo...' : 'Remover'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}