import React, { useState, useEffect } from 'react';
import { Github, LogOut, Search, Trash2, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, RefreshCw, Settings2, X } from 'lucide-react';
import { toast } from '../ui/useToast';
import ConfirmationModal from '../ui/ConfirmationModal';
import { Button } from '../ui/Button';
import { Repository, fetchUserRepositories, deleteRepository, updateRepository, User } from '../../services/githubService';
import { Select, SelectItem, Input, Spinner } from '@nextui-org/react';

interface RepositoryManagerProps {
  user: User;
  onLogout: () => void;
}

const RepositoryManager: React.FC<RepositoryManagerProps> = ({ user, onLogout }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'created'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [managedRepository, setManagedRepository] = useState<Repository | null>(null);
  const [managedName, setManagedName] = useState('');
  const [managedVisibility, setManagedVisibility] = useState<'public' | 'private'>('public');
  const [isSavingRepository, setIsSavingRepository] = useState(false);

  const fetchRepositories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchUserRepositories();
      setRepositories(result.repositories);
      
      setSelectedRepos([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch repositories',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const openRepositoryManager = (repository: Repository) => {
    setManagedRepository(repository);
    setManagedName(repository.name);
    setManagedVisibility(repository.visibility === 'private' ? 'private' : 'public');
  };

  const closeRepositoryManager = () => {
    if (!isSavingRepository) setManagedRepository(null);
  };

  const saveRepositoryChanges = async () => {
    if (!managedRepository || !managedName.trim()) return;
    try {
      setIsSavingRepository(true);
      const updated = await updateRepository(user.login, managedRepository.name, {
        name: managedName.trim(),
        visibility: managedVisibility,
      });
      setRepositories((current) => current.map((repository) => repository.id === updated.id ? updated : repository));
      setSelectedRepos((current) => current.map((name) => name === managedRepository.name ? updated.name : name));
      setManagedRepository(null);
      toast({ title: 'Repository updated', description: `${updated.name} was updated successfully.` });
    } catch (err) {
      toast({ title: 'Could not update repository', description: err instanceof Error ? err.message : 'The repository could not be updated.', variant: 'destructive' });
    } finally {
      setIsSavingRepository(false);
    }
  };

  useEffect(() => {
    const filtered = repositories.filter((repo) => 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const sorted = [...filtered].sort((a, b) => {
      const valueA = sortBy === 'name' ? a.name : sortBy === 'created' ? new Date(a.created_at).getTime() : new Date(a.updated_at).getTime();
      const valueB = sortBy === 'name' ? b.name : sortBy === 'created' ? new Date(b.created_at).getTime() : new Date(b.updated_at).getTime();
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredRepositories(sorted);
    setCurrentPage(1);
  }, [repositories, searchQuery, sortBy, sortOrder]);

  const toggleRepositorySelection = (repoId: string) => {
    setSelectedRepos((prev) => 
      prev.includes(repoId) 
        ? prev.filter((id) => id !== repoId) 
        : [...prev, repoId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRepos.length === paginatedRepositories.length) {
      setSelectedRepos([]);
    } else {
      setSelectedRepos(paginatedRepositories.map((repo) => repo.name));
    }
  };

  const handleDeleteRepositories = async () => {
    try {
      setIsDeleting(true);
      
      const results = await Promise.allSettled(
        selectedRepos.map((repoName) => 
          deleteRepository(user.login, repoName)
        )
      );
      
      const succeeded = results.filter((result) => result.status === 'fulfilled').length;
      const failed = results.filter((result) => result.status === 'rejected').length;
      
      const deletedRepoNames = selectedRepos.filter((_, index) => 
        results[index].status === 'fulfilled'
      );
      
      setRepositories((prev) => 
        prev.filter((repo) => !deletedRepoNames.includes(repo.name))
      );
      
      setSelectedRepos([]);
      
      toast({
        title: 'Repositories deleted',
        description: `Successfully deleted ${succeeded} repositories. ${failed ? `Failed to delete ${failed} repositories.` : ''}`,
        variant: failed ? 'destructive' : 'default',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete repositories',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  const totalPages = Math.ceil(filteredRepositories.length / pageSize);
  const paginatedRepositories = filteredRepositories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="bg-content1 shadow-medium border-b border-divider">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">Repository management</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">By Rabity</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {user.login && (
                  <span className="text-sm text-foreground-500">
                    Signed in as <span className="font-medium">{user.login}</span>
                  </span>
                )}
                <Button
                  variant="secondary"
                  onClick={onLogout}
                  leftIcon={<LogOut className="h-4 w-4" />}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="w-full min-w-0 lg:flex-1">
              <Input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="h-4 w-4 text-foreground-500" />}
                size="sm"
                classNames={{ inputWrapper: 'h-10 min-h-10' }}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 lg:flex-none">
              <Select
                label="Sort by"
                selectedKeys={[sortBy]}
                onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'name')}
                className="w-40"
                size="sm"
                classNames={{ trigger: 'h-10 min-h-10', label: 'text-xs' }}
              >
                <SelectItem key="updated" value="updated">Last updated</SelectItem>
                <SelectItem key="created" value="created">Created date</SelectItem>
                <SelectItem key="name" value="name">Name</SelectItem>
              </Select>

              <Button
                variant="secondary"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
                className="h-10 min-w-10 px-0"
              >
                {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              <div className="ml-auto flex gap-2">
                <Button
                  variant="secondary"
                  onClick={fetchRepositories}
                  isLoading={isLoading}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Refresh
                </Button>
                
                <Button
                  variant="danger"
                  onClick={() => setShowConfirmation(true)}
                  disabled={selectedRepos.length === 0}
                  isLoading={isDeleting}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Delete Selected ({selectedRepos.length})
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-md p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-danger mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-danger">Failed to load repositories</h3>
                  <p className="text-sm text-danger mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-content1 rounded-lg shadow-medium overflow-hidden">
            <div className="border-b border-divider">
              <div className="px-6 py-3 flex items-center bg-content2">
                <div className="flex items-center mr-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-gray-500 accent-[#64748b] focus:ring-2 focus:ring-[#64748b]/40"
                    checked={selectedRepos.length === paginatedRepositories.length && paginatedRepositories.length > 0}
                    onChange={toggleSelectAll}
                    disabled={isLoading || paginatedRepositories.length === 0}
                  />
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="text-sm font-medium text-foreground">Repository</div>
                  <div className="hidden sm:block text-sm font-medium text-foreground">Last Updated</div>
                  <div className="hidden sm:block text-sm font-medium text-foreground">Visibility</div>
                  <div className="hidden sm:block text-sm font-medium text-foreground">Manage</div>
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="px-6 py-12 text-center">
                <Spinner color="default" size="lg" className="mx-auto mb-4" />
                <p className="text-foreground-500">Loading repositories...</p>
              </div>
            )}

            {!isLoading && filteredRepositories.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Github className="h-12 w-12 text-foreground-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No repositories found</h3>
                <p className="text-foreground-500">
                  {searchQuery ? `No repositories matching "${searchQuery}"` : "You don't have any repositories yet."}
                </p>
              </div>
            )}

            {!isLoading && paginatedRepositories.length > 0 && (
              <ul className="divide-y divide-divider">
                {paginatedRepositories.map((repo) => (
                  <li key={repo.name} className="px-6 py-4 hover:bg-content2 transition-colors">
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer rounded border-gray-500 accent-[#64748b] focus:ring-2 focus:ring-[#64748b]/40"
                          checked={selectedRepos.includes(repo.name)}
                          onChange={() => toggleRepositorySelection(repo.name)}
                        />
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <a 
                            href={repo.html_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-sm font-semibold text-white hover:text-gray-300 hover:underline"
                          >
                            {repo.name}
                          </a>
                          {repo.description && (
                            <p className="text-sm text-foreground-500 mt-1 line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          <div className="mt-1 sm:hidden flex items-center text-xs text-foreground-500">
                            <span className="capitalize">{repo.visibility}</span>
                            <span className="mx-1">•</span>
                            <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="hidden sm:block text-sm text-foreground-500">
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </div>
                        <div className="hidden sm:block">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            repo.visibility === 'public'
                              ? 'border-success text-success-500'
                              : 'border-warning text-warning-500'
                          }`}>
                            {repo.visibility}
                          </span>
                        </div>
                        <div className="hidden items-center sm:flex">
                          <Button variant="secondary" onClick={() => openRepositoryManager(repo)} leftIcon={<Settings2 className="h-4 w-4" />}>
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!isLoading && totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-divider bg-content2">
                <div className="text-sm text-foreground-500">
                  Showing {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, filteredRepositories.length)} of {filteredRepositories.length}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    leftIcon={<ChevronRight className="h-4 w-4" />}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
        
        <footer className="bg-content1 border-t border-divider">
          <div className="container mx-auto px-4 py-4 text-center text-sm text-foreground-500">
            © {new Date().getFullYear()} GitHub Repository Wiper by Parsa3323. All rights reserved.
          </div>
        </footer>
      </div>

      {managedRepository && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeRepositoryManager} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-content1 p-6 shadow-xl">
            <button type="button" aria-label="Close manage repository dialog" onClick={closeRepositoryManager} className="absolute right-4 top-4 text-foreground-500 hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-foreground">Manage repository</h2>
            <p className="mt-1 text-sm text-foreground-500">Update the repository name or visibility.</p>
            <label className="mt-5 block text-sm font-medium text-foreground" htmlFor="repository-name">Name</label>
            <input
              id="repository-name"
              value={managedName}
              onChange={(event) => setManagedName(event.target.value)}
              disabled={isSavingRepository}
              className="mt-2 w-full rounded-md border border-default-200 bg-content2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="repository-visibility">Visibility</label>
            <select
              id="repository-visibility"
              value={managedVisibility}
              onChange={(event) => setManagedVisibility(event.target.value as 'public' | 'private')}
              disabled={isSavingRepository}
              className="mt-2 w-full rounded-md border border-default-200 bg-content2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={closeRepositoryManager} disabled={isSavingRepository}>Cancel</Button>
              <Button onClick={saveRepositoryChanges} isLoading={isSavingRepository}>Save changes</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleDeleteRepositories}
        title="Delete repositories"
        message={`Are you sure you want to delete ${selectedRepos.length} repositories? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        isProcessing={isDeleting}
        repositories={repositories.filter(repo => selectedRepos.includes(repo.name))}
      />
    </>
  );
};

export default RepositoryManager;
