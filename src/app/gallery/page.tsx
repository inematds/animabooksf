'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProjectType } from '@/lib/types';

interface ProjectMeta {
  id: string;
  type: ProjectType;
  title: string;
  itemCount: number;
}

const TYPE_ICONS: Record<ProjectType, string> = {
  decoration: '🏠',
  construction: '🔨',
  city: '🌆',
};

const TYPE_LABELS: Record<ProjectType, string> = {
  decoration: 'Decoracao',
  construction: 'Construcao',
  city: 'Cidade',
};

export default function GalleryPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [filter, setFilter] = useState<ProjectType | 'all'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]));
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir "${title}"?`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch { /* silent */ } finally {
      setDeleting(null);
    }
  };

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-purple-600">← Inicio</Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Minhas Criacoes</h1>
          <Link href="/create">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 rounded-xl text-white font-semibold text-sm cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}
            >
              + Nova Criacao
            </motion.div>
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'decoration', 'construction', 'city'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filter === t
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {t === 'all' ? 'Todos' : `${TYPE_ICONS[t]} ${TYPE_LABELS[t]}`}
            </button>
          ))}
        </div>

        {/* Project grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{TYPE_ICONS[project.type]}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{project.title}</h3>
                    <p className="text-xs text-gray-400">
                      {TYPE_LABELS[project.type]} - {project.itemCount} itens
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/create/${project.type}/${project.id}`)}
                    className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold bg-purple-500 text-white hover:bg-purple-600 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => router.push(`/view/${project.id}`)}
                    className="px-3 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => handleDelete(project.id, project.title)}
                    disabled={deleting === project.id}
                    className="px-3 py-2 rounded-xl text-sm bg-red-50 text-red-500 hover:bg-red-100 transition"
                  >
                    {deleting === project.id ? '...' : '🗑️'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhuma criacao ainda</h3>
            <p className="text-gray-400 text-sm mb-4">Comece decorando, construindo ou criando uma cidade!</p>
            <Link href="/create">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-6 py-3 rounded-xl text-white font-semibold cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}
              >
                Comecar a Criar
              </motion.div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
