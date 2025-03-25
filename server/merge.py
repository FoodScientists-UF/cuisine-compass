import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()


url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

response = (
    supabase.table("Recipes")
    .select("*")
    .execute()
)

rows = response.data

for row in rows:
    instructions = (
        supabase.table("Instructions")
        .select("step_number, content")
        .order("step_number", desc=False)
        .eq("recipe_id", row["id"])
        .execute()
    )
    ordered_instructions = list(map(lambda x: x["content"], instructions.data))
    print(ordered_instructions)

    ingredients = (
        supabase.table("Ingredients")
        .select("name, amount, unit")
        .eq("recipe_id", row["id"])
        .execute()
    )

    print(ingredients.data)

    """
    response = (
        supabase.table("Recipes")
        .update({"ingredients": ingredients.data, "instructions": ordered_instructions})
        .eq("id", row["id"])
        .execute()
    )
    """


    