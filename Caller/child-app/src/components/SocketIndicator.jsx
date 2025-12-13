const SocketIndicator = ({ retrying }) => {
  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-2">
      <span
        className={`w-3 h-3 rounded-full ${
          retrying ? "bg-red-500 animate-pulse" : "bg-green-500"
        }`}
      ></span>
      <span className="text-black dark:text-white  text-sm">
        {retrying ? "Reconnecting..." : "Connected"}
      </span>
    </div>
  );
};

export default SocketIndicator;
