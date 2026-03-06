'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { PlacedItem } from '@/lib/types';

interface CreativeCanvasProps {
  background: string;
  backgroundSrc: string; // full resolved src path
  items: PlacedItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<PlacedItem>) => void;
  onDropNewItem: (x: number, y: number) => void;
  bgError?: boolean;
  onBgError?: () => void;
}

export default function CreativeCanvas({
  background,
  backgroundSrc,
  items,
  selectedItemId,
  onSelectItem,
  onUpdateItem,
  onDropNewItem,
  bgError,
  onBgError,
}: CreativeCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const getCanvasPos = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 50, y: 50 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectItem(itemId);
    setDragging(itemId);

    const item = items.find((i) => i.id === itemId);
    if (item && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
      const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
      dragOffset.current = { x: mouseX - item.x, y: mouseY - item.y };
    }
  }, [items, onSelectItem]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const pos = getCanvasPos(e.clientX, e.clientY);
    onUpdateItem(dragging, {
      x: Math.max(2, Math.min(98, pos.x - dragOffset.current.x)),
      y: Math.max(2, Math.min(98, pos.y - dragOffset.current.y)),
    });
  }, [dragging, getCanvasPos, onUpdateItem]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvasBg) {
      onSelectItem(null);
    }
  }, [onSelectItem]);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const pos = getCanvasPos(e.clientX, e.clientY);
    onDropNewItem(pos.x, pos.y);
  }, [getCanvasPos, onDropNewItem]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Sort items by layer then zIndex
  const layerOrder = { back: 0, main: 1, front: 2 };
  const sortedItems = [...items].sort((a, b) => {
    const layerDiff = layerOrder[a.layer] - layerOrder[b.layer];
    return layerDiff !== 0 ? layerDiff : a.zIndex - b.zIndex;
  });

  return (
    <div
      ref={canvasRef}
      className="relative w-full aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-lg cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onDrop={handleCanvasDrop}
      onDragOver={handleDragOver}
    >
      {/* Background */}
      {bgError ? (
        <div data-canvas-bg className="absolute inset-0 bg-gradient-to-b from-sky-200 to-green-200 flex items-center justify-center text-gray-400 text-sm">
          Selecione um fundo
        </div>
      ) : (
        <Image
          src={backgroundSrc}
          alt="Fundo"
          fill
          className="object-cover pointer-events-none"
          data-canvas-bg
          onError={onBgError}
        />
      )}

      {/* Items */}
      {sortedItems.map((item, idx) => {
        const isSelected = selectedItemId === item.id;
        const zBase = layerOrder[item.layer] * 100;

        return (
          <div
            key={item.id}
            className={`absolute cursor-grab active:cursor-grabbing group ${
              isSelected ? 'ring-2 ring-purple-500 ring-offset-1 rounded' : ''
            }`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) scale(${item.scale}) rotate(${item.rotation}deg) ${item.flipped ? 'scaleX(-1)' : ''}`,
              zIndex: zBase + item.zIndex + idx,
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.category.startsWith('sprites:')
                ? `/sprites/${item.assetId}`
                : `/assets/${item.category}/${item.assetId}`}
              alt={item.assetId}
              className="object-contain pointer-events-none select-none"
              draggable={false}
              style={{ width: '80px', height: '80px', maxWidth: '120px', maxHeight: '120px' }}
            />
          </div>
        );
      })}
    </div>
  );
}
