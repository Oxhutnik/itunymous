"use client";
import { useState } from "react";

interface LoginFormProps {
  onSuccess: (userId: string) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Giriş yapılıyor...");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('itunymous_userId', email);
        localStorage.setItem('itunymous_hobbies', JSON.stringify(data.hobbies || []));
        onSuccess(email);
      } else {
        setMessage(data.message || "Giriş başarısız.");
      }
    } catch (error) {
      setMessage("Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 mb-4"
            placeholder="E-posta"
            required
            disabled={isLoading}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 mb-4"
            placeholder="Şifre"
            required
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg px-5 py-2.5"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-center text-gray-400">{message}</p>
        )}
      </div>
    </main>
  );
}