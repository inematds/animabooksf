import { Suspense } from 'react';
import EditorClient from './EditorClient';

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-gray-100">
          <div className="text-gray-400 animate-pulse">Carregando...</div>
        </div>
      }
    >
      <EditorClient />
    </Suspense>
  );
}
