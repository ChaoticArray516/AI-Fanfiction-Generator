import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// 获取环境变量的辅助函数
function getEnvVar(key: string): string {
  // Astro 在服务端使用 process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  // 备用：尝试 import.meta.env
  return import.meta.env[key] || '';
}

// 创建 DeepSeek 客户端（兼容 OpenAI SDK）
export const deepseek = createOpenAI({
  apiKey: getEnvVar('DEEPSEEK_API_KEY'),
  baseURL: getEnvVar('DEEPSEEK_BASE_URL') || 'https://api.deepseek.com',
});

/**
 * 生成故事文本的核心函数
 */
export async function generateStory(params: {
  prompt: string;
  currentText?: string;
  context?: string;  // 角色设定、世界观等
  style?: string;    // 写作风格
  creativity?: number; // 创造性程度 0-1
}) {
  const {
    prompt,
    currentText = '',
    context = '',
    style = 'Cinematic',
    creativity = 0.7
  } = params;

  // 构建系统提示词
  const systemPrompt = buildSystemPrompt(style, creativity, context);

  // 构建用户消息
  let userMessage = prompt;
  if (currentText) {
    userMessage = `Continue the following story:\n\n${currentText}\n\n---\n\nInstruction: ${prompt}`;
  }

  const result = await streamText({
    model: deepseek('deepseek-chat'),
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ],
    temperature: creativity,
    maxTokens: 2000,
  });

  return result;
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(style: string, creativity: number, context: string): string {
  let prompt = `You are a creative writing assistant specializing in fanfiction and original fiction. Your goal is to write engaging, well-crafted prose that maintains narrative consistency and character voice.\n\n`;

  // 添加风格指令
  const stylePrompts: Record<string, string> = {
    'Cinematic': 'Write with vivid, scene-setting descriptions. Focus on visual details, atmosphere, and creating a movie-like experience in the reader\'s mind. Use sensory language to paint the scene.',
    'Poetic': 'Use lyrical, metaphorical language. Pay attention to rhythm, word choice, and emotional resonance. Your prose should have a musical quality and explore deeper themes.',
    'Suspenseful': 'Build tension through careful pacing and uncertainty. Use shorter sentences during action sequences. End paragraphs with hooks that keep the reader turning pages.',
    'Romantic': 'Focus on emotional depth and character relationships. Explore feelings, desires, and connections between characters. Use intimate sensory details and internal monologue.',
    'Gritty': 'Write with raw, unflinching realism. Focus on harsh realities, moral ambiguity, and the physical toll of events. Avoid romanticizing—show things as they are.',
  };

  prompt += `**Writing Style**: ${stylePrompts[style] || stylePrompts['Cinematic']}\n\n`;

  // 添加创造性指导
  if (creativity > 0.7) {
    prompt += `**Creativity Level**: High. Feel free to introduce unexpected plot twists, vivid imagery, and bold narrative choices. Take risks with the storytelling while maintaining coherence.\n\n`;
  } else if (creativity < 0.4) {
    prompt += `**Creativity Level**: Grounded. Stay close to established conventions and the given context. Prioritize logical progression and familiarity over innovation.\n\n`;
  } else {
    prompt += `**Creativity Level**: Balanced. Blend creativity with consistency. Introduce fresh ideas while honoring the story's established tone and direction.\n\n`;
  }

  // 添加上下文（Lorebook 信息）
  if (context) {
    prompt += `**Story Context to Remember**:\n${context}\n\n`;
  }

  prompt += `**Instructions**:
- Continue the story naturally from where it left off
- Maintain consistency with the existing narrative, characters, and world
- Match the established tone and voice
- Write 2-4 paragraphs (approximately 150-300 words)
- Do NOT repeat or summarize what has already been written
- End at a natural pause point, preferably with a small hook or question`;

  return prompt;
}

/**
 * 从 Lorebook 条目构建上下文字符串
 */
export function buildLorebookContext(lorebook: Array<{
  type: string;
  name: string;
  description: string;
  attributes?: Record<string, string>;
}>): string {
  if (!lorebook || lorebook.length === 0) return '';

  const sections: Record<string, string[]> = {};

  // 按类型分组
  lorebook.forEach(entry => {
    if (!sections[entry.type]) {
      sections[entry.type] = [];
    }

    let entryText = `**${entry.name}**`;
    if (entry.description) {
      entryText += `: ${entry.description}`;
    }
    if (entry.attributes) {
      const attrs = Object.entries(entry.attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      if (attrs) {
        entryText += ` (${attrs})`;
      }
    }
    sections[entry.type].push(entryText);
  });

  // 构建格式化文本
  let context = '';
  Object.entries(sections).forEach(([type, entries]) => {
    context += `### ${type}\n`;
    entries.forEach(entry => {
      context += `- ${entry}\n`;
    });
    context += '\n';
  });

  return context.trim();
}
