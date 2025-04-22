import React, { useState, useEffect, useContext } from "react";
import { Dialog } from "@headlessui/react";
import { AuthContext, supabase } from "../AuthProvider";
import "../components/CreateCollectionDialog.css";

const CreateCollectionDialog = ({ isOpen, onClose, onCreate }) => {
  const { session } = useContext(AuthContext);
  const [collectionName, setCollectionName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [collectionImage, setCollectionImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  

  const handleCreateCollection = async (e) => {
    e.preventDefault();

    if (!collectionName.trim()) {
      alert("Please enter a collection name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("saved_collections")
        .upsert([{ 
          id: crypto.randomUUID(),
          name: collectionName.trim(), 
          user_id: session.user.id, 
          is_private: isPrivate 
        }])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      onCreate(data[0]);

      alert("Collection created successfully!");
      onClose();
    } catch (error) {
      alert("Error creating collection: " + error.message);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="dialog-overlay">
      <div className="dialog-container">
        <Dialog.Panel className="dialog-box">
          <button className="close-btn" onClick={onClose}>×</button>
          <Dialog.Title className="dialog-title">Create Collection</Dialog.Title>

          <label className="dialog-label">Title</label>
          <input 
            className="dialog-input"
            type="text" 
            placeholder="Name your collection"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />

          <label className="dialog-label block mb-1 text-left mt-4">
            Cover Image (Optional)
          </label>
          <label
            htmlFor="collectionImageInput"
            className="upload-placeholder cursor-pointer block w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-300 mb-4"
          >
            {collectionImage ? (
              <img
                src={imagePreview}
                alt="Collection Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mx-auto mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
                <span>Click to upload</span>
              </div>
            )}
            <input
              id="collectionImageInput"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                console.log(e.target.files[0]);
                if (file) {
                  setCollectionImage(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
              className="hidden"
            />
          </label>

          <label className="dialog-label-two">Make this collection private?</label>
          <div className="dialog-private">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
            <span>I want this collection to be private</span>
          </div>

          <button className="dialog-create-btn w-full" onClick={handleCreateCollection}>Create Collection</button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateCollectionDialog;