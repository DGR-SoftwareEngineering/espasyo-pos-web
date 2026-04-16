import React from 'react';
import { Link } from 'core-lib/components';

const Custom404 = () => {
  return (
    <>

      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6f3b19] via-[#4e230f] to-[#291407] p-6 overflow-hidden">
        
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-75"
          style={{
            backgroundImage: 'url(/new-espasyo.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        <div className="absolute inset-0 z-0 bg-[#291407]/65" />

        <div className="relative z-10 w-full max-w-lg -translate-y-4 border border-amber-200/50 shadow-2xl rounded-[2rem] bg-[#2c1a0f]/95 p-10 text-center">
          
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2 text-amber-100">
            <span className="text-4xl">☕</span>
            <span className="text-5xl">🫘</span>
            <span className="text-4xl">☕</span>
          </div>

          <div className="absolute -top-16 left-1/4 flex gap-1">
            <span className="text-2xl rotate-12">🫘</span>
            <span className="text-2xl -rotate-12">🫘</span>
          </div>
          <div className="absolute -top-16 right-1/4 flex gap-1">
            <span className="text-2xl rotate-12">🫘</span>
            <span className="text-2xl -rotate-12">🫘</span>
          </div>

          <h1 className="text-9xl font-black text-amber-200/20 absolute top-10 left-0 right-0 pointer-events-none">
            404
          </h1>

          <div className="relative pt-10">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              PAGE NOT FOUND  !
            </h2>
            
            <div className="w-16 h-1 bg-amber-400 mx-auto mb-6 rounded-full" />

            <p className="text-stone-200 text-lg mb-10 leading-relaxed font-medium">
              We're sorry, the page you're looking for could not be found.
              Please go back to the login page.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/" className="px-10 py-4 bg-amber-400 text-stone-950 font-bold rounded-full shadow-lg shadow-amber-950/20">
                Return to Login
              </Link>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-widest">
            <div className="h-px w-8 bg-amber-300" />
            E'spasyo
            <div className="h-px w-8 bg-amber-300" />
          </div>
        </div>

        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-900/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-800/10 rounded-full blur-3xl" />
      </div>
    </>
  );
};

export default Custom404;	