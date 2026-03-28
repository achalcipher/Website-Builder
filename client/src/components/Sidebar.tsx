import React, { useEffect, useRef, useState } from 'react'
import type { Message, Project, Version } from '../types';
import { BotIcon, ClipboardCopyIcon, EyeIcon, Loader2Icon, SendIcon, UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/configs/axios';
import { toast } from 'sonner';

const MAX_HISTORY = 5;

interface SidebarProps {
    isMenuOpen: boolean;
    project: Project;
    setProject: (project: Project) => void;
    isGenerating: boolean;
    setIsGenerating: (isGenerating: boolean) => void;
}

const Sidebar = ({ isMenuOpen, project, setProject, isGenerating, setIsGenerating }: SidebarProps) => {
    const messageRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState('')
    const [rollbackConfirmId, setRollbackConfirmId] = useState<string | null>(null)
    const [promptHistory, setPromptHistory] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem('promptHistory') || '[]') } catch { return [] }
    })

    const fetchProject = async () => {
        try {
            const { data } = await api.get(`/api/user/project/${project.id}`)
            setProject(data.project)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    const handleRollback = async (versionId: string) => {
        try {
            setRollbackConfirmId(null)
            setIsGenerating(true)
            const { data } = await api.get(`/api/project/rollback/${project.id}/${versionId}`);
            const { data: data2 } = await api.get(`/api/user/project/${project.id}`);
            toast.success(data.message)
            setProject(data2.project)
            setIsGenerating(false)
        } catch (error: any) {
            setIsGenerating(false)
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    const handleRevisions = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return;
        let interval: number | undefined;
        let retries = 0;
        try {
            // save to prompt history
            const updated = [input, ...promptHistory.filter(p => p !== input)].slice(0, MAX_HISTORY)
            setPromptHistory(updated)
            localStorage.setItem('promptHistory', JSON.stringify(updated))

            setIsGenerating(true);
            interval = window.setInterval(() => {
                retries++;
                fetchProject();
                if (retries >= 18) {
                    clearInterval(interval);
                    setIsGenerating(false);
                    toast.error('Revision is taking too long. Please try again.');
                }
            }, 10000)
            const { data } = await api.post(`/api/project/revision/${project.id}`, { message: input })
            fetchProject();
            toast.success(data.message)
            setInput('')
            clearInterval(interval)
            setIsGenerating(false);
        } catch (error: any) {
            setIsGenerating(false);
            clearInterval(interval)
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    const handleShare = () => {
        const url = `${window.location.origin}/view/${project.id}`
        navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
    }

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [project.conversation.length, isGenerating])

    return (
        <div className={`h-full sm:max-w-sm rounded-xl bg-gray-900 border-gray-800 transition-all ${isMenuOpen ? 'max-sm:w-0 overflow-hidden' : 'w-full'}`}>
            <div className='flex flex-col h-full'>
                {/* Header */}
                <div className='flex items-center justify-between px-3 pt-3 pb-1'>
                    <span className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Chat</span>
                    {project.isPublished && (
                        <button onClick={handleShare} className='flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-300 transition-colors'>
                            <ClipboardCopyIcon className='size-3.5' /> Share
                        </button>
                    )}
                </div>

                {/* Messages */}
                <div className='flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4'>
                    {[...project.conversation, ...project.versions]
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        .map((message) => {
                            const isMessage = 'content' in message;
                            if (isMessage) {
                                const msg = message as Message;
                                const isUser = msg.role === 'user';
                                return (
                                    <div key={msg.id} className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                                        {!isUser && (
                                            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center shrink-0'>
                                                <BotIcon className='size-5 text-white' />
                                            </div>
                                        )}
                                        <div className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${isUser ? "bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-tr-none" : "rounded-tl-none bg-gray-800 text-gray-100"}`}>
                                            {msg.content}
                                        </div>
                                        {isUser && (
                                            <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0'>
                                                <UserIcon className='size-5 text-gray-200' />
                                            </div>
                                        )}
                                    </div>
                                )
                            } else {
                                const ver = message as Version;
                                return (
                                    <div key={ver.id} className='w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 shadow flex flex-col gap-2'>
                                        <div className='text-xs font-medium'>
                                            code updated <br />
                                            <span className='text-gray-500 text-xs font-normal'>
                                                {new Date(ver.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            {project.current_version_index === ver.id ? (
                                                <button className='px-3 py-1 rounded-md text-xs bg-gray-700'>Current version</button>
                                            ) : rollbackConfirmId === ver.id ? (
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-xs text-gray-300'>Rollback?</span>
                                                    <button onClick={() => handleRollback(ver.id)} className='text-xs text-green-400 hover:text-green-300 font-medium'>Yes</button>
                                                    <button onClick={() => setRollbackConfirmId(null)} className='text-xs text-gray-400 hover:text-white'>No</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setRollbackConfirmId(ver.id)} className='px-3 py-1 rounded-md text-xs bg-violet-600 hover:bg-violet-700 text-white transition-colors'>
                                                    Roll back
                                                </button>
                                            )}
                                            <Link target='_blank' to={`/preview/${project.id}/${ver.id}`}>
                                                <EyeIcon className='size-6 p-1 bg-gray-700 hover:bg-violet-600 transition-colors rounded' />
                                            </Link>
                                        </div>
                                    </div>
                                )
                            }
                        })}
                    {isGenerating && (
                        <div className='flex items-start gap-3 justify-start'>
                            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center shrink-0'>
                                <BotIcon className='size-5 text-white' />
                            </div>
                            <div className='flex gap-1.5 h-full items-end pb-1'>
                                <span className='size-2 rounded-full animate-bounce bg-gray-500' style={{ animationDelay: '0s' }} />
                                <span className='size-2 rounded-full animate-bounce bg-gray-500' style={{ animationDelay: '0.2s' }} />
                                <span className='size-2 rounded-full animate-bounce bg-gray-500' style={{ animationDelay: '0.4s' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messageRef} />
                </div>

                {/* Prompt history chips */}
                {promptHistory.length > 0 && !isGenerating && (
                    <div className='px-3 pb-1 flex flex-wrap gap-1.5'>
                        {promptHistory.slice(0, 3).map((p, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(p)}
                                className='text-xs px-2.5 py-1 rounded-full border border-gray-700 text-gray-500 hover:border-violet-600 hover:text-violet-300 transition-colors truncate max-w-[140px]'
                                title={p}
                            >
                                {p.length > 20 ? p.slice(0, 20) + '…' : p}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleRevisions} className='m-3 relative'>
                    <div className='flex items-center gap-2'>
                        <textarea
                            onChange={(e) => setInput(e.target.value)}
                            value={input}
                            rows={4}
                            placeholder='Describe changes or ask for revisions...'
                            className='flex-1 p-3 rounded-xl resize-none text-sm outline-none ring ring-gray-700 focus:ring-violet-500 bg-gray-800 text-gray-100 placeholder-gray-500 transition-all'
                            disabled={isGenerating}
                        />
                        <button
                            disabled={isGenerating || !input.trim()}
                            className='absolute bottom-2.5 right-2.5 rounded-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white transition-colors disabled:opacity-50'
                        >
                            {isGenerating
                                ? <Loader2Icon className='size-7 p-1.5 animate-spin text-white' />
                                : <SendIcon className='size-7 p-1.5 text-white' />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Sidebar
