
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div className='border-t border-gray-800 mt-24 py-6 px-4'>
      <div className='flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm mb-3'>
        <Link to='/' className='hover:text-gray-300 transition-colors'>Home</Link>
        <Link to='/pricing' className='hover:text-gray-300 transition-colors'>Pricing</Link>
        <Link to='/community' className='hover:text-gray-300 transition-colors'>Community</Link>
        <Link to='/projects' className='hover:text-gray-300 transition-colors'>My Projects</Link>
      </div>
      <p className='text-center text-gray-600 text-xs'>Copyright © 2025 AchalCipher. All rights reserved.</p>
    </div>
  )
}

export default Footer
