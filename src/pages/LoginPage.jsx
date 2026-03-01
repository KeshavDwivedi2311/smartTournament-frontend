import { Link } from 'react-router-dom';
import { Trophy, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ background: 'linear-gradient(135deg, #060a13 0%, #0c1929 50%, #060a13 100%)' }}
    >
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
          style={{ color: '#64748b', minHeight: 'auto' }}
          onMouseOver={e => e.currentTarget.style.color = '#00d4ff'}
          onMouseOut={e => e.currentTarget.style.color = '#64748b'}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Card */}
        <div className="rounded-2xl p-6 sm:p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy size={28} style={{ color: '#00d4ff' }} />
              <span className="text-xl font-bold" style={{ color: '#f1f5f9' }}>
                SmartSport
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#f1f5f9' }}>
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base" style={{ color: '#64748b' }}>
              Sign in to manage your tournaments
            </p>
          </div>

          <div className="space-y-3">
            <button
              className="w-full p-3 sm:p-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
                color: '#060a13',
                border: 'none',
              }}
            >
              Login with Magic Link
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3" style={{ background: 'rgba(6,10,19,0.8)', color: '#64748b' }}>
                  Or continue with
                </span>
              </div>
            </div>

            <button
              className="w-full p-3 sm:p-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
              }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              className="w-full p-3 sm:p-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
              }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm" style={{ color: '#475569' }}>
              By signing in, you agree to our{' '}
              <a href="#" style={{ color: '#00d4ff' }} className="hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" style={{ color: '#00d4ff' }} className="hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm" style={{ color: '#475569' }}>
              Don't have an account?{' '}
              <a href="#" style={{ color: '#00d4ff' }} className="font-medium hover:underline">
                Contact admin for access
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
