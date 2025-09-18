"use client";
import { useState, useEffect } from "react";
import ChatMatchmaking from "@/Components/ChatMatchmaking";
import ChatApp from "@/Components/ChatApp";
import RegisterForm from "@/Components/RegisterForm";
import LoginForm from "@/Components/LoginForm";
import { socket } from "@/lib/soocketClient";

export default function Page() {
  const [screen, setScreen] = useState<"welcome" | "main" | "register" | "login" | "match" | "continue">("welcome");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLastRoom, setHasLastRoom] = useState(false);
  const [matchedRoomId, setMatchedRoomId] = useState<string | null>(null);

  // localStorage kontrolünü sadece client tarafında yap
  useEffect(() => {
    // Ensure socket is connected
    if (!socket.connected) {
      console.log('Page: Connecting socket...');
      socket.connect();
    }

    const storedUserId = localStorage.getItem('itunymous_userId');
    const storedRoomId = localStorage.getItem('itunymous_lastRoomId');

    // Always start with welcome screen, don't auto-login
    // Just check for active chats if user exists for later use
    if (storedUserId) {
      fetch(`http://localhost:5000/api/chat/check-active?userId=${storedUserId}`)
        .then(response => response.json())
        .then(data => {
          setHasLastRoom(data.hasActiveChat);
          // If user has active chat but no stored roomId, store it
          if (data.hasActiveChat && !storedRoomId) {
            // We need to get the roomId from the backend
            fetch(`http://localhost:5000/api/chat/get-room?userId=${storedUserId}`)
              .then(response => response.json())
              .then(roomData => {
                if (roomData.roomId) {
                  localStorage.setItem('itunymous_lastRoomId', roomData.roomId);
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          setHasLastRoom(!!storedRoomId);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setHasLastRoom(false);
      setIsLoading(false);
    }
  }, []);

  // When userId changes (login/register), join user room
  useEffect(() => {
    if (userId && socket.connected) {
      console.log('User logged in, joining user room:', userId);
      socket.emit('join_user_room', { userId });
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear(); // Tüm localStorage'ı temizle
    setUserId(null);
    setScreen("welcome");
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </main>
    );
  }

  // Ekran kontrollerini düzenle
  if (!userId) {
    if (screen === "register") {
      return <RegisterForm onSuccess={(id) => {
        console.log("RegisterForm onSuccess çağrıldı, userId:", id);
        setUserId(id);
        // Check for active chat after login
        fetch(`http://localhost:5000/api/chat/check-active?userId=${id}`)
          .then(response => response.json())
          .then(data => {
            console.log("Active chat check result:", data);
            setHasLastRoom(data.hasActiveChat);
            if (data.hasActiveChat) {
              // Get roomId if not stored
              const storedRoomId = localStorage.getItem('itunymous_lastRoomId');
              if (!storedRoomId) {
                fetch(`http://localhost:5000/api/chat/get-room?userId=${id}`)
                  .then(response => response.json())
                  .then(roomData => {
                    if (roomData.roomId) {
                      localStorage.setItem('itunymous_lastRoomId', roomData.roomId);
                    }
                  })
                  .catch(() => {});
              }
            }
          })
          .catch((error) => {
            console.error("Active chat check error:", error);
          })
          .finally(() => {
            console.log("Setting screen to main");
            setScreen("main");
          });
      }} />;
    }
    if (screen === "login") {
      return <LoginForm onSuccess={(id) => {
        setUserId(id);
        // Check for active chat after login
        fetch(`http://localhost:5000/api/chat/check-active?userId=${id}`)
          .then(response => response.json())
          .then(data => {
            setHasLastRoom(data.hasActiveChat);
            if (data.hasActiveChat) {
              // Get roomId if not stored
              const storedRoomId = localStorage.getItem('itunymous_lastRoomId');
              if (!storedRoomId) {
                fetch(`http://localhost:5000/api/chat/get-room?userId=${id}`)
                  .then(response => response.json())
                  .then(roomData => {
                    if (roomData.roomId) {
                      localStorage.setItem('itunymous_lastRoomId', roomData.roomId);
                    }
                  })
                  .catch(() => {});
              }
            }
          })
          .catch(() => {})
          .finally(() => {
            setScreen("main");
          });
      }} />;
    }
    // Show welcome screen with both buttons
    if (screen === "welcome") {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4">
            <h1 className="text-2xl font-bold mb-6 text-center">itunymous</h1>
            <button
              className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5"
              onClick={() => setScreen("register")}
            >
              Kayıt Ol
            </button>
            <button
              className="w-full text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5"
              onClick={() => setScreen("login")}
            >
              Giriş Yap
            </button>
          </div>
        </main>
      );
    }
  }

  if (userId && screen === "match") {
    return <ChatMatchmaking userEmail={userId} onBack={() => setScreen("main")} />;
  }

  if (userId && screen === "continue") {
    const lastRoomId = matchedRoomId || localStorage.getItem('itunymous_lastRoomId');
    console.log('Continue chat - userId:', userId, 'roomId:', lastRoomId, 'matchedRoomId:', matchedRoomId);
    if (lastRoomId) {
      return <ChatApp initialRoom={lastRoomId} userEmail={userId} onLeaveChat={() => setScreen("main")} />;
    } else {
      console.log('No roomId found, going to main');
      setScreen("main");
    }
  }

  // Show main menu for logged-in users
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-6 text-center">itunymous</h1>

        {userId ? (
           <>
             {hasLastRoom && (
               <button
                 className="w-full text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
                 onClick={() => {
                   console.log('Continue chat button clicked');
                   setScreen("continue");
                 }}
               >
                 Sohbeti Devam Et
               </button>
             )}
             <button
               className="w-full text-white bg-purple-600 hover:bg-purple-700 font-medium rounded-lg text-sm px-5 py-2.5"
               onClick={() => setScreen("match")}
             >
               Sohbet Arkadaşı Bul
             </button>
             <button
               className="w-full text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5"
               onClick={handleLogout}
             >
               Çıkış Yap
             </button>
           </>
         ) : (
          // This should not be reached since we handle welcome screen above
          <div>Unexpected state</div>
         )}
      </div>
    </main>
  );
}