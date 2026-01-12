const Footer = ({ content = "Your Organization" }) => {
  return (
    <footer className="h-12 bg-black border-t border-border-dark flex items-center overflow-hidden">
      <div className="dark:bg-black text-accent h-full px-8 flex items-center font-black text-sm z-10">
        Announcement
      </div>
      <div className="scrolling-text whitespace-nowrap text-sm dark:text-green-400">
        {content}
      </div>
    </footer>
  );
};

export default Footer;
