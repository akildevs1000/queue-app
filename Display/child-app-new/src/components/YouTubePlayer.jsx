const YouTubePlayer = ({ videoId }) => {
  // Ensure we have a video ID before attempting to render the iframe
  if (!videoId) {
    return (
      <div className="flex items-center justify-center p-8 text-lg text-red-400 bg-surface-darker rounded-lg shadow-xl">
        Error: YouTube Video ID is missing.
      </div>
    );
  }

  // Construct the embed URL with necessary parameters for display boards (autoplay, mute, loop)
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;

  return (
    <div className="w-full h-full max-w-4xl max-h-[600px] aspect-video">
      <iframe
        className="w-full h-full rounded-lg shadow-2xl border-none"
        src={embedUrl}
        title="Queue Display Video Information"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YouTubePlayer;