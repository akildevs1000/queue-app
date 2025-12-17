const ImageDisplay = ({ src = "https://dummy-image.netlify.app/index.jpg" }) => {
  return (
    <div className="w-full h-[72vh] max-w-4xl max-h-[600px] flex items-center justify-center overflow-hidden rounded-lg shadow-2xl bg-gray-100">
      <img
        className="w-full h-full object-cover rounded-lg"
        src={src}
      />
    </div>
  );
};

export default ImageDisplay;
