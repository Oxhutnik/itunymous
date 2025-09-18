import React, { Ref } from "react";

interface Props {
  sender: string;
  message: string;
  isOwnMessage: boolean;
}

const ChatMessage = ({ sender, message, isOwnMessage }: Props) => {
  const isSystemMessage = sender === "system";
  return (
    <div
      className={
        isSystemMessage
          ? "flex items-center justify-center "
          : isOwnMessage
          ? "flex items-center justify-end"
          : "flex items-center justify-start"
      }
    >
      <div
        style={
          isSystemMessage
            ? {
                backgroundColor: "rgb(80,80,80)",
                color: "white",
                textAlign: "center",
              }
            : isOwnMessage
            ? { color: "white", backgroundColor: "rgb(100,100,255)" }
            : { color: "black", backgroundColor: "rgb(200,200,200)" }
        }
        className="max-w-xs px-4 py-2  rounded-lg "
      >
        {!isSystemMessage && <div></div>}
        <div className="text-lg">{message}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
