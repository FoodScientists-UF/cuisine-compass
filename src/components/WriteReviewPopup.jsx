import { supabase, AuthContext } from "../AuthProvider";

export default function WriteReviewPopup({ onClose }) {
  const { session } = useContext(AuthContext);

  const handlePostReview = () => {
    // Logic to post the review goes here
    
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-[500px] text-center relative">
        <button 
          className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-[#D75600]"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl abhaya-libre-semibold mb-4">Write a Review</h2>
        <textarea
          className="w-full p-2 border-2 border-gray-300 abhaya-libre-regular rounded-lg h-32"
          placeholder="Leave a review, tips, or thoughts..."
        ></textarea>
        <button className="mt-4 bg-[#D75600] abhaya-libre-regular text-white px-4 py-2 rounded-lg hover:opacity-80 transition">
          Post Review
        </button>
      </div>
    </div>
  );
}
