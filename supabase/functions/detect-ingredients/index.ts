import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing image with AI...");

    // Call Lovable AI with vision capabilities
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: "You are an expert food ingredient recognition system. Your task is to carefully analyze images and identify ALL visible food ingredients with high accuracy. Be specific and precise. Do not guess or add ingredients that are not clearly visible. Return ONLY a JSON array of ingredient names."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Carefully examine this image and identify ALL visible food ingredients. Look closely at:\n- Raw vegetables and fruits\n- Proteins (meat, fish, eggs, tofu)\n- Grains and starches\n- Dairy products\n- Herbs and spices\n- Other edible items\n\nBe specific (e.g., 'cherry tomatoes' not just 'tomatoes', 'red bell pepper' not just 'pepper').\nReturn ONLY a JSON array format: [\"ingredient1\", \"ingredient2\", ...]\nDo not include any other text or explanation."
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", data);

    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Try to parse the JSON array from the response
    let ingredients = [];
    try {
      // Extract JSON array from the response
      const match = content.match(/\[.*\]/s);
      if (match) {
        ingredients = JSON.parse(match[0]);
      }
    } catch (e) {
      console.error("Error parsing ingredients:", e);
      // Fallback: split by common delimiters
      ingredients = content
        .replace(/[\[\]"]/g, "")
        .split(/[,\n]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }

    console.log("Detected ingredients:", ingredients);

    return new Response(
      JSON.stringify({ ingredients }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in detect-ingredients function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
