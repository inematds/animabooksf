'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const modes = [
  {
    type: 'story',
    icon: '📖',
    title: 'Historias',
    desc: 'Crie historias interativas com personagens, cenarios e dialogos.',
    color: 'from-purple-500 to-violet-500',
    hue: 270,
    href: '/editor/new',
  },
  {
    type: 'decoration',
    icon: '🏠',
    title: 'Decoracao',
    desc: 'Decore quartos, salas e jardins com moveis, plantas e objetos.',
    color: 'from-pink-500 to-rose-500',
    hue: 340,
    href: '/create/decoration/new',
  },
  {
    type: 'construction',
    icon: '🔨',
    title: 'Construcao',
    desc: 'Construa casas e estruturas com blocos, portas e telhados.',
    color: 'from-amber-500 to-orange-500',
    hue: 30,
    href: '/create/construction/new',
  },
  {
    type: 'city',
    icon: '🌆',
    title: 'Cidades',
    desc: 'Crie cidades com predios, ruas, veiculos e personagens.',
    color: 'from-blue-500 to-indigo-500',
    hue: 220,
    href: '/create/city/new',
  },
  {
    type: 'fashion',
    icon: '👗',
    title: 'Moda',
    desc: 'Vista personagens com roupas, acessorios, calcados e chapeus.',
    color: 'from-fuchsia-500 to-pink-500',
    hue: 300,
    href: '/create/fashion/new',
  },
  {
    type: 'countryside',
    icon: '🏕️',
    title: 'Campo',
    desc: 'Crie cenas no campo com animais, acampamento, rios e fazendas.',
    color: 'from-green-500 to-emerald-500',
    hue: 140,
    href: '/create/countryside/new',
  },
];

export default function CreateHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/" className="text-sm text-gray-400 hover:text-purple-600">&#8592; Inicio</Link>
        </div>

        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{
            background: 'linear-gradient(135deg, #7c3aed, #db2777)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Criar Algo Novo
          </h1>
          <p className="text-gray-500">Escolha o que voce quer criar hoje!</p>
        </motion.div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modes.map((mode, idx) => (
            <motion.div
              key={mode.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Link href={mode.href}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative rounded-2xl p-6 cursor-pointer overflow-hidden text-center"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    border: `2px solid hsla(${mode.hue}, 60%, 80%, 0.5)`,
                    boxShadow: `0 4px 24px hsla(${mode.hue}, 50%, 60%, 0.12)`,
                  }}
                >
                  <div className="text-5xl mb-4 select-none">{mode.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{mode.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{mode.desc}</p>
                  <div
                    className={`inline-block px-6 py-2 rounded-xl text-white font-semibold text-sm bg-gradient-to-r ${mode.color}`}
                    style={{ boxShadow: `0 3px 12px hsla(${mode.hue}, 60%, 40%, 0.3)` }}
                  >
                    Comecar
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
