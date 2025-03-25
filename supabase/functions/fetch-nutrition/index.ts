// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { ingredient } = await req.json();

  const nutritionUrl = new URL("https://api.calorieninjas.com/v1/nutrition");
  
  nutritionUrl.search = new URLSearchParams({
    query: ingredient
  }).toString();

  const response = await fetch(nutritionUrl, { headers: {"X-Api-Key": Deno.env.get("CALORIENINJAS_API_KEY") || "" } });

  if (!response.ok) {
    return new Response('Error fetching nutrition data', { status: response.status, headers: corsHeaders });
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    return new Response('No nutrition data found', { status: 404, headers: corsHeaders });
  }

  return new Response(
    JSON.stringify(data.items[0]),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
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
