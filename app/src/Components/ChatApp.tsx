"use client";
import ChatForm from "@/Components/ChatForm";
import ChatMessage from "@/Components/ChatMessage";
import { socket } from "@/lib/soocketClient";
import { useEffect, useState } from "react";
import MessageList from "./MessageList";
import Header from "./Header";
import { useRouter } from "next/navigation";

interface ChatAppProps {
  initialRoom?: string;
  userEmail?: string;
  onLeaveChat?: () => void;
}

export default function ChatApp({ initialRoom, userEmail, onLeaveChat }: ChatAppProps) {
  console.log('ChatApp initialized with:', { initialRoom, userEmail });
  const router = useRouter();
  const [room, setRoom] = useState(initialRoom || "");
  const [joined, setJoined] = useState(!!initialRoom);
  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([]);
  const [username, setUserName] = useState(userEmail || "");
  const [lastTimestamp, setLastTimestamp] = useState(0);

  useEffect(() => {
    // Ensure socket is connected
    if (!socket.connected) {
      console.log('ChatApp: Socket not connected, connecting...');
      socket.connect();
    }

    const setupSocketListeners = () => {
      socket.on("user_joined", (message) => {
        console.log('ChatApp: User joined:', message);
        setMessages((prev) => [{ sender: "system", message }, ...prev]);
      });
      socket.on("user_left", (message) => {
        console.log('ChatApp: User left:', message);
        setMessages((prev) => [{ sender: "system", message }, ...prev]);
        // Clear stored roomId when other user leaves
        localStorage.removeItem('itunymous_lastRoomId');
        // Navigate to main menu when other user leaves
        console.log('ChatApp: Other user left, navigating to main menu');
        if (onLeaveChat) {
          onLeaveChat();
        } else {
          window.location.href = '/';
        }
      });
      socket.on("chat_ended", (data) => {
        console.log('ChatApp: Chat ended:', data);
        setMessages((prev) => [{ sender: "system", message: data.message }, ...prev]);
        // Clear stored roomId when chat is ended
        localStorage.removeItem('itunymous_lastRoomId');
        // Navigate to main menu when chat is ended
        console.log('ChatApp: Chat ended, navigating to main menu');
        if (onLeaveChat) {
          onLeaveChat();
        } else {
          window.location.href = '/';
        }
      });
    };

    // Re-join room on reconnection
    const handleConnect = () => {
      console.log('ChatApp: Socket reconnected, setting up listeners');
      setupSocketListeners();
      if (joined && room) {
        console.log('ChatApp: Re-joining room on reconnect:', room, username);
        socket.emit("join-room", { room, username });
      }
      // Also re-join user room
      if (userEmail) {
        console.log('ChatApp: Re-joining user room on reconnect:', userEmail);
        socket.emit('join_user_room', { userId: userEmail });
      }
    };

    // Set up listeners initially
    setupSocketListeners();
    socket.on("connect", handleConnect);

    // Join user-specific room for match notifications
    if (socket.connected && userEmail) {
      console.log('ChatApp: Joining user room:', userEmail);
      socket.emit('join_user_room', { userId: userEmail });
    }

    return () => {
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("chat_ended");
      socket.off("connect", handleConnect);
    };
  }, [joined, room, username, userEmail]);

  useEffect(() => {
    if (joined && room) {
      const pollMessages = () => {
        fetch(`http://localhost:5000/api/chat/messages/${room}?since=${lastTimestamp}`)
          .then(res => res.json())
          .then(data => {
            if (data.messages && data.messages.length > 0) {
              const newMessages = data.messages.map((m: any) => ({ sender: m.sender, message: m.message })).reverse();
              setMessages(prev => [...newMessages, ...prev]);
              setLastTimestamp(data.messages[data.messages.length - 1].timestamp);
            }
          })
          .catch(err => console.error('Polling error:', err));
      };

      const interval = setInterval(pollMessages, 1000);
      return () => clearInterval(interval);
    }
  }, [joined, room, lastTimestamp]);

  useEffect(() => {
    if (initialRoom && userEmail && !joined) {
      console.log('ChatApp: Joining room:', initialRoom, 'with user:', userEmail);

      // Ensure socket is connected before proceeding
      const ensureSocketConnected = () => {
        console.log('ChatApp: Socket connected status:', socket.connected, 'socket id:', socket.id);
        if (!socket.connected) {
          console.log('ChatApp: Socket not connected, connecting...');
          socket.connect();
          // Wait a bit for connection
          setTimeout(() => {
            console.log('ChatApp: After timeout, socket connected:', socket.connected, 'socket id:', socket.id);
            if (socket.connected) {
              proceedWithJoin();
            } else {
              console.error('ChatApp: Failed to connect socket');
              // Still proceed even if socket fails
              proceedWithJoin();
            }
          }, 1000);
        } else {
          proceedWithJoin();
        }
      };

      const proceedWithJoin = () => {
        // Load old messages first
        fetch(`http://localhost:5000/api/chat/messages/${initialRoom}`)
          .then(response => response.json())
          .then(data => {
            console.log('Loaded messages:', data.messages);
            if (data.messages && data.messages.length > 0) {
              // Convert stored messages to the expected format and reverse for correct order
              const oldMessages = data.messages
                .map((msg: { sender: string; message: string; timestamp: number }) => ({
                  sender: msg.sender,
                  message: msg.message
                }))
                .reverse(); // Reverse to show oldest first
              console.log('Converted messages:', oldMessages);
              setMessages(oldMessages);
              setLastTimestamp(data.messages[data.messages.length - 1].timestamp);
            } else {
              setMessages([]); // Ensure empty array if no messages
              setLastTimestamp(Date.now() / 1000);
            }
          })
          .catch(error => {
            console.error("Error loading messages:", error);
            setMessages([]); // Ensure empty array on error
          })
          .finally(() => {
            // Join the room after loading messages
            console.log('ChatApp: Emitting join-room event, socket connected:', socket.connected, 'socket id:', socket.id);
            socket.emit("join-room", { room: initialRoom, username: userEmail });
            console.log('ChatApp: join-room event emitted');
            setJoined(true);
          });
      };

      ensureSocketConnected();
    }
  }, [initialRoom, userEmail, joined]);
  // useEffect(() => {
  //   const room = 123;
  //   const username = "123";
  //   socket.emit("join-room", { room, username: username });
  //   setJoined(true);
  // }, []);
  function handleJoin() {
    if (username && room) {
      // Load old messages first
      fetch(`http://localhost:5000/api/chat/messages/${room}`)
        .then(response => response.json())
        .then(data => {
          console.log('Loaded messages:', data.messages);
          if (data.messages && data.messages.length > 0) {
            // Convert stored messages to the expected format and reverse for correct order
            const oldMessages = data.messages
              .map((msg: { sender: string; message: string; timestamp: number }) => ({
                sender: msg.sender,
                message: msg.message
              }))
              .reverse(); // Reverse to show oldest first
            console.log('Converted messages:', oldMessages);
            setMessages(oldMessages);
            setLastTimestamp(data.messages[data.messages.length - 1].timestamp);
          } else {
            setMessages([]); // Ensure empty array if no messages
            setLastTimestamp(Date.now() / 1000);
          }
        })
        .catch(error => {
          console.error("Error loading messages:", error);
          setMessages([]); // Ensure empty array on error
        })
        .finally(() => {
          // Join the room after loading messages
          socket.emit("join-room", { room, username: username });
          setJoined(true);
        });
    }
  }
  function handleSendMessage(message: string) {
    const data = { roomId: room, sender: username, message };
    console.log(data);
    fetch("http://localhost:5000/api/chat/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(err => console.error("Send message error:", err));
  }

  function handleLeaveRoom() {
    console.log('ChatApp: handleLeaveRoom called, room:', room, 'user:', username);

    // Do not clear the stored roomId for leave room, only for end chat

    // Always try to emit socket event if connected
    if (socket.connected) {
      console.log('ChatApp: Emitting leave_room event');
      socket.emit('leave_room', { room, username });
    }

    // Navigate back to main page
    console.log('ChatApp: Navigating to main page after leave_room');
    if (onLeaveChat) {
      onLeaveChat();
    } else {
      window.location.href = '/';
    }
  }

  function handleEndChat() {
    console.log('ChatApp: handleEndChat called for room:', room, 'user:', username);

    // Clear the stored roomId immediately
    localStorage.removeItem('itunymous_lastRoomId');

    // Try to end chat via API
    fetch("http://localhost:5000/api/chat/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: room, userId: username }),
    })
    .then(response => {
      console.log('ChatApp: End chat response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('ChatApp: End chat response data:', data);
    })
    .catch(error => {
      console.error('ChatApp: Error ending chat:', error);
    })
    .finally(() => {
      // Always navigate back to main page
      console.log('ChatApp: Navigating to main page after end chat');
      if (onLeaveChat) {
        onLeaveChat();
      } else {
        window.location.href = '/';
      }
    });
  }
  return (
    <div className="flex flex-col justify-center  items-center">
      {!joined ? (
        <div className="flex flex-col justify-center gap-y-5 items-center">
          <input
            type="text"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="name"
            disabled={!!userEmail}
            className="flex-1 px-4 border-2 py-2 w-100 bg-neutral-700 rounded-lg focus:outline-none disabled:opacity-50"
          ></input>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="room"
            disabled={!!initialRoom}
            className="flex-1 px-4 border-2 py-2 w-100 bg-neutral-700 rounded-lg focus:outline-none disabled:opacity-50"
          ></input>
          <button
            onClick={handleJoin}
            className="px-4 py-2 rounded-lg bg-blue-500 cursor-pointer"
          >
            Send
          </button>
        </div>
      ) : (
        <MessageList
          username={username}
          messages={messages}
          onSendMessage={handleSendMessage}
          onEndChat={handleEndChat}
          onLeaveRoom={handleLeaveRoom}
        ></MessageList>
      )}{" "}
    </div>
  );
}
