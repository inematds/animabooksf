import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface StoryMeta {
  id: string;
  title: string;
  scenesCount: number;
}

function getStories(): StoryMeta[] {
  const dir = path.join(process.cwd(), 'data', 'stories');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
      return {
        id: f.replace('.json', ''),
        title: data.title || 'Sem titulo',
        scenesCount: data.scenes?.length || 0,
      };
    });
}

export default function HomePage() {
  const stories = getStories();

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-3">
            Animabook SF
          </h1>
          <p className="text-gray-500 text-lg">
            Crie e leia historias infantis interativas com personagens animados
          </p>
        </div>

        {/* Quick navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Link
            href="/editor/new"
            className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 shadow-lg hover:shadow-xl transition"
          >
            + Nova Historia
          </Link>
          <Link
            href="/challenges"
            className="px-5 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 shadow border border-purple-200 transition"
          >
            Desafios
          </Link>
          <Link
            href="/events"
            className="px-5 py-3 bg-white text-pink-600 rounded-xl font-semibold hover:bg-pink-50 shadow border border-pink-200 transition"
          >
            Eventos
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-3 bg-white text-gray-600 rounded-xl font-semibold hover:bg-gray-50 shadow border border-gray-200 transition"
          >
            Painel Educador
          </Link>
          <Link
            href="/profile"
            className="px-5 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 shadow border border-orange-200 transition"
          >
            Perfil
          </Link>
        </div>

        {stories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 border border-gray-100"
              >
                <h3 className="font-semibold text-gray-800 mb-1">{story.title}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {story.scenesCount} cena{story.scenesCount !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/reader/${story.id}`}
                    className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                  >
                    Ler
                  </Link>
                  <Link
                    href={`/editor/${story.id}`}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <p>Nenhuma historia ainda.</p>
            <p className="text-sm mt-1">Crie sua primeira historia!</p>
          </div>
        )}
      </div>
    </main>
  );
}
