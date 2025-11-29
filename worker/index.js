// ===========================
// Cloudflare Worker - CONTEXTOR API
// ===========================

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return handleCORS();
    }

    // Route API requests
    const url = new URL(request.url);

    if (url.pathname === "/api/generate" && request.method === "POST") {
      return handleGenerate(request, env);
    }

    // Health check endpoint
    if (url.pathname === "/api/health" && request.method === "GET") {
      return handleHealthCheck(env);
    }

    // Return 404 for other routes
    return new Response("Not Found", { status: 404 });
  },
};

// ===========================
// Main Generate Handler
// ===========================
async function handleGenerate(request, env) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return errorResponse("INVALID_REQUEST", validation.error);
    }

    // Route to appropriate processor
    const startTime = Date.now();
    const result = await routeRequest(body, env);

    // Add processing time
    result.metadata = {
      ...result.metadata,
      processingTime: Date.now() - startTime,
    };

    // Return success response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error("Worker error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred");
  }
}

// ===========================
// Request Validation
// ===========================
function validateRequest(body) {
  const { mode, input, subMode, stage } = body;

  // Validate mode
  const validModes = ["text", "image", "video", "music"];
  if (!mode || !validModes.includes(mode)) {
    return {
      valid: false,
      error: "Invalid mode. Must be: text, image, video, or music",
    };
  }

  // Validate input
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return {
      valid: false,
      error: "Input is required and must be non-empty string",
    };
  }

  // Validate input length
  if (input.length > 5000) {
    return {
      valid: false,
      error: "Input exceeds maximum length of 5000 characters",
    };
  }

  // Validate Mode A
  if (subMode === "modeA") {
    const validStages = ["clarify", "distill"];
    if (!stage || !validStages.includes(stage)) {
      return {
        valid: false,
        error: "Mode A requires valid stage: clarify or distill",
      };
    }

    if (stage === "distill") {
      if (!body.questions || !body.answers) {
        return {
          valid: false,
          error: "Distill stage requires questions and answers",
        };
      }
      if (!Array.isArray(body.questions) || !Array.isArray(body.answers)) {
        return { valid: false, error: "Questions and answers must be arrays" };
      }
      if (body.questions.length !== body.answers.length) {
        return {
          valid: false,
          error: "Number of questions and answers must match",
        };
      }
    }
  }

  return { valid: true };
}

// ===========================
// Request Router
// ===========================
async function routeRequest(body, env) {
  const { mode, subMode } = body;

  // Route by mode and subMode
  if (subMode === "modeA") {
    return await processModeA(body, env);
  } else if (subMode === "cot" || subMode === "pot") {
    return await processModeB(body, env);
  } else {
    // Default mode or explicit "default" subMode
    switch (mode) {
      case "text":
        return await processTextMode(body, env);
      case "image":
        return await processImageMode(body, env);
      case "video":
        return await processVideoMode(body, env);
      case "music":
        return await processMusicMode(body, env);
    }
  }
}

// ===========================
// Default Text Mode
// ===========================
async function processTextMode(body, env) {
  const { input } = body;

  const systemPrompt = `You are an expert context engineering assistant specializing in transforming vague ideas into comprehensive, actionable briefs for AI models.

Your role is to:
1. **Deeply analyze** the user's input to understand intent, goals, and underlying needs
2. **Expand and clarify** implicit requirements and expectations
3. **Structure information** logically with clear sections and hierarchy
4. **Add critical context** that makes the brief self-contained and production-ready
5. **Provide specific details** including constraints, success criteria, and edge cases
6. **Anticipate questions** an AI would need answered to perform the task excellently

Output Requirements:
- **Comprehensive**: Cover all relevant aspects thoroughly (aim for 300-800 words)
- **Well-structured**: Use clear headings, bullet points, and logical flow
- **Specific**: Include concrete examples, requirements, and constraints
- **Actionable**: Every detail should be useful for task execution
- **Self-contained**: No external context needed to understand the brief
- **Professional**: Production-ready quality suitable for real-world use

Style Guidelines:
- Be direct and precise (no fluff or meta-commentary)
- Use active voice and clear language
- Balance detail with readability
- Focus on "what" and "why", not just rephrasing

Critical Rules:
- NEVER simply rephrase or restate the input
- DO expand with relevant domain knowledge
- DO add structure even to simple inputs
- DO anticipate implementation details
- DO NOT make wild assumptions about unstated requirements
- DO NOT include self-referential commentary`;

  const userPrompt = `Original input: "${input}"

Generate a comprehensive, well-structured context brief that transforms this input into a production-ready specification. Expand appropriately based on the complexity and scope implied by the input.`;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.8,
    maxTokens: 4096,
  });

  return {
    success: true,
    mode: "text",
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
    },
  };
}

// ===========================
// Mode A - Clarify & Distill
// ===========================
async function processModeA(body, env) {
  const { stage } = body;

  if (stage === "clarify") {
    return await processModeAClarify(body, env);
  } else if (stage === "distill") {
    return await processModeADistill(body, env);
  }
}

async function processModeAClarify(body, env) {
  const { input } = body;

  const systemPrompt = `You are a world-class requirements analyst and strategic questioner. Your expertise is extracting maximum clarity from minimal information through precisely targeted questions.

Given raw user input, generate 4-7 laser-focused clarifying questions that systematically uncover:

1. **Core Objective & Desired Outcome**
   - What specific problem are they solving?
   - What does success look like?

2. **Key Requirements & Must-Haves**
   - What are the non-negotiable elements?
   - What features/capabilities are essential vs. nice-to-have?

3. **Constraints & Limitations**
   - Time, budget, technical, regulatory, or resource constraints?
   - What are the boundaries or hard limits?

4. **Target Audience/Users/Stakeholders**
   - Who will use/benefit from this?
   - What are their needs, skills, expectations?

5. **Technical & Domain-Specific Details**
   - What existing systems/tools/processes are involved?
   - What technical requirements or standards apply?

6. **Success Criteria & Metrics**
   - How will they measure if this worked?
   - What are the key performance indicators?

7. **Context & Background**
   - Why now? What prompted this?
   - What's been tried before?

Your questions MUST be:
- **Specific**: Not "What do you want?" but "What specific user actions should this system support?"
- **Strategic**: Each question should unlock critical information
- **Progressive**: Questions build on each other logically
- **Actionable**: Answers should lead directly to implementation clarity
- **Open-ended**: Allow for detailed, informative responses
- **Domain-relevant**: Tailored to the specific context of the input

Output Format:
ONLY output the numbered questions (4-7 questions). No preamble, no commentary, no explanations.

1. [Specific, strategic question]
2. [Specific, strategic question]
...`;

  const userPrompt = `Raw user input: "${input}"

Generate 4-7 strategic clarifying questions that will transform this vague input into a crystal-clear specification.`;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.8,
    maxTokens: 1024,
  });

  const questions = parseQuestions(aiResult.output);

  return {
    success: true,
    mode: "text",
    subMode: "modeA",
    stage: "clarify",
    questions: questions,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
    },
  };
}

async function processModeADistill(body, env) {
  const { questions, answers } = body;

  const systemPrompt = `You are an expert information architect and context synthesis specialist. Your role is to transform Q&A exchanges into polished, production-ready context briefs.

Given a set of strategic questions and user answers, create a comprehensive, well-structured context brief that:

**Integration & Synthesis:**
- Extract and integrate ALL key information from the Q&A
- Identify connections and patterns across answers
- Resolve any contradictions or ambiguities
- Highlight critical insights and priorities
- Synthesize scattered details into cohesive narrative

**Organization & Structure:**
- Organize information logically by theme/category
- Use clear hierarchical structure with sections and subsections
- Group related concepts together
- Create natural flow from context → requirements → details
- Use headings, bullet points, and formatting for clarity

**Production Quality:**
- Write in clear, professional, active voice
- Be comprehensive yet concise (no unnecessary words)
- Make it self-contained and actionable
- Ensure any AI or human reader has complete context
- Balance technical precision with readability

**Output Format:**
- Transform Q&A into flowing narrative (NOT list format)
- Use strategic section headers (e.g., "Objective", "Requirements", "Constraints")
- Include all essential details from answers
- Add minimal connecting text for coherence
- Aim for 400-1000 words depending on complexity

**Critical Rules:**
- NEVER simply reformat the Q&A as a list
- DO synthesize and reorganize information thematically
- DO preserve all specific details from answers
- DO NOT add assumptions or information not in answers
- DO NOT include meta-commentary about the process
- DO create a document that stands alone without the original Q&A`;

  let qaText = "Questions and User Answers:\n\n";
  for (let i = 0; i < questions.length; i++) {
    qaText += `Q${i + 1}: ${questions[i]}\n`;
    qaText += `A${i + 1}: ${answers[i]}\n\n`;
  }

  const userPrompt = `${qaText}

Transform this Q&A into a comprehensive, well-structured context brief that synthesizes all information into a cohesive, production-ready document.`;

  const aiResult = await callGemini(systemPrompt, userPrompt, env, {
    temperature: 0.7,
    maxTokens: 5120,
  });

  return {
    success: true,
    mode: "text",
    subMode: "modeA",
    stage: "distill",
    output: aiResult.output,
    metadata: {
      provider: "gemini",
      model: aiResult.model,
      fallbackUsed: false,
    },
  };
}

// ===========================
// Mode B - CoT / PoT
// ===========================
async function processModeB(body, env) {
  const { input, subMode } = body;

  let systemPrompt;

  if (subMode === "cot") {
    systemPrompt = `You are an expert analytical reasoner specializing in Chain-of-Thought (CoT) methodology. Break down complex problems into transparent, step-by-step logical reasoning.

Your CoT reasoning should follow this comprehensive structure:

1. **Problem Understanding & Framing**
   - Restate the core question or challenge
   - Identify what's being asked (explicitly and implicitly)
   - Define success criteria and constraints
   - Note any ambiguities or assumptions

2. **Component Analysis**
   - Break down into fundamental elements
   - Identify key variables, actors, systems involved
   - Map relationships and dependencies
   - Highlight critical vs. peripheral factors

3. **Step-by-Step Reasoning**
   - Walk through logic sequentially with clear transitions
   - Explain WHY each step follows from the previous
   - Surface decision points and evaluate options
   - Show work - make thinking visible and verifiable
   - Use concrete examples where helpful
   - Number each reasoning step clearly

4. **Synthesis & Conclusion**
   - Integrate insights from analysis
   - State final answer/recommendation with confidence level
   - Explain how conclusion addresses original problem
   - Note limitations or caveats
   - Suggest follow-up questions or next steps

CRITICAL REQUIREMENTS:
- Be THOROUGH - don't skip reasoning steps
- Be EXPLICIT - state assumptions, don't leave them implicit
- Be LOGICAL - each step must follow necessarily from previous
- Use clear numbered structure (1.1, 1.2, etc.) for sub-points
- Aim for 400-1000 words of detailed reasoning
- Think out loud - transparency is the goal`;
  } else {
    systemPrompt = `You are an expert algorithmic thinker specializing in Program-of-Thought (PoT) methodology. Transform problems into structured, executable pseudo-code with clear logic flow.

Your PoT reasoning should follow this comprehensive structure:

1. **Problem Specification**
   - Define inputs (types, formats, constraints, examples)
   - Define outputs (types, formats, success criteria)
   - State assumptions and edge cases
   - Clarify computational requirements

2. **Algorithm Design**
   - High-level approach and strategy
   - Key data structures needed (with rationale)
   - Core functions/procedures outline
   - Complexity considerations (time/space)
   - Alternative approaches considered

3. **Pseudo-Code Implementation**
   - Write structured, code-like logic
   - Use clear variable names and types
   - Include control flow (if/else, loops, recursion)
   - Add inline comments explaining non-obvious logic
   - Show data transformations step-by-step
   - Use indentation and formatting for clarity
   - Make it executable-adjacent (someone could implement this)

4. **Algorithm Analysis**
   - Explain key design decisions and trade-offs
   - Discuss complexity (Big-O if relevant)
   - Note edge cases and how they're handled
   - Suggest optimizations or variations
   - Highlight potential failure modes

CRITICAL REQUIREMENTS:
- Use PROPER pseudo-code syntax (not vague descriptions)
- Be SPECIFIC with data structures and operations
- ANNOTATE logic with explanatory comments
- Think like you're designing for implementation
- Aim for 400-1200 words including code + explanations
- Balance technical precision with readability`;
  }

  const userPrompt = `Problem/Task: ${input}

Provide comprehensive ${subMode === "cot" ? "Chain-of-Thought reasoning" : "Program-of-Thought algorithmic design"} that thoroughly analyzes and solves this.`;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.8,
    maxTokens: 4096,
  });

  return {
    success: true,
    mode: "text",
    subMode: subMode,
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
    },
  };
}

// ===========================
// Image Mode
// ===========================
async function processImageMode(body, env) {
  const { input, outputFormat } = body;

  const systemPrompt = `You are a master visual prompt engineer with expertise in photography, cinematography, and digital art. Transform user concepts into comprehensive visual blueprints optimized for image generation AI (Midjourney, SDXL, Flux, Stable Diffusion).

Generate a DETAILED blueprint using this EXACT structure:

Subject: [Main subject/focal point - be ultra-specific about appearance, characteristics, materials]
Scene: [What is happening - action, interaction, story moment, context]
Environment: [Complete setting description - location, background elements, spatial relationships, time of day]
Lighting: [Comprehensive lighting setup - primary/secondary sources, direction, quality (hard/soft), color temperature, mood, shadows, highlights]
Camera: [Technical camera specs - angle (eye-level/high/low/dutch/aerial), perspective (wide/normal/telephoto), framing (close-up/medium/full/establishing)]
Lens: [Lens characteristics - focal length (14mm/35mm/50mm/85mm/200mm), aperture (f/1.4-f/22), depth of field, bokeh, distortion, optical effects]
Mood: [Emotional atmosphere - specific feelings, energy level, psychological impact, viewer response]
Palette: [Precise color scheme - primary/secondary/accent colors, saturation levels, contrast, color harmony (analogous/complementary/triadic), color grading]
Art Style: [Artistic approach - medium (photography/painting/3D/mixed), technique, artistic movement, specific artist references, rendering style]
Textures: [Surface qualities - materials, tactile properties, weathering, finish (matte/glossy/rough/smooth), detail level]
Composition: [Visual structure - rule of thirds, golden ratio, leading lines, symmetry/asymmetry, visual balance, focal hierarchy, negative space]
Negative Controls: [Specific elements to AVOID - unwanted styles, artifacts, compositions, colors, subjects]
References: [Concrete examples - specific artworks, photographers, films, artistic periods, visual styles]

CRITICAL REQUIREMENTS:
- Be HIGHLY SPECIFIC with technical details (not vague)
- Use professional photography/cinematography terminology
- Each field should be 2-4 sentences of rich detail
- Think like a professional creative director briefing a team
- Make every word count toward visual clarity`;

  const userPrompt = `User's visual concept: "${input}"

Transform this into a comprehensive visual blueprint with professional-level detail for each field. Expand the concept with expert knowledge of visual composition, lighting, and aesthetics.`;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.8,
    maxTokens: 3072,
  });

  const response = {
    success: true,
    mode: "image",
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
    },
  };

  if (outputFormat === "json" || outputFormat === "both") {
    response.outputJSON = parseBlueprintToJSON(aiResult.output);
  }

  return response;
}

// ===========================
// Video Mode
// ===========================
async function processVideoMode(body, env) {
  const { input, outputFormat } = body;

  const systemPrompt = `You are a professional cinematographer and director specializing in visual storytelling. Transform user concepts into detailed cinematic breakdowns for video generation AI (Runway Gen-3, Pika, Luma Dream Machine, Kling).

Create a COMPREHENSIVE blueprint using this EXACT structure:

Scene Summary: [2-3 sentence cinematic description capturing the essence, narrative moment, and emotional core]
Camera Motion: [Detailed movement - type (pan/tilt/dolly/zoom/crane/steadicam/handheld), speed (slow/medium/fast), trajectory, start/end positions, motivation for movement]
Lens & Focal Length: [Technical specs - focal length (wide 14-24mm/normal 35-50mm/telephoto 85-200mm), aperture, depth of field characteristics, optical effects (flares/aberrations)]
Character Movement: [Subject actions - blocking, choreography, speed, emotional quality of movement, body language, interaction with environment, performance notes]
Environment Dynamics: [Background motion - wind, water, crowds, vehicles, natural phenomena, practical effects, environmental storytelling elements]
Lighting: [Cinematic lighting - key/fill/rim lights, practical sources, color temperature shifts, lighting changes over time, shadow play, atmospheric effects (fog/haze/particles), mood evolution]
Timeline (0-1s, 1-2s, etc.): [Precise frame-by-frame breakdown - describe visual changes, action beats, camera moves, lighting shifts for each second. Be specific about timing and transitions]
Style: [Cinematic approach - genre (noir/sci-fi/documentary/commercial), era (classic/modern/futuristic), film references, color grading (teal-orange/bleach-bypass/vintage), grain/texture]
Aesthetic Rules: [Visual guidelines - contrast levels, saturation, sharpness, motion blur, frame rate feel (24fps cinematic/60fps smooth), aspect ratio implications, compositional principles]
Negative Controls: [Elements to AVOID - unwanted artifacts, camera issues (shake/jitter), visual styles, technical problems, content to exclude]
References: [Specific examples - films (with scene/timestamp if relevant), directors, cinematographers, music videos, commercials, visual artists]

CRITICAL REQUIREMENTS:
- Think in MOTION - everything should have temporal dynamics
- Use professional film production terminology
- Be specific about TIMING - when things happen in the clip
- Each field should be 2-5 sentences with rich temporal detail
- Consider cause and effect in motion
- Design for 3-10 second clip generation`;

  const userPrompt = `User's video concept: "${input}"

Transform this into a professional cinematic breakdown with frame-accurate temporal detail. Think like a director planning a shot.`;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.8,
    maxTokens: 3584,
  });

  const response = {
    success: true,
    mode: "video",
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
    },
  };

  if (outputFormat === "json" || outputFormat === "both") {
    response.outputJSON = parseBlueprintToJSON(aiResult.output);
  }

  return response;
}

// ===========================
// Music Mode
// ===========================
async function processMusicMode(body, env) {
  const { input, outputFormat } = body;

  const systemPrompt = `You are a professional music producer and composer with expertise in music theory, production, and arrangement. Transform user concepts into comprehensive musical blueprints for AI music generation (Suno, Udio, MusicGen, Stable Audio).

Create a DETAILED blueprint using this EXACT structure:

Genre: [Primary genre + subgenre + fusion elements. Be specific - not just "rock" but "indie rock with post-punk influences and shoegaze textures"]
Tempo (BPM): [Exact BPM or range (e.g., 128 BPM or 120-125 BPM). Include feel - strict/loose/swing/rubato. Consider genre conventions]
Key: [Musical key (e.g., E Minor, Ab Major) + modal flavor if relevant (Dorian/Phrygian/etc.). Include modulation points if applicable]
Chord Progression: [Specific chord sequence with Roman numerals or chord names. Example: "I-V-vi-IV in C Major" or "Am-F-C-G". Note rhythm/timing of changes]
Mood & Emotion: [Multi-dimensional emotional description - energy level (low/high), emotional tone (melancholic/euphoric/aggressive), vibe (chill/intense/mysterious), listener impact]
Vocal Style: [Detailed vocal specs - gender, range (alto/tenor/etc.), delivery (smooth/raspy/breathy/powerful), effects (reverb/delay/autotune), melodic vs spoken, harmony layers. If instrumental, specify lead instrument role]
Lyrical Theme: [Narrative concept - subject matter, perspective (first/third person), imagery, storytelling approach, metaphors, emotional arc. If instrumental, describe the musical "story"]
Instrumentation: [Complete arrangement - drums (live/electronic/hybrid + specific patterns), bass (synth/electric/upright + playing style), guitars/keys/synths (specific sounds/patches), supporting instruments, layering strategy]
Mixing Style: [Production aesthetic - clarity (clean/lo-fi/raw), spatial design (wide/intimate/ambient), frequency balance (bass-heavy/bright/balanced), effects (reverb depth, delay types), dynamics (compressed/dynamic), reference production era]
Song Structure: [Complete form - intro duration, verse/chorus arrangement (ABABCB, etc.), bridge placement, outro style, timing of sections, transitions, build/release moments]
Reference Tracks: [3-5 specific songs with artist names that exemplify the target sound. Explain what aspect of each reference to emulate]

CRITICAL REQUIREMENTS:
- Use PROFESSIONAL music theory and production terminology
- Be SPECIFIC with technical details (not "upbeat" but "140 BPM four-on-floor house beat")
- Each field should be 2-4 sentences with rich musical detail
- Think like a producer giving session musicians a recording brief
- Balance artistic vision with technical precision`;

  const userPrompt = `User's music concept: "${input}"

Transform this into a comprehensive musical blueprint with professional production-level detail. Expand with expert knowledge of music theory, arrangement, and production.`;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.8,
    maxTokens: 3072,
  });

  const response = {
    success: true,
    mode: "music",
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
    },
  };

  if (outputFormat === "json" || outputFormat === "both") {
    response.outputJSON = parseBlueprintToJSON(aiResult.output);
  }

  return response;
}

// ===========================
// AI Provider Integration
// ===========================
async function callAIWithFallback(systemPrompt, userPrompt, env, options = {}) {
  let result;
  let fallbackUsed = false;

  try {
    // Primary: Gemini 2.5 Flash with retry and timeout
    result = await fetchWithTimeout(
      () =>
        fetchWithRetry(
          () => callGemini(systemPrompt, userPrompt, env, options),
          2,
        ),
      30000,
    );
  } catch (error) {
    console.error("Gemini failed, trying OpenRouter:", error);
    fallbackUsed = true;

    try {
      // Fallback: OpenRouter with retry and timeout
      result = await fetchWithTimeout(
        () =>
          fetchWithRetry(
            () => callOpenRouter(systemPrompt, userPrompt, env, options),
            2,
          ),
        30000,
      );
    } catch (openrouterError) {
      console.error("OpenRouter also failed:", openrouterError);
      throw new Error("All AI providers failed");
    }
  }

  return {
    ...result,
    fallbackUsed,
  };
}

async function callOpenRouter(systemPrompt, userPrompt, env, options = {}) {
  const endpoint = "https://openrouter.ai/api/v1/chat/completions";
  const apiKey = env.OPENROUTER_API_KEY;

  const requestBody = {
    model: "z-ai/glm-4.5-air:free",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2048,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://contextor.pages.dev",
      "X-Title": "CONTEXTOR",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  return {
    output: data.choices[0].message.content,
    provider: "openrouter",
    model: "glm-4.5-air:free",
  };
}

async function callGemini(systemPrompt, userPrompt, env, options = {}) {
  const apiKey = env.GEMINI_API_KEY;
  // Use Gemini 2.5 Flash (verified working via curl test)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: combinedPrompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature || 0.8,
      maxOutputTokens: options.maxTokens || 8192, // Increased for comprehensive output
      topP: 0.95,
      topK: 40,
    },
    // Safety settings to prevent blocking
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini HTTP error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Comprehensive response validation
  if (!data) {
    throw new Error("Gemini returned empty response");
  }

  // Check for safety blocking or other issues
  if (!data.candidates || data.candidates.length === 0) {
    console.error("Gemini response:", JSON.stringify(data));

    // Check for prompt feedback (safety blocking)
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      throw new Error(`Gemini blocked: ${data.promptFeedback.blockReason}`);
    }

    throw new Error(
      "Gemini returned no candidates (possibly content filtered)",
    );
  }

  const candidate = data.candidates[0];

  // Check finish reason
  if (candidate.finishReason && candidate.finishReason !== "STOP") {
    console.warn("Gemini finish reason:", candidate.finishReason);

    if (candidate.finishReason === "SAFETY") {
      throw new Error("Gemini blocked content due to safety filters");
    }

    if (candidate.finishReason === "RECITATION") {
      throw new Error("Gemini blocked due to recitation concerns");
    }
  }

  // Validate content structure
  if (
    !candidate.content ||
    !candidate.content.parts ||
    candidate.content.parts.length === 0
  ) {
    console.error("Gemini candidate:", JSON.stringify(candidate));
    throw new Error("Gemini response missing content or parts");
  }

  const outputText = candidate.content.parts[0].text;

  if (!outputText || outputText.trim().length === 0) {
    throw new Error("Gemini returned empty text");
  }

  return {
    output: outputText,
    provider: "gemini",
    model: "gemini-2.5-flash",
  };
}

// ===========================
// Retry Logic & Timeout Handling
// ===========================
async function fetchWithRetry(fn, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff: 1s, 2s
      const delay = Math.pow(2, i) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
    }
  }
}

async function fetchWithTimeout(fn, timeoutMs = 30000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
  });

  return Promise.race([fn(), timeoutPromise]);
}

// ===========================
// Health Check Handler
// ===========================
async function handleHealthCheck(env) {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    providers: {
      gemini: { status: "unknown", latency: null },
      openrouter: { status: "unknown", latency: null },
    },
  };

  // Test Gemini
  try {
    const start = Date.now();
    await callGemini("Health check", "Respond with OK", env, { maxTokens: 10 });
    health.providers.gemini = {
      status: "healthy",
      latency: Date.now() - start,
    };
  } catch (error) {
    health.providers.gemini = {
      status: "unhealthy",
      error: error.message,
    };
  }

  // Test OpenRouter
  try {
    const start = Date.now();
    await callOpenRouter("Health check", "Respond with OK", env, {
      maxTokens: 10,
    });
    health.providers.openrouter = {
      status: "healthy",
      latency: Date.now() - start,
    };
  } catch (error) {
    health.providers.openrouter = {
      status: "unhealthy",
      error: error.message,
    };
  }

  // Overall status
  if (
    health.providers.gemini.status === "unhealthy" &&
    health.providers.openrouter.status === "unhealthy"
  ) {
    health.status = "critical";
  } else if (health.providers.gemini.status === "unhealthy") {
    health.status = "degraded";
  }

  return new Response(JSON.stringify(health, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

// ===========================
// Helper Functions
// ===========================
function parseQuestions(text) {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const questions = [];

  for (const line of lines) {
    const match = line.match(/^\d+[\.\)]\s*(.+)$/);
    if (match) {
      questions.push(match[1].trim());
    }
  }

  return questions.length > 0 ? questions : [text];
}

function parseBlueprintToJSON(blueprintText) {
  const lines = blueprintText.split("\n");
  const json = {};

  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const key = match[1]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "");
      const value = match[2].trim();
      json[key] = value;
    }
  }

  return json;
}

// ===========================
// CORS & Error Handling
// ===========================
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function errorResponse(code, message, details = null) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        details,
      },
    }),
    {
      status: code === "INVALID_REQUEST" ? 400 : 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    },
  );
}
