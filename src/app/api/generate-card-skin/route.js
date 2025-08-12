export async function POST(request) {
  try {
    console.log("🎯 Card skin generation API called");

    const { prompt } = await request.json();
    console.log("📝 Received prompt:", prompt);

    if (!prompt || typeof prompt !== "string") {
      console.log("❌ Invalid prompt provided");
      return Response.json(
        { success: false, error: "Valid prompt is required" },
        { status: 400 },
      );
    }

    // Community safety filter for inappropriate content
    const blockedWords = [
      "nsfw",
      "nude",
      "naked",
      "sex",
      "sexual",
      "porn",
      "adult",
      "explicit",
      "inappropriate",
      "violence",
      "gore",
      "bloody",
      "weapon",
      "gun",
      "knife",
      "hate",
      "racist",
      "discrimination",
      "offensive",
      "vulgar",
      "profanity",
    ];

    const lowerPrompt = prompt.toLowerCase();
    const containsBlockedContent = blockedWords.some((word) =>
      lowerPrompt.includes(word),
    );

    if (containsBlockedContent) {
      console.log("🚫 Content blocked due to safety filter");
      return Response.json(
        {
          success: false,
          error:
            "Content not allowed. Please create family-friendly card designs only.",
        },
        { status: 400 },
      );
    }

    // Enhanced prompt for pixelated background artwork that fills the entire rectangle
    const enhancedPrompt = `${prompt}, pixel art style, 8-bit retro, pixelated graphics, low resolution pixel style, blocky pixels, retro gaming aesthetic, pixel perfect, old school video game art, chunky pixels, pixelated texture, 16-bit style, abstract pixel background texture, digital pixel wallpaper, pixelated seamless pattern, pixel art background, decorative pixel texture, full coverage pixel design, no empty space, no cards, no rectangular objects, no borders, no frames, no text, no logos, no numbers, pure pixelated artistic background, seamless pixel fill, pixel texture pattern, decorative pixel background, vibrant pixel colors, pixel artistic design, pixel background wallpaper, fills entire space, continuous pixel pattern, abstract pixel art background, suitable for card background, no card shapes, just pixelated background texture, retro pixel aesthetic, family-friendly content`;
    console.log(
      "✨ Enhanced prompt for pixelated background artwork:",
      enhancedPrompt,
    );

    console.log("🚀 Calling Stable Diffusion V3 integration...");

    // Call Stable Diffusion V3 integration using the correct endpoint format
    const imageResponse = await fetch(
      `/integrations/stable-diffusion-v-3/?prompt=${encodeURIComponent(enhancedPrompt)}&width=1024&height=640`,
      {
        method: "GET",
      },
    );

    console.log("📡 Stable Diffusion response status:", imageResponse.status);

    if (!imageResponse.ok) {
      console.error(
        "❌ Stable Diffusion API error:",
        imageResponse.status,
        imageResponse.statusText,
      );
      const errorData = await imageResponse.text();
      console.error("❌ Error details:", errorData);
      return Response.json(
        {
          success: false,
          error: `AI service error: ${imageResponse.status} ${imageResponse.statusText}`,
        },
        { status: 500 },
      );
    }

    const imageData = await imageResponse.json();
    console.log("📦 Received image data structure:", Object.keys(imageData));

    if (!imageData.data || !imageData.data[0]) {
      console.log("❌ No image data in response:", imageData);
      return Response.json(
        { success: false, error: "No image data received from AI service" },
        { status: 500 },
      );
    }

    const imageUrl = imageData.data[0];
    console.log(
      "✅ Successfully generated pixelated card skin:",
      imageUrl.substring(0, 50) + "...",
    );

    // Save the generated card skin to database
    try {
      // Import and use the database directly instead of HTTP call to avoid circular issues
      const sql = (await import("../utils/sql.js")).default;
      await sql`
        INSERT INTO card_skins (prompt, image_url)
        VALUES (${prompt}, ${imageUrl})
      `;
      console.log("💾 Card skin saved to database successfully");
    } catch (saveError) {
      console.error("⚠️ Error saving to database:", saveError);
      // Don't fail the whole request if database save fails
    }

    // Return the generated image URL
    return Response.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
    });
  } catch (error) {
    console.error("💥 Unexpected error in card skin generation:", error);
    console.error("Stack trace:", error.stack);
    return Response.json(
      { success: false, error: `Internal server error: ${error.message}` },
      { status: 500 },
    );
  }
}
