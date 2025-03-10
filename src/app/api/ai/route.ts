import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getCurrentUser } from "../util";

// 定义响应类型
interface ParsedResponse {
  question: string;
  title: string;
  answer: string;
}

export async function POST(request: NextRequest) {
  try {
    // 从请求体中获取文本
    const { text } = await request.json();

    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "用户未登录" }, { status: 401 });
    }

    if (!text) {
      return NextResponse.json({ error: "缺少文本参数" }, { status: 400 });
    }

    // 创建 OpenAI 客户端
    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

    // 系统提示
    const systemPrompt = `
You are a multilingual educational content parsing assistant. The user will provide exam text. Please parse the "question", "title", and "answer" and output them in JSON format for 10 different languages.

Requirements:
1. Generate content for each language (zh, ja, en, de, fr, es, it, pt, ru, ko)
2. The title for each language should be a concise summary of the answer, typically 2-5 words, and must include relevant SEO keywords in that language
3. The answer for each language must be detailed, human-friendly, and naturally incorporate relevant SEO keywords
4. Ensure the content is search engine friendly while maintaining a natural language flow
5. Maintain accuracy in translation while considering cultural aspects of each language

Example Input:
Which is the highest mountain in the world? Mount Everest.

Example JSON Output:
{
  "zh-CN": {
    "question": "世界上最高的山是哪座？",
    "title": "珠穆朗玛峰高度数据",
    "answer": "珠穆朗玛峰是地球上最高的山峰，海拔高度达8,848.86米（29,031.7英尺）。它位于喜马拉雅山脉的马哈兰古尔·喜马尔亚山脉，跨越尼泊尔和西藏边界。对全球登山者来说，攀登珠峰被视为登山界的终极成就，但这一旅程面临极端高海拔、不可预测的天气和危险地形等重大挑战。"
  },
  "ja": {
    "question": "世界で一番高い山はどれですか？",
    "title": "エベレスト山の高度情報",
    "answer": "エベレスト山（Mount Everest）は地球上で最も高い山で、海抜8,848.86メートル（29,031.7フィート）に達します。ヒマラヤ山脈のマハランギュル・ヒマール支脈に位置し、ネパールとチベットの国境にまたがっています。世界中の登山家にとって、エベレスト登頂は登山の究極の達成とされていますが、極端な高度、予測不能な天候、危険な地形など、大きな課題が伴います。"
  },
  "en": {
    "question": "Which is the highest mountain in the world?",
    "title": "Mount Everest Height Facts",
    "answer": "Mount Everest is the highest mountain on Earth, reaching an impressive elevation of 8,848.86 meters (29,031.7 ft) above sea level. Located in the Mahalangur Himal sub-range of the Himalayas, this majestic peak sits on the border between Nepal and Tibet. Climbers worldwide consider summiting Everest the ultimate mountaineering achievement, though the journey comes with significant challenges including extreme altitude, unpredictable weather, and dangerous terrain."
  },
  "de": {
    "question": "Welcher ist der höchste Berg der Welt?",
    "title": "Mount Everest Höhendaten",
    "answer": "Der Mount Everest ist der höchste Berg der Erde mit einer beeindruckenden Höhe von 8.848,86 Metern (29.031,7 Fuß) über dem Meeresspiegel. Er befindet sich in der Mahalangur-Himal-Unterkette des Himalayas und liegt an der Grenze zwischen Nepal und Tibet. Bergsteiger aus aller Welt betrachten die Besteigung des Everest als die ultimative bergsteigerische Leistung, obwohl die Reise mit erheblichen Herausforderungen wie extremer Höhe, unvorhersehbarem Wetter und gefährlichem Gelände verbunden ist."
  },
  "fr": {
    "question": "Quelle est la plus haute montagne du monde ?",
    "title": "Données d'altitude du Mont Everest",
    "answer": "Le Mont Everest est la plus haute montagne de la Terre, atteignant une altitude impressionnante de 8 848,86 mètres (29 031,7 pieds) au-dessus du niveau de la mer. Situé dans la sous-chaîne Mahalangur Himal de l'Himalaya, ce sommet majestueux se trouve à la frontière entre le Népal et le Tibet. Les alpinistes du monde entier considèrent l'ascension de l'Everest comme l'accomplissement ultime en matière d'alpinisme, bien que le voyage s'accompagne de défis importants, notamment l'altitude extrême, les conditions météorologiques imprévisibles et le terrain dangereux."
  },
  "es": {
    "question": "¿Cuál es la montaña más alta del mundo?",
    "title": "Datos de altura del Monte Everest",
    "answer": "El Monte Everest es la montaña más alta de la Tierra, alcanzando una impresionante elevación de 8.848,86 metros (29.031,7 pies) sobre el nivel del mar. Ubicado en la subcordillera Mahalangur Himal del Himalaya, este majestuoso pico se encuentra en la frontera entre Nepal y Tíbet. Los escaladores de todo el mundo consideran que hacer cumbre en el Everest es el logro definitivo del montañismo, aunque el viaje conlleva desafíos significativos, incluida la altitud extrema, el clima impredecible y el terreno peligroso."
  },
  "it": {
    "question": "Qual è la montagna più alta del mondo?",
    "title": "Dati sull'altitudine del Monte Everest",
    "answer": "Il Monte Everest è la montagna più alta della Terra, raggiungendo un'impressionante elevazione di 8.848,86 metri (29.031,7 piedi) sul livello del mare. Situato nella sottocatena Mahalangur Himal dell'Himalaya, questa maestosa vetta si trova al confine tra Nepal e Tibet. Gli scalatori di tutto il mondo considerano la conquista dell'Everest come il massimo traguardo dell'alpinismo, sebbene il viaggio comporti sfide significative tra cui l'altitudine estrema, il tempo imprevedibile e il terreno pericoloso."
  },
  "pt": {
    "question": "Qual é a montanha mais alta do mundo?",
    "title": "Dados de altitude do Monte Everest",
    "answer": "O Monte Everest é a montanha mais alta da Terra, atingindo uma impressionante elevação de 8.848,86 metros (29.031,7 pés) acima do nível do mar. Localizado na subcordilheira Mahalangur Himal dos Himalaias, este majestoso pico situa-se na fronteira entre o Nepal e o Tibete. Alpinistas de todo o mundo consideram o cume do Everest como a conquista máxima do montanhismo, embora a jornada apresente desafios significativos, incluindo altitude extrema, clima imprevisível e terreno perigoso."
  },
  "ru": {
    "question": "Какая гора самая высокая в мире?",
    "title": "Данные о высоте горы Эверест",
    "answer": "Гора Эверест — самая высокая гора на Земле, достигающая впечатляющей высоты 8 848,86 метров (29 031,7 футов) над уровнем моря. Расположенная в подхребте Махалангур-Химал Гималаев, эта величественная вершина находится на границе между Непалом и Тибетом. Альпинисты со всего мира считают восхождение на Эверест высшим достижением в альпинизме, хотя путешествие сопряжено со значительными трудностями, включая экстремальную высоту, непредсказуемую погоду и опасный рельеф."
  },
  "ko": {
    "question": "세계에서 가장 높은 산은 무엇인가요?",
    "title": "에베레스트산 고도 정보",
    "answer": "에베레스트산은 지구에서 가장 높은 산으로, 해발 8,848.86미터(29,031.7피트)의 인상적인 고도에 이릅니다. 히말라야 산맥의 마할랑구르 히말 하위 산맥에 위치한 이 웅장한 봉우리는 네팔과 티베트 사이의 국경에 자리하고 있습니다. 전 세계 등반가들은 에베레스트 정상 등정을 등산의 궁극적인 성취로 여기지만, 이 여정에는 극단적인 고도, 예측 불가능한 날씨, 위험한 지형 등 상당한 도전이 따릅니다."
  }
}
`;

    // 发送请求到 DeepSeek API
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      response_format: {
        type: "json_object",
      },
    });

    // 解析响应
    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content || "{}") as ParsedResponse;

    // 返回解析后的内容
    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error("AI 处理错误:", error);
    return NextResponse.json({ error: "处理请求时出错" }, { status: 500 });
  }
}
