import { supabase, AuthContext } from "../AuthProvider";
import { useContext, useState } from "react";

export default function CreateNote({ onClose }) {
  const today = new Date().toLocaleDateString(
    "en-US",
    {
        year: "numeric",
        month: "short",
        day: "numeric",
    }
    );

  const [title, setTitle] = useState(`Grocery List - ${today}`);

  const { session } = useContext(AuthContext);

  const handlePublishNote = async (e) => {
    if (!session?.user?.id) return;
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const itemsText = formData.get("items");

    const itemsArray = itemsText
      ? itemsText.split("\n").map((item) => item.trim())
      : [];

    const { data, error } = await supabase
      .from("Grocery List")
      .insert({
        user_id: session.user.id,
        title: title,
        items: itemsArray,
      })
      .single();

    if (error) throw error;
    else onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form
        className="bg-[#F2F2F2] p-6 rounded-2xl shadow-lg w-[500px] h-[500px] text-center relative border-2 border-black"
        onSubmit={handlePublishNote}
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
          Publish list
        </button>
      </form>
    </div>
  );
}
