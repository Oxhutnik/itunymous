import React from "react";

const Header = () => {
  return (
    <div
      style={{ width: "clamp(0px, 99vw, 977px)" }}
      className="flex justify-center "
    >
      <div
        style={{ textShadow: "4px 4px 8px rgba(0,0,0,1)" }}
        className="flex cursor-pointer absolute w-auto px-10 font-bold text-[rgb(216,181,100)] text-2xl h-10 mt-2.5 border-0 items-center z-80 text-center"
      >
        ITUNYMOUS
      </div>
    </div>
  );
};

export default Header;
