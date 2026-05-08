"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);


  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1a] text-white overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0ea5e9] rounded-full blur-[120px] opacity-20" aria-hidden="true" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00d4aa] rounded-full blur-[120px] opacity-20" aria-hidden="true" />

      <div className="z-10 flex flex-col items-center max-w-3xl text-center px-6">
        <div className="text-6xl mb-6" aria-hidden="true">🐟</div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4aa] to-[#0ea5e9]">Tuna.ai</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-10 font-light">
          Your AI travel planning buddy built specifically for content creators.
        </p>
        
        <button 
          onClick={() => {
            // Mock Auth for Hackathon: Set a token and redirect
            localStorage.setItem("tuna_auth_token", "mock_jwt_token_12345");
            router.push("/app");
          }}
          aria-label="Sign in with Google"
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0a0f1a] font-bold rounded-full text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
        <p className="mt-4 text-sm text-slate-500">
          Secure authentication powered by Firebase Auth
        </p>
      </div>
    </main>
  );
}
