import { Checkbox } from "semantic-ui-react";

export default function SavePopup({ collections = [] }) {
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
                onCheck={() => console.log(`${collection.name} checked`)}
              />
            </div>
          ))}
        </div>
        <div className="bg-gray-400 h-[0.5px]"></div>
        <div className="flex flex-row items-center gap-x-5">
          <img className="w-12 h-12 rounded-md bg-gray-300" />
          <span className="abhaya-libre-regular text-xl">
            Create a collection
          </span>
        </div>
      </div>
    </div>
  );
}
