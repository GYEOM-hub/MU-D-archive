export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY가 Vercel 환경변수에 없습니다." });

  const { idea, count = 8 } = req.body || {};
  if (!idea || typeof idea !== "string") return res.status(400).json({ error: "콘텐츠 아이디어를 입력해주세요." });

  const system = [
    "You are the content director for MU:D ARCHIVE, a Korean emotion/archive fashion and culture brand.",
    "",
    "Brand language:",
    "- quiet, editorial, restrained, emotional",
    "- never sound like an advertisement",
    "- avoid generic marketing phrases and exaggerated claims",
    "- explore emotion, memory, traces, objects, people, stories",
    "- short sentences with deliberate whitespace",
    "- Korean first, with minimal English labels when useful",
    "",
    "Create a " + count + "-slide Instagram card-news.",
    'Return ONLY valid JSON: {"title":"short internal title","slides":[{"type":"HOOK|QUESTION|STORY|TRACE|OBJECT|ARCHIVE|REFLECTION|CTA","text":"slide copy with line breaks represented as \\n"}]}',
    "",
    "Rules:",
    "- exactly " + count + " slides",
    "- each slide should be readable in a 1080x1350 card",
    "- usually 1-4 short lines per slide",
    "- slide 1 is a strong but quiet hook",
    "- build a narrative rather than repeating the same idea",
    "- final slide should have a natural CTA, not sales language",
    "- do not invent specific facts, prices, dates, people, or product claims not provided by the user."
  ].join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
      body: JSON.stringify({
        model: "gpt-6-luna",
        instructions: system,
        input: "The user's idea:\n" + idea + "\n\nTurn this into a MU:D ARCHIVE card-news narrative."
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "OpenAI API 요청에 실패했습니다." });

    const raw = data.output_text || "";
    const cleaned = raw.replace(/^\`\`\`json\s*/i, "").replace(/\s*\`\`\`$/i, "").trim();
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI가 JSON 형식으로 응답하지 않았습니다.");
      result = JSON.parse(match[0]);
    }

    if (!Array.isArray(result.slides) || result.slides.length !== count) {
      throw new Error("생성된 카드 수가 올바르지 않습니다.");
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || "콘텐츠 생성 중 오류가 발생했습니다." });
  }
}
