import { useCompletion } from 'ai/react';
import { useState, useRef, useEffect } from 'react';

interface LoreEntry {
  type: string;
  name: string;
  description: string;
  attributes?: Record<string, string>;
}

interface AIGeneratorProps {
  onTextGenerated?: (text: string) => void;
  initialText?: string;
  lorebook?: LoreEntry[];
}

export function AIGenerator({ onTextGenerated, initialText = '', lorebook = [] }: AIGeneratorProps) {
  const [sceneDirection, setSceneDirection] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [creativity, setCreativity] = useState(0.7);
  const editorRef = useRef<HTMLDivElement>(null);

  // 构建上下文
  const context = lorebook.length > 0
    ? lorebook.map(entry => {
        let text = `${entry.type} - ${entry.name}`;
        if (entry.description) text += `: ${entry.description}`;
        return text;
      }).join('\n')
    : '';

  const {
    completion,
    isLoading,
    error,
    handleSubmit,
    setInput,
  } = useCompletion({
    api: '/api/generate',
    initialCompletion: initialText,
    body: {
      style,
      creativity,
      context,
    },
    onFinish: (prompt, completion) => {
      // 生成完成后，将文本添加到编辑器
      if (editorRef.current && completion) {
        const newParagraph = document.createElement('p');
        newParagraph.className = 'magic-text';
        newParagraph.textContent = completion;
        editorRef.current.appendChild(newParagraph);

        // 触发输入事件以更新字数统计
        editorRef.current.dispatchEvent(new Event('input'));

        // 滚动到底部
        const scrollArea = document.getElementById('editor-scroll');
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }

        // 通知父组件
        onTextGenerated?.(completion);
      }
    },
  });

  // 初始化编辑器内容
  useEffect(() => {
    if (editorRef.current && initialText && !editorRef.current.hasChildNodes()) {
      const paragraph = document.createElement('p');
      paragraph.textContent = initialText;
      editorRef.current.appendChild(paragraph);
    }
  }, [initialText]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    // 获取当前编辑器中的文本
    const currentText = editorRef.current?.innerText || '';

    // 设置场景指令作为输入
    const input = sceneDirection || 'Continue the story from where it left off.';
    setInput(input);

    // 提交生成请求
    const formData = new FormData();
    formData.append('prompt', input);
    formData.append('currentText', currentText);

    handleSubmit(e, {
      body: JSON.stringify({
        prompt: input,
        currentText,
        context,
        style,
        creativity,
      }),
    });
  };

  return (
    <>
      {/* Continue Writing Button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="btn-primary w-full py-3.5 rounded-xl text-[15px] flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Continue Writing
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-[#E05A5A]/20 border border-[#E05A5A] text-sm">
          <p className="font-bold text-[#E05A5A]">Error</p>
          <p className="text-[#EAE6F8]">{error.message}</p>
        </div>
      )}

      <hr className="border-[#3A3651]" />

      {/* Scene Direction */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-[#EAE6F8]">Scene Direction</label>
          <button
            type="button"
            onClick={() => setSceneDirection('')}
            className="text-[10px] text-[#A09CB8] hover:text-[#EAE6F8] uppercase tracking-wider"
          >
            Clear
          </button>
        </div>
        <textarea
          value={sceneDirection}
          onChange={(e) => setSceneDirection(e.target.value)}
          className="input-field w-full rounded-lg px-3 py-2.5 text-sm resize-none h-24 placeholder:text-[#3A3651]"
          placeholder="e.g. Kaelen reaches out to touch the book, but a defensive ward triggers, throwing him back..."
        />
      </div>

      {/* Style & Tone */}
      <div className="flex flex-col gap-5">
        <h3 className="text-sm font-bold text-[#EAE6F8]">Style & Tone</h3>

        {/* Creativity Slider */}
        <div>
          <div className="flex justify-between text-xs text-[#A09CB8] font-medium mb-3">
            <span>Grounded</span>
            <span className="text-[#EAE6F8]">Creativity</span>
            <span>Fantastical</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={creativity}
            onChange={(e) => setCreativity(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-xs text-[#A09CB8] mt-1">
            {Math.round(creativity * 100)}%
          </div>
        </div>

        {/* Writing Style Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#A09CB8] font-medium">Writing Style</label>
          <div className="relative">
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="input-field w-full rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer"
            >
              <option value="Cinematic">Cinematic</option>
              <option value="Poetic">Poetic</option>
              <option value="Suspenseful">Suspenseful</option>
              <option value="Romantic">Romantic</option>
              <option value="Gritty">Gritty</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09CB8] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
