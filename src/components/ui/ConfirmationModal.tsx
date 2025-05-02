import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Repository } from '../../services/githubService';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  isProcessing: boolean;
  repositories: Repository[];
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  isProcessing,
  repositories,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-[#242424] rounded-lg max-w-md w-full mx-auto shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-300 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 bg-red-900/20 rounded-full p-2">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-white">{title}</h3>
            </div>
            
            <div className="mt-3">
              <p className="text-sm text-gray-300">{message}</p>
              
              {repositories.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-200 mb-2">
                    Repositories to delete:
                  </h4>
                  <div className="max-h-48 overflow-y-auto rounded border border-gray-700 bg-[#2a2a2a]">
                    <ul className="divide-y divide-gray-700">
                      {repositories.map((repo) => (
                        <li key={repo.name} className="py-2 px-3 text-sm">
                          <div className="font-medium text-gray-200">{repo.name}</div>
                          {repo.description && (
                            <div className="text-xs text-gray-400 truncate">
                              {repo.description}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="text-sm bg-yellow-900/20 p-3 mt-4 rounded-md border border-yellow-800/30">
                <p className="text-yellow-300 font-medium">Warning</p>
                <p className="text-yellow-200 mt-1">
                  This action will permanently delete the selected repositories, including all code, issues, and pull requests.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2a2a2a] px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isProcessing}
              className="border-gray-600 text-gray-300 hover:bg-[#333333]"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              isLoading={isProcessing}
              leftIcon={<AlertTriangle className="h-4 w-4" />}
              className="bg-red-900/20 text-red-400 border-red-800/30 hover:bg-red-900/30"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;