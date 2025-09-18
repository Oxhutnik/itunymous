# itunymous

itunymous, kullanıcıların ilgi alanlarına göre anonim sohbet edebileceği modern bir gerçek zamanlı chat uygulamasıdır. Günümüzün dijital dünyasında, insanlar arası bağlantıları güçlendirmek ve benzer ilgi alanlarına sahip kişilerle güvenli, özel sohbetler yapabilmek amacıyla geliştirilmiştir.

## Temel İlkeler
- **Anonimlik**: Kullanıcılar gerçek kimliklerini gizleyerek sohbet edebilir.
- **İlgi Tabanlı Eşleştirme**: Hobiler ve ilgi alanlarına göre uyumlu kişilerle eşleştirme.
- **Güvenlik**: Email doğrulaması ile güvenli kayıt sistemi.
- **Gerçek Zamanlı İletişim**: WebSocket teknolojisi ile anlık mesajlaşma.
- **Kullanıcı Dostu Arayüz**: Modern ve responsive tasarım.

## Özellikler
### 🔐 Güvenlik ve Kimlik Doğrulama
- Email tabanlı kayıt ve giriş sistemi.
- 5 dakikalık doğrulama kodu ile güvenli aktivasyon.
- Otomatik oturum yönetimi.

### 👥 Akıllı Eşleştirme Sistemi
- Kullanıcıların hobilerini belirtmesi.
- Ortak ilgi alanlarına göre otomatik eşleştirme.
- Bekleme havuzu sistemi ile hızlı bağlantı.

### 💬 Gerçek Zamanlı Sohbet
- WebSocket tabanlı anlık mesajlaşma.
- Sohbet geçmişi kaydetme ve görüntüleme.
- Oda bazlı çoklu sohbet desteği.
- Sohbeti sonlandırma ve ayrılma seçenekleri.

### 🎨 Modern Kullanıcı Arayüzü
- Tailwind CSS ile responsive tasarım.
- Karanlık tema.
- Türkçe dil desteği.
- Mobil uyumlu tasarım.

## Teknoloji Altyapısı
### Ön Uç (Frontend)
- **Next.js 15**: React tabanlı modern web framework.
- **React 19**: Kullanıcı arayüzü kütüphanesi.
- **TypeScript**: Tip güvenliği sağlayan JavaScript üst kümesi.
- **Tailwind CSS**: Utility-first CSS framework.
- **Socket.IO Client**: Gerçek zamanlı iletişim.

### Arka Uç (Backend)
- **FastAPI**: Yüksek performanslı Python web framework'ü.
- **Python 3.8+**: Programlama dili.
- **Socket.IO Server**: Gerçek zamanlı sunucu.
- **Uvicorn**: ASGI web sunucusu.
- **Email Doğrulama**: Gmail SMTP entegrasyonu.

## Gereksinimler
Bu uygulamayı çalıştırmak için aşağıdaki yazılımlara ihtiyacınız var:
- **Node.js**: 18 veya üzeri sürüm.
- **Python**: 3.8 veya üzeri sürüm.
- **npm veya yarn**: Paket yöneticisi.
- **Git**: Sürüm kontrol sistemi.

## Kurulum
### 1. Repoyu Klonlayın
```bash
git clone https://github.com/kullaniciadi/itunymous.git
cd itunymous
```

### 2. Arka Uç Kurulumu
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows için: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Ön Uç Kurulumu
```bash
cd ../app
npm install
```

## Ortam Yapılandırması
### Arka Uç Ortam Değişkenleri
`backend/` klasöründe `.env` dosyası oluşturun:
```env
MAIL_USERNAME=sizin_gmail@gmail.com
MAIL_PASSWORD=sizin_uygulama_sifresi
```

#### Güvenlik Notları
- `.env` dosyasını asla GitHub'a yüklemeyin.
- Gmail için uygulama şifresi kullanın (normal şifreniz değil).
- Diğer geliştiriciler için `.env.example` dosyası oluşturun.

### Ön Uç Yapılandırması
Ön uç varsayılan olarak `http://localhost:5000` adresindeki arka uca bağlanır. Farklı ortamlarda bu URL'leri güncelleyin.

## Uygulamayı Çalıştırma
### 1. Arka Ucu Başlatın
```bash
cd backend
source venv/bin/activate
python main.py
```
Arka uç `http://localhost:5000` adresinde çalışacak.

### 2. Ön Ucu Başlatın
```bash
cd ../app
npm run dev
```
Ön uç `http://localhost:3000` adresinde çalışacak.
