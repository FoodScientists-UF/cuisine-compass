import { useState } from "react";
import { Checkbox } from "semantic-ui-react";
import CreateCollectionDialog from './CreateCollectionDialog';
import { FiPlus } from "react-icons/fi";

export default function SavePopup({ collections, savedCollections, callback, recipeId, onCollectionCreated, style={} }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenCollectionDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseCollectionDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCreateCollection = async (e) => {
      e.preventDefault();
  
      if (!collectionName.trim()) {
        alert("Please enter a collection name");
        return;
      }
  
      let uploadedImageUrl = selectedCollection?.cover_img || null;
  
      if (imageFile) {
        const fileName = `${session.user.id}-${crypto.randomUUID()}`;
        const { data: imageData, error: uploadError } = await supabase.storage
          .from("collection-picture")
          .upload(fileName, imageFile, { upsert: true });
  
        if (uploadError) {
          alert("Error uploading collection image: " + uploadError.message);
          return;
        }
  
        const { data: urlData } = supabase.storage
          .from("collection-picture")
          .getPublicUrl(fileName);
        uploadedImageUrl = urlData.publicUrl;
      }
  
      const collectionData = {
        name: collectionName.trim(),
        user_id: session.user.id,
        is_private: isPrivate,
        cover_img: uploadedImageUrl,
        ...(selectedCollection && { id: selectedCollection.id }),
        ...(!selectedCollection && { id: crypto.randomUUID() }),
      };
  
      try {
        const { data, error } = await supabase
          .from("saved_collections")
          .upsert([collectionData])
          .select()
          .single();
  
        if (error) throw error;
  
        alert(
          `Collection ${selectedCollection ? "updated" : "created"} successfully!`
        );
  
        setFolders((prevFolders) => {
          if (selectedCollection) {
            return prevFolders.map((folder) =>
              folder.id === data.id
                ? { ...folder, ...data, recipeCount: folder.recipeCount }
                : folder
            );
          } else {
            return [...prevFolders, { ...data, recipeCount: 0 }];
          }
        });
  
        closeCollectionDialog();
      } catch (error) {
        alert(
          `Error ${selectedCollection ? "updating" : "creating"} collection: ${
            error.message
          }`
        );
      }
    };

  
  const isCollectionSaved = (collection) => {
    return savedCollections.map((c) => c.folder_id).includes(collection.id);
  };
  return (
    <div className={`absolute mt-2 right-0 w-[22rem] rounded-lg shadow-lg border border-gray-200 z-10 bg-white`} style={style}>
      <div className="p-4 flex flex-col gap-y-4">
        <span className="text-xl abhaya-libre-semibold text-center">Save</span>
        <div className="flex flex-col gap-y-4">
          {collections.map((collection, index) => (
            <div
              key={index}
              className="flex flex-row justify-between items-center px-3 py-2 rounded-md hover:bg-[#F3F3F3] transition"
            >
              <div className="flex flex-row gap-x-5 items-center">
                <img
                  src={collection.image}
                  className="w-12 h-12 rounded-md bg-gray-300"
                />
                <span className="abhaya-libre-regular text-xl">
                  {collection.name}
                </span>
              </div>
              <button
                className={`${
                  isCollectionSaved(collection) ? "bg-gray-500" : "bg-[#D75600]"
                } flex flex-row items-center gap-x-2 text-white px-5 py-1 rounded-full text-lg abhaya-libre-semibold`}
                onClick={() => callback(collection, isCollectionSaved(collection), recipeId)}
              >
                {isCollectionSaved(collection) ? "Saved!" : "Save"}
              </button>
            </div>
          ))}
        </div>
        <div className="bg-gray-400 h-[0.5px]"></div>
        <div className="flex flex-row items-center gap-x-5 px-3 py-2 rounded-md hover:bg-[#F3F3F3] transition">
          <div className="relative w-12 h-12"> 
            <img className="w-12 h-12 rounded-md bg-gray-300" />
            <FiPlus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black w-5 h-5"/>
          </div>
          <button className="abhaya-libre-regular text-xl" onClick={handleOpenCollectionDialog}>Create a collection</button>
           </div>
        </div>

        <CreateCollectionDialog 
        isOpen={isDialogOpen} 
        onClose={handleCloseCollectionDialog} 
        onCreate={handleCreateCollection}
      />
    </div>
  );
};
