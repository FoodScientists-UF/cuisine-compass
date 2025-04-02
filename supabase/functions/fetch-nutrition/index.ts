// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  const { ingredient, id } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  const { data, error } = await supabase
    .from("Recipes")
    .select("id, nutrition")
    .eq("id", id)
    .single();
  
  if (data?.nutrition) {
    return new Response(JSON.stringify(data.nutrition), { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 });
  }

  const nutritionUrl = new URL("https://api.calorieninjas.com/v1/nutrition");
  
  nutritionUrl.search = new URLSearchParams({
    query: ingredient
  }).toString();

  const response = await fetch(nutritionUrl, { headers: {"X-Api-Key": Deno.env.get("CALORIENINJAS_API_KEY") || "" } });

  if (!response.ok) {
    return new Response('Error fetching nutrition data', { status: response.status, headers: corsHeaders });
  }

  const responseData = await response.json();

  if (!responseData.items || responseData.items.length === 0) {
    return new Response('No nutrition data found', { status: 404, headers: corsHeaders });
  }

  const item = responseData.items[0];
  
  const formattedNutrition = Object.keys(item)
    .filter(field => field !== 'name')
    .map(field => {
      const displayName = field
        .replace(/_/g, " ")
        .replace(/^./, (str) => str.toUpperCase())
        .split(" ")[0];

      return {
        nutrient: displayName,
        amount: `${item[field]}${
          field.includes("_g") ? "g" : field.includes("_mg") ? "mg" : ""
        }`,
      };
    });

  const { data: updatedData, error: updatedError } = await supabase
    .from("Recipes")
    .update({ nutrition: formattedNutrition })
    .eq("id", id);

  return new Response(
    JSON.stringify(formattedNutrition),
    { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 },
  );
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fetch-nutrition' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
