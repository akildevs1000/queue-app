// ImageFeed.js
const ImageFeed = ({ src = "", altText = "Image" }) => {
  if (!src) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-lg text-red-400 bg-surface-darker rounded-lg shadow-xl">
        Error: Image URL is missing.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-100 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5 dark:ring-border-dark group">
      
      {/* Overlay: Optional */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-10"></div>
      
      <img
        src={src}
        alt={altText}
        className="absolute inset-0 w-full h-full object-cover rounded-2xl border-none"
      />
    </div>
  );
};

export default ImageFeed;
