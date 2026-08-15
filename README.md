# 🎯 VALORANT Canlı Günlük Mağaza Takipçisi (Store Checker)

Modern, hızlı, mobil uyumlu ve güvenli **VALORANT Günlük Mağaza Takip** web uygulaması.

Oyun istemcisini açmaya gerek kalmadan, doğrudan resmi Riot Games OAuth yetkilendirmesi üzerinden günlük 4 silah kaplaması teklifinizi, VP fiyatlarını, kalan süreyi ve oyun içi skin video önizlemelerini canlı olarak görüntüleyin.

![Valorant Store Preview](https://raw.githubusercontent.com/valorant-api-assets/preview/main/preview.png)

---

## ✨ Özellikler

- **🔒 %100 Resmi & Güvenli:** Resmi `riot-client` OAuth kimliği ile çalışır. Şifreniz asla üçüncü taraf sunucularda saklanmaz.
- **⚡ Otomatik Pano Algılama:** Riot sayfasında giriş yaptıktan sonra adres çubuğundaki linki kopyalayıp sekmeye döndüğünüz anda mağazanız otomatik yüklenir.
- **📱 Mobile-First Tasarım:** Masaüstü, tablet ve mobil (iOS / Android) ekranlara tam uyumlu arayüz.
- **🎬 Canlı Video Önizlemeleri:** Her silah kaplamasının seviye efektlerini ve bitirici (finisher) animasyonlarını video modal üzerinden izleyin.
- **💎 VP Fiyatlandırması & Nadirlik:** Skin nadirlik katmanlarına göre renk efektleri ve güncel VP maliyetleri.
- **⏱️ Canlı Geri Sayım Sayacı:** Mağazanın 24 saatlik yenilenme süresine kalan dakikayı canlı takip edin.
- **🌍 Otomatik Bölge Çözümleme (PAS):** Türkiye, Avrupa (EU), Kuzey Amerika (NA), Asya (AP) ve Kore (KR) sunucularını otomatik algılar.

---

## 🛠️ Kullanılan Teknolojiler

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & İkonlar:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
- **Dil:** [TypeScript](https://www.typescriptlang.org/)
- **Veri & API:** Riot Games PvP Gateway & [valorant-api.com](https://valorant-api.com/)
- **Sunucu / Dağıtım:** Node.js, PM2, Nginx

---

## 🚀 Kurulum ve Yerel Çalıştırma

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/kullanici-adiniz/valorant-store-app.git
cd valorant-store-app
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Geliştirici Sunucusunu Başlatın
```bash
npm run dev
```

Tarayıcınızda **[http://localhost:3000](http://localhost:3000)** adresine giderek uygulamayı kullanmaya başlayabilirsiniz!

---

## 📦 Kendi Sunucunuzda (VPS) Yayınlama

Uygulamayı bir Linux (Debian/Ubuntu) sunucusunda 7/24 çalıştırmak için:

```bash
# 1. Projeyi derleyin
npm run build

# 2. PM2 ile arka planda başlatın
npm install -g pm2
pm2 start npm --name "valorant-store" -- start -- -p 3000
pm2 save
pm2 startup
```

---

## 📄 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Riot Games veya VALORANT ile resmi bir bağlantısı yoktur.
