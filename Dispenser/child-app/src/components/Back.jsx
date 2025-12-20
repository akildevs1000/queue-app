const Back = ({ onClick = () => {} }) => {
  return (
    <div className="absolute bottom-4 right-4">
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
      >
        {/* <span className="material-symbols-outlined">arrow_back</span> */}
        <span className="text-sm">Main Menu</span>
      </button>
    </div>
  );
};

export default Back;
