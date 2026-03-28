import {Request, Response} from 'express'
import prisma from '../lib/prisma.js';
import openai from '../configs/openai.js';
import Stripe from 'stripe'

// Get User Credits
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        res.json({credits: user?.credits})
    } catch (error : any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// Controller Function to create New Project
export const createUserProject = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        const { initial_prompt } = req.body;

        if(!userId){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        if(user && user.credits < 5){
            return res.status(403).json({ message: 'add credits to create more projects' });
        }

        // Create a new project
        const project = await prisma.websiteProject.create({
            data: {
                name: initial_prompt.length > 50 ? initial_prompt.substring(0, 47) + '...' : initial_prompt,
                initial_prompt,
                userId
            }
        })

        // Update User's Total Creation
        await prisma.user.update({
            where: {id: userId},
            data: {totalCreation: {increment: 1}}
        })

        await prisma.conversation.create({
            data: {
                role: 'user',
                content: initial_prompt,
                projectId: project.id
            }
        })

        await prisma.user.update({
            where: {id: userId},
            data: {credits: {decrement: 5}}
        })

        res.json({projectId: project.id})

        const getFallbackTemplate = (prompt: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${prompt}</title>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>body{font-family:'Inter',sans-serif}</style>
</head>
<body class="bg-gray-950 text-white min-h-screen">
<nav class="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
  <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <span class="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AchalCipher</span>
    <div class="hidden md:flex gap-8 text-sm text-gray-400">
      <a href="#home" class="hover:text-white transition-colors">Home</a>
      <a href="#features" class="hover:text-white transition-colors">Features</a>
      <a href="#about" class="hover:text-white transition-colors">About</a>
      <a href="#contact" class="hover:text-white transition-colors">Contact</a>
    </div>
    <button class="bg-violet-600 hover:bg-violet-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors">Get Started</button>
  </div>
</nav>
<section id="home" class="min-h-screen flex items-center justify-center px-6 pt-20">
  <div class="text-center max-w-4xl">
    <div class="inline-flex items-center gap-2 bg-violet-950/50 border border-violet-800/50 rounded-full px-4 py-2 text-sm text-violet-300 mb-8">
      <span class="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></span>
      Built with AchalCipher AI
    </div>
    <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
      ${prompt.length > 40 ? prompt.substring(0,40)+'...' : prompt}
    </h1>
    <p class="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">A beautiful, modern website crafted with precision and style. Customize every element to match your vision.</p>
    <div class="flex flex-wrap gap-4 justify-center">
      <button class="bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 px-8 py-3 rounded-xl font-semibold transition-all active:scale-95">Get Started Free</button>
      <button class="border border-gray-700 hover:border-gray-500 px-8 py-3 rounded-xl font-semibold transition-all">Learn More</button>
    </div>
  </div>
</section>
<section id="features" class="py-24 px-6">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-4xl font-bold text-center mb-4">Features</h2>
    <p class="text-gray-400 text-center mb-16 max-w-xl mx-auto">Everything you need to build something amazing</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-violet-700 transition-colors">
        <div class="w-12 h-12 bg-violet-950 rounded-xl flex items-center justify-center mb-4 text-2xl">⚡</div>
        <h3 class="text-lg font-semibold mb-2">Lightning Fast</h3>
        <p class="text-gray-400 text-sm">Optimized for performance with modern web standards and best practices.</p>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-cyan-700 transition-colors">
        <div class="w-12 h-12 bg-cyan-950 rounded-xl flex items-center justify-center mb-4 text-2xl">🎨</div>
        <h3 class="text-lg font-semibold mb-2">Beautiful Design</h3>
        <p class="text-gray-400 text-sm">Stunning visuals with smooth animations and a modern aesthetic.</p>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-700 transition-colors">
        <div class="w-12 h-12 bg-purple-950 rounded-xl flex items-center justify-center mb-4 text-2xl">📱</div>
        <h3 class="text-lg font-semibold mb-2">Fully Responsive</h3>
        <p class="text-gray-400 text-sm">Looks perfect on every device, from mobile to desktop.</p>
      </div>
    </div>
  </div>
</section>
<section id="about" class="py-24 px-6 bg-gray-900/50">
  <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
    <div class="flex-1">
      <h2 class="text-4xl font-bold mb-6">About This Project</h2>
      <p class="text-gray-400 mb-4">This website was generated by AchalCipher AI based on your prompt. You can edit, revise, and customize it using the chat panel on the left.</p>
      <p class="text-gray-400">Use the revision feature to ask for changes — update colors, add sections, modify content, or completely redesign any part of this page.</p>
    </div>
    <div class="flex-1 bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <div class="space-y-4">
        <div class="flex items-center gap-3"><span class="text-green-400">✓</span><span class="text-gray-300">AI-generated HTML + Tailwind CSS</span></div>
        <div class="flex items-center gap-3"><span class="text-green-400">✓</span><span class="text-gray-300">Fully editable via chat</span></div>
        <div class="flex items-center gap-3"><span class="text-green-400">✓</span><span class="text-gray-300">Version history & rollback</span></div>
        <div class="flex items-center gap-3"><span class="text-green-400">✓</span><span class="text-gray-300">One-click publish & share</span></div>
        <div class="flex items-center gap-3"><span class="text-green-400">✓</span><span class="text-gray-300">Download as HTML file</span></div>
      </div>
    </div>
  </div>
</section>
<section id="contact" class="py-24 px-6">
  <div class="max-w-xl mx-auto text-center">
    <h2 class="text-4xl font-bold mb-4">Get In Touch</h2>
    <p class="text-gray-400 mb-10">Have questions? We'd love to hear from you.</p>
    <form class="space-y-4" onsubmit="event.preventDefault();alert('Message sent!')">
      <input type="text" placeholder="Your Name" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"/>
      <input type="email" placeholder="Your Email" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"/>
      <textarea rows="4" placeholder="Your Message" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"></textarea>
      <button type="submit" class="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 py-3 rounded-xl font-semibold transition-all active:scale-95">Send Message</button>
    </form>
  </div>
</section>
<footer class="border-t border-gray-800 py-8 px-6 text-center text-gray-500 text-sm">
  <p>© 2025 AchalCipher. Built with AI.</p>
</footer>
</body>
</html>`

        try {
            console.log('Starting AI generation for project:', project.id)

            const promptEnhanceResponse = await openai.chat.completions.create({
                model: 'deepseek/deepseek-chat-v3-0324:free',
                timeout: 30000,
                messages: [
                    { role: 'system', content: `You are a prompt enhancement specialist. Enhance the user's website request to be more specific and detailed. Return ONLY the enhanced prompt, 2-3 sentences max.` },
                    { role: 'user', content: initial_prompt }
                ]
            })

            const enhancedPrompt = promptEnhanceResponse.choices[0].message.content || initial_prompt;
            console.log('Prompt enhanced, generating code...')

            await prisma.conversation.create({ data: { role: 'assistant', content: `Enhancing your prompt and generating website...`, projectId: project.id } })

            const codeGenerationResponse = await openai.chat.completions.create({
                model: 'deepseek/deepseek-chat-v3-0324:free',
                timeout: 60000,
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert web developer. Output ONLY a complete HTML document. Use Tailwind CSS via <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>. No markdown, no code fences, no explanations. Just raw HTML.`
                    },
                    { role: 'user', content: `Create a complete website for: ${enhancedPrompt}` }
                ]
            })

            const aiCode = codeGenerationResponse.choices[0].message.content || '';
            const code = aiCode.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '').trim() || getFallbackTemplate(initial_prompt);
            console.log('Code generated, saving...')

            const version = await prisma.version.create({ data: { code, description: 'Initial version', projectId: project.id } })
            await prisma.conversation.create({ data: { role: 'assistant', content: "I've created your website! You can now preview it and request any changes.", projectId: project.id } })
            await prisma.websiteProject.update({ where: { id: project.id }, data: { current_code: code, current_version_index: version.id } })
            console.log('Project saved successfully:', project.id)

        } catch (aiError: any) {
            console.log('AI failed, using fallback template:', aiError.message)
            const fallback = getFallbackTemplate(initial_prompt)
            const version = await prisma.version.create({ data: { code: fallback, description: 'Initial version', projectId: project.id } })
            await prisma.conversation.create({ data: { role: 'assistant', content: "I've created your website! You can now preview it and request any changes.", projectId: project.id } })
            await prisma.websiteProject.update({ where: { id: project.id }, data: { current_code: fallback, current_version_index: version.id } })
        }

    } catch (error : any) {
        await prisma.user.update({
            where: {id: userId},
            data: {credits: {increment: 5}}
        })
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

// Controller Function to Get A Single User Project
export const getUserProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const {projectId} = req.params;

       const project = await prisma.websiteProject.findUnique({
        where: {id: projectId, userId},
        include: {
            conversation: {
                orderBy: {timestamp: 'asc'}
            },
            versions: {orderBy: {timestamp: 'asc'}}
        }
       })

        res.json({project})

    } catch (error : any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// Controller Function to Get All Users Projects
export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({ message: 'Unauthorized' });
        }

       const projects = await prisma.websiteProject.findMany({
        where: {userId},
        orderBy: {updatedAt: 'desc'}
       })

        res.json({projects})

    } catch (error : any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// Controller Function to Toggle Project Publish
export const togglePublish = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const {projectId} = req.params;

        const project = await prisma.websiteProject.findUnique({
            where: {id: projectId, userId}
        })

        if(!project){
            return res.status(404).json({ message: 'Project not found' });
        }

        await prisma.websiteProject.update({
            where: {id: projectId},
            data: {isPublished: !project.isPublished}
        })
       
        res.json({message: project.isPublished ? 'Project Unpublished' : 'Project Published Successfully'})

    } catch (error : any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// Controller Function to Purchase Credits
export const purchaseCredits = async (req: Request, res: Response) => {
    try {
        interface Plan {
            credits: number;
            amount: number;
        }

        const plans = {
            basic: {credits: 100, amount: 5},
            pro: {credits: 400, amount: 19},
            enterprise: {credits: 1000, amount: 49},
        }

        const userId = req.userId;
        const {planId} = req.body as {planId: keyof typeof plans}
        const origin = req.headers.origin as string;

        const plan: Plan = plans[planId]

        if(!plan){
            return res.status(404).json({ message: 'Plan not found' });
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: userId!,
                planId: req.body.planId,
                amount: plan.amount,
                credits: plan.credits
            }
        })

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

        const session = await stripe.checkout.sessions.create({
                success_url: `${origin}/loading`,
                cancel_url: `${origin}`,
                line_items: [
                    {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `AiSiteBuilder - ${plan.credits} credits`
                        },
                        unit_amount: Math.floor(transaction.amount) * 100
                    },
                    quantity: 1
                    },
                ],
                mode: 'payment',
                metadata: {
                    transactionId: transaction.id,
                    appId: 'ai-site-builder'
                },
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
                });

        res.json({payment_link: session.url})

    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}
