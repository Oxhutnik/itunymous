"use client";
import { useState } from "react";

interface RegisterFormProps {
  onSuccess: (userId: string) => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);

  const HOBBY_OPTIONS = [
    "Müzik", "Spor", "Kitap", "Film", "Seyahat", 
    "Teknoloji", "Yemek", "Fotoğrafçılık", "Dans",
    "Oyun", "Sanat", "Bilim", "Doğa", "Yazılım"
  ];



  // 1. Adım: Mail gönder
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Kod gönderiliyor...");
    try {
      const response = await fetch("http://localhost:5000/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) setStep(2);
    } catch {
      setMessage("Sunucuya bağlanılamadı.");
    }
  };

  // 2. Adım: Kod doğrula
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Kod doğrulanıyor...");
    try {
      const response = await fetch("http://localhost:5000/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) setStep(3);
    } catch {
      setMessage("Sunucuya bağlanılamadı.");
    }
  };

  // Şifre oluşturma adımını güncelle
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Kayıt işlemi başlatılıyor...");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Hobbies:", hobbies);
    setMessage("Kayıt olunuyor...");
    try {
      const requestData = { email, password, hobbies };
      console.log("Gönderilen veri:", requestData);
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      setMessage(data.message);
      if (response.ok) {
        console.log("Kayıt başarılı, onSuccess çağrılıyor...");
        onSuccess(email);
      } else {
        console.log("Kayıt başarısız:", data.message);
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      setMessage("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Kayıt Ol</h1>
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 mb-4"
              placeholder="E-posta"
              required
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2.5">Kodu Gönder</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 mb-4"
              placeholder="Doğrulama Kodu"
              required
            />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 rounded-lg px-5 py-2.5">Kodu Doğrula</button>
          </form>
        )}
    {step === 3 && (
      <form onSubmit={handleRegister}>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 mb-4"
          placeholder="Şifre Oluştur"
          required
        />
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Hobilerinizi Seçin (En az 1 tane)</p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {HOBBY_OPTIONS.map(hobby => (
              <label key={hobby} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={hobbies.includes(hobby)}
                  onChange={e => {
                    if (e.target.checked) {
                      setHobbies([...hobbies, hobby]);
                    } else {
                      setHobbies(hobbies.filter(h => h !== hobby));
                    }
                  }}
                  className="rounded border-gray-600"
                />
                <span>{hobby}</span>
              </label>
            ))}
          </div>
        </div>
        <button 
          type="submit" 
          disabled={hobbies.length === 0}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg px-5 py-2.5"
        >
          Kaydı Tamamla
        </button>
      </form>
    )}
        {message && <p className="mt-4 text-sm text-center text-gray-400">{message}</p>}
      </div>
    </main>
  );
}