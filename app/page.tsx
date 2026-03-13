import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlayCircle, Search, Moon } from 'lucide-react'

// SVG placeholder for the logo based on the image provided
const AyuAiLogo = () => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-20 h-20 mb-4"
  >
    <path
      d="M100 20C100 20 120 60 140 70C160 80 150 120 130 140C110 160 100 160 100 160C100 160 80 160 60 140C40 120 30 80 50 70C70 60 100 20 100 20Z"
      fill="#E6AE8C"
      opacity="0.9"
    />
    <path
      d="M100 60C111.046 60 120 51.0457 120 40C120 28.9543 111.046 20 100 20C88.9543 20 80 28.9543 80 40C80 51.0457 88.9543 60 100 60Z"
      fill="#E6AE8C"
    />
    <path
      d="M50 100C30 120 20 150 50 180C80 180 120 160 160 130C160 130 130 140 100 140C70 140 50 100 50 100Z"
      fill="#43776C"
    />
    <path
      d="M50 120Q70 90 90 120Q70 130 50 120Z"
      fill="#43776C"
    />
    <circle cx="150" cy="50" r="5" fill="#E6AE8C" />
    <circle cx="170" cy="80" r="3" fill="#E6AE8C" />
    <circle cx="140" cy="30" r="2" fill="#E6AE8C" />
  </svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F3F5F6] flex flex-col justify-between font-sans selection:bg-[#0F9D6C]/20">
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16 sm:pt-24 text-center">
        
        {/* Logo and Branding */}
        <div className="flex flex-col items-center mb-8">
          <AyuAiLogo />
          <h1 className="text-4xl font-semibold text-[#0B3B32] tracking-tight">
            Ayu<span className="text-[#43776C]">Ai</span>
          </h1>
        </div>

        {/* Hero Copy */}
        <h2 className="text-2xl sm:text-3xl text-gray-700 font-medium mb-4 max-w-2xl text-balance">
          The bridge between your visit and your health.
        </h2>
        
        <p className="text-gray-500 mb-10 max-w-xl text-balance">
          AI-powered post-visit companion that helps you understand, remember, and follow through.
        </p>

        {/* Action Elements */}
        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
          
          {/* Watch Demo */}
          <button className="flex items-center gap-2 text-[#0F9D6C] font-medium hover:text-[#0C7F57] transition-colors group">
            <div className="bg-[#E0F2FE] p-2 rounded-full group-hover:bg-[#d1ece0] transition-colors">
              <PlayCircle className="w-5 h-5 fill-current text-[#0F9D6C] stroke-white" />
            </div>
            Watch Demo Video
          </button>

          {/* Auth Buttons */}
          <div className="flex flex-row w-full gap-4 justify-center">
            <Link href="/auth/signup?role=patient" className="flex-1">
              <Button 
                className="w-full h-12 rounded-xl bg-[#0F9D6C] hover:bg-[#0C7F57] text-white shadow-lg shadow-[#0F9D6C]/20 font-medium text-base transition-all active:scale-95"
              >
                Sign Up
              </Button>
            </Link>
            
            <Link href="/auth/login" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl text-[#0F9D6C] border border-[#0F9D6C] hover:bg-[#E0F2FE]/50 font-medium text-base transition-all active:scale-95"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Search CTA */}
          <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mt-2 text-sm">
            <Search className="w-4 h-4" />
            Find a Doctor by Symptoms
          </button>
        </div>
      </main>

      {/* Footer Area */}
      <footer className="w-full py-8 px-6 mt-16 text-center text-xs text-gray-400 flex flex-col items-center max-w-2xl mx-auto space-y-4">
        <p className="leading-relaxed text-balance">
          AyuAi helps you understand and act on your doctor's recommendations. It is not a 
          substitute for professional medical judgment.
        </p>
        <p>
          Built by <span className="underline decoration-gray-300">junaidjmomin</span> for the Built with Opus 4.6 hackathon by <span className="underline decoration-gray-300">Anthropic</span>
        </p>
      </footer>

      {/* Focus Mode Toast / Toggle (Decorative) */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-[#1f2937] text-white rounded-full px-4 py-2 flex items-center gap-3 shadow-xl cursor-pointer hover:bg-gray-800 transition-colors">
          <div className="bg-pink-400 w-4 h-4 rounded-full flex items-center justify-center">
            <Moon className="w-2.5 h-2.5 text-white" fill="currentColor"/>
          </div>
          <span className="text-sm font-semibold tracking-wide pr-1">Focus Mode</span>
          <div className="w-8 h-4 bg-gray-600 rounded-full relative">
            <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>

    </div>
  )
}
