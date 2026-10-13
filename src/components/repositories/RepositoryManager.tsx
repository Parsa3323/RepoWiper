import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Github, LogOut, Search, Trash2, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, RefreshCw, Settings2, X, Lock, Unlock, ExternalLink, CalendarDays, MoreHorizontal, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '../ui/useToast';
import ConfirmationModal from '../ui/ConfirmationModal';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { LightRays } from '../ui/light-rays';
import { LineShadowText } from '../ui/line-shadow-text';
import { Dock, DockIcon } from '../ui/dock';
import { Repository, fetchUserRepositories, deleteRepository, updateRepository, User } from '../../services/githubService';
import { previewRepositories } from '../../services/mockData';
import { Checkbox, Select, SelectItem, Input, Spinner } from '@nextui-org/react';

interface RepositoryManagerProps {
  user: User;
  onLogout: () => void;
  isPreview?: boolean;
}

const getCalendarDays = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from({ length: firstDay + daysInMonth }, (_, index) => index < firstDay ? null : index - firstDay + 1);
};

const RepositoryManager: React.FC<RepositoryManagerProps> = ({ user, onLogout, isPreview = false }) => {
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
  const [contextMenu, setContextMenu] = useState<{ repository: Repository; x: number; y: number } | null>(null);
  const [mobileRepositoryMenu, setMobileRepositoryMenu] = useState<Repository | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileDockVisible, setIsMobileDockVisible] = useState(true);
  const dockHideTimer = useRef<number | null>(null);

  const revealMobileDock = useCallback(() => {
    setIsMobileDockVisible(true);
    if (dockHideTimer.current !== null) window.clearTimeout(dockHideTimer.current);
    if (selectedRepos.length > 0) {
      dockHideTimer.current = null;
      return;
    }
    dockHideTimer.current = window.setTimeout(() => setIsMobileDockVisible(false), 4000);
  }, [selectedRepos.length]);

  const handleLogout = () => {
    setIsProfileOpen(false);
    onLogout();
  };

  const fetchRepositories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (isPreview) {
        setRepositories(previewRepositories);
      } else {
        const result = await fetchUserRepositories();
        setRepositories(result.repositories);
      }
      
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
  }, [isPreview]);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  useEffect(() => {
    revealMobileDock();
    return () => {
      if (dockHideTimer.current !== null) window.clearTimeout(dockHideTimer.current);
    };
  }, [revealMobileDock, selectedRepos]);

  useEffect(() => {
    window.addEventListener('scroll', revealMobileDock, { passive: true });
    return () => window.removeEventListener('scroll', revealMobileDock);
  }, [revealMobileDock]);

  useEffect(() => {
    if (!contextMenu) return undefined;
    const closeContextMenu = () => setContextMenu(null);
    window.addEventListener('click', closeContextMenu);
    window.addEventListener('scroll', closeContextMenu, true);
    return () => {
      window.removeEventListener('click', closeContextMenu);
      window.removeEventListener('scroll', closeContextMenu, true);
    };
  }, [contextMenu]);

  const openRepositoryManager = (repository: Repository) => {
    setManagedRepository(repository);
    setManagedName(repository.name);
    setManagedVisibility(repository.visibility === 'private' ? 'private' : 'public');
  };

  const closeRepositoryManager = () => {
    if (!isSavingRepository) setManagedRepository(null);
  };

  const changeRepositoryVisibility = async (repository: Repository, visibility: 'public' | 'private') => {
    try {
      if (isPreview) {
        setRepositories((current) => current.map((item) => item.id === repository.id ? { ...item, visibility, private: visibility === 'private' } : item));
        toast({ title: 'Preview updated', description: `${repository.name} is now ${visibility}.` });
        return;
      }
      const updated = await updateRepository(user.login, repository.name, { name: repository.name, visibility });
      setRepositories((current) => current.map((item) => item.id === updated.id ? updated : item));
      toast({ title: 'Repository updated', description: `${updated.name} is now ${visibility}.` });
    } catch (err) {
      toast({ title: 'Could not update repository', description: err instanceof Error ? err.message : 'The repository could not be updated.', variant: 'destructive' });
    }
  };

  const handleRepositoryContextMenu = (event: React.MouseEvent, repository: Repository) => {
    event.preventDefault();
    if (window.innerWidth < 768) return;
    setContextMenu({
      repository,
      x: Math.min(event.clientX, window.innerWidth - 240),
      y: Math.min(event.clientY, window.innerHeight - 150),
    });
  };

  const openMobileRepositoryMenu = (event: React.MouseEvent, repository: Repository) => {
    event.stopPropagation();
    setMobileRepositoryMenu(repository);
  };

  const handleContextDelete = () => {
    if (!contextMenu) return;
    setSelectedRepos([contextMenu.repository.name]);
    setShowConfirmation(true);
    setContextMenu(null);
  };

  const handleContextVisibility = () => {
    if (!contextMenu) return;
    const repository = contextMenu.repository;
    const visibility = repository.visibility === 'private' ? 'public' : 'private';
    setContextMenu(null);
    void changeRepositoryVisibility(repository, visibility);
  };

  const handleContextRename = () => {
    if (!contextMenu) return;
    setManagedRepository(contextMenu.repository);
    setManagedName(contextMenu.repository.name);
    setManagedVisibility(contextMenu.repository.visibility === 'private' ? 'private' : 'public');
    setContextMenu(null);
  };

  const saveRepositoryChanges = async () => {
    if (!managedRepository || !managedName.trim()) return;
    try {
      setIsSavingRepository(true);
      if (isPreview) {
        const updatedName = managedName.trim();
        setRepositories((current) => current.map((repository) => repository.id === managedRepository.id ? {
          ...repository,
          name: updatedName,
          full_name: `${user.login}/${updatedName}`,
          visibility: managedVisibility,
          private: managedVisibility === 'private',
        } : repository));
        setManagedRepository(null);
        toast({ title: 'Preview updated', description: `${updatedName} was updated successfully.` });
        return;
      }
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
      if (isPreview) {
        setRepositories((prev) => prev.filter((repo) => !selectedRepos.includes(repo.name)));
        const deletedCount = selectedRepos.length;
        setSelectedRepos([]);
        toast({ title: 'Preview updated', description: `Simulated deletion of ${deletedCount} repositories.` });
        return;
      }
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
      <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#111111]">
        <LightRays color="rgba(255, 248, 220, 0.22)" />
        <header className="relative z-20 bg-[#111111] shadow-medium border-b border-divider">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">Repository Wiper</p>
                  <p className="mt-1 text-xl font-black tracking-tighter text-foreground">By <LineShadowText className="font-black italic" shadowColor="#ffffff">Rabity</LineShadowText></p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {user.login && (
                  <div className="group relative">
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen((open) => !open)}
                      className="flex h-9 w-9 items-center justify-center gap-2 rounded-xl p-1 text-left text-sm text-foreground-500 transition-colors hover:bg-[#181818] hover:text-foreground focus:outline-none focus:ring-1 focus:ring-default-300 md:h-auto md:w-auto md:justify-start md:px-2 md:py-1"
                      aria-label={`View profile for ${user.login}`}
                    >
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-7 w-7 rounded-full" />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#242424] text-xs font-semibold text-foreground">
                          {user.login.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="hidden md:inline">Signed in as <span className="font-medium text-foreground">{user.login}</span></span>
                    </button>
                    <div className={`absolute right-0 top-full z-30 w-64 max-w-[calc(100vw-2rem)] pt-2 md:left-1/2 md:right-auto md:-translate-x-1/2 ${isProfileOpen ? '!block' : 'hidden'} md:group-hover:block md:group-focus-within:block`}>
                      <div className="rounded-2xl border border-default-200 bg-[#111111] p-4 text-foreground shadow-xl">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="h-12 w-12 rounded-full" />
                          ) : (
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#242424] text-lg font-semibold text-foreground">
                              {user.login.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{user.login}</p>
                            <p className="text-xs text-foreground-500">GitHub profile</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          className="mt-4 w-full"
                          rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                          onClick={() => window.open(user.html_url, '_blank', 'noopener,noreferrer')}
                        >
                          View profile
                        </Button>
                        <div className="md:hidden">
                          <Button
                            type="button"
                            variant="secondary"
                            className="mt-2 w-full"
                            leftIcon={<LogOut className="h-4 w-4" />}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleLogout();
                            }}
                          >
                            Logout
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-4 w-4" />}
                  className="hidden md:inline-flex"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="w-full min-w-0 lg:flex-1">
              <Input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="h-4 w-4 text-foreground-500" />}
                size="sm"
                classNames={{ inputWrapper: 'h-10 min-h-10 rounded-xl border border-default-200 bg-[#181818] shadow-none data-[hover=true]:bg-[#181818] group-data-[focus=true]:bg-[#181818]', input: 'text-foreground placeholder:text-foreground-500' }}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 lg:flex-none">
              <Select
                label="Sort by"
                selectedKeys={[sortBy]}
                onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'name')}
                className="hidden w-40 md:block"
                size="sm"
                classNames={{ trigger: 'h-10 min-h-10 rounded-xl border border-default-200 bg-[#181818] shadow-none data-[hover=true]:bg-[#181818]', label: 'text-xs text-foreground-500', value: 'text-foreground', popoverContent: 'rounded-xl border border-default-200 bg-[#111111] shadow-xl', listbox: 'bg-[#111111] text-foreground', listboxWrapper: 'bg-[#111111]' }}
              >
                <SelectItem key="updated" value="updated">Last updated</SelectItem>
                <SelectItem key="created" value="created">Created date</SelectItem>
                <SelectItem key="name" value="name">Name</SelectItem>
              </Select>

              <Button
                variant="secondary"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
                className="hidden h-10 min-w-10 px-0 md:flex"
              >
                <motion.span
                  animate={{ rotate: sortOrder === 'asc' ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="inline-flex"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </Button>
              
              <div className="ml-auto hidden gap-2 md:flex">
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

          <div className={`fixed bottom-4 left-1/2 z-30 -translate-x-1/2 transition-all duration-300 md:hidden ${isMobileDockVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
            <Dock iconSize={42} iconMagnification={58}>
              <DockIcon>
                <button type="button" onClick={fetchRepositories} aria-label="Refresh repositories" title="Refresh repositories" className="flex h-full w-full items-center justify-center rounded-xl text-foreground transition-colors hover:bg-[#242424]">
                  <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </DockIcon>
              <DockIcon>
                <button type="button" onClick={toggleSelectAll} disabled={paginatedRepositories.length === 0} aria-label="Select all repositories" title="Select all repositories" className="flex h-full w-full items-center justify-center rounded-xl text-foreground transition-colors hover:bg-[#242424] disabled:opacity-40">
                  <ListChecks className="h-5 w-5" />
                </button>
              </DockIcon>
              <DockIcon>
                <button type="button" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} aria-label="Change sort direction" title="Change sort direction" className="flex h-full w-full items-center justify-center rounded-xl text-foreground transition-colors hover:bg-[#242424]">
                  <motion.span animate={{ rotate: sortOrder === 'asc' ? 180 : 0 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="inline-flex">
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </button>
              </DockIcon>
              <DockIcon>
                <button type="button" onClick={() => setShowConfirmation(true)} disabled={selectedRepos.length === 0} aria-label="Delete selected repositories" title="Delete selected repositories" className="flex h-full w-full items-center justify-center rounded-xl text-danger transition-colors hover:bg-danger-50 disabled:opacity-40">
                  <Trash2 className="h-5 w-5" />
                </button>
              </DockIcon>
            </Dock>
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

          <div className="bg-[#111111] rounded-2xl shadow-medium overflow-visible">
            <div className="overflow-hidden rounded-t-2xl border-b border-divider">
              <div className="px-6 py-3 flex items-center bg-[#181818]">
                <div className="mr-4 flex h-5 w-5 items-center">
                  <Checkbox
                    size="sm"
                    color="default"
                    isSelected={selectedRepos.length === paginatedRepositories.length && paginatedRepositories.length > 0}
                    onValueChange={toggleSelectAll}
                    isDisabled={isLoading || paginatedRepositories.length === 0}
                    aria-label="Select all repositories"
                    classNames={{ base: 'm-0 min-w-0 p-0', wrapper: 'm-0 h-4 w-4 rounded-[4px]' }}
                  />
                </div>
                <div className="grid flex-1 grid-cols-1 items-center gap-x-8 gap-y-3 pr-8 sm:grid-cols-[minmax(0,1fr)_12rem_9rem_2.25rem]">
                  <div className="text-sm font-medium text-foreground">Repository</div>
                  <div className="hidden h-9 items-center text-sm font-medium text-foreground sm:flex">Last Updated</div>
                  <div className="hidden h-9 items-center text-sm font-medium text-foreground sm:flex">Visibility</div>
                  <div className="hidden h-9 items-center text-sm font-medium text-foreground sm:flex">Manage</div>
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
                  <li key={repo.name} onContextMenu={(event) => handleRepositoryContextMenu(event, repo)} className="px-6 py-4 transition-colors hover:bg-[#181818]">
                    <div className="flex items-center">
                      <div className="mr-4 flex h-5 w-5 items-center">
                        <Checkbox
                          size="sm"
                          color="default"
                          isSelected={selectedRepos.includes(repo.name)}
                          onValueChange={() => toggleRepositorySelection(repo.name)}
                          aria-label={`Select ${repo.name}`}
                          classNames={{ base: 'm-0 min-w-0 p-0', wrapper: 'm-0 h-4 w-4 rounded-[4px]' }}
                        />
                      </div>
                      <div className="grid flex-1 grid-cols-1 items-center gap-x-8 gap-y-3 pr-8 sm:grid-cols-[minmax(0,1fr)_12rem_9rem_2.25rem]">
                        <div className="relative">
                          <div className="pr-10">
                            <a 
                            href={repo.html_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-sm font-semibold text-white hover:text-gray-300 hover:underline"
                            >
                              <span className="inline-flex items-center gap-1.5">
                                {repo.name}
                                <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                              </span>
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
                          <button type="button" onClick={(event) => openMobileRepositoryMenu(event, repo)} aria-label={`Open actions for ${repo.name}`} title={`Open actions for ${repo.name}`} className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-xl text-foreground-500 transition-colors hover:bg-[#181818] hover:text-foreground md:hidden">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="relative hidden h-9 items-center text-sm text-foreground-500 sm:flex">
                          <div className="group relative">
                            <span className="inline-flex cursor-help items-center gap-1.5" tabIndex={0}>
                              {new Date(repo.updated_at).toLocaleDateString()}
                              <CalendarDays className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                            </span>
                            <div className="pointer-events-none absolute right-0 top-full z-30 mt-2 hidden w-56 rounded-xl border border-default-200 bg-[#111111] p-3 text-foreground shadow-xl group-hover:block group-focus-within:block">
                              <div className="mb-3 flex items-center justify-between text-xs font-medium text-foreground">
                                <span>{new Date(repo.updated_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                                <CalendarDays className="h-4 w-4 text-foreground-500" aria-hidden="true" />
                              </div>
                              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-foreground-500">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day}>{day}</span>)}
                              </div>
                              <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
                                {getCalendarDays(new Date(repo.updated_at)).map((day, index) => {
                                  const updatedDay = new Date(repo.updated_at).getDate();
                                  return <span key={`${repo.id}-${index}`} className={`flex h-6 items-center justify-center rounded-md ${day === updatedDay ? 'bg-white text-black font-semibold' : 'text-foreground-500'}`}>{day ?? ''}</span>;
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="hidden h-9 items-center sm:flex">
                          <span className="inline-flex items-center gap-1 rounded-full border border-gray-600 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                            {repo.visibility === 'private' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            {repo.visibility}
                          </span>
                        </div>
                        <div className="hidden h-9 items-center sm:flex">
                          <button
                            type="button"
                            onClick={() => openRepositoryManager(repo)}
                            aria-label={`Manage ${repo.name}`}
                            title={`Manage ${repo.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-[#181818] hover:text-foreground focus:outline-none focus:ring-1 focus:ring-default-300"
                          >
                            <Settings2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!isLoading && totalPages > 1 && (
              <>
                <div className="hidden items-center justify-between border-t border-divider bg-[#181818] px-6 py-3 md:flex">
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
                <div className="flex items-center justify-between border-t border-divider bg-[#181818] px-4 py-3 md:hidden">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                    className="h-9 min-w-9 px-0"
                  />
                  <span className="text-sm text-foreground-500">Page {currentPage} of {totalPages}</span>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    leftIcon={<ChevronRight className="h-4 w-4" />}
                    className="h-9 min-w-9 px-0"
                  />
                </div>
              </>
            )}
          </div>
        </main>
        
        <footer className="relative z-0 bg-[#111111] border-t border-divider md:z-10">
          <div className="container mx-auto px-4 py-4 text-center text-sm text-foreground-500">
            © {new Date().getFullYear()} GitHub Repository Wiper by Parsa3323. All rights reserved.
          </div>
        </footer>
      </div>

      <Modal isOpen={Boolean(managedRepository)} onClose={closeRepositoryManager} className="max-w-md p-0">
        <div className="p-6">
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
              className="mt-2 w-full rounded-md border border-default-200 bg-[#181818] px-3 py-2 text-sm text-foreground outline-none focus:border-gray-500"
            />
            <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="repository-visibility">Visibility</label>
            <select
              id="repository-visibility"
              value={managedVisibility}
              onChange={(event) => setManagedVisibility(event.target.value as 'public' | 'private')}
              disabled={isSavingRepository}
              className="mt-2 w-full rounded-md border border-default-200 bg-[#181818] px-3 py-2 text-sm text-foreground outline-none focus:border-gray-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-default-200 bg-[#181818] px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closeRepositoryManager} disabled={isSavingRepository}>Cancel</Button>
          <Button variant="secondary" onClick={saveRepositoryChanges} isLoading={isSavingRepository}>Save changes</Button>
        </div>
      </Modal>

      <Modal isOpen={Boolean(mobileRepositoryMenu)} onClose={() => setMobileRepositoryMenu(null)} className="max-w-sm p-0">
        {mobileRepositoryMenu && (
          <>
            <div className="p-6">
              <button type="button" aria-label="Close repository details" onClick={() => setMobileRepositoryMenu(null)} className="absolute right-4 top-4 text-foreground-500 hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
              <div className="pr-8">
                <a href={mobileRepositoryMenu.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-lg font-semibold text-foreground hover:text-gray-300 hover:underline">
                  {mobileRepositoryMenu.name}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                {mobileRepositoryMenu.description && <p className="mt-2 text-sm text-foreground-500">{mobileRepositoryMenu.description}</p>}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-default-200 bg-[#181818] p-3">
                  <p className="text-xs text-foreground-500">Last updated</p>
                  <p className="mt-1 text-sm text-foreground">{new Date(mobileRepositoryMenu.updated_at).toLocaleDateString()}</p>
                </div>
                <div className="rounded-xl border border-default-200 bg-[#181818] p-3">
                  <p className="text-xs text-foreground-500">Visibility</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm capitalize text-foreground">
                    {mobileRepositoryMenu.visibility === 'private' ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    {mobileRepositoryMenu.visibility}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-default-200 bg-[#181818] p-4">
              <Button
                variant="secondary"
                onClick={() => {
                  openRepositoryManager(mobileRepositoryMenu);
                  setMobileRepositoryMenu(null);
                }}
                leftIcon={<Settings2 className="h-4 w-4" />}
              >
                Manage
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const repository = mobileRepositoryMenu;
                  setMobileRepositoryMenu(null);
                  void changeRepositoryVisibility(repository, repository.visibility === 'private' ? 'public' : 'private');
                }}
                leftIcon={mobileRepositoryMenu.visibility === 'private' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              >
                {mobileRepositoryMenu.visibility === 'private' ? 'Make public' : 'Make private'}
              </Button>
              <Button
                variant="danger"
                className="col-span-2"
                onClick={() => {
                  setSelectedRepos([mobileRepositoryMenu.name]);
                  setMobileRepositoryMenu(null);
                  setShowConfirmation(true);
                }}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Delete repository
              </Button>
            </div>
          </>
        )}
      </Modal>

      {contextMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-50 hidden w-56 overflow-hidden rounded-2xl border border-default-200 bg-[#111111] p-2 shadow-xl md:block"
          style={{ left: contextMenu.x, top: contextMenu.y, transformOrigin: 'top left' }}
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <p className="truncate px-3 py-2 text-xs text-foreground-500">{contextMenu.repository.name}</p>
          <div className="space-y-1">
            <button type="button" onClick={handleContextRename} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#181818]">
              <Settings2 className="h-4 w-4" />
              Rename repository
            </button>
            <button type="button" onClick={handleContextVisibility} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#181818]">
              {contextMenu.repository.visibility === 'private' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              Make {contextMenu.repository.visibility === 'private' ? 'public' : 'private'}
            </button>
            <button type="button" onClick={handleContextDelete} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-50">
              <Trash2 className="h-4 w-4" />
              Delete repository
            </button>
          </div>
        </motion.div>
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
