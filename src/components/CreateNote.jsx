import { supabase, AuthContext } from "../AuthProvider";
import { useContext, useState, useEffect } from "react";

export default function CreateNote({ onClose, listId }) {
  const today = new Date().toLocaleDateString(
    "en-US",
    {
        year: "numeric",
        month: "short",
        day: "numeric",
    }
    );

  const [title, setTitle] = useState(`Grocery List - ${today}`);
  const [items, setItems] = useState("");
  const { session } = useContext(AuthContext);

  // Split text if the item length is > 40 (help with wrapping text)
  function splitText(text) {
    if (typeof text !== "string" || text.length <= 40) return [text];

    const words = text.split(" ");
    let lines = [];
    let currentLine = "";

    words.forEach(word => {
        if ((currentLine + word).length <= 40) {
            currentLine += (currentLine ? " " : "") + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
}

  const handlePublishNote = async (e) => {
    if (!session?.user?.id) return;
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const itemsText = formData.get("items");

    const itemsArray = itemsText
      ? itemsText.split("\n").flatMap((item) => splitText(item.trim()))
      : [];

    const { data, error } = await supabase
      .from("Grocery List")
      .upsert({
        user_id: session.user.id,
        title: title,
        items: itemsArray,
      })
      .single();

    if (error) throw error;
    else onClose();
  };

  useEffect(() => {
    if (!listId) return;

    const fetchList = async () => {
      const { data, error } = await supabase
        .from("Grocery List")
        .select("title, items")
        .eq("id", listId)
        .single();

      if (error) {
        console.error("Error fetching grocery list:", error);
        return;
      }

      setTitle(data.title);
      setItems(data.items ? data.items.join("\n") : "");
    };

    fetchList();
  }, [listId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!session?.user?.id) return;
  
    const formData = new FormData(e.target);
    const updatedTitle = formData.get("title");
    const itemsText = formData.get("items");
  
    const itemsArray = itemsText
      ? itemsText
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
          .flatMap(splitText)
      : [];
  
    console.log("Submitting listId:", listId);
    console.log("itemsArray to save:", itemsArray);
    console.log("updatedTitle to save:", updatedTitle);
    
    let response;
    if (listId) {
      response = await supabase
        .from("Grocery List")
        .update({ user_id: session.user.id, title: updatedTitle, items: itemsArray })
        .eq("id", listId);
  
      console.log("UPDATE response:", response);
    } else {
      response = await supabase
        .from("Grocery List")
        .insert({ user_id: session.user.id, title: updatedTitle, items: itemsArray })
        .single();
  
      console.log("INSERT response:", response);
    }
  
    if (response.error) {
      console.error("Error saving grocery list:", response.error);
    } else {
      onClose();
    }
  };
  
  

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form
        className="bg-[#F2F2F2] p-6 rounded-2xl shadow-lg w-[500px] h-[500px] text-center relative border-2 border-black"
        onSubmit={handleSubmit}
      >
        <button
          className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-[#D75600]"
          onClick={onClose}
        >
          ×
        </button>
        <input
          className="text-2xl text-[#535353] abhaya-libre-semibold bg-[#F2F2F2] w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          name="title"
        />
        
        <textarea
          className="text-20px w-full p-2 abhaya-libre-medium h-[350px] bg-[#F2F2F2]"
          placeholder="Start your note..."
          name="items"
          value={items}
          onChange={(e) => setItems(e.target.value)}
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #000 1px, transparent 2px)",
            backgroundSize: "100% 2em", 
            lineHeight: "2",
            fontSize: "24px",
            paddingLeft: "0.5em", 
            outline: "none",
          }}
        />
        <hr className="absolute top-10 left-0 w-full border-t-2 border-black my-4" />
        <button
          type="submit"
          className="mt-4 bg-[#535353] abhaya-libre-regular text-white px-4 py-2 rounded-lg hover:opacity-80 transition"
        >
          {listId ? "Update List" : "Publish List"}
        </button>
      </form>
    </div>
  );
}
