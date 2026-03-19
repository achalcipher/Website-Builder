import api from '@/configs/axios';
import { authClient } from '@/lib/auth-client';
import { Loader2Icon } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Home = () => {

  const {data: session} = authClient.useSession()
  const navigate = useNavigate()

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if(!session?.user){
        return toast.error('Please sign in to create a project')
      }else if(!input.trim()){
        return toast.error('Please enter a message')
      }
      setLoading(true)
      const {data} = await api.post('/api/user/project', {initial_prompt: input});
      setLoading(false);
      navigate(`/projects/${data.projectId}`)
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }

  }

  return (
  
      <section className="flex flex-col items-center text-white text-sm pb-20 px-4 font-poppins">

        <div className="flex items-center gap-2 border border-violet-800/50 bg-violet-950/30 rounded-full p-1 pr-3 text-sm mt-20">
          <span className="bg-violet-600 text-xs px-3 py-1 rounded-full">NEW</span>
          <p className="flex items-center gap-2 text-gray-300">
            <span>AI-powered website generation is here</span>
            <svg className="mt-px" width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m1 1 4 3.5L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </p>
        </div>

        <h1 className="text-center text-[40px] leading-[48px] md:text-6xl md:leading-[70px] mt-4 font-semibold max-w-3xl">
          Build stunning websites with the power of AI.
        </h1>

        <p className="text-center text-base max-w-md mt-2 text-gray-400">
          Describe your idea and AchalCipher turns it into a fully functional website in seconds.
        </p>

        <form onSubmit={onSubmitHandler} className="bg-white/10 max-w-2xl w-full rounded-xl p-4 mt-10 border border-violet-600/70 focus-within:ring-2 ring-violet-500 transition-all">
          <textarea onChange={e => setInput(e.target.value)} className="bg-transparent outline-none text-gray-300 resize-none w-full" rows={4} placeholder="Describe your website in detail..." required />
          <button className="ml-auto flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-md px-4 py-2">
            {!loading ? 'Build with AI' : (
              <>
              Building <Loader2Icon className='animate-spin size-4 text-white'/>
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mx-auto mt-16">
          <div className="flex flex-col items-center text-center">
            <span className="text-2xl font-semibold text-white">10k+</span>
            <span className="text-xs text-gray-500 mt-1">Websites Built</span>
          </div>
          <div className="w-px h-8 bg-gray-700 hidden md:block" />
          <div className="flex flex-col items-center text-center">
            <span className="text-2xl font-semibold text-white">500+</span>
            <span className="text-xs text-gray-500 mt-1">Active Builders</span>
          </div>
          <div className="w-px h-8 bg-gray-700 hidden md:block" />
          <div className="flex flex-col items-center text-center">
            <span className="text-2xl font-semibold text-white">99%</span>
            <span className="text-xs text-gray-500 mt-1">Satisfaction Rate</span>
          </div>
          <div className="w-px h-8 bg-gray-700 hidden md:block" />
          <div className="flex flex-col items-center text-center">
            <span className="text-2xl font-semibold text-white">&lt; 30s</span>
            <span className="text-xs text-gray-500 mt-1">Avg. Generation Time</span>
          </div>
        </div>
      </section>

  )
}

export default Home
