import sql from "@/app/api/utils/sql";

// Create a new card skin
export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, image_url, action, cardId } = body;

    // Handle toggle featured action
    if (action === "toggle-featured") {
      if (!cardId) {
        return Response.json(
          { success: false, error: "Card ID is required" },
          { status: 400 },
        );
      }

      // Toggle featured status
      const result = await sql`
        UPDATE card_skins 
        SET is_featured = NOT is_featured 
        WHERE id = ${cardId}
        RETURNING id, is_featured
      `;

      if (result.length === 0) {
        return Response.json(
          { success: false, error: "Card not found" },
          { status: 404 },
        );
      }

      return Response.json({
        success: true,
        cardId: result[0].id,
        isFeatured: result[0].is_featured,
      });
    }

    // Handle card creation
    if (!prompt || !image_url) {
      return Response.json(
        { success: false, error: "Prompt and image_url are required" },
        { status: 400 },
      );
    }

    // Safety filter for prompts
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
    const isNsfw = blockedWords.some((word) => lowerPrompt.includes(word));

    const result = await sql`
      INSERT INTO card_skins (prompt, image_url, is_nsfw)
      VALUES (${prompt}, ${image_url}, ${isNsfw})
      RETURNING *
    `;

    return Response.json({
      success: true,
      cardSkin: result[0],
    });
  } catch (error) {
    console.error("Error managing card skin:", error);
    return Response.json(
      { success: false, error: "Failed to manage card skin" },
      { status: 500 },
    );
  }
}

// Get all card skins (excluding NSFW)
export async function GET() {
  try {
    // Get featured skins
    const featuredSkins = await sql`
      SELECT id, prompt, image_url, likes, is_featured, created_at 
      FROM card_skins 
      WHERE is_featured = true AND is_nsfw = false
      ORDER BY likes DESC
    `;

    // Get regular (non-featured) skins
    const regularSkins = await sql`
      SELECT id, prompt, image_url, likes, is_featured, created_at 
      FROM card_skins 
      WHERE is_featured = false AND is_nsfw = false
      ORDER BY created_at DESC
    `;

    return Response.json({
      success: true,
      featuredSkins,
      cardSkins: regularSkins,
    });
  } catch (error) {
    console.error("Error fetching card skins:", error);
    return Response.json(
      { success: false, error: "Failed to fetch card skins" },
      { status: 500 },
    );
  }
}
