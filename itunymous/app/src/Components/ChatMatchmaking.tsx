import { useState, useEffect } from 'react';
import ChatApp from './ChatApp';
import { socket } from '@/lib/soocketClient';

export default function ChatMatchmaking({ userEmail, onBack }: { userEmail: string; onBack: () => void }) {
    const [isSearching, setIsSearching] = useState(false);
    const [isMatched, setIsMatched] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");
    const [hasActiveChat, setHasActiveChat] = useState(false);
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

    useEffect(() => {
        // Ensure socket is connected
        if (!socket.connected) {
            socket.connect();
        }

        // Check for active chat on component mount
        checkActiveChat();
        // Also check again after a short delay to ensure state is updated
        const timeoutId = setTimeout(() => {
            checkActiveChat();
        }, 1000);

        // Join user-specific room for match notifications
        const joinUserRoom = () => {
            if (socket.connected) {
                console.log('ChatMatchmaking: Joining user room:', userEmail);
                socket.emit('join_user_room', { userId: userEmail });
            }
        };

        joinUserRoom();

        // Listen for match found events locally
        const handleMatchFound = (data: { targetUser: string; roomId: string; commonHobbies: number }) => {
            console.log('ChatMatchmaking: Received match_found event:', data);
            if (data.targetUser === userEmail) {
                console.log('ChatMatchmaking: Match is for current user, setting room and matched state');
                setRoomId(data.roomId);
                setIsMatched(true);
                setIsSearching(false);
                setMessage(`Eşleşme bulundu! ${data.commonHobbies} ortak hobiniz var.`);
                localStorage.setItem('itunymous_lastRoomId', data.roomId);
            }
        };

        const handleConnect = () => {
            console.log('ChatMatchmaking: Socket connected, joining user room');
            joinUserRoom();
        };

        socket.on('match_found', handleMatchFound);
        socket.on('connect', handleConnect);

        // Periodic check for active chat (fallback for socket issues)
        const activeChatInterval = setInterval(() => {
            if (!isMatched && userEmail && isSearching) {
                fetch(`http://localhost:5000/api/chat/check-active?userId=${userEmail}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.hasActiveChat && !isMatched) {
                            console.log('ChatMatchmaking: Found active chat via periodic check');
                            fetch(`http://localhost:5000/api/chat/get-room?userId=${userEmail}`)
                                .then(response => response.json())
                                .then(roomData => {
                                    if (roomData.roomId) {
                                        console.log('ChatMatchmaking: Setting matched state with room:', roomData.roomId);
                                        setRoomId(roomData.roomId);
                                        setIsMatched(true);
                                        setIsSearching(false);
                                        setMessage('Eşleşme bulundu! Sohbet sayfasına yönlendiriliyorsunuz.');
                                        localStorage.setItem('itunymous_lastRoomId', roomData.roomId);
                                    }
                                })
                                .catch(error => console.error('Error getting room:', error));
                        }
                    })
                    .catch(error => console.error('Error checking active chat:', error));
            }
        }, 1500); // Check every 1.5 seconds while searching

        return () => {
            socket.off('match_found', handleMatchFound);
            socket.off('connect', handleConnect);
            clearInterval(activeChatInterval);
            clearTimeout(timeoutId);
        };
    }, [userEmail, isMatched]);

    const checkActiveChat = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/chat/check-active?userId=${userEmail}`);
            const data = await response.json();
            console.log('ChatMatchmaking: checkActiveChat result:', data);
            setHasActiveChat(data.hasActiveChat || false);
            if (data.hasActiveChat) {
                // Get the room ID
                const roomResponse = await fetch(`http://localhost:5000/api/chat/get-room?userId=${userEmail}`);
                const roomData = await roomResponse.json();
                setActiveRoomId(roomData.roomId);
            } else {
                setActiveRoomId(null);
            }
        } catch (error) {
            console.error("Error checking active chat:", error);
            setHasActiveChat(false);
            setActiveRoomId(null);
        }
    };

    const startMatching = async () => {
        setIsSearching(true);
        setMessage("Hobi eşleştirmesi yapılıyor...");
        
        try {
            const response = await fetch("http://localhost:5000/api/chat/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userEmail }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                if (data.status === 'matched') {
                    // Match found immediately - set state directly
                    console.log('ChatMatchmaking: Immediate match found:', data);
                    setRoomId(data.roomId);
                    setIsMatched(true);
                    setIsSearching(false);
                    setMessage(`Eşleşme bulundu! ${data.commonHobbies} ortak hobiniz var.`);
                    localStorage.setItem('itunymous_lastRoomId', data.roomId);
                } else if (data.status === 'waiting') {
                    setMessage("Uygun eşleşme bekleniyor... Lütfen bekleyin.");
                    setTimeout(checkMatch, 5000);
                }
            } else {
                if (data.message === "Zaten aktif bir sohbettesiniz.") {
                    setMessage("Sohbet zaten var! Devam etmek için 'Sohbeti Devam Et' butonuna basın.");
                } else {
                    setMessage(data.message || "Bir hata oluştu.");
                }
                setIsSearching(false);
            }
        } catch (error) {
            console.error("Eşleşme hatası:", error);
            setMessage("Bağlantı hatası oluştu.");
            setIsSearching(false);
        }
    };

    const checkMatch = async () => {
        if (!isSearching || isMatched) return;

        try {
            const response = await fetch("http://localhost:5000/api/chat/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userEmail }),
            });

            const data = await response.json();

            if (data.status === 'matched') {
                // Match found - set state directly
                console.log('ChatMatchmaking: Match found in checkMatch:', data);
                setRoomId(data.roomId);
                setIsMatched(true);
                setIsSearching(false);
                setMessage(`Eşleşme bulundu! ${data.commonHobbies} ortak hobiniz var.`);
                localStorage.setItem('itunymous_lastRoomId', data.roomId);
            } else {
                // Also check if user has active chat (polling fallback)
                const activeResponse = await fetch(`http://localhost:5000/api/chat/check-active?userId=${userEmail}`);
                const activeData = await activeResponse.json();

                if (activeData.hasActiveChat) {
                    console.log('ChatMatchmaking: Found active chat via polling');
                    const roomResponse = await fetch(`http://localhost:5000/api/chat/get-room?userId=${userEmail}`);
                    const roomData = await roomResponse.json();

                    if (roomData.roomId) {
                        setRoomId(roomData.roomId);
                        setIsMatched(true);
                        setIsSearching(false);
                        setMessage('Eşleşme bulundu! Sohbet sayfasına yönlendiriliyorsunuz.');
                        localStorage.setItem('itunymous_lastRoomId', roomData.roomId);
                        return;
                    }
                }

                setTimeout(checkMatch, 3000); // Check more frequently
            }
        } catch (error) {
            console.error("Eşleşme kontrolü hatası:", error);
            setTimeout(checkMatch, 3000);
        }
    };

    const cancelMatching = async () => {
        setIsSearching(false);
        setMessage("Eşleşme iptal edildi.");
        try {
            await fetch("http://localhost:5000/api/chat/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userEmail }),
            });
        } catch (error) {
            console.error("İptal hatası:", error);
        }
    };

    const continueChat = () => {
        if (activeRoomId) {
            setRoomId(activeRoomId);
            setIsMatched(true);
        }
    };

    if (isMatched && roomId) {
        return <ChatApp initialRoom={roomId} userEmail={userEmail} onLeaveChat={onBack} />;
    }

    const handleBackToMain = () => {
        // Cancel any ongoing search
        if (isSearching) {
            cancelMatching();
        }
        // Navigate back to main menu
        onBack();
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={handleBackToMain}
                        className="text-gray-400 hover:text-white text-sm"
                    >
                        ← Ana Menü
                    </button>
                    <h2 className="text-2xl font-bold">Sohbet Eşleştirme</h2>
                    <div></div> {/* Spacer for centering */}
                </div>
                {hasActiveChat && (
                    <button
                        onClick={continueChat}
                        className="w-full bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 mb-4"
                    >
                        Sohbeti Devam Et
                    </button>
                )}
                {!isSearching ? (
                    <button
                        onClick={startMatching}
                        className="w-full bg-purple-600 hover:bg-purple-700 font-medium rounded-lg text-sm px-5 py-2.5"
                    >
                        Eşleşme Ara
                    </button>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                        <p className="text-center text-gray-300 mb-4">{message}</p>
                        <button
                            onClick={cancelMatching}
                            className="w-full bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5"
                        >
                            Eşleşmeyi İptal Et
                        </button>
                    </div>
                )}
                {message && !isSearching && (
                    <p className="text-center text-red-400 mt-4">{message}</p>
                )}
            </div>
        </div>
    );
}