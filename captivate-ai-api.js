/* =========================================================
   CAPTIVATE AI API
   Version 7.8
   Stable Core Engine + App Builder + Code Generation Assistant
========================================================= */

const API_VERSION = "8.1";

/*
   v7.5 changes the image engine to the Cloudflare-hosted
   FLUX.1 [schnell] JSON API. This avoids the FLUX.2 Klein
   multipart request path that returned HTTP 4009 in testing.
*/

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
  // Cloudflare-hosted Workers AI models only.
  // No AI Gateway ID is supplied by this Worker, so these requests use
  // the normal Workers AI billing path rather than Unified Billing credits.
  TEXT: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  CODE: "@cf/qwen/qwen2.5-coder-32b-instruct",
  IMAGE: "@cf/black-forest-labs/flux-1-schnell",
  VOICE: "@cf/deepgram/aura-2-en",
  VISION: "@cf/meta/llama-4-scout-17b-16e-instruct"
};

const VIDEO_CONFIG = {
  enabled: false,
  provider: "not-configured",
  model: null,
  reason: "Video generation requires a separately configured video provider. v7.5 never silently routes video requests to a third-party model or AI Gateway Unified Billing."
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
  "website-builder": `You are CAPTIVATE AI Website Builder Assistant, a senior product designer, UX architect, SEO specialist and frontend engineer.

Turn the website brief into an implementation-ready blueprint. Return valid JSON only using the exact schema requested by the backend.

Rules:
- Make the site responsive and mobile-first.
- Do not invent real business facts, testimonials, certifications, prices, addresses or statistics.
- Use placeholders such as [BUSINESS NAME] when information is missing.
- Include semantic HTML, accessibility, SEO, security and responsive guidance.
- Prefer simple maintainable HTML/CSS/JS unless a framework is requested.
- Separate MVP features from future enhancements.
- For stores, booking systems, dashboards or web apps, describe required backend/API/data work rather than pretending a static page provides it.
- Starter HTML must be a real static prototype and must not contain fake backend integrations or secrets.
- Return only JSON; no Markdown fences or commentary outside the JSON.`,
  "app-builder": `You are CAPTIVATE AI App Builder Assistant, a senior product architect, UX designer and software engineer.

Turn the app brief into an implementation-ready application blueprint. Return valid JSON only using the exact schema requested by the backend.

Rules:
- Design mobile-first unless the user specifies otherwise.
- Do not invent business facts, users, prices, credentials or integrations.
- Clearly separate MVP from future features.
- Define screens, user flows, roles, architecture, authentication, database, APIs, integrations, security, deployment and acceptance criteria.
- Starter code must be real starter code, not fake backend behavior or exposed secrets.
- Use placeholders such as [APP NAME] when information is missing.
- Return only JSON; no Markdown fences or commentary outside the JSON.`,
  "code-generator": `You are CAPTIVATE AI Code Generation Assistant, a senior software engineer and code reviewer.

Generate, repair, explain, convert, optimize or refactor code from the user's requirements.

Supported work includes:
- HTML, CSS, JavaScript, TypeScript, Python, PHP, SQL, JSON and common web technologies.
- Cloudflare Workers and Workers AI code.
- API integrations and frontend/backend integration examples.
- Debugging and error fixing.
- Code explanation and documentation.
- Refactoring and performance optimization.
- Complete file-oriented implementations when requested.

Rules:
- Follow the user's requested language, framework and runtime.
- Do not invent APIs, credentials, endpoints or undocumented SDK behavior.
- Never expose or request real secrets; use placeholders such as YOUR_API_KEY.
- Preserve working behavior when fixing code unless the user asks for a redesign.
- Identify assumptions and missing information.
- Return syntactically coherent code whenever code is requested.
- Include dependencies, setup, testing and deployment notes when useful.
- For security-sensitive code, use safe defaults and explain required configuration.
- If the user provides an error, diagnose the likely cause before presenting the corrected implementation.
- Prefer complete replacement files for substantial implementations rather than fragmented patches.
- Return valid JSON only using the exact schema requested by the backend.`,
    "business-tool-builder": `You are CAPTIVATE AI Business Tool Builder Assistant, a senior business-systems analyst, UX architect, product designer and software architect.

Design a practical business tool from the user's brief and return VALID JSON ONLY. Do not return Markdown fences or commentary outside the JSON.

Required JSON shape:
{
  "project": {
    "name": "",
    "businessType": "",
    "toolType": "",
    "targetAudience": "",
    "platform": "",
    "summary": ""
  },
  "summary": "",
  "features": [],
  "workflows": [],
  "roles": [],
  "dataModel": [],
  "businessLogic": [],
  "screens": [],
  "starterCode": "",
  "implementationPlan": [],
  "testing": [],
  "deployment": [],
  "security": [],
  "nextSteps": [],
  "assumptions": []
}

Rules:
- Design for the stated business and target users.
- Separate MVP features from future enhancements when useful.
- Never invent real company facts, prices, credentials, addresses, customer data, API keys or secrets.
- Use placeholders such as [BUSINESS NAME] when information is missing.
- Make workflows concrete: inputs, validation, actions, outputs and failure cases.
- Include sensible roles and permissions when the tool needs multiple users.
- Keep the data model implementation-ready: entity, important fields and relationships.
- Include business rules and validation logic, not just UI descriptions.
- Make screens mobile-friendly when a mobile-first platform is requested.
- Starter code must be a real safe prototype and must not contain secrets or fake claims of completed integrations.
- If an integration is requested but credentials/provider details are missing, describe the integration boundary and configuration required.
- Include testing scenarios for normal, invalid and security-sensitive cases.
- Include deployment and security guidance appropriate to the requested platform.
- Do not pretend that a static prototype has a real database, authentication system, payment gateway or external integration.
- Keep the output concise enough to be usable but detailed enough to build from.
- Return only the JSON object.` ,
  "gaming-assistant": `You are CAPTIVATE AI Gaming Assistant, a knowledgeable gaming coach, strategist and practice planner.

Turn the player's request into a practical, structured gaming response. Return VALID JSON ONLY. Do not return Markdown fences or commentary outside the JSON.

Required JSON shape:
{
  "game": { "name": "", "genre": "", "platform": "", "mode": "" },
  "summary": "",
  "strategy": [],
  "loadoutOrBuild": [],
  "settings": [],
  "practicePlan": [],
  "mistakesToAvoid": [],
  "decisionRules": [],
  "progressionPlan": [],
  "teamwork": [],
  "challenges": [],
  "troubleshooting": [],
  "nextSteps": [],
  "assumptions": []
}

Rules:
- Never claim access to live game state, private player data, current match telemetry, hidden game files or unavailable APIs.
- Do not invent exact current patches, item statistics, prices, rankings or balance values unless supplied by the user.
- If the game/version is unclear, state the assumption and keep advice broadly applicable.
- Adapt advice to the requested game, platform, mode, role and skill level.
- Separate general principles from version-sensitive information.
- Give actionable steps, decision rules and practice drills rather than vague encouragement.
- For competitive games, avoid cheating, exploits, unauthorized automation, credential theft or account abuse.
- For settings or loadouts, explain what each recommendation is intended to improve.
- Keep the output useful on mobile and easy to scan.
- Return only the JSON object.`,
  "game-story-generator": `You are CAPTIVATE AI Game Idea & Story Generator, a senior game designer, narrative designer and creative director.

Turn the user's game concept into an implementation-ready game concept and story blueprint.

Return VALID JSON ONLY using this exact top-level structure:
{
  "project": {
    "title": "",
    "genre": "",
    "platform": "",
    "audience": "",
    "mode": "",
    "summary": ""
  },
  "gameConcept": {
    "premise": "",
    "coreHook": "",
    "playerFantasy": "",
    "uniqueSellingPoints": []
  },
  "world": {
    "setting": "",
    "lore": "",
    "factions": [],
    "locations": []
  },
  "characters": [],
  "story": {
    "opening": "",
    "mainConflict": "",
    "storyArc": [],
    "missions": [],
    "endings": []
  },
  "gameplay": {
    "coreLoop": [],
    "mechanics": [],
    "progression": [],
    "challenges": []
  },
  "visualDirection": {
    "artStyle": "",
    "environment": "",
    "characters": "",
    "ui": ""
  },
  "audioDirection": {
    "music": "",
    "soundDesign": "",
    "voice": ""
  },
  "monetization": [],
  "developmentPlan": [],
  "mvp": [],
  "futureFeatures": [],
  "testing": [],
  "assumptions": [],
  "nextSteps": []
}

Rules:
- Make the concept original and coherent.
- Do not copy existing games, characters, stories, dialogue or copyrighted material.
- Do not invent real-world facts as if they are confirmed.
- Clearly separate the MVP from future features.
- Make story and gameplay support each other.
- Characters should have useful roles, motivations and conflicts.
- Missions should have objectives and meaningful progression.
- Keep the concept practical enough for a prototype.
- If information is missing, make reasonable creative assumptions and list them in assumptions.
- Return JSON only. No Markdown fences or commentary outside the JSON.`,
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
   BUSINESS TOOL BUILDER ASSISTANT
   v7.9 dedicated structured backend
========================================================= */

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => typeof item === "string" ? item.trim() : JSON.stringify(item))
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function normalizeBusinessToolItem(item) {
  if (typeof item === "string") {
    return { name: item.trim(), description: "" };
  }

  if (!item || typeof item !== "object") {
    return { name: "", description: "" };
  }

  return {
    name: cleanText(item.name || item.title || item.label || "Item", 200),
    description: cleanText(
      item.description ||
      item.details ||
      item.purpose ||
      item.summary ||
      "",
      3000
    ),
    priority: cleanText(item.priority || "", 40),
    inputs: normalizeStringArray(item.inputs),
    outputs: normalizeStringArray(item.outputs),
    steps: normalizeStringArray(item.steps),
    validation: normalizeStringArray(item.validation)
  };
}

function normalizeBusinessToolItems(value) {
  if (!Array.isArray(value)) {
    if (typeof value === "string" && value.trim()) {
      return [{ name: "Details", description: value.trim() }];
    }
    return [];
  }

  return value
    .map(normalizeBusinessToolItem)
    .filter(item => item.name || item.description);
}

function normalizeBusinessToolResult(result, request) {
  const source = result && typeof result === "object" ? result : {};

  const projectSource =
    source.project && typeof source.project === "object"
      ? source.project
      : {};

  const project = {
    name: cleanText(
      projectSource.name ||
      request.name ||
      "Business Tool",
      200
    ),
    businessType: cleanText(
      projectSource.businessType ||
      request.businessType ||
      "",
      200
    ),
    toolType: cleanText(
      projectSource.toolType ||
      request.toolType ||
      "Custom Business Tool",
      200
    ),
    targetAudience: cleanText(
      projectSource.targetAudience ||
      request.targetAudience ||
      request.users ||
      "",
      500
    ),
    platform: cleanText(
      projectSource.platform ||
      request.platform ||
      "Mobile-first Web App",
      100
    ),
    summary: cleanText(
      projectSource.summary ||
      source.summary ||
      "",
      5000
    )
  };

  const features = normalizeBusinessToolItems(
    source.features || source.coreFeatures
  );

  const workflows = normalizeBusinessToolItems(
    source.workflows ||
    source.userFlows ||
    source.processes
  );

  const roles = normalizeBusinessToolItems(source.roles);

  const dataModel = normalizeBusinessToolItems(
    source.dataModel ||
    source.database ||
    source.data
  );

  const businessLogic = normalizeBusinessToolItems(
    source.businessLogic ||
    source.logic
  );

  const screens = normalizeBusinessToolItems(
    source.screens ||
    source.pages
  );

  const implementationPlan = normalizeBusinessToolItems(
    source.implementationPlan ||
    source.buildPlan ||
    source.plan
  );

  const testing = normalizeBusinessToolItems(
    source.testing ||
    source.testPlan
  );

  const deployment = normalizeBusinessToolItems(
    source.deployment
  );

  const security = normalizeBusinessToolItems(
    source.security
  );

  const nextSteps = normalizeBusinessToolItems(
    source.nextSteps
  );

  const assumptions = normalizeBusinessToolItems(
    source.assumptions
  );

  const starterCode = cleanText(
    source.starterCode ||
    source.code ||
    "",
    30000
  );

  const summary = cleanText(
    source.summary ||
    project.summary ||
    "Business tool blueprint generated successfully.",
    6000
  );

  return {
    project,
    summary,
    features,
    workflows,
    roles,
    dataModel,
    businessLogic,
    screens,
    starterCode,
    implementationPlan,
    testing,
    deployment,
    security,
    nextSteps,
    assumptions
  };
}

function businessToolFallbackResult(request) {
  const project = {
    name: request.name || "Business Tool",
    businessType: request.businessType || "",
    toolType: request.toolType || "Custom Business Tool",
    targetAudience: request.targetAudience || request.users || "",
    platform: request.platform || "Mobile-first Web App",
    summary:
      "A structured MVP blueprint based on the supplied business process. " +
      "Review the assumptions and replace placeholders before production use."
  };

  return {
    project,
    summary: project.summary,
    features: [
      {
        name: "Core workflow",
        description: "Implement the primary business process described by the user.",
        priority: "MVP",
        inputs: [request.idea || request.topic || ""],
        outputs: ["Validated business record or workflow result"]
      },
      {
        name: "Validation",
        description: "Validate required fields and reject incomplete or invalid submissions.",
        priority: "MVP"
      }
    ],
    workflows: [
      {
        name: "Primary workflow",
        description: "Capture input, validate it, perform the business action and show the result.",
        priority: "MVP",
        steps: [
          "Collect required information",
          "Validate the information",
          "Process the business action",
          "Save or return the result",
          "Show success or actionable error"
        ]
      }
    ],
    roles: [],
    dataModel: [],
    businessLogic: [],
    screens: [
      {
        name: "Dashboard",
        description: "Show the most important business metrics and actions."
      }
    ],
    starterCode: "",
    implementationPlan: [],
    testing: [],
    deployment: [],
    security: [],
    nextSteps: [],
    assumptions: [
      {
        name: "Prototype status",
        description: "This blueprint does not create real external integrations or production credentials."
      }
    ]
  };
}

function businessToolRequestFromBody(body) {
  return {
    name: cleanText(body.name || body.toolName || "", 200),
    idea: cleanText(
      body.idea ||
      body.topic ||
      body.prompt ||
      body.text ||
      "",
      12000
    ),
    businessType: cleanText(body.businessType || "", 300),
    toolType: cleanText(body.toolType || "Custom Business Tool", 200),
    targetAudience: cleanText(
      body.targetAudience ||
      body.users ||
      "",
      1000
    ),
    users: cleanText(body.users || "", 1000),
    platform: cleanText(body.platform || "Mobile-first Web App", 150),
    features: cleanText(body.features || "", 6000),
    workflow: cleanText(body.workflow || "", 6000),
    data: cleanText(body.data || body.dataModel || "", 6000),
    integrations: cleanText(body.integrations || "", 4000),
    brand: cleanText(body.brand || "", 2000),
    extra: cleanText(
      body.extra ||
      body.extraInstructions ||
      "",
      6000
    )
  };
}

function buildBusinessToolInstruction(request) {
  return `
BUSINESS TOOL BUILDER REQUEST

Tool name:
${request.name || "[TOOL NAME]"}

Business tool idea:
${request.idea || "[BUSINESS TOOL IDEA]"}

Business type:
${request.businessType || "[BUSINESS TYPE]"}

Tool type:
${request.toolType}

Target users:
${request.targetAudience || request.users || "[TARGET USERS]"}

Platform:
${request.platform}

Core features requested:
${request.features || "[NOT SPECIFIED]"}

Current workflow/process:
${request.workflow || "[NOT SPECIFIED]"}

Data/records required:
${request.data || "[NOT SPECIFIED]"}

Integrations:
${request.integrations || "[NONE SPECIFIED]"}

Brand/design direction:
${request.brand || "[NOT SPECIFIED]"}

Extra requirements:
${request.extra || "[NONE]"}

Return the exact JSON structure required by the system prompt.
Prioritize an implementable MVP and clearly identify anything that still requires backend services, credentials, external APIs or human decisions.
`;
}

async function generateBusinessToolBuilder(env, body) {
  const request = businessToolRequestFromBody(body);

  if (!request.idea) {
    throw new Error("Business Tool Builder requires an idea or business process description.");
  }

  const instruction = buildBusinessToolInstruction(request);

  const aiResponse = await runAI(
    env,
    NEW_TOOL_PROMPTS["business-tool-builder"],
    instruction,
    8192,
    MODELS.CODE
  );

  const rawText =
    typeof aiResponse === "string"
      ? aiResponse
      : aiResponse?.response ||
        aiResponse?.text ||
        aiResponse?.output_text ||
        "";

  let parsed = null;

  try {
    parsed = extractJsonObject(rawText);
  } catch (error) {
    console.warn(
      "Business Tool Builder JSON parsing warning:",
      error?.message || error
    );
  }

  const normalized = normalizeBusinessToolResult(
    parsed || businessToolFallbackResult(request),
    request
  );

  const summary =
    normalized.summary ||
    "Business tool blueprint generated successfully.";

  return {
    success: true,
    version: API_VERSION,
    type: "business-tool-builder",
    model: MODELS.CODE,
    provider: "cloudflare-workers-ai",
    billingPath: "standard-workers-ai",
    state: "Completed",
    project: normalized.project,
    businessTool: normalized,
    result: summary,
    output: normalized,
    text: summary,
    starterCode: normalized.starterCode,
    implementationPlan: normalized.implementationPlan,
    testing: normalized.testing,
    deployment: normalized.deployment,
    security: normalized.security,
    nextSteps: normalized.nextSteps
  };
}


/* =========================================================
   GAMING ASSISTANT
   v8.0 dedicated structured backend
========================================================= */

function normalizeGamingArray(value, limit = 20) {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => {
      if (typeof item === "string") return cleanText(item, 1200);
      if (item && typeof item === "object") {
        const title = cleanText(item.title || item.name || item.rule || item.step || "", 200);
        const detail = cleanText(item.detail || item.description || item.reason || item.action || item.notes || "", 1000);
        if (title && detail) return `${title}: ${detail}`;
        return title || detail;
      }
      return "";
    })
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeGamingObject(value, defaults = {}) {
  const source = value && typeof value === "object" ? value : {};
  const result = {};
  for (const [key, fallback] of Object.entries(defaults)) {
    result[key] = cleanText(source[key] ?? fallback, 300);
  }
  return result;
}

function normalizeGamingResult(data, request) {
  const source = data && typeof data === "object" ? data : {};
  const game = normalizeGamingObject(source.game, {
    name: request.game || "",
    genre: request.genre || "",
    platform: request.platform || "General",
    mode: request.mode || ""
  });

  return {
    game,
    summary: cleanText(source.summary || "Gaming guidance generated successfully.", 2500),
    strategy: normalizeGamingArray(source.strategy),
    loadoutOrBuild: normalizeGamingArray(source.loadoutOrBuild || source.loadout || source.build),
    settings: normalizeGamingArray(source.settings),
    practicePlan: normalizeGamingArray(source.practicePlan || source.trainingPlan),
    mistakesToAvoid: normalizeGamingArray(source.mistakesToAvoid || source.mistakes),
    decisionRules: normalizeGamingArray(source.decisionRules || source.rules),
    progressionPlan: normalizeGamingArray(source.progressionPlan || source.progression),
    teamwork: normalizeGamingArray(source.teamwork || source.teamPlay),
    challenges: normalizeGamingArray(source.challenges),
    troubleshooting: normalizeGamingArray(source.troubleshooting || source.commonProblems),
    nextSteps: normalizeGamingArray(source.nextSteps),
    assumptions: normalizeGamingArray(source.assumptions)
  };
}

function gamingFallbackResult(request) {
  return {
    game: {
      name: request.game || "",
      genre: request.genre || "",
      platform: request.platform || "General",
      mode: request.mode || ""
    },
    summary: "A practical gaming strategy blueprint based on the supplied request.",
    strategy: ["Review the objective and win condition before each match.", "Focus on one measurable improvement at a time.", "Review mistakes after each session and adjust the next practice block."],
    loadoutOrBuild: [],
    settings: [],
    practicePlan: ["Warm up with a short mechanical drill.", "Play focused matches with one improvement target.", "Review the biggest recurring mistake before the next session."],
    mistakesToAvoid: ["Changing too many variables at once.", "Ignoring positioning, timing or resource management."],
    decisionRules: ["Prioritize the safest action that advances the current objective."],
    progressionPlan: ["Build consistency first, then increase difficulty."],
    teamwork: [],
    challenges: [],
    troubleshooting: [],
    nextSteps: ["Apply one recommendation in your next session and record the result."],
    assumptions: request.game ? [] : ["Game title was not specified; advice should be treated as general guidance."]
  };
}

function gamingRequestFromBody(body) {
  return {
    game: cleanText(body.game || body.gameTitle || body.title || "", 200),
    genre: cleanText(body.genre || "", 150),
    platform: cleanText(body.platform || "General", 150),
    mode: cleanText(body.mode || body.gameMode || "", 150),
    role: cleanText(body.role || body.character || "", 200),
    skillLevel: cleanText(body.skillLevel || body.level || "", 150),
    goal: cleanText(body.goal || body.objective || "", 1000),
    request: cleanText(body.request || body.topic || body.prompt || body.text || "", 8000),
    problems: cleanText(body.problems || body.error || "", 4000),
    preferences: cleanText(body.preferences || body.playstyle || "", 2000),
    extra: cleanText(body.extra || body.extraInstructions || "", 4000)
  };
}

function buildGamingInstruction(request) {
  return `
GAMING ASSISTANT REQUEST

Game:
${request.game || "[GAME NOT SPECIFIED]"}

Genre:
${request.genre || "[NOT SPECIFIED]"}

Platform:
${request.platform}

Mode:
${request.mode || "[NOT SPECIFIED]"}

Role / character:
${request.role || "[NOT SPECIFIED]"}

Skill level:
${request.skillLevel || "[NOT SPECIFIED]"}

Primary goal:
${request.goal || "[NOT SPECIFIED]"}

Player request:
${request.request || "[NOT SPECIFIED]"}

Problems or obstacles:
${request.problems || "[NONE SPECIFIED]"}

Playstyle preferences:
${request.preferences || "[NOT SPECIFIED]"}

Extra requirements:
${request.extra || "[NONE]"}

Return the exact JSON structure required by the system prompt. Make the advice actionable and clearly distinguish assumptions or version-sensitive information.
`;
}

async function generateGamingAssistant(env, body) {
  const request = gamingRequestFromBody(body);
  if (!request.request) {
    throw new Error("Gaming Assistant requires a gaming question, goal or request.");
  }

  const aiResponse = await runAI(
    env,
    NEW_TOOL_PROMPTS["gaming-assistant"],
    buildGamingInstruction(request),
    8192,
    MODELS.TEXT
  );

  const rawText = typeof aiResponse === "string"
    ? aiResponse
    : aiResponse?.response || aiResponse?.text || aiResponse?.output_text || "";

  let parsed = null;
  try { parsed = extractJsonObject(rawText); }
  catch (error) { console.warn("Gaming Assistant JSON parsing warning:", error?.message || error); }

  const normalized = normalizeGamingResult(
    parsed || gamingFallbackResult(request),
    request
  );

  return {
    success: true,
    version: API_VERSION,
    type: "gaming-assistant",
    model: MODELS.TEXT,
    provider: "cloudflare-workers-ai",
    billingPath: "standard-workers-ai",
    state: "Completed",
    game: normalized.game,
    gamingAssistant: normalized,
    result: normalized.summary,
    output: normalized,
    text: normalized.summary,
    strategy: normalized.strategy,
    practicePlan: normalized.practicePlan,
    nextSteps: normalized.nextSteps
  };
}


/* =========================================================
   WEBSITE BUILDER ASSISTANT
   v7.6 dedicated structured backend
========================================================= */

function extractJsonObject(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  const unfenced = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try { return JSON.parse(unfenced); } catch (_) {}
  const start = unfenced.indexOf("{");
  if (start < 0) return null;
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < unfenced.length; i++) {
    const ch = unfenced[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(unfenced.slice(start, i + 1)); } catch (_) { return null; }
      }
    }
  }
  return null;
}

function normalizeWebsiteArray(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  return value.map(item => cleanText(item, 1200)).filter(Boolean);
}

function normalizeWebsitePage(page, index) {
  const item = page && typeof page === "object" ? page : {};
  return {
    name: cleanText(item.name || `Page ${index + 1}`, 120),
    path: cleanText(item.path || (index === 0 ? "/" : `/page-${index + 1}`), 120),
    purpose: cleanText(item.purpose || "", 600),
    sections: normalizeWebsiteArray(item.sections),
    primaryCTA: cleanText(item.primaryCTA || item.cta || "", 200),
    notes: cleanText(item.notes || "", 800)
  };
}

function normalizeWebsiteResult(data, request) {
  const source = data && typeof data === "object" ? data : {};
  const project = source.project && typeof source.project === "object" ? source.project : {};
  const architecture = source.architecture && typeof source.architecture === "object" ? source.architecture : {};
  const seo = source.seo && typeof source.seo === "object" ? source.seo : {};
  const accessibility = source.accessibility && typeof source.accessibility === "object" ? source.accessibility : {};
  const security = source.security && typeof source.security === "object" ? source.security : {};
  const dataModel = source.dataModel && typeof source.dataModel === "object" ? source.dataModel : {};
  const pages = Array.isArray(source.pages) ? source.pages.map(normalizeWebsitePage) : [];

  return {
    project: {
      name: cleanText(project.name || request.idea || "Untitled Website", 200),
      websiteType: cleanText(project.websiteType || request.websiteType || "Business Website", 100),
      audience: cleanText(project.audience || request.targetAudience || "General audience", 500),
      style: cleanText(project.style || request.style || "Modern & Premium", 150),
      summary: cleanText(project.summary || "", 1200)
    },
    sitemap: normalizeWebsiteArray(source.sitemap || pages.map(p => p.path)),
    pages,
    architecture: {
      stack: cleanText(architecture.stack || "Semantic HTML5 + CSS + vanilla JavaScript", 500),
      frontend: cleanText(architecture.frontend || "Responsive mobile-first frontend", 700),
      backend: cleanText(architecture.backend || "Not required for a static MVP; add API/backend for dynamic features", 1000),
      hosting: cleanText(architecture.hosting || "Static hosting compatible", 500),
      integrations: normalizeWebsiteArray(architecture.integrations)
    },
    components: normalizeWebsiteArray(source.components),
    features: normalizeWebsiteArray(source.features),
    mvpFeatures: normalizeWebsiteArray(source.mvpFeatures),
    futureFeatures: normalizeWebsiteArray(source.futureFeatures),
    dataModel: {
      entities: normalizeWebsiteArray(dataModel.entities),
      fields: normalizeWebsiteArray(dataModel.fields),
      notes: cleanText(dataModel.notes || "", 1000)
    },
    forms: normalizeWebsiteArray(source.forms),
    responsive: normalizeWebsiteArray(source.responsive),
    seo: {
      title: cleanText(seo.title || "", 160),
      metaDescription: cleanText(seo.metaDescription || "", 320),
      keywords: normalizeWebsiteArray(seo.keywords),
      openGraph: normalizeWebsiteArray(seo.openGraph),
      schema: normalizeWebsiteArray(seo.schema)
    },
    accessibility: normalizeWebsiteArray(accessibility.checklist || accessibility.items),
    security: normalizeWebsiteArray(security.checklist || security.items),
    starterHtml: cleanText(source.starterHtml || source.htmlStarter || "", 30000),
    buildPrompt: cleanText(source.buildPrompt || "", 10000),
    assumptions: normalizeWebsiteArray(source.assumptions),
    nextSteps: normalizeWebsiteArray(source.nextSteps)
  };
}

function websiteFallbackResult(request, reason) {
  const idea = request.idea || "Website project";
  const type = request.websiteType || "Business Website";
  return {
    project: { name: idea, websiteType: type, audience: request.targetAudience || "General audience", style: request.style || "Modern & Premium", summary: `A ${type.toLowerCase()} for ${idea}.` },
    sitemap: ["/", "/about", "/services", "/contact"],
    pages: [
      { name: "Home", path: "/", purpose: "Introduce the offer and drive the primary action.", sections: ["Hero", "Value proposition", "Services", "CTA", "Footer"], primaryCTA: "Get Started", notes: "Replace placeholders with verified business content." },
      { name: "About", path: "/about", purpose: "Explain the business and build trust.", sections: ["Story", "Mission", "Team placeholder", "CTA"], primaryCTA: "Contact Us", notes: "Do not publish invented credentials." },
      { name: "Services", path: "/services", purpose: "Explain products or services.", sections: ["Service cards", "Benefits", "Process", "FAQ", "CTA"], primaryCTA: "Request a Quote", notes: "Add real pricing only when supplied." },
      { name: "Contact", path: "/contact", purpose: "Provide contact options and a lead form.", sections: ["Contact details placeholder", "Lead form"], primaryCTA: "Send Message", notes: "Connect the form to a real backend before production." }
    ],
    architecture: { stack: "Semantic HTML5 + CSS + vanilla JavaScript", frontend: "Mobile-first responsive frontend", backend: "Backend required for real form processing or dynamic features", hosting: "Static hosting compatible", integrations: [] },
    components: ["Header", "Navigation", "Hero", "Section", "Card Grid", "CTA", "Form", "Footer"],
    features: request.features ? [request.features] : [],
    mvpFeatures: ["Responsive layout", "Clear navigation", "Primary CTA", "Contact form UI", "SEO metadata", "Accessible semantic structure"],
    futureFeatures: ["CMS", "Analytics", "Authentication", "Payments", "Database-backed forms"],
    dataModel: { entities: ["Lead"], fields: ["name", "email", "phone", "message", "createdAt"], notes: "Store lead data only when a backend is connected." },
    forms: ["Contact / lead form"],
    responsive: ["Mobile navigation", "Fluid typography", "Stacked cards on small screens", "Touch-friendly controls"],
    seo: { title: idea, metaDescription: `Learn about ${idea} and explore its services.`, keywords: [], openGraph: ["og:title", "og:description", "og:image"], schema: ["Organization or LocalBusiness when applicable"] },
    accessibility: ["Semantic headings", "Keyboard navigation", "Visible focus states", "Form labels", "Alt text"],
    security: ["Validate and sanitize form input", "Use HTTPS", "Protect API keys server-side", "Rate-limit public forms"],
    starterHtml: "",
    buildPrompt: `Build a responsive ${type} for ${idea}. Use ${request.style || "Modern & Premium"} styling, semantic HTML, accessible components, SEO metadata and clear CTA placeholders. Do not invent business facts.`,
    assumptions: [reason],
    nextSteps: ["Review the sitemap", "Replace placeholders", "Connect backend services for dynamic features", "Test mobile, accessibility and forms"]
  };
}

function websiteRequestFromBody(body) {
  return {
    idea: cleanText(body.idea || body.topic || body.prompt, 2000),
    targetAudience: cleanText(body.targetAudience || body.audience, 1200),
    websiteType: cleanText(body.websiteType || body.siteType || "Business Website", 200),
    style: cleanText(body.style || "Modern & Premium", 300),
    pages: cleanText(body.pages || body.requestedPages, 3000),
    features: cleanText(body.features || body.pagesFeatures || "", 5000),
    brand: cleanText(body.brand || body.brandDirection || "", 2000),
    extra: cleanText(body.extra || body.extraInstructions || "", 4000)
  };
}

async function generateWebsiteBuilder(env, body) {
  const request = websiteRequestFromBody(body);
  if (!request.idea) throw new Error("Website idea is required.");

  const structuredInstruction = `Return JSON with exactly these top-level keys: project, sitemap, pages, architecture, components, features, mvpFeatures, futureFeatures, dataModel, forms, responsive, seo, accessibility, security, starterHtml, buildPrompt, assumptions, nextSteps.

Required page keys: name, path, purpose, sections, primaryCTA, notes.

WEBSITE BRIEF
Idea: ${request.idea}
Target audience: ${request.targetAudience || "Not specified"}
Website type: ${request.websiteType}
Style: ${request.style}
Requested pages: ${request.pages || "Not specified"}
Features: ${request.features || "Not specified"}
Brand/color direction: ${request.brand || "Not specified"}
Extra instructions: ${request.extra || "Not specified"}

starterHtml: provide a complete self-contained static HTML prototype when practical, with semantic HTML, responsive CSS, accessible navigation, hero, key sections and footer. Use [PLACEHOLDERS] for missing facts. Do not include secrets or fake API connections.

buildPrompt: provide a detailed implementation prompt covering stack, pages, components, interactions, data/API requirements, validation, security, SEO and acceptance criteria.`;

  const aiResponse = await runAI(env, NEW_TOOL_PROMPTS["website-builder"], structuredInstruction, 8192, MODELS.CODE);
  const raw = cleanResult(extractText(aiResponse));
  const parsed = extractJsonObject(raw) || websiteFallbackResult(request, "Model output was not valid JSON; a safe fallback blueprint was returned.");
  const normalized = normalizeWebsiteResult(parsed, request);
  const summary = [
    `Website: ${normalized.project.name}`,
    `Type: ${normalized.project.websiteType}`,
    `Pages: ${normalized.pages.map(p => `${p.name} (${p.path})`).join(", ") || "Not specified"}`,
    `Stack: ${normalized.architecture.stack}`,
    `MVP: ${normalized.mvpFeatures.join("; ") || "Not specified"}`,
    `Next: ${normalized.nextSteps.join("; ") || "Review and implement the blueprint."}`
  ].join("\n");

  return {
    success: true, version: API_VERSION, type: "website-builder", model: MODELS.CODE,
    provider: "cloudflare-workers-ai", billingPath: "standard-workers-ai", state: "Completed",
    project: normalized.project, website: normalized, result: summary, output: normalized,
    text: summary, htmlStarter: normalized.starterHtml, buildPrompt: normalized.buildPrompt
  };
}


/* =========================================================
   APP BUILDER ASSISTANT
========================================================= */
function normalizeAppArray(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  return value.map(item => cleanText(item, 1600)).filter(Boolean);
}
function normalizeAppObjectArray(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  return value.filter(x => x && typeof x === "object").map(item => {
    const o = {};
    for (const [k,v] of Object.entries(item)) {
      if (Array.isArray(v)) o[k] = normalizeAppArray(v);
      else if (v && typeof v === "object") o[k] = v;
      else o[k] = cleanText(v, 1800);
    }
    return o;
  });
}
function normalizeAppScreen(screen, index) {
  const x = screen && typeof screen === "object" ? screen : {};
  return {
    name: cleanText(x.name || `Screen ${index+1}`, 160),
    purpose: cleanText(x.purpose || "", 900),
    users: normalizeAppArray(x.users || x.roles),
    components: normalizeAppArray(x.components),
    actions: normalizeAppArray(x.actions),
    states: normalizeAppArray(x.states),
    apiNeeds: normalizeAppArray(x.apiNeeds || x.api),
    notes: cleanText(x.notes || "", 1200)
  };
}
function normalizeAppResult(data, request) {
  const s = data && typeof data === "object" ? data : {};
  const p = s.project && typeof s.project === "object" ? s.project : {};
  const a = s.architecture && typeof s.architecture === "object" ? s.architecture : {};
  const auth = s.authentication && typeof s.authentication === "object" ? s.authentication : (s.auth && typeof s.auth === "object" ? s.auth : {});
  const db = s.database && typeof s.database === "object" ? s.database : {};
  const api = s.api && typeof s.api === "object" ? s.api : {};
  return {
    project: { name: cleanText(p.name || request.name || request.idea || "Untitled App",220), idea: cleanText(p.idea || request.idea || "",1600), appType: cleanText(p.appType || request.appType || "Web App",160), platform: cleanText(p.platform || request.platform || "Web",160), audience: cleanText(p.audience || request.targetAudience || "General audience",800), summary: cleanText(p.summary || "",1600) },
    goals: normalizeAppArray(s.goals), features: normalizeAppArray(s.features), mvpFeatures: normalizeAppArray(s.mvpFeatures), futureFeatures: normalizeAppArray(s.futureFeatures), roles: normalizeAppObjectArray(s.roles),
    screens: Array.isArray(s.screens) ? s.screens.map(normalizeAppScreen) : [],
    userFlows: normalizeAppObjectArray(s.userFlows || s.flows),
    architecture: { frontend: cleanText(a.frontend || "Responsive mobile-first frontend",1000), backend: cleanText(a.backend || "API/backend required for dynamic features",1200), stack: cleanText(a.stack || "Use a maintainable stack appropriate to the requested platform",1000), hosting: cleanText(a.hosting || "Production-compatible hosting",700), integrations: normalizeAppArray(a.integrations) },
    authentication: { method: cleanText(auth.method || "Not specified",500), roles: normalizeAppArray(auth.roles), session: cleanText(auth.session || "",800), notes: cleanText(auth.notes || "",1000) },
    database: { engine: cleanText(db.engine || "Not specified",500), entities: normalizeAppObjectArray(db.entities), relationships: normalizeAppArray(db.relationships), indexes: normalizeAppArray(db.indexes), notes: cleanText(db.notes || "",1200) },
    api: { style: cleanText(api.style || "REST or platform-appropriate API",500), endpoints: normalizeAppObjectArray(api.endpoints), validation: normalizeAppArray(api.validation), errors: normalizeAppArray(api.errors) },
    integrations: normalizeAppArray(s.integrations), security: normalizeAppArray(s.security), accessibility: normalizeAppArray(s.accessibility), starterCode: cleanText(s.starterCode || s.code || "",50000), implementationPlan: normalizeAppArray(s.implementationPlan || s.buildPlan), acceptanceCriteria: normalizeAppArray(s.acceptanceCriteria), deployment: normalizeAppArray(s.deployment), nextSteps: normalizeAppArray(s.nextSteps), assumptions: normalizeAppArray(s.assumptions)
  };
}
function appFallbackResult(request, reason) {
  return { project:{name:request.name||request.idea||"Untitled App",idea:request.idea||"",appType:request.appType||"Web App",platform:request.platform||"Web",audience:request.targetAudience||"General audience",summary:`An MVP application for ${request.name||request.idea||"the project"}.`}, goals:["Deliver a clear MVP","Provide a usable user flow","Keep the architecture maintainable"], features:request.features?[request.features]:[], mvpFeatures:["Core user flow","Responsive interface","Input validation","Error handling"], futureFeatures:["Analytics","Advanced automation","Additional integrations"], roles:[{name:"User",permissions:["Use core application features"]}], screens:[{name:"Home",purpose:"Introduce the app and primary action.",users:["User"],components:["Header","Hero","Primary CTA"],actions:["Start"],states:[],apiNeeds:[],notes:""},{name:"Dashboard",purpose:"Provide the main workspace when needed.",users:["User"],components:["Navigation","Content panels"],actions:["Create","View","Edit"],states:["Loading","Empty","Error","Success"],apiNeeds:[],notes:""}], userFlows:[{name:"Primary flow",steps:["Open app","Enter required information","Submit","Review result"]}], architecture:{frontend:"Responsive mobile-first frontend",backend:"Add backend/API for dynamic data or protected operations",stack:"Use a maintainable stack appropriate to the requested platform",hosting:"Production-compatible hosting",integrations:[]}, authentication:{method:"Not specified",roles:["User"],session:"",notes:""}, database:{engine:"Not specified",entities:[],relationships:[],indexes:[],notes:""}, api:{style:"REST or platform-appropriate API",endpoints:[],validation:["Validate all client input server-side"],errors:["Return safe error messages"]}, integrations:request.integrations?[request.integrations]:[], security:["Never expose secrets in frontend code","Validate and sanitize inputs","Use HTTPS"], accessibility:["Semantic structure","Keyboard support","Visible focus","Accessible labels"], starterCode:"", implementationPlan:["Finalize MVP requirements","Build UI","Implement backend/API where required","Test core flows","Deploy"], acceptanceCriteria:["Primary user flow works","Invalid input is handled","Mobile layout is usable","No secrets are exposed"], deployment:["Configure environment variables securely","Deploy","Test production endpoints"], nextSteps:["Review the blueprint","Choose the stack","Implement MVP"], assumptions:[reason] };
}
function appRequestFromBody(body) {
  return { idea:cleanText(body.idea||body.topic||body.prompt,2500), name:cleanText(body.name||body.appName,220), targetAudience:cleanText(body.targetAudience||body.audience,1200), appType:cleanText(body.appType||"Web App",200), platform:cleanText(body.platform||"Web",200), style:cleanText(body.style||"Modern & Clean",300), features:cleanText(body.features||"",6000), screens:cleanText(body.screens||body.pages||"",4000), monetization:cleanText(body.monetization||"",1600), integrations:cleanText(body.integrations||"",3000), brand:cleanText(body.brand||body.brandDirection||"",2000), extra:cleanText(body.extra||body.extraInstructions||"",5000) };
}
async function generateAppBuilder(env, body) {
  const r=appRequestFromBody(body); if(!r.idea) throw new Error("App idea is required.");
  const instruction=`Return JSON with exactly these top-level keys: project, goals, features, mvpFeatures, futureFeatures, roles, screens, userFlows, architecture, authentication, database, api, integrations, security, accessibility, starterCode, implementationPlan, acceptanceCriteria, deployment, nextSteps, assumptions.\n\nEach screen should contain: name, purpose, users, components, actions, states, apiNeeds, notes.\n\nAPP BRIEF\nIdea: ${r.idea}\nApp name: ${r.name||"Not specified"}\nTarget audience: ${r.targetAudience||"Not specified"}\nApp type: ${r.appType}\nPlatform: ${r.platform}\nDesign style: ${r.style}\nCore features: ${r.features||"Not specified"}\nRequested screens: ${r.screens||"Not specified"}\nMonetization: ${r.monetization||"Not specified"}\nIntegrations: ${r.integrations||"Not specified"}\nBrand direction: ${r.brand||"Not specified"}\nExtra instructions: ${r.extra||"Not specified"}\n\nstarterCode must contain real starter implementation when practical. Never include real credentials or secrets. Separate MVP from future work. Describe real backend/API/database requirements instead of pretending a frontend-only prototype is complete.`;
  const ai=await runAI(env,NEW_TOOL_PROMPTS["app-builder"],instruction,8192,MODELS.CODE);
  const raw=cleanResult(extractText(ai)); const parsed=extractJsonObject(raw)||appFallbackResult(r,"Model output was not valid JSON; a safe fallback app blueprint was returned."); const n=normalizeAppResult(parsed,r);
  const summary=[`App: ${n.project.name}`,`Type: ${n.project.appType}`,`Platform: ${n.project.platform}`,`Screens: ${n.screens.map(x=>x.name).join(", ")||"Not specified"}`,`MVP: ${n.mvpFeatures.join("; ")||"Not specified"}`,`Next: ${n.nextSteps.join("; ")||"Review and implement the blueprint."}`].join("\n");
  return {success:true,version:API_VERSION,type:"app-builder",model:MODELS.CODE,provider:"cloudflare-workers-ai",billingPath:"standard-workers-ai",state:"Completed",project:n.project,app:n,result:summary,output:n,text:summary,starterCode:n.starterCode,implementationPlan:n.implementationPlan,acceptanceCriteria:n.acceptanceCriteria};
}

/* =========================================================
   CODE GENERATION ASSISTANT
========================================================= */
function codeRequestFromBody(body) { return {request:cleanText(body.request||body.idea||body.topic||body.prompt||body.text,12000),language:cleanText(body.language||"JavaScript",120),framework:cleanText(body.framework||"None specified",160),task:cleanText(body.task||body.taskType||"Generate Code",200),runtime:cleanText(body.runtime||body.environment||"Not specified",300),code:cleanText(body.code||body.sourceCode||"",30000),error:cleanText(body.error||body.errorMessage||"",12000),files:cleanText(body.files||body.fileStructure||"",6000),requirements:cleanText(body.requirements||body.extra||body.extraInstructions||"",7000)}; }
function normalizeCodeFiles(value) { if(!Array.isArray(value)) return []; return value.filter(x=>x&&typeof x==="object").map((x,i)=>({filename:cleanText(x.filename||x.file||`file-${i+1}.txt`,240),language:cleanText(x.language||"",100),code:cleanText(x.code||x.content||"",30000),purpose:cleanText(x.purpose||"",1000)})).filter(x=>x.code); }
function normalizeCodeResult(data,r) { const s=data&&typeof data==="object"?data:{}; return {task:cleanText(s.task||r.task,300),language:cleanText(s.language||r.language,120),framework:cleanText(s.framework||r.framework,180),summary:cleanText(s.summary||"",3000),assumptions:normalizeAppArray(s.assumptions),files:normalizeCodeFiles(s.files),code:cleanText(s.code||s.generatedCode||"",50000),explanation:cleanText(s.explanation||s.codeExplanation||"",12000),diagnosis:cleanText(s.diagnosis||s.errorDiagnosis||"",8000),fixes:normalizeAppArray(s.fixes||s.changes),dependencies:normalizeAppArray(s.dependencies),setup:normalizeAppArray(s.setup||s.installation),testing:normalizeAppArray(s.testing||s.tests),deployment:normalizeAppArray(s.deployment),security:normalizeAppArray(s.security),optimization:normalizeAppArray(s.optimization||s.performance),nextSteps:normalizeAppArray(s.nextSteps)}; }
function codeFallbackResult(r,reason) { return {task:r.task,language:r.language,framework:r.framework,summary:"The code request was received, but the model response could not be parsed into the structured format.",assumptions:[reason],files:[],code:"",explanation:"Please review the request and run it again.",diagnosis:r.error?"The supplied error should be checked against the provided source code and runtime.":"",fixes:[],dependencies:[],setup:[],testing:["Run the generated code in the target runtime","Test the main success path","Test invalid input and error handling"],deployment:[],security:["Do not expose secrets in client-side code","Validate untrusted input","Use environment variables for credentials"],optimization:[],nextSteps:["Retry the request","Provide the exact error and relevant source file if debugging"]}; }
function buildCodeGenerationInstruction(r) { return `Return JSON with exactly these top-level keys: task, language, framework, summary, assumptions, files, code, explanation, diagnosis, fixes, dependencies, setup, testing, deployment, security, optimization, nextSteps.\n\nFor files, use an array of objects with exactly: filename, language, code, purpose.\n\nCODE REQUEST\nTask: ${r.task}\nLanguage: ${r.language}\nFramework: ${r.framework}\nRuntime/environment: ${r.runtime}\nRequest: ${r.request||"Not specified"}\nExisting code:\n${r.code||"No existing code supplied."}\n\nError message:\n${r.error||"No error supplied."}\n\nRequested files/file structure:\n${r.files||"Not specified."}\n\nAdditional requirements:\n${r.requirements||"Not specified."}\n\nIMPORTANT:\n- If debugging, diagnose the supplied code/error and provide corrected code.\n- If explanation only, explain without inventing a rewrite unless useful.\n- If complete implementation is requested, populate files and/or code with complete coherent code.\n- Do not put Markdown fences inside JSON string values.\n- Never put real API keys, tokens, passwords or private credentials in generated code.\n- Use safe placeholders such as YOUR_API_KEY.\n- For Cloudflare Workers, use env bindings and environment variables rather than hard-coded secrets.\n- If an external API is uncertain, state the assumption rather than inventing undocumented endpoints.\n- Keep code internally consistent with the requested runtime and language.`; }
async function generateCodeGenerator(env,body) { const r=codeRequestFromBody(body); if(!r.request&&!r.code&&!r.error) throw new Error("Code request, source code, or error message is required."); const ai=await runAI(env,NEW_TOOL_PROMPTS["code-generator"],buildCodeGenerationInstruction(r),8192,MODELS.CODE); const raw=cleanResult(extractText(ai)); const parsed=extractJsonObject(raw)||codeFallbackResult(r,"Model output was not valid JSON; a safe structured fallback was returned."); const n=normalizeCodeResult(parsed,r); if(!n.code&&!n.files.length&&r.code&&r.error)n.code=r.code; const summary=n.summary||`${n.task} completed for ${n.language}${n.framework&&n.framework!=="None specified"?` using ${n.framework}`:""}.`; return {success:true,version:API_VERSION,type:"code-generator",model:MODELS.CODE,provider:"cloudflare-workers-ai",billingPath:"standard-workers-ai",state:"Completed",task:n.task,language:n.language,framework:n.framework,result:summary,output:n,text:summary,code:n.code,files:n.files,explanation:n.explanation,diagnosis:n.diagnosis,fixes:n.fixes,dependencies:n.dependencies,setup:n.setup,testing:n.testing,deployment:n.deployment,security:n.security,optimization:n.optimization,nextSteps:n.nextSteps}; }

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

function base64ToDataURI(base64, mimeType = "image/png") {
  if (!base64 || typeof base64 !== "string") return null;
  if (base64.startsWith("data:")) return base64;
  return `data:${mimeType};base64,${base64}`;
}

async function generateImage(env, body) {
  /*
  ---------------------------------------------------------
  v7.5 IMAGE ENGINE
  ---------------------------------------------------------
  Uses Cloudflare-hosted FLUX.1 [schnell].

  Important:
  - FLUX.1 [schnell] accepts a normal JSON object through env.AI.run().
  - prompt is required and supports up to 2048 characters.
  - steps is optional and has a maximum of 8.
  - The model returns response.image as Base64.
  - Do NOT send width/height or FLUX.2 multipart fields here.
  ---------------------------------------------------------
  */

  const prompt = cleanText(
    body.prompt || body.topic,
    2048
  );

  if (!prompt) {
    throw new Error("Image prompt is required.");
  }

  const steps = clampInteger(
    body.steps,
    4,
    1,
    8
  );

  const seed =
    body.seed !== undefined && body.seed !== ""
      ? Number.parseInt(body.seed, 10)
      : null;

  const input = {
    prompt,
    steps
  };

  if (Number.isInteger(seed) && seed >= 0) {
    input.seed = seed;
  }

  let response;

  try {
    response = await env.AI.run(
      MODELS.IMAGE,
      input
    );
  } catch (error) {
    const message =
      error?.message ||
      String(error || "Unknown image model error");

    throw new Error(
      `Image generation failed using ${MODELS.IMAGE}: ${message}`
    );
  }

  const rawImage =
    response?.result?.image ||
    response?.image;

  const image =
    base64ToDataURI(
      rawImage,
      "image/jpeg"
    );

  if (!image) {
    throw new Error(
      `Image model ${MODELS.IMAGE} returned no image data.`
    );
  }

  return {
    success: true,
    version: API_VERSION,
    type: "image-generator",
    model: MODELS.IMAGE,
    provider: "cloudflare-workers-ai",
    billingPath: "standard-workers-ai",
    state: response?.state || "Completed",
    image,
    prompt,
    steps,
    seed: Number.isInteger(seed) && seed >= 0 ? seed : null
  };
}

async function generateThumbnail(env, body) {
  const topic = cleanText(
    body.prompt || body.topic,
    1800
  );

  if (!topic) {
    throw new Error("Thumbnail topic is required.");
  }

  const title = cleanText(
    body.title || topic,
    300
  );

  const style = cleanText(
    body.style || "high-contrast cinematic YouTube thumbnail",
    400
  );

  const prompt = [
    `Create a professional YouTube thumbnail for: ${topic}`,
    `Headline concept: ${title}`,
    `Style: ${style}`,
    "Strong focal subject, dramatic lighting, clear visual hierarchy, bold readable typography, minimal clutter, mobile-friendly composition.",
    "Use a landscape YouTube-thumbnail composition with safe margins for text.",
    "Do not add watermarks or unrelated logos."
  ].join("\n");

  const response = await generateImage(env, {
    prompt,
    steps: body.steps
  });

  return {
    ...response,
    type: "thumbnail-generator",
    title,
    topic
  };
}

async function streamToDataURI(stream, mimeType = "audio/mpeg") {
  if (!stream) throw new Error("Voice model returned no audio stream.");

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
  const text = cleanText(
    body.text || body.script || body.topic,
    6000
  );

  if (!text) throw new Error("Voice text is required.");

  const allowedSpeakers = new Set([
    "amalthea", "andromeda", "apollo", "arcas", "aries", "asteria",
    "athena", "atlas", "aurora", "callista", "cora", "cordelia",
    "delia", "draco", "electra", "harmonia", "helena", "hera",
    "hermes", "hyperion", "iris", "janus", "juno", "jupiter",
    "luna", "mars", "minerva", "neptune", "odysseus", "ophelia",
    "orion", "orpheus", "pandora", "phoebe", "pluto", "saturn",
    "thalia", "theia", "vesta", "zeus"
  ]);

  const speakerCandidate = String(body.speaker || "luna").toLowerCase();
  const speaker = allowedSpeakers.has(speakerCandidate)
    ? speakerCandidate
    : "luna";

  const allowedEncodings = new Set([
    "linear16", "flac", "mulaw", "alaw", "mp3", "opus", "aac"
  ]);

  const encodingCandidate = String(body.encoding || "mp3").toLowerCase();
  const encoding = allowedEncodings.has(encodingCandidate)
    ? encodingCandidate
    : "mp3";

  const response = await env.AI.run(MODELS.VOICE, {
    text,
    speaker,
    encoding
  });

  const mime = {
    mp3: "audio/mpeg",
    opus: "audio/ogg",
    aac: "audio/aac",
    flac: "audio/flac",
    linear16: "audio/wav",
    mulaw: "audio/basic",
    alaw: "audio/basic"
  }[encoding] || "audio/mpeg";

  const audio = await streamToDataURI(response, mime);

  return {
    success: true,
    version: API_VERSION,
    type: "voice-studio",
    model: MODELS.VOICE,
    provider: "cloudflare-workers-ai",
    billingPath: "standard-workers-ai",
    audio,
    speaker,
    encoding,
    text
  };
}

function videoUnavailableResponse() {
  return {
    success: false,
    version: API_VERSION,
    type: "video-generator",
    code: "VIDEO_PROVIDER_REQUIRED",
    provider: VIDEO_CONFIG.provider,
    model: VIDEO_CONFIG.model,
    available: false,
    message: VIDEO_CONFIG.reason
  };
}

function mediaErrorResponse(type, error, status = 502) {
  const message =
    error?.message ||
    String(error || "Unknown media generation error");

  return errorResponse(
    message,
    status,
    {
      type,
      provider: "cloudflare-workers-ai",
      model:
        type === "voice-studio"
          ? MODELS.VOICE
          : MODELS.IMAGE,
      billingPath: "standard-workers-ai",
      hint:
        type === "image-generator" || type === "thumbnail-generator"
          ? "v7.8 uses the Cloudflare-hosted FLUX.1 [schnell] JSON API. Check the Worker console if this request still fails."
          : "Check the Worker console for the underlying media-model error."
    }
  );
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
    "business-tool-builder",
    "game-story-generator"
  ].includes(type);
}



/* =========================================================
   GAME IDEA & STORY GENERATOR
   v8.1 dedicated structured backend
========================================================= */

function normalizeStoryArray(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  return value
    .map(item => cleanText(item, 1600)    .filter(Boolean);
}

function normalizeStoryObjectArray(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  return value
    .map(item => {
      if (!item || typeof item !== "object") {
        return { name: cleanText(item, 160), description: "" };
      }
      return {
        name: cleanText(item.name || item.title || item.role || "Untitled", 160),
        description: cleanText(item.description || item.summary || item.details || "", 1600),
        role: cleanText(item.role || "", 300),
        motivation: cleanText(item.motivation || "", 500),
        conflict: cleanText(item.conflict || "", 700)
      };
    })
    .filter(item => item.name || item.description);
}

function normalizeGameStoryResult(data, request) {
  const source = data && typeof data === "object" ? data : {};
  const project = source.project && typeof source.project === "object" ? source.project : {};
  const concept = source.gameConcept && typeof source.gameConcept === "object" ? source.gameConcept : {};
  const world = source.world && typeof source.world === "object" ? source.world : {};
  const story = source.story && typeof source.story === "object" ? source.story : {};
  const gameplay = source.gameplay && typeof source.gameplay === "object" ? source.gameplay : {};
  const visual = source.visualDirection && typeof source.visualDirection === "object" ? source.visualDirection : {};
  const audio = source.audioDirection && typeof source.audioDirection === "object" ? source.audioDirection : {};

  return {
    project: {
      title: cleanText(project.title || request.title || request.idea || "Untitled Game", 200),
      genre: cleanText(project.genre || request.genre || "Adventure", 160),
      platform: cleanText(project.platform || request.platform || "PC / Mobile", 200),
      audience: cleanText(project.audience || request.audience || request.targetAudience || "General players", 500),
      mode: cleanText(project.mode || request.mode || "Single-player", 160),
      summary: cleanText(project.summary || "", 1600)
    },
    gameConcept: {
      premise: cleanText(concept.premise || "", 2000),
      coreHook: cleanText(concept.coreHook || concept.hook || "", 1200),
      playerFantasy: cleanText(concept.playerFantasy || "", 1200),
      uniqueSellingPoints: normalizeStoryArray(concept.uniqueSellingPoints || concept.usps)
    },
    world: {
      setting: cleanText(world.setting || "", 1600),
      lore: cleanText(world.lore || "", 2200),
      factions: normalizeStoryObjectArray(world.factions),
      locations: normalizeStoryObjectArray(world.locations)
    },
    characters: normalizeStoryObjectArray(source.characters),
    story: {
      opening: cleanText(story.opening || "", 1800),
      mainConflict: cleanText(story.mainConflict || story.conflict || "", 1800),
      storyArc: normalizeStoryArray(story.storyArc || story.arc),
      missions: normalizeStoryObjectArray(story.missions),
      endings: normalizeStoryArray(story.endings)
    },
    gameplay: {
      coreLoop: normalizeStoryArray(gameplay.coreLoop),
      mechanics: normalizeStoryArray(gameplay.mechanics),
      progression: normalizeStoryArray(gameplay.progression),
      challenges: normalizeStoryArray(gameplay.challenges)
    },
    visualDirection: {
      artStyle: cleanText(visual.artStyle || "", 1000),
      environment: cleanText(visual.environment || "", 1000),
      characters: cleanText(visual.characters || "", 1000),
      ui: cleanText(visual.ui || "", 1000)
    },
    audioDirection: {
      music: cleanText(audio.music || "", 900),
      soundDesign: cleanText(audio.soundDesign || "", 900),
      voice: cleanText(audio.voice || "", 900)
    },
    monetization: normalizeStoryArray(source.monetization),
    developmentPlan: normalizeStoryArray(source.developmentPlan || source.buildPlan),
    mvp: normalizeStoryArray(source.mvp || source.mvpFeatures),
    futureFeatures: normalizeStoryArray(source.futureFeatures || source.future),
    testing: normalizeStoryArray(source.testing),
    assumptions: normalizeStoryArray(source.assumptions),
    nextSteps: normalizeStoryArray(source.nextSteps)
  };
}

function gameStoryFallbackResult(request) {
  return normalizeGameStoryResult({
    project: {
      title: request.title || request.idea || "Untitled Game",
      genre: request.genre || "Adventure",
      platform: request.platform || "PC / Mobile",
      audience: request.audience || request.targetAudience || "General players",
      mode: request.mode || "Single-player",
      summary: "A prototype-ready game concept generated from the supplied brief."
    },
    gameConcept: {
      premise: request.idea || "Create a compelling game concept from the user's idea.",
      coreHook: "A focused gameplay loop connected to a clear narrative goal.",
      playerFantasy: "Explore, make meaningful decisions and overcome escalating challenges.",
      uniqueSellingPoints: []
    },
    world: { setting: "", lore: "", factions: [], locations: [] },
    characters: [],
    story: { opening: "", mainConflict: "", storyArc: [], missions: [], endings: [] },
    gameplay: { coreLoop: [], mechanics: [], progression: [], challenges: [] },
    visualDirection: { artStyle: "", environment: "", characters: "", ui: "" },
    audioDirection: { music: "", soundDesign: "", voice: "" },
    monetization: [],
    developmentPlan: [],
    mvp: [],
    futureFeatures: [],
    testing: [],
    assumptions: ["Some game details were not supplied and should be refined during design."],
    nextSteps: ["Review the concept", "Define the MVP", "Prototype the core gameplay loop"]
  }, request);
}

function gameStoryRequestFromBody(body) {
  return {
    title: cleanText(body.title || body.gameTitle || "", 200),
    idea: cleanText(body.idea || body.topic || body.request || body.prompt || "", 12000),
    genre: cleanText(body.genre || "", 200),
    platform: cleanText(body.platform || "", 300),
    audience: cleanText(body.audience || body.targetAudience || "", 600),
    mode: cleanText(body.mode || body.gameMode || "", 200),
    setting: cleanText(body.setting || "", 1600),
    characters: cleanText(body.characters || "", 3000),
    mechanics: cleanText(body.mechanics || body.gameplay || "", 4000),
    style: cleanText(body.style || body.artStyle || "", 800),
    inspiration: cleanText(body.inspiration || "", 1200),
    monetization: cleanText(body.monetization || "", 1000),
    extra: cleanText(body.extra || body.extraInstructions || "", 4000)
  };
}

function buildGameStoryInstruction(request) {
  return `GAME IDEA & STORY BRIEF

Title:
${request.title || "Not specified"}

Core idea:
${request.idea || "Not specified"}

Genre:
${request.genre || "Not specified"}

Platform:
${request.platform || "Not specified"}

Target audience:
${request.audience || "Not specified"}

Game mode:
${request.mode || "Not specified"}

Setting:
${request.setting || "Not specified"}

Characters:
${request.characters || "Not specified"}

Gameplay / mechanics:
${request.mechanics || "Not specified"}

Visual style:
${request.style || "Not specified"}

Inspiration / direction:
${request.inspiration || "Not specified"}

Monetization:
${request.monetization || "Not specified"}

Extra requirements:
${request.extra || "Not specified"}

Create the complete structured game concept using the required JSON schema.`;
}

async function generateGameStoryGenerator(env, body) {
  const request = gameStoryRequestFromBody(body);
  if (!request.idea) {
    throw new Error("Game idea or request is required.");
  }

  const instruction = buildGameStoryInstruction(request);
  const aiResponse = await runAI(
    env,
    NEW_TOOL_PROMPTS["game-story-generator"],
    instruction,
    8192,
    MODELS.CODE
  );

  const raw = cleanResult(extractText(aiResponse));
  const parsed = extractJsonObject(raw);
  const normalized = parsed
    ? normalizeGameStoryResult(parsed, request)
    : gameStoryFallbackResult(request);

  const summary =
    normalized.project.summary ||
    normalized.gameConcept.premise ||
    `Game concept generated for ${normalized.project.title}.`;

  return {
    success: true,
    version: API_VERSION,
    type: "game-story-generator",
    model: MODELS.CODE,
    provider: "cloudflare-workers-ai",
    billingPath: "standard-workers-ai",
    state: "Completed",
    project: normalized.project,
    gameStory: normalized,
    result: summary,
    output: normalized,
    text: summary,
    gameConcept: normalized.gameConcept,
    world: normalized.world,
    characters: normalized.characters,
    story: normalized.story,
    gameplay: normalized.gameplay,
    visualDirection: normalized.visualDirection,
    audioDirection: normalized.audioDirection,
    developmentPlan: normalized.developmentPlan,
    nextSteps: normalized.nextSteps
  };
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

          model: STANDARD_MODEL,

          models: MODELS,

          modelSource: "cloudflare-hosted-model-registry",

          billing: {
            mode: "standard-workers-ai",
            aiGatewayCreditsRequiredByDefault: false,
            gatewayIdConfigured: false,
            note: "v7.8 does not pass an AI Gateway ID to env.AI.run()."
          },

          imageEngine: {
            model: MODELS.IMAGE,
            requestFormat: "json",
            output: "base64-image",
            steps: { min: 1, max: 8, default: 4 }
          },

          environmentModelOverride: false,

          tools: SUPPORTED_TOOLS,

          capabilities: {
            text: { available: true, model: MODELS.TEXT },
            code: { available: true, model: MODELS.CODE },
            websiteBuilder: { available: true, model: MODELS.CODE, mode: "structured-blueprint" },
            businessToolBuilder: { available: true, model: MODELS.CODE, mode: "structured-blueprint" },
            gameStoryGenerator: { available: true, model: MODELS.CODE, mode: "structured-game-concept" },
            gamingAssistant: { available: true, model: MODELS.TEXT, mode: "structured-gaming-guidance" },
            appBuilder: { available: true, model: MODELS.CODE, mode: "structured-app-blueprint" },
            codeGenerator: { available: true, model: MODELS.CODE, mode: "structured-code-generation" },
            image: { available: true, model: MODELS.IMAGE },
            thumbnail: { available: true, model: MODELS.IMAGE },
            voice: { available: true, model: MODELS.VOICE },
            vision: { available: true, model: MODELS.VISION },
            video: {
              available: VIDEO_CONFIG.enabled,
              model: VIDEO_CONFIG.model,
              reason: VIDEO_CONFIG.reason
            }
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
          body.topic || body.prompt || body.text || body.script || body.idea || body.request || body.idea || body.request ||
          body.idea || body.request || body.code || body.error,
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

      if (type === "app-builder") {
        try { return jsonResponse(await generateAppBuilder(env, body)); }
        catch (error) { console.error("CAPTIVATE app-builder error:", error); return errorResponse(error?.message || "App Builder Assistant failed.", 502, { type, model: MODELS.CODE }); }
      }

      if (type === "code-generator") {
        try { return jsonResponse(await generateCodeGenerator(env, body)); }
        catch (error) { console.error("CAPTIVATE code-generator error:", error); return errorResponse(error?.message || "Code Generation Assistant failed.", 502, { type, model: MODELS.CODE }); }
      }


      if (type === "game-story-generator") {
        try {
          return jsonResponse(await generateGameStoryGenerator(env, body));
        } catch (error) {
          console.error("CAPTIVATE game-story-generator error:", error);
          return errorResponse(
            error?.message || "Game Idea & Story Generator failed.",
            502,
            { type, model: MODELS.CODE }
          );
        }
      }

      if (type === "gaming-assistant") {
        try {
          return jsonResponse(await generateGamingAssistant(env, body));
        } catch (error) {
          console.error("CAPTIVATE gaming-assistant error:", error);
          return errorResponse(
            error?.message || "Gaming Assistant failed.",
            502,
            { type, model: MODELS.TEXT }
          );
        }
      }

      if (type === "business-tool-builder") {
  try {
    return jsonResponse(
      await generateBusinessToolBuilder(env, body)
    );
  } catch (error) {
    console.error(
      "CAPTIVATE business-tool-builder error:",
      error
    );

    return errorResponse(
      error?.message ||
        "Business Tool Builder Assistant failed.",
      502,
      {
        type,
        model: MODELS.CODE
      }
    );
  }
}

if (type === "website-builder") {
        try {
          return jsonResponse(await generateWebsiteBuilder(env, body));
        } catch (error) {
          console.error("CAPTIVATE website-builder error:", error);
          return errorResponse(error?.message || "Website Builder Assistant failed.", 502, { type, model: MODELS.CODE });
        }
      }

      if (type === "image-generator") {
        try {
          return jsonResponse(await generateImage(env, body));
        } catch (error) {
          console.error("CAPTIVATE image-generator error:", error);
          return mediaErrorResponse(type, error, 502);
        }
      }

      if (type === "video-generator") {
        return jsonResponse(videoUnavailableResponse(), 503);
      }

      if (type === "voice-studio") {
        try {
          return jsonResponse(await generateVoice(env, body));
        } catch (error) {
          console.error("CAPTIVATE voice-studio error:", error);
          return mediaErrorResponse(type, error, 502);
        }
      }

      if (type === "thumbnail-generator") {
        try {
          return jsonResponse(await generateThumbnail(env, body));
        } catch (error) {
          console.error("CAPTIVATE thumbnail-generator error:", error);
          return mediaErrorResponse(type, error, 502);
        }
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

        model: isCodeTool(type) ? MODELS.CODE : STANDARD_MODEL,

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
