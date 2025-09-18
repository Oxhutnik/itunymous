ıtunymous
ıtunymous, kullanıcıların ilgi alanlarına göre anonim sohbet edebileceği, modern ve gerçek zamanlı bir chat uygulamasıdır. Günümüzün dijital dünyasında, insanlar arası bağlantıları güçlendirmek ve benzer ilgi alanlarına sahip kişilerle güvenli, özel sohbetler yapabilmek amacıyla geliştirilmiştir.

✨ Temel İlkeler
Anonimlik: Gerçek kimliğinizi gizleyerek özgürce sohbet edin.

İlgi Alanına Dayalı Eşleştirme: Ortak hobiler ve ilgi alanları sayesinde ruh eşinizi bulun.

Güvenlik: E-posta doğrulamasıyla güvenli bir şekilde kaydolun.

Gerçek Zamanlı İletişim: WebSocket teknolojisi ile anlık ve kesintisiz mesajlaşın.

Kullanıcı Dostu Arayüz: Modern, duyarlı ve göz yormayan tasarım.

🚀 Özellikler
🔐 Güvenlik ve Kimlik Doğrulama
E-posta tabanlı güvenli kayıt ve giriş sistemi.

5 dakikalık doğrulama kodu ile hızlı hesap aktivasyonu.

Otomatik oturum yönetimi ile kesintisiz deneyim.

👥 Akıllı Eşleştirme Sistemi
Kullanıcıların hobilerini belirterek kişiselleştirilmiş eşleşme.

Ortak ilgi alanlarına göre otomatik eşleştirme algoritması.

Bekleme havuzu sistemi sayesinde anında bağlantı.

💬 Gerçek Zamanlı Sohbet
WebSocket tabanlı, anlık ve akıcı mesajlaşma.

Sohbet geçmişi kaydetme ve kolayca görüntüleme.

Oda bazlı çoklu sohbet desteği.

Sohbeti sonlandırma ve ayrılma seçenekleri.

🎨 Modern Kullanıcı Arayüzü
Tailwind CSS ile tamamen duyarlı (responsive) tasarım.

Göz yorgunluğunu azaltan şık bir karanlık tema.

Türkçe dil desteği.

Mobil uyumlu arayüz.

🛠️ Teknoloji Altyapısı
Ön Uç (Frontend)
Next.js 15: Hızlı ve modern web uygulamaları için React tabanlı framework.

React 19: Dinamik kullanıcı arayüzleri oluşturmak için kütüphane.

TypeScript: Kodunuzu daha güvenli ve ölçeklenebilir hale getirmek için.

Tailwind CSS: Hızlı tasarım için utility-first CSS framework.

Socket.IO Client: Gerçek zamanlı iletişim kurmak için.

Arka Uç (Backend)
FastAPI: Yüksek performanslı ve modern Python web framework'ü.

Python 3.8+: Güçlü ve esnek programlama dili.

Socket.IO Server: Gerçek zamanlı bağlantıları yönetmek için.

Uvicorn: ASGI web sunucusu.

Email Doğrulama: Gmail SMTP entegrasyonu.

⚙️ Gereksinimler
Bu uygulamayı başarıyla çalıştırmak için sisteminizde aşağıdaki yazılımların kurulu olması gerekir:

Node.js: 18 veya üzeri sürüm.

Python: 3.8 veya üzeri sürüm.

npm veya yarn: Paket yöneticisi.

Git: Sürüm kontrol sistemi.

💻 Kurulum
1. Repoyu Klonlayın
Bash

git clone https://github.com/kullaniciadi/itunymous.git
cd itunymous
2. Arka Uç (Backend) Kurulumu
Bash

cd backend
python -m venv venv
source venv/bin/activate  # Windows için: venv\Scripts\activate
pip install -r requirements.txt
3. Ön Uç (Frontend) Kurulumu
Bash

cd ../app
npm install
🔧 Ortam Yapılandırması
Arka Uç Ortam Değişkenleri
backend/ klasöründe .env adında bir dosya oluşturun ve içeriğini aşağıdaki gibi doldurun:

Kod snippet'i

MAIL_USERNAME=sizin_gmail@gmail.com
MAIL_PASSWORD=sizin_uygulama_sifresi
⚠️ Güvenlik Notları:

.env dosyasını asla GitHub'a yüklemeyin!

Gmail için uygulama şifresi kullanın, normal hesabınızın şifresini değil.

Ön Uç Yapılandırması
Ön uç varsayılan olarak http://localhost:5000 adresindeki arka uca bağlanır. Farklı bir ortamda çalıştırıyorsanız, bu URL'yi uygun şekilde güncelleyin.

▶️ Uygulamayı Çalıştırma
1. Arka Ucu Başlatın
Bash

cd backend
source venv/bin/activate
python main.py
Arka uç http://localhost:5000 adresinde çalışmaya başlayacak.

2. Ön Ucu Başlatın
Bash

cd ../app
npm run dev
Ön uç http://localhost:3000 adresinde çalışmaya başlayacak.

Artık uygulamayı kullanmaya hazırsınız! Tarayıcınızdan http://localhost:3000 adresini ziyaret ederek ıtunymous'u keşfedin.
