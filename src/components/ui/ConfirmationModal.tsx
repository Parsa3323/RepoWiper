import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Repository } from '../../services/githubService';
import { Modal } from './Modal';

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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
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
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-700 bg-[#181818]">
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
              
              <div className="mt-4 rounded-lg border border-red-900/40 bg-red-950/20 p-3 text-sm">
                <p className="font-medium text-red-300">Warning</p>
                <p className="mt-1 text-red-200">
                  This action will permanently delete the selected repositories, including all code, issues, and pull requests.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col-reverse gap-2 border-t border-default-200 bg-[#181818] px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isProcessing}
              className="border-gray-600 text-gray-300 hover:bg-[#242424]"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              isLoading={isProcessing}
              leftIcon={<AlertTriangle className="h-4 w-4" />}
              className="border-2 border-red-700 bg-red-900/20 text-red-400 hover:bg-red-900/30"
            >
              {confirmLabel}
            </Button>
          </div>
    </Modal>
  );
};

export default ConfirmationModal;
