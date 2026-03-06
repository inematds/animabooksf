import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/storageAdapter';
import { PlacedItem } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ViewProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  // Resolve background path - new format "path:filename" or legacy "filename"
  const bgSrc = (() => {
    const bg = project.background;
    if (bg.includes(':')) {
      const [path, filename] = bg.split(':');
      return `${path}${filename}`;
    }
    return `/assets/${project.type}/fundos/${bg}`;
  })();
  const layerOrder = { back: 0, main: 1, front: 2 };
  const sortedItems = [...project.items].sort((a: PlacedItem, b: PlacedItem) => {
    const layerDiff = layerOrder[a.layer] - layerOrder[b.layer];
    return layerDiff !== 0 ? layerDiff : a.zIndex - b.zIndex;
  });

  return (
    <main className="relative w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 to-gray-900">
      <Link
        href="/gallery"
        className="absolute top-3 left-3 z-50 px-3 py-1.5 text-sm rounded-full text-white/80 hover:text-white transition"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        ← Voltar
      </Link>

      <h1 className="text-white text-xl font-bold mb-4">{project.title}</h1>

      <div
        className="relative w-full max-w-4xl aspect-video overflow-hidden"
        style={{
          borderRadius: '20px',
          border: '3px solid rgba(255,255,255,0.10)',
          boxShadow: '0 0 60px rgba(100,60,200,0.12), 0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Background */}
        <Image
          src={bgSrc}
          alt="Fundo"
          fill
          className="object-cover"
        />

        {/* Items */}
        {sortedItems.map((item: PlacedItem, idx: number) => {
          const zBase = layerOrder[item.layer] * 100;
          return (
            <div
              key={item.id}
              className="absolute pointer-events-none select-none"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) scale(${item.scale}) rotate(${item.rotation}deg) ${item.flipped ? 'scaleX(-1)' : ''}`,
                zIndex: zBase + item.zIndex + idx,
              }}
            >
              <Image
                src={item.category.startsWith('sprites:')
                ? `/sprites/${item.assetId}`
                : `/assets/${item.category}/${item.assetId}`}
                alt={item.assetId}
                width={80}
                height={80}
                className="object-contain"
                style={{ width: 'auto', height: 'auto', maxWidth: '120px', maxHeight: '120px' }}
              />
            </div>
          );
        })}
      </div>

      <Link
        href={`/create/${project.type}/${id}`}
        className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-purple-500 hover:bg-purple-600 transition"
      >
        Editar
      </Link>
    </main>
  );
}
