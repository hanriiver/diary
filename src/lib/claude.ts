import Anthropic from '@anthropic-ai/sdk'

interface ProcessedNote {
  summary: string
  keyPoints: string[]
  reviewPoints: string[]
  extraContent: string
}

interface NoteData {
  summary: string
  keyPoints: string[]
  reviewPoints: string[]
  extraContent: string
  category: string
}

export async function processStudyNote(
  rawContent: string,
  category: string
): Promise<ProcessedNote> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      summary: '(API 키 미설정 - 테스트 데이터) 요약 내용입니다.',
      keyPoints: ['(API 키 미설정 - 테스트 데이터) 핵심 포인트 1', '핵심 포인트 2'],
      reviewPoints: ['(API 키 미설정 - 테스트 데이터) 복습 포인트 1'],
      extraContent: '(API 키 미설정 - 테스트 데이터) 보충 설명입니다.',
    }
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `당신은 학습 도우미입니다. 주어진 학습 노트를 한국어로 분석하여 다음 JSON 형식으로 응답하세요:
{
  "summary": "2-3 단락 분량의 핵심 개념 요약",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", ...],
  "reviewPoints": ["다시 복습해야 할 항목 1", ...],
  "extraContent": "보충 설명 및 추가 학습 내용"
}
JSON 외의 다른 텍스트는 포함하지 마세요.`,
    messages: [
      {
        role: 'user',
        content: `카테고리: ${category}\n\n학습 노트:\n${rawContent}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = JSON.parse(text) as ProcessedNote
  return parsed
}

export async function generateBlogPost(noteData: NoteData, title: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return `# ${title}\n\n(API 키 미설정 - 테스트 데이터) 블로그 포스트 내용이 여기에 생성됩니다.\n\n## 요약\n\n${noteData.summary}\n`
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: `당신은 개발자 블로그 작성자입니다. 학습한 내용을 자신이 직접 공부하고 느낀 점을 공유하는 것처럼 자연스럽고 인간적인 한국어 블로그 포스트로 작성하세요. AI가 쓴 것처럼 느껴지지 않게, 개발자가 공부하면서 직접 겪은 경험과 생각을 담아 써주세요. 마크다운 형식으로 작성하고, 제목(# )으로 시작하세요.`,
    messages: [
      {
        role: 'user',
        content: `제목: ${title}
카테고리: ${noteData.category}

요약:
${noteData.summary}

핵심 포인트:
${noteData.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

복습 포인트:
${noteData.reviewPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

보충 설명:
${noteData.extraContent}

위 내용을 바탕으로 자연스러운 블로그 포스트를 작성해주세요.`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
