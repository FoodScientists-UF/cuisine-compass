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

  const { title } = await req.json()

  const searchUrl = new URL("https://api.unsplash.com/search/photos");
  searchUrl.search = new URLSearchParams({
    client_id: Deno.env.get("UNSPLASH_ACCESS_KEY"),
    page: '1',
    per_page: '1',
    query: title.toLowerCase(),
  }).toString();

  console.log(searchUrl);
  const response = await fetch(searchUrl);
  const data = await response.json();
  console.log(data);
  const imageResult = Object.values(data.results)[0];

  if (imageResult && imageResult.urls && imageResult.urls.full) {
    return new Response(JSON.stringify({ image_url: imageResult.urls.full }), 
    { headers: {"Content-Type": "application/json", ...corsHeaders}, status: 200 });
  } else return new Response(
      JSON.stringify({ error: 'Image not found' }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 404 },
    );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fetch-image' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
