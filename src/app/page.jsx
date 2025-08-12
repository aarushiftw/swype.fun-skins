import { useState, useCallback, useEffect } from "react";
import {
  Sparkles,
  Download,
  Share2,
  Heart,
  Copy,
  CreditCard,
} from "lucide-react";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [featuredSkins, setFeaturedSkins] = useState([]);
  const [error, setError] = useState(null);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);

  // Default card skins
  const defaultCardSkins = [
    {
      id: "default-1",
      image:
        "https://ucarecdn.com/1344fb8e-92c9-4b65-b8f9-25a04d11d3b4/-/format/auto/",
      prompt: "pepe take my money meme",
      likes: 124,
      isDefault: true,
    },
    {
      id: "default-2",
      image:
        "https://ucarecdn.com/ca6a68c7-4686-4825-9e2e-018de3ad81eb/-/format/auto/",
      prompt: "american psycho swyper",
      likes: 98,
      isDefault: true,
    },
    {
      id: "default-3",
      image:
        "https://ucarecdn.com/795429b1-cb1d-4908-817b-c411a8744bb5/-/format/auto/",
      prompt: "come swype habibi",
      likes: 156,
      isDefault: true,
    },
  ];

  // Load gallery and featured skins from database
  const loadGallery = useCallback(async () => {
    try {
      setIsLoadingGallery(true);
      const response = await fetch("/api/card-skins");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Load featured skins
          if (data.featuredSkins) {
            setFeaturedSkins(
              data.featuredSkins.map((skin) => ({
                id: skin.id,
                image: skin.image_url,
                prompt: skin.prompt,
                likes: skin.likes,
                isFeatured: skin.is_featured,
              })),
            );
          }

          // Load regular skins
          if (data.cardSkins) {
            setGallery(
              data.cardSkins.map((skin) => ({
                id: skin.id,
                image: skin.image_url,
                prompt: skin.prompt,
                likes: skin.likes,
                isFeatured: skin.is_featured,
              })),
            );
          }
        }
      }
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setIsLoadingGallery(false);
    }
  }, []);

  // Toggle featured status for a card
  const toggleFeatured = useCallback(
    async (cardId) => {
      try {
        const response = await fetch("/api/card-skins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "toggle-featured",
            cardId: cardId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Reload gallery to reflect changes
            loadGallery();
          }
        }
      } catch (error) {
        console.error("Error toggling featured status:", error);
      }
    },
    [loadGallery],
  );

  // Load gallery on component mount
  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const generateCardSkin = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      console.log("Starting card generation with prompt:", prompt);

      const response = await fetch("/api/generate-card-skin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      console.log("API response status:", response.status);

      const data = await response.json();
      console.log("API response data:", data);

      if (!response.ok) {
        throw new Error(
          `API Error ${response.status}: ${data.error || "Unknown error"}`,
        );
      }

      if (data.success && data.imageUrl) {
        console.log("Successfully generated image:", data.imageUrl);
        const newCard = {
          id: Date.now(),
          image: data.imageUrl,
          prompt: prompt,
          likes: 0,
        };
        setGeneratedCard(newCard);
        setPrompt("");
        // Reload gallery to include the new card
        loadGallery();
      } else {
        throw new Error(
          data.error || "Failed to generate image - no image URL received",
        );
      }
    } catch (err) {
      console.error("Detailed error in generateCardSkin:", err);
      setError(`Error: ${err.message}. Check browser console for details.`);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, loadGallery]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);

  const shareCard = useCallback((card) => {
    // Twitter share with custom caption
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent("My card skin is the best!")}&url=${encodeURIComponent(window.location.href)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  }, []);

  const visitSwypeFun = useCallback(() => {
    window.open("https://swype.fun", "_blank");
  }, []);

  // Background card images scattered around
  const backgroundCards = [
    { top: "10%", left: "5%", rotation: "-15deg" },
    { top: "15%", right: "8%", rotation: "12deg" },
    { top: "35%", left: "3%", rotation: "8deg" },
    { top: "45%", right: "5%", rotation: "-20deg" },
    { bottom: "20%", left: "7%", rotation: "25deg" },
    { bottom: "15%", right: "10%", rotation: "-10deg" },
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Courier+Prime:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen relative"
        style={{ backgroundColor: "#E8E0D4" }}
      >
        {/* TV Screen Lines Overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          )`,
          }}
        />

        {/* Background scattered cards */}
        {backgroundCards.map((card, index) => (
          <div
            key={index}
            className="absolute w-20 h-12 border-2 border-[#2F5F4F] opacity-20 pointer-events-none"
            style={{
              ...card,
              transform: `rotate(${card.rotation})`,
              borderRadius: "4px",
            }}
          />
        ))}

        {/* Header */}
        <header className="relative z-10 bg-[#E8E0D4] border-b-4 border-[#2F5F4F] px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="https://ucarecdn.com/fafda16d-9673-4162-a49e-4dd64b4f1c78/-/format/auto/"
                alt="Swype.fun Card Icon"
                className="w-16 h-16 object-contain"
              />
              <img
                src="https://ucarecdn.com/dd43e6a2-76ab-4ad4-bd73-b2d04a770d00/-/format/auto/"
                alt="SWYPE.FUN"
                className="h-10 object-contain"
              />
              <span
                className="text-xs bg-[#2F5F4F] text-[#E8E0D4] px-2 py-1 font-bold"
                style={{ fontFamily: "Courier Prime, monospace" }}
              >
                v1.0
              </span>
              <span
                className="text-xs text-[#2F5F4F] font-bold"
                style={{ fontFamily: "Courier Prime, monospace" }}
              >
                POWERED BY BRAHMA
              </span>
            </div>
            <button
              onClick={visitSwypeFun}
              className="bg-[#2F5F4F] text-[#E8E0D4] px-6 py-3 border-2 border-[#2F5F4F] hover:bg-[#E8E0D4] hover:text-[#2F5F4F] transition-all duration-200 flex items-center gap-2 font-bold"
              style={{ fontFamily: "Courier Prime, monospace" }}
            >
              <CreditCard size={16} />
              Visit swype.fun
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            {/* Main Title */}
            <div className="text-center mb-16">
              <h1
                className="text-4xl md:text-6xl font-bold text-[#1a3a2a] mb-6 leading-tight"
                style={{ fontFamily: "Press Start 2P, monospace" }}
              >
                Generate Your Swype Card Skin
              </h1>
              <p
                className="text-lg text-[#1a3a2a] max-w-3xl mx-auto font-bold"
                style={{ fontFamily: "Courier Prime, monospace" }}
              >
                Create your card skin, download it and directly upload it on
                your dashboard. Share your created skin on Twitter for some
                surprising perks
              </p>
            </div>

            {/* Main Generator Card */}
            <div className="bg-[#C8D4C0] border-4 border-[#2F5F4F] p-8 mb-12 relative">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-4 h-4 bg-[#2F5F4F]"></div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-[#2F5F4F]"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#2F5F4F]"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#2F5F4F]"></div>

              <div className="max-w-3xl mx-auto">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="prompt"
                      className="block text-left text-sm font-bold text-[#1a3a2a] mb-3"
                      style={{ fontFamily: "Courier Prime, monospace" }}
                    >
                      DESCRIBE YOUR CARD SKIN IDEA:
                    </label>
                    <div className="flex gap-4">
                      <input
                        id="prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., ocean waves sunset, retro space adventure, mountain landscape..."
                        className="flex-1 px-4 py-4 border-2 border-[#2F5F4F] bg-[#E8E0D4] text-[#1a3a2a] placeholder-[#2F5F4F]/70 focus:outline-none focus:ring-4 focus:ring-[#2F5F4F]/30 font-bold"
                        style={{ fontFamily: "Courier Prime, monospace" }}
                        onKeyPress={(e) =>
                          e.key === "Enter" && generateCardSkin()
                        }
                        disabled={isGenerating}
                      />
                      <button
                        onClick={generateCardSkin}
                        disabled={isGenerating || !prompt.trim()}
                        className="px-8 py-4 bg-[#2F5F4F] text-[#E8E0D4] font-bold border-2 border-[#2F5F4F] hover:bg-[#E8E0D4] hover:text-[#2F5F4F] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        style={{ fontFamily: "Courier Prime, monospace" }}
                      >
                        {isGenerating ? "GENERATING..." : "GENERATE"}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-200 border-2 border-red-600 text-red-800">
                      <p className="text-sm font-mono font-bold">{error}</p>
                    </div>
                  )}

                  <p
                    className="text-xs text-[#1a3a2a] text-left font-bold"
                    style={{ fontFamily: "Courier Prime, monospace" }}
                  >
                    Generated cards automatically include **4269 number and
                    SWYPE.FUN logo branding
                  </p>
                </div>
              </div>

              {/* Live Preview */}
              {generatedCard && (
                <div className="mt-12 text-center">
                  <h3
                    className="text-lg font-bold text-[#1a3a2a] mb-6"
                    style={{ fontFamily: "Press Start 2P, monospace" }}
                  >
                    YOUR GENERATED CARD SKIN
                  </h3>
                  <div className="relative inline-block">
                    <div className="relative bg-[#E8E0D4] border-4 border-[#2F5F4F] p-2">
                      <img
                        src={generatedCard.image}
                        alt={`Card skin: ${generatedCard.prompt}`}
                        className="w-80 h-48 object-cover border-2 border-[#2F5F4F]"
                      />

                      {/* Card Number Overlay */}
                      <div className="absolute bottom-6 left-6">
                        <img
                          src="https://ucarecdn.com/2b6f1c91-df42-4ebf-9f3d-1d1087ca3df0/-/format/auto/"
                          alt="**** 4269"
                          className="h-5 object-contain drop-shadow-lg"
                          style={{
                            filter:
                              "drop-shadow(2px 2px 4px rgba(0,0,0,0.8)) drop-shadow(-1px -1px 2px rgba(232, 224, 212, 0.3))",
                          }}
                        />
                      </div>

                      {/* SWYPE.FUN Logo Overlay - New Logo */}
                      <div className="absolute top-6 left-8">
                        <img
                          src="https://ucarecdn.com/7ad09ec8-4437-4807-9831-682c10ee2c1d/-/format/auto/"
                          alt="SWYPE.FUN"
                          className="h-6 object-contain"
                        />
                      </div>

                      {/* Chip and Contactless Payment Icon - Left Middle */}
                      <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                        <img
                          src="https://ucarecdn.com/72772ad4-78c1-4649-b4ea-0b5c50527c0f/-/format/auto/"
                          alt="Card Chip and Contactless"
                          className="h-8 object-contain drop-shadow-lg"
                          style={{
                            filter:
                              "drop-shadow(0 0 2px rgba(0,0,0,0.5)) drop-shadow(1px 1px 1px rgba(0,0,0,0.3))",
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons - Only Twitter and Download */}
                    <div className="flex justify-center gap-3 mt-6">
                      <button
                        onClick={() => shareCard(generatedCard)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#1DA1F2] text-white font-bold border-2 border-[#1DA1F2] hover:bg-white hover:text-[#1DA1F2] transition-colors"
                        style={{ fontFamily: "Courier Prime, monospace" }}
                      >
                        <Share2 size={16} />
                        TWEET
                      </button>
                      <button
                        className="flex items-center gap-2 px-6 py-3 bg-[#2F5F4F] text-[#E8E0D4] font-bold border-2 border-[#2F5F4F] hover:bg-[#E8E0D4] hover:text-[#2F5F4F] transition-colors"
                        style={{ fontFamily: "Courier Prime, monospace" }}
                      >
                        <Download size={16} />
                        DOWNLOAD
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="relative z-10 py-16 px-6 bg-[#D4C8B8] border-t-4 border-[#2F5F4F]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-2xl font-bold text-[#1a3a2a] mb-4"
                style={{ fontFamily: "Press Start 2P, monospace" }}
              >
                Swype Card Skins, Created by You!
              </h2>
              <p
                className="text-[#1a3a2a] font-bold"
                style={{ fontFamily: "Courier Prime, monospace" }}
              >
                Get inspired by prompts, download community favourite skins or
                more!
              </p>
            </div>

            {isLoadingGallery ? (
              <div className="text-center py-12">
                <p
                  className="text-[#1a3a2a] font-bold"
                  style={{ fontFamily: "Courier Prime, monospace" }}
                >
                  Loading community card skins...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Featured Card Skins from Database */}
                {featuredSkins.map((card) => (
                  <div
                    key={card.id}
                    className="group bg-[#E8E0D4] border-4 border-[#2F5F4F] p-4 hover:bg-[#C8D4C0] transition-all duration-200"
                  >
                    <div className="relative">
                      <div className="relative bg-[#E8E0D4] border-2 border-[#2F5F4F] p-1">
                        <img
                          src={card.image}
                          alt={`Card skin: ${card.prompt}`}
                          className="w-full h-48 object-cover border border-[#2F5F4F]"
                        />

                        {/* Featured Badge */}
                        <div className="absolute top-2 right-2 bg-[#2F5F4F] text-[#E8E0D4] px-2 py-1 text-xs font-bold">
                          FEATURED
                        </div>

                        {/* Card Number Overlay */}
                        <div className="absolute bottom-4 left-4">
                          <img
                            src="https://ucarecdn.com/2b6f1c91-df42-4ebf-9f3d-1d1087ca3df0/-/format/auto/"
                            alt="**** 4269"
                            className="h-4 object-contain drop-shadow-lg"
                            style={{
                              filter:
                                "drop-shadow(2px 2px 4px rgba(0,0,0,0.8)) drop-shadow(-1px -1px 2px rgba(232, 224, 212, 0.3))",
                            }}
                          />
                        </div>

                        {/* SWYPE.FUN Logo Overlay */}
                        <div className="absolute top-4 left-4">
                          <img
                            src="https://ucarecdn.com/7ad09ec8-4437-4807-9831-682c10ee2c1d/-/format/auto/"
                            alt="SWYPE.FUN"
                            className="h-4 object-contain"
                          />
                        </div>

                        {/* Chip and Contactless Payment Icon - Left Middle */}
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <img
                            src="https://ucarecdn.com/72772ad4-78c1-4649-b4ea-0b5c50527c0f/-/format/auto/"
                            alt="Card Chip and Contactless"
                            className="h-6 object-contain"
                          />
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-[#2F5F4F]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                        <button
                          onClick={() => shareCard(card)}
                          className="w-12 h-12 bg-[#1DA1F2] text-white border-2 border-[#1DA1F2] hover:bg-white hover:text-[#1DA1F2] transition-colors flex items-center justify-center"
                        >
                          <Share2 size={16} />
                        </button>
                        <button className="w-12 h-12 bg-[#E8E0D4] text-[#2F5F4F] border-2 border-[#E8E0D4] hover:bg-[#2F5F4F] hover:text-[#E8E0D4] transition-colors flex items-center justify-center">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p
                        className="text-sm text-[#1a3a2a] mb-3 line-clamp-2 font-bold"
                        style={{ fontFamily: "Courier Prime, monospace" }}
                      >
                        "{card.prompt}"
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#1a3a2a]">
                          <Heart size={16} />
                          <span
                            className="text-sm font-bold"
                            style={{ fontFamily: "Courier Prime, monospace" }}
                          >
                            {card.likes}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(card.prompt)}
                          className="text-xs text-[#1a3a2a] hover:text-[#2F5F4F]/80 transition-colors flex items-center gap-1 font-bold"
                          style={{ fontFamily: "Courier Prime, monospace" }}
                        >
                          <Copy size={12} />
                          COPY PROMPT
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* User Created Card Skins */}
                {gallery.map((card) => (
                  <div
                    key={card.id}
                    className="group bg-[#E8E0D4] border-4 border-[#2F5F4F] p-4 hover:bg-[#C8D4C0] transition-all duration-200"
                  >
                    <div className="relative">
                      <div className="relative bg-[#E8E0D4] border-2 border-[#2F5F4F] p-1">
                        <img
                          src={card.image}
                          alt={`Card skin: ${card.prompt}`}
                          className="w-full h-48 object-cover border border-[#2F5F4F]"
                        />

                        {/* Card Number Overlay */}
                        <div className="absolute bottom-4 left-4">
                          <img
                            src="https://ucarecdn.com/2b6f1c91-df42-4ebf-9f3d-1d1087ca3df0/-/format/auto/"
                            alt="**** 4269"
                            className="h-4 object-contain drop-shadow-lg"
                            style={{
                              filter:
                                "drop-shadow(2px 2px 4px rgba(0,0,0,0.8)) drop-shadow(-1px -1px 2px rgba(232, 224, 212, 0.3))",
                            }}
                          />
                        </div>

                        {/* SWYPE.FUN Logo Overlay */}
                        <div className="absolute top-4 left-4">
                          <img
                            src="https://ucarecdn.com/7ad09ec8-4437-4807-9831-682c10ee2c1d/-/format/auto/"
                            alt="SWYPE.FUN"
                            className="h-4 object-contain"
                          />
                        </div>

                        {/* Chip and Contactless Payment Icon - Left Middle */}
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <img
                            src="https://ucarecdn.com/72772ad4-78c1-4649-b4ea-0b5c50527c0f/-/format/auto/"
                            alt="Card Chip and Contactless"
                            className="h-6 object-contain"
                          />
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-[#2F5F4F]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                        <button
                          onClick={() => shareCard(card)}
                          className="w-12 h-12 bg-[#1DA1F2] text-white border-2 border-[#1DA1F2] hover:bg-white hover:text-[#1DA1F2] transition-colors flex items-center justify-center"
                        >
                          <Share2 size={16} />
                        </button>
                        <button className="w-12 h-12 bg-[#E8E0D4] text-[#2F5F4F] border-2 border-[#E8E0D4] hover:bg-[#2F5F4F] hover:text-[#E8E0D4] transition-colors flex items-center justify-center">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p
                        className="text-sm text-[#1a3a2a] mb-3 line-clamp-2 font-bold"
                        style={{ fontFamily: "Courier Prime, monospace" }}
                      >
                        "{card.prompt}"
                      </p>
                      <div className="flex items-center justify-between">
                        <button className="flex items-center gap-2 text-[#1a3a2a] hover:text-red-600 transition-colors">
                          <Heart size={16} />
                          <span
                            className="text-sm font-bold"
                            style={{ fontFamily: "Courier Prime, monospace" }}
                          >
                            {card.likes}
                          </span>
                        </button>
                        <button
                          onClick={() => copyToClipboard(card.prompt)}
                          className="text-xs text-[#1a3a2a] hover:text-[#2F5F4F]/80 transition-colors flex items-center gap-1 font-bold"
                          style={{ fontFamily: "Courier Prime, monospace" }}
                        >
                          <Copy size={12} />
                          COPY PROMPT
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 bg-[#E8E0D4] border-t-4 border-[#2F5F4F] py-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <button
              onClick={visitSwypeFun}
              className="flex items-center justify-center space-x-4 mb-6 hover:opacity-80 transition-opacity cursor-pointer mx-auto"
            >
              <img
                src="https://ucarecdn.com/fafda16d-9673-4162-a49e-4dd64b4f1c78/-/format/auto/"
                alt="Swype.fun Card Icon"
                className="w-8 h-8 object-contain"
              />
              <img
                src="https://ucarecdn.com/dd43e6a2-76ab-4ad4-bd73-b2d04a770d00/-/format/auto/"
                alt="SWYPE.FUN"
                className="h-5 object-contain"
              />
            </button>
            <p
              className="text-[#1a3a2a] mb-6 font-bold text-lg"
              style={{ fontFamily: "Courier Prime, monospace" }}
            >
              Crypto's first programmable, DeFi-native credit card.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-[#1a3a2a] font-bold">
              <a
                href="https://docs.brahma.fi/faqs/swype.fun-or-faqs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#2F5F4F]/80 transition-colors"
                style={{ fontFamily: "Courier Prime, monospace" }}
              >
                Frequently Asked Questions
              </a>
              <a
                href="https://brahma.fi"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#2F5F4F]/80 transition-colors"
                style={{ fontFamily: "Courier Prime, monospace" }}
              >
                Powered by Brahma
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
