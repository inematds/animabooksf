'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface StoryMeta {
  id: string;
  title: string;
  scenesCount: number;
}

/* ------------------------------------------------------------------ */
/*  Derive a consistent gradient hue from story title                  */
/* ------------------------------------------------------------------ */
function titleToHue(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

const cardEmojis = ['📖', '🌟', '🦋', '🐾', '🌸', '🎨', '🌈', '🏰', '🚀', '🧙'];

/* ------------------------------------------------------------------ */
/*  Floating decorative elements                                       */
/* ------------------------------------------------------------------ */
function FloatingDecoration({
  emoji,
  size,
  top,
  left,
  delay,
  duration,
}: {
  emoji: string;
  size: number;
  top: string;
  left: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none z-0"
      style={{ top, left, fontSize: size }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0.15, 0.35, 0.15],
        y: [0, -18, 0],
        rotate: [0, 8, -8, 0],
      }}
      transition={{
        repeat: Infinity,
        duration,
        delay,
        ease: 'easeInOut',
      }}
    >
      {emoji}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main HomeContent component                                         */
/* ------------------------------------------------------------------ */
export default function HomeContent({ stories: initialStories }: { stories: StoryMeta[] }) {
  const router = useRouter();
  const [stories, setStories] = useState(initialStories);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir "${title}"? Esta acao nao pode ser desfeita.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/stories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStories((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      {/* Decorative floating elements */}
      <FloatingDecoration emoji="⭐" size={28} top="8%" left="5%" delay={0} duration={4} />
      <FloatingDecoration emoji="☁️" size={38} top="12%" left="85%" delay={0.5} duration={5} />
      <FloatingDecoration emoji="✨" size={22} top="25%" left="92%" delay={1} duration={3.5} />
      <FloatingDecoration emoji="🌙" size={26} top="6%" left="70%" delay={1.5} duration={4.5} />
      <FloatingDecoration emoji="☁️" size={44} top="3%" left="35%" delay={0.8} duration={6} />
      <FloatingDecoration emoji="⭐" size={20} top="55%" left="3%" delay={2} duration={3.8} />
      <FloatingDecoration emoji="✨" size={18} top="70%" left="95%" delay={0.3} duration={4.2} />
      <FloatingDecoration emoji="🌸" size={24} top="80%" left="8%" delay={1.2} duration={5.2} />

      {/* Soft gradient orbs in background */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero header */}
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Animated mascot area */}
          <motion.div
            className="text-5xl sm:text-6xl mb-4 select-none"
            animate={{ rotate: [0, -5, 5, -3, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            📚
          </motion.div>

          <h1
            className="text-4xl sm:text-6xl font-extrabold mb-3 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Animabook SF
          </h1>

          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Crie e leia historias infantis interativas com personagens animados.
            <br />
            <span className="text-purple-400 font-medium">
              Um mundo de imaginacao espera por voce!
            </span>
          </p>
        </motion.div>

        {/* Primary CTA - Nova Historia */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
        >
          <Link href="/editor/new">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-white font-bold text-lg sm:text-xl cursor-pointer"
              style={{
                background:
                  'linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #f472b6 100%)',
                boxShadow:
                  '0 8px 32px rgba(139,92,246,0.35), 0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <span className="flex items-center gap-2">
                <span className="text-2xl">+</span>
                Nova Historia
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                  className="text-xl"
                >
                  ✨
                </motion.span>
              </span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Navigation buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {[
            { href: '/challenges', label: 'Desafios', icon: '🏆', color: 'purple' },
            { href: '/events', label: 'Eventos', icon: '🎉', color: 'pink' },
            { href: '/dashboard', label: 'Painel Educador', icon: '👩‍🏫', color: 'blue' },
            { href: '/profile', label: 'Perfil', icon: '🌟', color: 'amber' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-3 rounded-xl font-semibold text-sm sm:text-base cursor-pointer flex items-center gap-2"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(139,92,246,0.15)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  color: '#6d28d9',
                }}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Section title */}
        {stories.length > 0 && (
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <span className="text-2xl">📚</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700">
              Suas Historias
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent" />
          </motion.div>
        )}

        {/* Story cards grid */}
        {stories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {stories.map((story, idx) => {
              const hue = titleToHue(story.title);
              const emoji = cardEmojis[idx % cardEmojis.length];

              return (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.5 + idx * 0.08,
                    duration: 0.45,
                    ease: 'easeOut',
                  }}
                >
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative rounded-2xl p-5 sm:p-6 cursor-default overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.80)',
                      backdropFilter: 'blur(12px)',
                      border: `2px solid hsla(${hue}, 60%, 80%, 0.5)`,
                      boxShadow: `0 4px 20px hsla(${hue}, 50%, 60%, 0.10), 0 1px 4px rgba(0,0,0,0.04)`,
                    }}
                  >
                    {/* Decorative gradient corner */}
                    <div
                      className="absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] pointer-events-none"
                      style={{
                        background: `linear-gradient(135deg, hsla(${hue}, 70%, 85%, 0.4), transparent)`,
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl sm:text-3xl mt-0.5 select-none">{emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">
                            {story.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                            <span>🎬</span>
                            {story.scenesCount} cena{story.scenesCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-1">
                        <Link href={`/reader/${story.id}`} className="flex-1">
                          <motion.div
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="w-full text-center px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer"
                            style={{
                              background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 25) % 360}, 55%, 50%))`,
                              color: 'white',
                              boxShadow: `0 3px 12px hsla(${hue}, 60%, 40%, 0.25)`,
                            }}
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              <span>▶</span> Ler
                            </span>
                          </motion.div>
                        </Link>
                        <Link href={`/editor/${story.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer"
                            style={{
                              background: 'rgba(243,244,246,0.9)',
                              color: '#6b7280',
                              border: '1.5px solid rgba(209,213,219,0.6)',
                            }}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>✏️</span> Editar
                            </span>
                          </motion.div>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(story.id, story.title);
                          }}
                          disabled={deleting === story.id}
                          className="px-3 py-2 rounded-xl text-sm cursor-pointer"
                          style={{
                            background: 'rgba(254,226,226,0.9)',
                            color: '#dc2626',
                            border: '1.5px solid rgba(252,165,165,0.6)',
                          }}
                        >
                          {deleting === story.id ? '...' : '🗑️'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <motion.div
            className="text-center py-16 sm:py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.div
              className="text-6xl sm:text-7xl mb-6 select-none"
              animate={{
                y: [0, -10, 0],
                rotate: [0, -3, 3, 0],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              📖
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-600 mb-2">
              Nenhuma historia ainda
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-6 max-w-sm mx-auto">
              Sua estante esta esperando! Crie sua primeira historia e de vida aos personagens.
            </p>
            <Link href="/editor/new">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold cursor-pointer"
                style={{
                  background:
                    'linear-gradient(135deg, #8b5cf6, #d946ef)',
                  boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                }}
              >
                <span className="text-xl">+</span>
                Criar Minha Primeira Historia
                <span>🚀</span>
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* Footer spacer */}
        <div className="h-8" />
      </div>
    </main>
  );
}
