import { useState, useCallback } from 'react';
import {
  BookOpen,
  Users,
  Film,
  Camera,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Layers,
  Eye,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/stores/useCanvasStore';
import {
  parseStoryboard,
  buildAIAnalysisPrompt,
  type StoryboardData,
  type StoryScene,
} from '@/lib/storyboard-parser';

type ViewMode = 'input' | 'scenes' | 'characters' | 'timeline';
type AnalysisMode = 'characters' | 'scenes' | 'visuals' | 'camera';

const ANALYSIS_MODES: Array<{ mode: AnalysisMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { mode: 'characters', label: 'Characters', icon: Users },
  { mode: 'scenes', label: 'Scenes', icon: Film },
  { mode: 'visuals', label: 'Visual Prompts', icon: Eye },
  { mode: 'camera', label: 'Camera Shots', icon: Camera },
];

const SAMPLE_TEXT_EN = `Chapter 1: The Awakening

The ancient forest stirred as dawn broke through the canopy. Elena walked along the mossy path, her cloak trailing behind her like a shadow. The air smelled of pine and rain.

"We shouldn't be here," whispered Marcus, his hand resting on his sword. The old warrior scanned the trees with practiced eyes.

Elena paused at the edge of a clearing. Before them stood a stone circle, ancient runes glowing with a faint blue light. In the center, a crystal hovered, pulsing with energy.

Chapter 2: The Crystal

"It's exactly as the prophecy described," Elena said, stepping forward. The crystal's light intensified, casting dancing shadows across the standing stones.

Marcus grabbed her arm. "Wait. Something's wrong." The ground trembled beneath their feet. From the shadows between the stones, dark figures emerged — the Wraith Guard.

Elena raised her staff, its emerald tip blazing with green fire. "Stay behind me!" she commanded. The air crackled with magical energy as the battle began.`;

const SAMPLE_TEXT_CN = `第一章：觉醒

古老的森林在黎明破晓时苏醒。叶琳沿着长满苔藓的小径行走，她的斗篷在身后像影子一样拖曳。空气中弥漫着松木和雨水的气息。

"我们不应该来这里，"马库斯低声说道，他的手放在剑柄上。这位老战士用练过的眼睛扫视着树林。

叶琳在一片空地边缘停下脚步。他们面前矗立着一个石圈，古老的符文发出微弱的蓝光。在中央，一颗水晶悬浮着，散发着脉动的能量。

第二章：水晶

"和预言描述的一模一样，"叶琳说着向前迈步。水晶的光芒增强了，在立石上投下舞动的影子。

马库斯抓住她的手臂。"等等。有什么不对劲。"他们脚下的大地开始震动。从石头之间的阴影中，黑暗的身影出现了——幽灵卫队。

叶琳举起法杖，翡翠色的杖尖燃烧着绿色的火焰。"待在我身后！"她命令道。空气中噼啪作响，充满了魔法能量，战斗开始了。`;

export function StoryboardPanel() {
  const addNode = useCanvasStore((s) => s.addNode);
  const addEdge = useCanvasStore((s) => s.addEdge);

  const [inputText, setInputText] = useState('');
  const [storyData, setStoryData] = useState<StoryboardData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisMode>('scenes');
  const [aiPromptOutput, setAiPromptOutput] = useState<string | null>(null);

  // Parse the text
  const handleParse = useCallback(() => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);

    // Simulate a brief analysis delay for UX
    setTimeout(() => {
      const result = parseStoryboard(inputText);
      setStoryData(result);
      setViewMode('scenes');
      setIsAnalyzing(false);
    }, 500);
  }, [inputText]);

  // Load sample text
  const handleLoadSample = useCallback((lang: 'en' | 'zh') => {
    setInputText(lang === 'en' ? SAMPLE_TEXT_EN : SAMPLE_TEXT_CN);
  }, []);

  // Generate AI analysis prompt
  const handleAIAnalysis = useCallback((mode: AnalysisMode) => {
    setSelectedAnalysis(mode);
    const prompt = buildAIAnalysisPrompt({
      text: inputText,
      requestType: mode,
    });
    setAiPromptOutput(prompt);
  }, [inputText]);

  // Create a single scene node
  const handleCreateSceneNode = useCallback((scene: StoryScene) => {
    const x = 200 + Math.random() * 400;
    const y = 100 + Math.random() * 300;
    addNode('image', { x, y }, {
      label: scene.title,
      imageUrl: null,
      width: 512,
      height: 512,
      format: 'png',
      prompt: scene.imagePrompt,
    });
  }, [addNode]);

  // Auto-generate full storyboard on canvas
  const handleGenerateStoryboard = useCallback(() => {
    if (!storyData) return;

    const startX = 100;
    const startY = 100;
    const spacingX = 320;
    const spacingY = 200;

    const imageNodeIds: string[] = [];
    const textNodeIds: string[] = [];

    storyData.scenes.forEach((scene, i) => {
      const x = startX + i * spacingX;
      const y = startY;

      // Create image node for the scene
      const imageId = addNode('image', { x, y }, {
        label: scene.title,
        imageUrl: null,
        width: 512,
        height: 512,
        format: 'png',
        prompt: scene.imagePrompt,
      });
      imageNodeIds.push(imageId);

      // Create text node for dialogue/narration below
      if (scene.dialogue.length > 0 || scene.content) {
        const dialogueContent = scene.dialogue.length > 0
          ? scene.dialogue.slice(0, 3).map((d) => `"${d}"`).join('\n')
          : scene.content.slice(0, 150) + '...';

        const textId = addNode('text', { x, y: y + spacingY }, {
          label: `${scene.title} - Dialogue`,
          content: dialogueContent,
          prompt: '',
        });
        textNodeIds.push(textId);

        // Connect image to text vertically
        addEdge({
          id: `${imageId}-${textId}`,
          source: imageId,
          target: textId,
          type: 'process',
        });
      }
    });

    // Connect image nodes in sequence
    for (let i = 0; i < imageNodeIds.length - 1; i++) {
      addEdge({
        id: `${imageNodeIds[i]}-${imageNodeIds[i + 1]}`,
        source: imageNodeIds[i],
        target: imageNodeIds[i + 1],
        type: 'process',
      });
    }
  }, [storyData, addNode, addEdge]);

  // Toggle scene expansion
  const toggleScene = useCallback((index: number) => {
    setExpandedScenes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* View Mode Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-[var(--muted)]">
        {([
          { mode: 'input' as ViewMode, label: 'Input', icon: BookOpen },
          { mode: 'scenes' as ViewMode, label: 'Scenes', icon: Film },
          { mode: 'characters' as ViewMode, label: 'Cast', icon: Users },
          { mode: 'timeline' as ViewMode, label: 'Timeline', icon: Camera },
        ]).map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            disabled={mode !== 'input' && !storyData}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border-none',
              viewMode === mode
                ? 'bg-[var(--primary)] text-white'
                : 'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Input View */}
      {viewMode === 'input' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Story Text
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => handleLoadSample('en')}
                className="px-2 py-1 rounded text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--muted)] hover:bg-white/10 cursor-pointer border-none"
              >
                EN Sample
              </button>
              <button
                onClick={() => handleLoadSample('zh')}
                className="px-2 py-1 rounded text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--muted)] hover:bg-white/10 cursor-pointer border-none"
              >
                CN Sample
              </button>
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your novel chapter, screenplay, or storyboard text here...&#10;&#10;粘贴您的小说章节、剧本或故事板文本..."
            className="w-full h-[200px] px-3 py-2 text-sm rounded-lg bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)] resize-none"
          />

          <div className="text-xs text-[var(--muted-foreground)] text-right">
            {inputText.length} characters
          </div>

          <button
            onClick={handleParse}
            disabled={!inputText.trim() || isAnalyzing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer border-none"
          >
            <Sparkles className="h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Story'}
          </button>

          {/* AI Analysis Modes */}
          {inputText.trim() && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                AI Analysis
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {ANALYSIS_MODES.map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => handleAIAnalysis(mode)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer border',
                      selectedAnalysis === mode && aiPromptOutput
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {aiPromptOutput && (
                <div className="p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                  <p className="text-[10px] text-[var(--muted-foreground)] mb-1.5">AI Prompt (copy to AI chat):</p>
                  <p className="text-xs text-[var(--foreground)] whitespace-pre-wrap line-clamp-6">
                    {aiPromptOutput}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(aiPromptOutput)}
                    className="mt-2 px-2 py-1 rounded text-[10px] text-[var(--primary)] hover:bg-[var(--primary)]/10 cursor-pointer bg-transparent border border-[var(--primary)]/30"
                  >
                    Copy Prompt
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Scenes View */}
      {viewMode === 'scenes' && storyData && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              {storyData.totalScenes} Scenes Detected
            </h3>
            <button
              onClick={handleGenerateStoryboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer border-none"
            >
              <Layers className="h-3.5 w-3.5" />
              Generate All
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {storyData.scenes.map((scene) => {
              const isExpanded = expandedScenes.has(scene.index);

              return (
                <div
                  key={scene.index}
                  className="rounded-lg border border-[var(--border)] overflow-hidden"
                >
                  {/* Scene Header */}
                  <button
                    onClick={() => toggleScene(scene.index)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-[var(--muted)] hover:bg-white/5 transition-colors cursor-pointer border-none text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-[var(--primary)]">{scene.index + 1}</span>
                      </div>
                      <span className="text-xs font-medium text-[var(--foreground)] truncate">
                        {scene.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-[9px] font-medium',
                        scene.mood === 'tense' && 'bg-red-500/20 text-red-400',
                        scene.mood === 'romantic' && 'bg-pink-500/20 text-pink-400',
                        scene.mood === 'melancholy' && 'bg-blue-500/20 text-blue-400',
                        scene.mood === 'joyful' && 'bg-yellow-500/20 text-yellow-400',
                        scene.mood === 'mysterious' && 'bg-purple-500/20 text-purple-400',
                        scene.mood === 'epic' && 'bg-orange-500/20 text-orange-400',
                        scene.mood === 'neutral' && 'bg-gray-500/20 text-gray-400',
                      )}>
                        {scene.mood}
                      </span>
                      {isExpanded ? <ChevronUp className="h-3 w-3 text-[var(--muted-foreground)]" /> : <ChevronDown className="h-3 w-3 text-[var(--muted-foreground)]" />}
                    </div>
                  </button>

                  {/* Scene Details */}
                  {isExpanded && (
                    <div className="p-3 space-y-3">
                      {/* Setting */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Setting</p>
                        <p className="text-xs text-[var(--foreground)]">{scene.setting}</p>
                      </div>

                      {/* Characters */}
                      {scene.characters.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Characters</p>
                          <div className="flex flex-wrap gap-1">
                            {scene.characters.map((char) => (
                              <span key={char} className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[10px] text-[var(--primary)]">
                                {char}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dialogue */}
                      {scene.dialogue.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Dialogue</p>
                          <div className="space-y-1">
                            {scene.dialogue.slice(0, 3).map((d, i) => (
                              <p key={i} className="text-xs text-[var(--foreground)] italic pl-2 border-l-2 border-[var(--primary)]/30">
                                "{d}"
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Camera Shot */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Camera</p>
                        <p className="text-xs text-[var(--foreground)]">{scene.cameraShot}</p>
                      </div>

                      {/* Image Prompt */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Image Prompt</p>
                        <p className="text-xs text-[var(--foreground)] p-2 rounded bg-[var(--muted)] border border-[var(--border)]">
                          {scene.imagePrompt}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreateSceneNode(scene)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 cursor-pointer border-none"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add to Canvas
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(scene.imagePrompt)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent text-[var(--muted-foreground)] text-xs hover:text-[var(--foreground)] hover:bg-white/5 cursor-pointer border border-[var(--border)]"
                        >
                          <Palette className="h-3.5 w-3.5" />
                          Copy Prompt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Characters View */}
      {viewMode === 'characters' && storyData && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
            {storyData.characters.length} Characters Found
          </h3>

          {storyData.characters.length === 0 ? (
            <p className="text-xs text-[var(--muted-foreground)] p-4 text-center">
              No recurring characters detected. Try with a longer text.
            </p>
          ) : (
            <div className="space-y-2">
              {storyData.characters.map((char) => (
                <div
                  key={char.name}
                  className="p-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{char.name}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">{char.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {char.appearances.map((sceneIdx) => (
                      <span
                        key={sceneIdx}
                        className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-[9px] text-[var(--muted-foreground)]"
                      >
                        Scene {sceneIdx + 1}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && storyData && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Story Timeline
            </h3>
            <button
              onClick={handleGenerateStoryboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer border-none"
            >
              <Layers className="h-3.5 w-3.5" />
              Generate All
            </button>
          </div>

          <div className="relative pl-6 space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {/* Timeline line */}
            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-[var(--border)]" />

            {storyData.scenes.map((scene) => (
              <div key={scene.index} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-[-16px] top-1 w-3 h-3 rounded-full bg-[var(--primary)] border-2 border-[var(--card)]" />

                <div className="p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-[var(--foreground)]">{scene.title}</p>
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-medium',
                      scene.mood === 'tense' && 'bg-red-500/20 text-red-400',
                      scene.mood === 'romantic' && 'bg-pink-500/20 text-pink-400',
                      scene.mood === 'melancholy' && 'bg-blue-500/20 text-blue-400',
                      scene.mood === 'joyful' && 'bg-yellow-500/20 text-yellow-400',
                      scene.mood === 'mysterious' && 'bg-purple-500/20 text-purple-400',
                      scene.mood === 'epic' && 'bg-orange-500/20 text-orange-400',
                      scene.mood === 'neutral' && 'bg-gray-500/20 text-gray-400',
                    )}>
                      {scene.mood}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2 mb-2">
                    {scene.content.slice(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2">
                    {scene.characters.slice(0, 3).map((char) => (
                      <span key={char} className="px-1.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[9px] text-[var(--primary)]">
                        {char}
                      </span>
                    ))}
                    <button
                      onClick={() => handleCreateSceneNode(scene)}
                      className="ml-auto p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--primary)] cursor-pointer bg-transparent border-none"
                      title="Add to canvas"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
