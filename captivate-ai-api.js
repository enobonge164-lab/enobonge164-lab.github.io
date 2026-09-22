/* =========================================================
   CAPTIVATE AI API
   Version 7.3
   Stable Core Engine
========================================================= */

const API_VERSION = "7.3";

/*
=========================================================
FIXED STANDARD MODEL
=========================================================

IMPORTANT:
We intentionally DO NOT read env.AI_MODEL.

The model is controlled here and cannot be overridden
by an environment variable.
*/

const MODELS = {
  TEXT: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  CODE: "@cf/qwen/qwen2.5-coder-32b-instruct",
  IMAGE: "black-forest-labs/flux-2-pro-preview",
  VIDEO: "runwayml/gen-4.5",
  VOICE: "@cf/deepgram/aura-2-en",
  VISION: "@cf/meta/llama-4-scout-17b-16e-instruct"
};

const STANDARD_MODEL = MODELS.TEXT;


/* =========================================================
   CORS
========================================================= */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=UTF-8"
};


/* =========================================================
   SUPPORTED TOOLS
========================================================= */

const SUPPORTED_TOOLS = [
  "caption",
  "hashtags",
  "script",
  "email",
  "proposal",
  "resume",
  "invoice",
  "prompt",
  "bio",
  "image-generator",
  "video-generator",
  "voice-studio",
  "thumbnail-generator",
  "website-builder",
  "app-builder",
  "code-generator",
  "business-tool-builder",
  "gaming-assistant",
  "game-story-generator",
  "gaming-tools"
];


/* =========================================================
   TOOL PROMPTS
========================================================= */

const NEW_TOOL_PROMPTS = {
  "image-generator": "Create a detailed image-generation brief with subject, composition, style, lighting, camera, aspect ratio and negative prompt.",
  "video-generator": "Create a production-ready video plan with scenes, shots, narration, motion, duration and aspect ratio. Do not claim to render video.",
  "voice-studio": "Create a narration script and voice-direction brief including tone, pacing, pronunciation and pauses. Do not claim to synthesize audio.",
  "thumbnail-generator": "Create three thumbnail concepts with headline text, visual composition, contrast, subject placement and safe-area guidance.",
  "website-builder": "Create a website specification and starter implementation plan including pages, sections, features, responsive behavior and code structure.",
  "app-builder": "Create an app specification including user flow, screens, data model, API needs and starter implementation plan.",
  "code-generator": "Generate or explain code based only on the supplied requirements. Include assumptions, setup and testing notes.",
  "business-tool-builder": "Design a practical business tool with inputs, outputs, workflow, validation, roles and implementation steps.",
  "gaming-assistant": "Provide game coaching, strategy, practice plans and decision support without pretending to access live game state.",
  "game-story-generator": "Create a game concept with genre, premise, world, characters, mechanics, missions and story arc.",
  "gaming-tools": "Create a useful gaming checklist, build planner, challenge plan or utility based on the request."
};

const TOOL_PROMPTS = {

  caption: `
You are the professional Caption Generator inside CAPTIVATE AI.

Create high-quality social media captions based on the user's request.

Rules:
- Understand the topic carefully.
- Match the requested platform.
- Make the caption natural and engaging.
- Start with a strong hook when appropriate.
- Provide useful value.
- Include a suitable call-to-action when appropriate.
- Do not automatically add hashtags unless the user requests them.
- Do not invent facts.
- If the user requests multiple captions or a specific number of captions,
  provide EXACTLY that number.
- When a specific quantity is requested, number every item clearly from
  1 through the requested number.
`,

  hashtags: `
You are the professional Hashtag Generator inside CAPTIVATE AI.

Generate relevant hashtags based on the user's topic and platform.

Rules:
- Use a mixture of broad, medium and niche hashtags.
- Keep hashtags relevant to the topic.
- Do not explain the hashtags unless requested.
- If the user requests an exact number of hashtags, provide EXACTLY that number.
- Never provide fewer or more than requested.
- Put hashtags clearly on separate lines or separated by spaces.
`,

  script: `
You are the professional YouTube and social video Script Generator
inside CAPTIVATE AI.

Create useful, engaging and practical scripts.

A good script should normally contain:
- Title
- Hook
- Introduction
- Main content
- Examples where useful
- Conclusion
- Call-to-action

Rules:
- Follow the user's requested platform.
- Match the requested tone and audience.
- If the user requests multiple scripts, ideas, hooks, titles,
  sections or other numbered items, provide EXACTLY the requested number.
- Number multiple requested items clearly.
- Never stop early.
`,

  email: `
You are the professional Email Writer inside CAPTIVATE AI.

Write clear, professional and natural emails.

Rules:
- Understand the purpose of the email.
- Use an appropriate tone.
- Include a useful subject when appropriate.
- Keep the message professional and readable.
- Do not invent personal information.
- If the user requests multiple emails, subjects, versions or items,
  provide EXACTLY the requested number and number them clearly.
`,

  proposal: `
You are the professional Business Proposal Generator inside CAPTIVATE AI.

Create professional business proposals.

Include useful sections where appropriate:
- Executive Summary
- Problem or Need
- Proposed Solution
- Deliverables
- Process
- Timeline
- Pricing when provided
- Benefits
- Terms
- Call-to-action

Rules:
- Use the information provided by the user.
- Do not invent important business facts.
- If the user requests multiple proposals, ideas, packages,
  strategies or other numbered items, provide EXACTLY the requested number.
`,

  resume: `
You are the professional Resume Builder inside CAPTIVATE AI.

Create professional, ATS-friendly resume content.

Rules:
- Use information supplied by the user.
- Do not invent employment history, qualifications or achievements.
- If information is missing, use a clear placeholder or suggest what
  information should be added.
- If the user requests multiple versions, skills, achievements,
  summaries or other items, provide EXACTLY the requested number.
`,

  invoice: `
You are the professional Invoice Generator inside CAPTIVATE AI.

Create a clean and professional invoice using the information provided.

Rules:
- Never change amounts supplied by the user.
- Never invent prices.
- Calculate totals carefully when enough information is provided.
- Preserve dates and names accurately.
- If multiple invoice items are requested, provide EXACTLY the requested number.
`,

  prompt: `
You are the professional Prompt Generator inside CAPTIVATE AI.

Create high-quality prompts that users can copy and use with AI tools.

Rules:
- Make prompts specific and useful.
- Include context, objective, instructions and desired output format
  when appropriate.
- Match the user's selected category.
- If the user requests multiple prompts, provide EXACTLY the requested number.
- Number multiple prompts clearly from 1 onward.
`,

  bio: `
You are the professional Bio Generator inside CAPTIVATE AI.

Create professional and engaging bios for the requested platform.

Rules:
- Match the platform.
- Keep the bio appropriate for the platform's style and length.
- Highlight the user's relevant identity, skills and value proposition.
- Do not invent major achievements.
- If multiple bios or versions are requested, provide EXACTLY the requested number.
- Number multiple versions clearly.
`
};


/* =========================================================
   JSON RESPONSE
========================================================= */

function jsonResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: CORS_HEADERS
    }
  );
}


/* =========================================================
   ERROR RESPONSE
========================================================= */

function errorResponse(message, status = 500, extra = {}) {
  return jsonResponse(
    {
      success: false,
      version: API_VERSION,
      error: message,
      ...extra
    },
    status
  );
}


/* =========================================================
   CLEAN TEXT
========================================================= */

function cleanText(value, maxLength = 8000) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}


/* =========================================================
   EXTRACT AI TEXT
========================================================= */

function extractText(aiResponse) {

  if (!aiResponse) {
    return "";
  }

  if (typeof aiResponse === "string") {
    return aiResponse;
  }

  if (typeof aiResponse.response === "string") {
    return aiResponse.response;
  }

  if (typeof aiResponse.result === "string") {
    return aiResponse.result;
  }

  if (
    aiResponse.result &&
    typeof aiResponse.result.response === "string"
  ) {
    return aiResponse.result.response;
  }

  if (
    aiResponse.result &&
    typeof aiResponse.result.text === "string"
  ) {
    return aiResponse.result.text;
  }

  if (
    aiResponse.choices &&
    Array.isArray(aiResponse.choices) &&
    aiResponse.choices[0]
  ) {

    const choice = aiResponse.choices[0];

    if (
      choice.message &&
      typeof choice.message.content === "string"
    ) {
      return choice.message.content;
    }

    if (typeof choice.text === "string") {
      return choice.text;
    }
  }

  return "";
}


/* =========================================================
   CLEAN AI MARKDOWN
========================================================= */

function cleanResult(text) {

  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/```(?:markdown|text)?/gi, "")
    .replace(/```/g, "")
    .trim();
}


/* =========================================================
   NUMBER WORDS
========================================================= */

const NUMBER_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  twentyone: 21,
  twentytwo: 22,
  twentythree: 23,
  twentyfour: 24,
  twentyfive: 25,
  twentysix: 26,
  twentyseven: 27,
  twentyeight: 28,
  twentynine: 29,
  thirty: 30,
  forty: 40,
  fifty: 50
};


/* =========================================================
   NORMALIZE NUMBER WORD
========================================================= */

function normalizeNumberWord(word) {

  return String(word || "")
    .toLowerCase()
    .replace(/[\s-]/g, "");
}


/* =========================================================
   DETECT REQUESTED NUMBER
========================================================= */

function detectRequestedNumber(text) {

  const input = String(text || "")
    .toLowerCase()
    .replace(/[–—]/g, "-");

  /*
  ---------------------------------------------------------
  DIGIT PATTERN
  ---------------------------------------------------------
  */

  const digitPattern =
    /\b(\d{1,2})\s*(?:ways?|tips?|ideas?|benefits?|reasons?|steps?|tools?|strategies?|methods?|examples?|mistakes?|things?|points?|techniques?|skills?|features?|advantages?|disadvantages?|solutions?|hacks?|rules?|principles?|questions?|tasks?|jobs?|services?|types?|channels?|platforms?|apps?|resources?|prompts?|headlines?|titles?|topics?|captions?|hashtags?|scripts?|emails?|versions?|options?|hooks?|subjects?|names?)\b/i;

  const digitMatch = input.match(digitPattern);

  if (digitMatch) {

    const number = parseInt(digitMatch[1], 10);

    if (number >= 2 && number <= 50) {
      return number;
    }
  }


  /*
  ---------------------------------------------------------
  WORD NUMBER PATTERN
  ---------------------------------------------------------
  */

  const wordPattern =
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)\s+(?:ways?|tips?|ideas?|benefits?|reasons?|steps?|tools?|strategies?|methods?|examples?|mistakes?|things?|points?|techniques?|skills?|features?|advantages?|disadvantages?|solutions?|hacks?|rules?|principles?|questions?|tasks?|jobs?|services?|types?|channels?|platforms?|apps?|resources?|prompts?|headlines?|titles?|topics?|captions?|hashtags?|scripts?|emails?|versions?|options?|hooks?|subjects?|names?)\b/i;

  const wordMatch = input.match(wordPattern);

  if (wordMatch) {

    const normalized =
      normalizeNumberWord(wordMatch[1]);

    const number = NUMBER_WORDS[normalized];

    if (number >= 2 && number <= 50) {
      return number;
    }
  }


  /*
  ---------------------------------------------------------
  GENERIC DIGIT REQUEST
  Examples:
  "give me 7"
  "generate 5"
  "create 10"
  ---------------------------------------------------------
  */

  const genericDigitPattern =
    /\b(?:give|create|generate|list|provide|show|write|suggest|name|make)\s+(?:me\s+)?(\d{1,2})\b/i;

  const genericDigitMatch =
    input.match(genericDigitPattern);

  if (genericDigitMatch) {

    const number =
      parseInt(genericDigitMatch[1], 10);

    if (number >= 2 && number <= 50) {
      return number;
    }
  }


  /*
  ---------------------------------------------------------
  GENERIC WORD REQUEST
  Examples:
  "give me five"
  "generate seven"
  ---------------------------------------------------------
  */

  const genericWordPattern =
    /\b(?:give|create|generate|list|provide|show|write|suggest|name|make)\s+(?:me\s+)?(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)\b/i;

  const genericWordMatch =
    input.match(genericWordPattern);

  if (genericWordMatch) {

    const normalized =
      normalizeNumberWord(genericWordMatch[1]);

    const number = NUMBER_WORDS[normalized];

    if (number >= 2 && number <= 50) {
      return number;
    }
  }


  return null;
}


/* =========================================================
   BUILD USER PROMPT
========================================================= */

function buildUserPrompt(type, body) {

  const platform =
    cleanText(body.platform || "General", 100);

  const topic =
    cleanText(body.topic, 8000);

  const fields = { ...body };

  delete fields.type;
  delete fields.topic;
  delete fields.platform;


  const extra =
    Object.entries(fields)
      .filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
      )
      .map(
        ([key, value]) =>
          `${key}: ${cleanText(value, 3000)}`
      )
      .join("\n");


  const requestedNumber =
    detectRequestedNumber(topic);


  let quantityInstruction = "";


  if (requestedNumber) {

    quantityInstruction = `
=========================================================
EXACT QUANTITY REQUIREMENT
=========================================================

The user requested EXACTLY ${requestedNumber} items.

You MUST produce EXACTLY ${requestedNumber} items.

MANDATORY:
- Item 1 must exist.
- Item 2 must exist.
- Continue sequentially.
- The final item must be ${requestedNumber}.
- Do not stop early.
- Do not provide fewer items.
- Do not provide more items.
- Do not combine two requested items into one.
- Give each item meaningful content.
- Count your items before finishing.

NUMBER THE ITEMS EXACTLY LIKE THIS:

1. First item
2. Second item
3. Third item
...
${requestedNumber}. Final item

=========================================================
`;
  }


  return [
    `TOOL: ${type}`,
    `PLATFORM: ${platform}`,
    `USER REQUEST:\n${topic}`,
    quantityInstruction,
    extra
      ? `ADDITIONAL INFORMATION:\n${extra}`
      : ""
  ]
    .filter(Boolean)
    .join("\n\n");
}


/* =========================================================
   COUNT NUMBERED ITEMS
========================================================= */

function countNumberedItems(text) {

  const matches =
    String(text || "")
      .match(
        /(?:^|\n)\s*(\d{1,2})[\.\)]\s+/g
      );

  if (!matches) {
    return 0;
  }


  const numbers = [];

  for (const match of matches) {

    const numberMatch =
      match.match(/(\d{1,2})[\.\)]\s+$/);

    if (numberMatch) {

      const number =
        parseInt(numberMatch[1], 10);

      numbers.push(number);
    }
  }


  /*
  ---------------------------------------------------------
  Only count a properly sequential list.
  ---------------------------------------------------------
  */

  if (numbers.length === 0) {
    return 0;
  }


  let expected = 1;

  for (const number of numbers) {

    if (number !== expected) {
      return 0;
    }

    expected++;
  }


  return numbers.length;
}


/* =========================================================
   COUNT HASHTAGS
========================================================= */

function countHashtags(text) {

  const matches =
    String(text || "").match(
      /(^|\s)#[A-Za-z0-9_]+/g
    );

  return matches ? matches.length : 0;
}


/* =========================================================
   VERIFY QUANTITY
========================================================= */

function verifyQuantity(type, text, requestedNumber) {

  if (!requestedNumber) {
    return true;
  }


  /*
  ---------------------------------------------------------
  HASHTAGS
  ---------------------------------------------------------
  */

  if (type === "hashtags") {

    const count =
      countHashtags(text);

    return count === requestedNumber;
  }


  /*
  ---------------------------------------------------------
  ALL OTHER LIST-BASED REQUESTS
  ---------------------------------------------------------
  */

  const numberedCount =
    countNumberedItems(text);

  return numberedCount === requestedNumber;
}


/* =========================================================
   CORRECTION PROMPT
========================================================= */

function buildCorrectionPrompt(
  type,
  originalRequest,
  currentResult,
  requestedNumber
) {

  if (type === "hashtags") {

    return `
The user requested EXACTLY ${requestedNumber} hashtags.

Original request:
"${originalRequest}"

Previous answer:
${currentResult}

The previous answer did NOT contain exactly ${requestedNumber} hashtags.

Rewrite the answer.

STRICT REQUIREMENTS:
- Return EXACTLY ${requestedNumber} hashtags.
- Count them before finishing.
- Do not provide fewer.
- Do not provide more.
- Every hashtag must be relevant.
- Do not add explanations.
- Do not number the hashtags.
- Return ONLY the hashtags.
`;
  }


  return `
The user requested EXACTLY ${requestedNumber} items.

Tool:
${type}

Original request:
"${originalRequest}"

Previous answer:
${currentResult}

The previous answer did NOT contain exactly ${requestedNumber}
numbered items.

Rewrite the answer completely.

STRICT REQUIREMENTS:
- Provide EXACTLY ${requestedNumber} items.
- Number them 1 through ${requestedNumber}.
- Do not skip any number.
- Do not stop early.
- Do not provide extra numbered items.
- Do not combine multiple requested items into one.
- Give every item meaningful content.
- Preserve useful information from the previous answer.
- Return the complete corrected answer.
- Do not mention that a correction was performed.

The final numbered item MUST be:
${requestedNumber}. ...
`;
}


/* =========================================================
   RUN AI
========================================================= */

async function runAI(
  env,
  systemPrompt,
  userPrompt,
  maxTokens = 4096,
  model = STANDARD_MODEL
) {

  /*
  CAPTIVATE AI text-generation call.
  This model accepts the unscoped prompt format.
  */

  const combinedPrompt =
    `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\n` +
    `USER REQUEST:\n${userPrompt}\n\n` +
    `IMPORTANT: Follow the system instructions exactly. ` +
    `Return only the useful final answer.`;

  return await env.AI.run(
    model,
    {
      prompt: combinedPrompt,
      max_tokens: maxTokens,
      temperature: 0.3,
      top_p: 0.9
    }
  );
}


/* =========================================================
   MEDIA / SPECIALIZED MODEL HELPERS
========================================================= */

function clampInteger(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function cleanPrompt(value, fallback = "") {
  return cleanText(value ?? fallback, 12000);
}

async function generateImage(env, body) {
  const prompt = cleanPrompt(body.prompt || body.topic);
  if (!prompt) throw new Error("Image prompt is required.");

  const width = clampInteger(body.width, 1024, 64, 2048);
  const height = clampInteger(body.height, 1024, 64, 2048);
  const outputFormat = ["jpeg", "png", "webp"].includes(String(body.output_format || "jpeg").toLowerCase())
    ? String(body.output_format || "jpeg").toLowerCase()
    : "jpeg";

  const input = {
    prompt,
    width,
    height,
    output_format: outputFormat
  };

  if (body.seed !== undefined && body.seed !== "") {
    input.seed = Number(body.seed);
  }

  if (body.safety_tolerance !== undefined && body.safety_tolerance !== "") {
    input.safety_tolerance = clampInteger(body.safety_tolerance, 2, 0, 5);
  }

  if (Array.isArray(body.input_images) && body.input_images.length) {
    input.input_images = body.input_images
      .filter((v) => typeof v === "string" && v.trim())
      .slice(0, 8);
  }

  const response = await env.AI.run(MODELS.IMAGE, input);
  const image = response?.result?.image || response?.image;

  if (!image) {
    throw new Error("Image model returned no image URL.");
  }

  return {
    success: true,
    type: "image-generator",
    model: MODELS.IMAGE,
    state: response?.state || "Completed",
    image,
    prompt,
    width,
    height,
    outputFormat
  };
}

async function generateVideo(env, body) {
  const prompt = cleanPrompt(body.prompt || body.topic);
  if (!prompt) throw new Error("Video prompt is required.");

  const duration = clampInteger(body.duration, 5, 2, 10);
  const ratio = String(body.ratio || body.aspect_ratio || "1280:720");
  const allowedRatios = ["1280:720", "720:1280", "1024:1024", "1920:1080", "1080:1920"];

  const input = {
    prompt,
    duration,
    ratio: allowedRatios.includes(ratio) ? ratio : "1280:720"
  };

  if (body.image_url) {
    input.image_url = cleanText(body.image_url, 4000);
  }

  const response = await env.AI.run(MODELS.VIDEO, input);
  const video = response?.result?.video || response?.video;

  if (!video) {
    throw new Error("Video model returned no video URL.");
  }

  return {
    success: true,
    type: "video-generator",
    model: MODELS.VIDEO,
    state: response?.state || "Completed",
    video,
    prompt,
    duration,
    ratio
  };
}

async function streamToDataURI(stream, mimeType = "audio/mpeg") {
  const buffer = await new Response(stream).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return `data:${mimeType};base64,${btoa(binary)}`;
}

async function generateVoice(env, body) {
  const text = cleanPrompt(body.text || body.script || body.topic);
  if (!text) throw new Error("Voice text is required.");

  const speaker = String(body.speaker || "luna");
  const encoding = ["linear16", "flac", "mulaw", "alaw", "mp3", "opus", "aac"].includes(String(body.encoding || "mp3"))
    ? String(body.encoding || "mp3")
    : "mp3";

  const response = await env.AI.run(MODELS.VOICE, {
    text,
    speaker,
    encoding
  });

  if (!response) throw new Error("Voice model returned no audio.");

  const mime = encoding === "mp3" ? "audio/mpeg" : `audio/${encoding}`;
  const audio = await streamToDataURI(response, mime);

  return {
    success: true,
    type: "voice-studio",
    model: MODELS.VOICE,
    audio,
    speaker,
    encoding,
    text
  };
}

async function generateThumbnail(env, body) {
  const topic = cleanPrompt(body.prompt || body.topic);
  if (!topic) throw new Error("Thumbnail topic is required.");

  const title = cleanText(body.title || topic, 300);
  const style = cleanText(body.style || "high-contrast cinematic YouTube thumbnail", 500);
  const prompt = [
    `Create a professional YouTube thumbnail for: ${topic}`,
    `Headline text: ${title}`,
    `Style: ${style}`,
    "Strong focal subject, dramatic lighting, clear hierarchy, bold readable typography, minimal clutter, mobile-friendly composition.",
    "Use a 16:9 landscape composition with safe margins for text."
  ].join("\n");

  const response = await env.AI.run(MODELS.IMAGE, {
    prompt,
    width: 1280,
    height: 720,
    output_format: "png"
  });

  const image = response?.result?.image || response?.image;
  if (!image) throw new Error("Thumbnail model returned no image URL.");

  return {
    success: true,
    type: "thumbnail-generator",
    model: MODELS.IMAGE,
    state: response?.state || "Completed",
    image,
    title,
    topic,
    width: 1280,
    height: 720
  };
}

function isMediaTool(type) {
  return [
    "image-generator",
    "video-generator",
    "voice-studio",
    "thumbnail-generator"
  ].includes(type);
}

function isCodeTool(type) {
  return [
    "website-builder",
    "app-builder",
    "code-generator",
    "business-tool-builder"
  ].includes(type);
}


/* =========================================================
   WORKER
========================================================= */

export default {

  async fetch(request, env) {

    try {

      /* ===================================================
         OPTIONS
      =================================================== */

      if (request.method === "OPTIONS") {

        return new Response(null, {
          status: 204,
          headers: CORS_HEADERS
        });
      }


      /* ===================================================
         GET / HEALTH CHECK
      =================================================== */

      if (request.method === "GET") {

        return jsonResponse({

          success: true,

          status: "online",

          service: "Captivate AI",

          version: API_VERSION,

          aiBinding: !!env.AI,

          model: isCodeTool(type) ? MODELS.CODE : STANDARD_MODEL,

          models: MODELS,

          modelSource: "fixed-production-registry",

          environmentModelOverride: false,

          tools: SUPPORTED_TOOLS,

          capabilities: {
            text: MODELS.TEXT,
            code: MODELS.CODE,
            image: MODELS.IMAGE,
            video: MODELS.VIDEO,
            voice: MODELS.VOICE,
            vision: MODELS.VISION
          }

        });
      }


      /* ===================================================
         ONLY POST AFTER THIS
      =================================================== */

      if (request.method !== "POST") {

        return errorResponse(
          "Method not allowed. Use POST.",
          405
        );
      }


      /* ===================================================
         AI BINDING CHECK
      =================================================== */

      if (!env.AI) {

        return errorResponse(
          "Cloudflare Workers AI binding is missing.",
          500
        );
      }


      /* ===================================================
         READ REQUEST BODY
      =================================================== */

      let body;

      try {

        body =
          await request.json();

      } catch (error) {

        return errorResponse(
          "Invalid JSON request body.",
          400
        );
      }


      if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
      ) {

        return errorResponse(
          "Request body must be a JSON object.",
          400
        );
      }


      /* ===================================================
         INPUT
      =================================================== */

      const type =
        cleanText(
          body.type || "caption",
          40
        ).toLowerCase();

      const topic =
        cleanText(
          body.topic || body.prompt || body.text || body.script,
          12000
        );

      const platform =
        cleanText(
          body.platform || "General",
          100
        );


      /* ===================================================
         VALIDATE REQUEST CONTENT
      =================================================== */

      if (!topic) {

        return errorResponse(
          "Please provide a topic, prompt, text, or request.",
          400
        );
      }


      /* ===================================================
         VALIDATE TOOL
      =================================================== */

      if (
        !SUPPORTED_TOOLS.includes(type)
      ) {

        return errorResponse(
          `Unsupported tool: ${type}`,
          400,
          {
            supportedTools:
              SUPPORTED_TOOLS
          }
        );
      }


      /* ===================================================
         SPECIALIZED MODEL ROUTING
      =================================================== */

      if (type === "image-generator") {
        return jsonResponse(await generateImage(env, body));
      }

      if (type === "video-generator") {
        return jsonResponse(await generateVideo(env, body));
      }

      if (type === "voice-studio") {
        return jsonResponse(await generateVoice(env, body));
      }

      if (type === "thumbnail-generator") {
        return jsonResponse(await generateThumbnail(env, body));
      }


      /* ===================================================
         REQUESTED NUMBER
      =================================================== */

      const requestedNumber =
        detectRequestedNumber(topic);


      /* ===================================================
         SYSTEM PROMPT
      =================================================== */

      const systemPrompt =
        TOOL_PROMPTS[type] ||
        NEW_TOOL_PROMPTS[type];


      /* ===================================================
         SYSTEM PROMPT VALIDATION
      =================================================== */

      if (!systemPrompt) {

        return errorResponse(
          `No system prompt is configured for tool: ${type}`,
          500,
          {
            type,
            supportedTools: SUPPORTED_TOOLS
          }
        );
      }


      /* ===================================================
         USER PROMPT
      =================================================== */

      const userPrompt =
        buildUserPrompt(
          type,
          body
        );


      /* ===================================================
         FIRST GENERATION
      =================================================== */

      let aiResponse =
        await runAI(
          env,
          systemPrompt,
          userPrompt,
          requestedNumber
            ? 6144
            : 4096,
          isCodeTool(type) ? MODELS.CODE : STANDARD_MODEL
        );


      let result =
        cleanResult(
          extractText(aiResponse)
        );


      if (!result) {

        throw new Error(
          "The AI returned an empty result."
        );
      }


      /* ===================================================
         EXACT QUANTITY VERIFICATION
      =================================================== */

      let quantityVerified =
        !requestedNumber;


      let correctionAttempts = 0;


      /*
      Maximum two correction attempts.
      */

      while (
        requestedNumber &&
        !quantityVerified &&
        correctionAttempts < 2
      ) {

        correctionAttempts++;


        const correctionPrompt =
          buildCorrectionPrompt(
            type,
            topic,
            result,
            requestedNumber
          );


        aiResponse =
          await runAI(
            env,
            systemPrompt,
            correctionPrompt,
            6144,
            isCodeTool(type) ? MODELS.CODE : STANDARD_MODEL
          );


        result =
          cleanResult(
            extractText(aiResponse)
          );


        if (!result) {

          throw new Error(
            "The AI returned an empty corrected result."
          );
        }


        quantityVerified =
          verifyQuantity(
            type,
            result,
            requestedNumber
          );
      }


      /* ===================================================
         FINAL QUANTITY CHECK
      =================================================== */

      if (
        requestedNumber &&
        !quantityVerified
      ) {

        return errorResponse(
          `The AI could not reliably produce exactly ${requestedNumber} items. Please try the request again.`,
          502,
          {
            type,
            requestedNumber,
            quantityVerified: false,
            correctionAttempts
          }
        );
      }


      /* ===================================================
         SUCCESS
      =================================================== */

      return jsonResponse({

        success: true,

        version: API_VERSION,

        type,

        platform,

        model: STANDARD_MODEL,

        requestedNumber:
          requestedNumber || null,

        quantityVerified,

        correctionAttempts,

        result,

        [type]: result

      });

    } catch (error) {

      console.error(
        "Captivate AI Error:",
        error
      );


      return errorResponse(
        error?.message ||
          "An unexpected error occurred.",
        500
      );
    }
  }
};
