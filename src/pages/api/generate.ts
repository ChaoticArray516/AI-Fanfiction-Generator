import { type APIRoute } from 'astro';
import { userProfileDbService } from '../../db/queries';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { prompt, currentText, context, style, creativity, isGuest } = body;

    console.log('Request body:', { prompt, style, creativity, isGuest });

    // 验证必填字段
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 获取环境变量
    const apiKey = process.env.DEEPSEEK_API_KEY || import.meta.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || import.meta.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

    // 检查 API Key
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('API Key loaded:', apiKey.substring(0, 10) + '...');
    console.log('Base URL:', baseURL);

    // 1. 认证检查 - 除非是游客请求
    if (!isGuest && !locals.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please sign in' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. 检查用户点数（仅对已认证用户）
    if (!isGuest) {
      const userId = locals.user!.id;
      const CREDITS_PER_GENERATION = 100; // 每次生成消耗 100 点
      const profile = await userProfileDbService.getByUserId(userId);

      if (!profile) {
        return new Response(
          JSON.stringify({ error: 'User profile not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (profile.credits < CREDITS_PER_GENERATION) {
        return new Response(
          JSON.stringify({
            error: 'Insufficient credits',
            message: `You need ${CREDITS_PER_GENERATION} credits to generate content. Your current balance: ${profile.credits}`,
            currentCredits: profile.credits,
            requiredCredits: CREDITS_PER_GENERATION,
          }),
          {
            status: 402,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // 扣除点数（在调用 AI API 之前）
      try {
        await userProfileDbService.deductCredits(userId, CREDITS_PER_GENERATION);
      } catch (error) {
        // 如果扣除失败（例如并发请求导致的点数不足），返回 402
        return new Response(
          JSON.stringify({
            error: 'Insufficient credits',
            message: error instanceof Error ? error.message : 'Failed to deduct credits',
          }),
          {
            status: 402,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 构建系统提示词
    const stylePrompts: Record<string, string> = {
      'Cinematic': 'Write with vivid, scene-setting descriptions. Focus on visual details and atmosphere.',
      'Poetic': 'Use lyrical, metaphorical language. Pay attention to rhythm and emotional resonance.',
      'Suspenseful': 'Build tension through pacing and uncertainty. Use shorter sentences during action.',
      'Romantic': 'Focus on emotional depth and character relationships. Explore feelings and desires.',
      'Gritty': 'Write with raw, unflinching realism. Focus on harsh realities and moral ambiguity.',
    };

    const systemPrompt = `You are a creative writing assistant specializing in fanfiction.

**Writing Style**: ${stylePrompts[style] || stylePrompts['Cinematic']}

**Creativity Level**: ${creativity > 0.7 ? 'High' : creativity < 0.4 ? 'Grounded' : 'Balanced'}

${context ? `**Context**: ${context}` : ''}

**Instructions**:
- Continue the story naturally from where it left off
- Maintain narrative consistency and character voice
- Write 2-4 paragraphs (150-300 words)
- Do NOT repeat or summarize what has already been written`;

    // 构建用户消息
    let userMessage = prompt;
    if (currentText) {
      userMessage = `Current story:\n${currentText}\n\n---\n\nContinue: ${prompt}`;
    }

    // 调用 DeepSeek API
    const response = await fetch(`${baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: creativity || 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    // 返回流式响应
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Generation error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
