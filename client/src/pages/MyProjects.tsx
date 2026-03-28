import React, { useEffect, useState } from 'react'
import type { Project } from '../types';
import { Loader2Icon, PlusIcon, TrashIcon, SearchIcon, PencilIcon, XIcon, CheckIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '@/configs/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

const MyProjects = () => {
    const {data: session, isPending} = authClient.useSession()
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([])
    const [search, setSearch] = useState('')
    const [renamingId, setRenamingId] = useState<string | null>(null)
    const [renameValue, setRenameValue] = useState('')
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const navigate = useNavigate()

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/api/user/projects')
            setProjects(data.projects)
            setLoading(false)
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    const deleteProject = async (projectId: string) => {
        try {
            const { data } = await api.delete(`/api/project/${projectId}`)
            toast.success(data.message);
            setDeleteConfirmId(null)
            fetchProjects()
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    const startRename = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation()
        setRenamingId(project.id)
        setRenameValue(project.name)
    }

    const saveRename = async (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!renameValue.trim()) return
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: renameValue } : p))
        toast.success('Project renamed')
        setRenamingId(null)
    }

    const filtered = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.initial_prompt.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        if (session?.user && !isPending) {
            fetchProjects()
        } else if (!isPending && !session?.user) {
            navigate('/');
            toast('Please login to view your projects');
        }
    }, [session?.user])

    return (
        <>
            <div className='px-4 md:px-16 lg:px-24 xl:px-32'>
                {loading ? (
                    <div className='flex items-center justify-center h-[80vh]'>
                        <Loader2Icon className='size-7 animate-spin text-violet-300' />
                    </div>
                ) : projects.length > 0 ? (
                    <div className='py-10 min-h-[80vh]'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
                            <h1 className='text-2xl font-medium text-white'>
                                My Projects <span className='text-gray-500 text-base font-normal'>({projects.length})</span>
                            </h1>
                            <div className='flex items-center gap-3'>
                                <div className='flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5'>
                                    <SearchIcon className='size-4 text-gray-500' />
                                    <input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder='Search projects...'
                                        className='bg-transparent outline-none text-sm text-gray-300 placeholder-gray-600 w-36'
                                    />
                                    {search && <XIcon onClick={() => setSearch('')} className='size-3.5 text-gray-500 cursor-pointer hover:text-white' />}
                                </div>
                                <button onClick={() => navigate('/')} className='flex items-center gap-2 text-white px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all text-sm'>
                                    <PlusIcon size={16} /> New
                                </button>
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className='flex flex-col items-center justify-center h-40 text-gray-500 text-sm'>
                                No projects match "{search}"
                            </div>
                        ) : (
                            <div className='flex flex-wrap gap-3.5'>
                                {filtered.map((project) => (
                                    <div
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                        key={project.id}
                                        className='relative group w-72 max-sm:mx-auto cursor-pointer bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-violet-700/20 hover:border-violet-800/80 transition-all duration-300'
                                    >
                                        <div className='relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800'>
                                            {project.current_code ? (
                                                <iframe
                                                    srcDoc={project.current_code}
                                                    className='absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none'
                                                    sandbox='allow-scripts allow-same-origin'
                                                    style={{ transform: 'scale(0.25)' }}
                                                />
                                            ) : (
                                                <div className='flex items-center justify-center h-full text-gray-600'>
                                                    <Loader2Icon className='size-5 animate-spin' />
                                                </div>
                                            )}
                                        </div>
                                        <div className='p-4 text-white bg-linear-180 from-transparent group-hover:from-violet-950 to-transparent transition-colors'>
                                            <div className='flex items-start justify-between gap-2'>
                                                {renamingId === project.id ? (
                                                    <input
                                                        autoFocus
                                                        value={renameValue}
                                                        onChange={e => setRenameValue(e.target.value)}
                                                        onClick={e => e.stopPropagation()}
                                                        onKeyDown={e => { if (e.key === 'Enter') saveRename(project.id, e as any) }}
                                                        className='flex-1 bg-gray-800 border border-violet-500 rounded px-2 py-0.5 text-sm outline-none'
                                                    />
                                                ) : (
                                                    <h2 className='text-sm font-medium line-clamp-2 flex-1'>{project.name}</h2>
                                                )}
                                                <div className='flex items-center gap-1 shrink-0' onClick={e => e.stopPropagation()}>
                                                    {renamingId === project.id ? (
                                                        <CheckIcon onClick={(e) => saveRename(project.id, e)} className='size-4 text-green-400 cursor-pointer hover:text-green-300' />
                                                    ) : (
                                                        <PencilIcon onClick={(e) => startRename(project, e)} className='size-3.5 text-gray-600 hover:text-gray-300 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity' />
                                                    )}
                                                </div>
                                            </div>
                                            <p className='text-gray-500 mt-1 text-xs line-clamp-1'>{project.initial_prompt}</p>
                                            <div onClick={e => e.stopPropagation()} className='flex justify-between items-center mt-4'>
                                                <span className='text-xs text-gray-600'>{new Date(project.createdAt).toLocaleDateString()}</span>
                                                <div className='flex gap-2 text-xs'>
                                                    <button onClick={() => navigate(`/preview/${project.id}`)} className='px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded transition-all'>Preview</button>
                                                    <button onClick={() => navigate(`/projects/${project.id}`)} className='px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded transition-colors'>Open</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div onClick={e => e.stopPropagation()}>
                                            {deleteConfirmId === project.id ? (
                                                <div className='absolute top-2 right-2 flex items-center gap-1.5 bg-gray-900 border border-red-500/50 rounded-lg px-2 py-1'>
                                                    <span className='text-xs text-gray-300'>Delete?</span>
                                                    <button onClick={() => deleteProject(project.id)} className='text-xs text-red-400 hover:text-red-300 font-medium'>Yes</button>
                                                    <button onClick={() => setDeleteConfirmId(null)} className='text-xs text-gray-400 hover:text-white'>No</button>
                                                </div>
                                            ) : (
                                                <TrashIcon
                                                    className='absolute top-3 right-3 scale-0 group-hover:scale-100 bg-white p-1.5 size-7 rounded text-red-500 cursor-pointer transition-all'
                                                    onClick={() => setDeleteConfirmId(project.id)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center h-[80vh]'>
                        <div className='text-6xl mb-4'>🚀</div>
                        <h1 className='text-2xl font-semibold text-gray-300'>No projects yet</h1>
                        <p className='text-gray-500 text-sm mt-2'>Create your first AI-generated website</p>
                        <button onClick={() => navigate('/')} className='text-white px-6 py-2 mt-6 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all'>
                            Create New
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </>
    )
}

export default MyProjects
