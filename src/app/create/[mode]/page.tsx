import { Suspense } from 'react';
import CreativeClient from './CreativeClient';

const MODOS = ['decoration', 'construction', 'city', 'fashion', 'countryside'];

// Site estático: só os 5 modos existem como página. O projeto vem por ?id=.
export function generateStaticParams() {
  return MODOS.map((mode) => ({ mode }));
}

export const dynamicParams = false;

export default function CreativePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-gray-100">
          <div className="text-gray-400 animate-pulse">Carregando...</div>
        </div>
      }
    >
      <CreativeClient />
    </Suspense>
  );
}
