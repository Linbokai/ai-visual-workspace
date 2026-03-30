import { useState } from 'react';
import { Search, User, Plus, Trash2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCanvasStore } from '@/stores/useCanvasStore';

interface Character {
  id: string;
  name: string;
  identity: string;
  appearance: string;
  age: string;
  gender: string;
  imageUrl: string | null;
}

// Simple local state for characters - in production this would be a store
const SAVED_CHARACTERS_KEY = 'saved-characters';

function getStoredCharacters(): Character[] {
  try {
    const stored = localStorage.getItem(SAVED_CHARACTERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeCharacters(chars: Character[]) {
  localStorage.setItem(SAVED_CHARACTERS_KEY, JSON.stringify(chars));
}

export function CharactersPanel() {
  const { t } = useTranslation();
  const addNode = useCanvasStore((s) => s.addNode);
  const [search, setSearch] = useState('');
  const [characters, setCharacters] = useState<Character[]>(getStoredCharacters);

  const filtered = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.identity.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCanvas = (char: Character) => {
    const x = 200 + Math.random() * 300;
    const y = 100 + Math.random() * 200;
    addNode('character-description', { x, y }, {
      label: char.name,
      character: { name: char.name, identity: char.identity, appearance: char.appearance, age: char.age, gender: char.gender, imageUrl: char.imageUrl },
    });
  };

  const handleDelete = (id: string) => {
    const updated = characters.filter((c) => c.id !== id);
    setCharacters(updated);
    storeCharacters(updated);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('characters.searchCharacters')}
          className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--muted)] text-[var(--foreground)] rounded-lg border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>

      {filtered.length > 0 && (
        <p className="text-[10px] text-[var(--muted-foreground)]">
          {t('characters.characterCount', { count: filtered.length })}
        </p>
      )}

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((char) => (
            <div
              key={char.id}
              className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                {char.imageUrl ? (
                  <img src={char.imageUrl} alt={char.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg text-violet-400">{char.name[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">{char.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{char.identity}</p>
                  <div className="flex gap-2 mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                    <span>{char.age}</span>
                    <span>{char.gender}</span>
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2 mt-1">{char.appearance}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  onClick={() => handleAddToCanvas(char)}
                  className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors cursor-pointer border-none"
                >
                  <Plus className="h-3 w-3" /> {t('characters.addToCanvas')}
                </button>
                <button
                  onClick={() => handleDelete(char.id)}
                  className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent"
                  title={t('characters.deleteCharacter')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8">
          <Users className="h-8 w-8 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">{t('characters.noCharacters')}</p>
          <p className="text-xs text-[var(--muted-foreground)] text-center">{t('characters.noCharactersDesc')}</p>
        </div>
      )}
    </div>
  );
}
