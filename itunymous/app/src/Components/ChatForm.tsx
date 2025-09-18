"use client";
import React, { useEffect, useRef, useState } from "react";
interface Props {
  onSendMessage: (e: string) => void;
}
const ChatForm = ({ onSendMessage }: Props) => {
  const [_, setmessage] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleSubmit() {
    if (inputRef.current && inputRef.current.value) {
      onSendMessage(inputRef.current.value);
      if (inputRef.current) {
        inputRef.current.value = "";
        setmessage("");
      }
    }
  }

  useEffect(() => {
    function checkPressedKey(e: KeyboardEvent) {
      if (e.code === "Enter") {
        handleSubmit();
      }
    }
    addEventListener("keypress", checkPressedKey);
    return () => removeEventListener("keypress", checkPressedKey);
  }, []);

  return (
    <div className="flex gap-2 justify-center items-center p-2">
      <input
        type="text"
        ref={inputRef}
        onChange={(e) => {
          setmessage(e.target.value);
        }}
        className="flex-1 px-4 border-2 py-2 w-176 bg-neutral-700 rounded-lg foucs--outline-none"
      ></input>
      <button
        onClick={handleSubmit}
        className="px-4 py-2 rounded-lg cursor-pointer bg-blue-500"
      >
        Send
      </button>
    </div>
  );
};

export default ChatForm;
