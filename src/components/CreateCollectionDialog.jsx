import React, { useState, useEffect, useContext } from "react";
import { Dialog } from "@headlessui/react";
import { AuthContext, supabase } from "../AuthProvider";

const CreateCollectionDialog = ({ isOpen, onClose, onCreate }) => {
  const { session } = useContext(AuthContext);
  const [collectionName, setCollectionName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

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
            type="text" 
            placeholder="Name your collection"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <label className="dialog-label-two">Make this collection private?</label>
          <div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
            <span>I want this collection to be private</span>
          </div>
          <button onClick={handleCreateCollection}>Create</button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateCollectionDialog;