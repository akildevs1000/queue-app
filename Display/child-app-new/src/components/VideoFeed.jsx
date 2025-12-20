// 1. Fix: Destructure props. In React, arguments are passed as a single 'props' object.
const VideoFeed = ({ videoId = "2sh8rCvijrY" }) => {
  
  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-lg text-red-400 bg-surface-darker rounded-lg shadow-xl">
        Error: YouTube Video ID is missing.
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;

  return (
    /* 2. Fix: Ensure h-full is applied. 
       Note: For this to work, the parent element of <VideoFeed /> must have a height! */
    <div className="relative w-full h-full min-h-[400px] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5 dark:ring-border-dark group">
      
      {/* Overlay: Optional - remove z-10 if you want the video to be clickable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none z-10"></div>
      
      <iframe
        className="absolute inset-0 w-full h-full rounded-lg border-none"
        src={embedUrl}
        title="Queue Display Video Information"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoFeed;