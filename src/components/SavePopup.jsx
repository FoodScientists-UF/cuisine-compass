import { useState } from "react";
import { Checkbox } from "semantic-ui-react";

export default function SavePopup({ collections, savedCollections, callback }) {
  const isCollectionSaved = (collection) => {
    return savedCollections.map((c) => c.folder_id).includes(collection.id);
  };
  return (
    <div className="absolute mt-2 right-0 w-96 rounded-lg shadow-lg border border-gray-200 z-10">
      <div className="p-4 flex flex-col gap-y-4">
        <span className="text-xl abhaya-libre-semibold text-center">Save</span>
        <div className="flex flex-col gap-y-4">
          {collections.map((collection, index) => (
            <div
              key={index}
              className="flex flex-row justify-between items-center"
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
              <Checkbox
                checked={isCollectionSaved(collection)}
                onChange={() =>
                  callback(collection, isCollectionSaved(collection))
                }
              />
            </div>
          ))}
        </div>
        <div className="bg-gray-400 h-[0.5px]"></div>
        <div className="flex flex-row items-center gap-x-5">
          <img className="w-12 h-12 rounded-md bg-gray-300" />
          <button className="abhaya-libre-regular text-xl hover:text-orange-500 transition">
            Create a collection
          </button>
        </div>
      </div>
    </div>
  );
}
