import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Lock,
  Key,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Globe,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ClipboardCheck,
  Zap,
  HelpCircle,
  Copy,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { HowToUseModal } from './HowToUseModal';

interface LoginFormProps {
  onLoginCredentials: (username: string, password: string, region: string, code?: string) => Promise<void>;
  onLoginToken: (tokenOrUrl: string, region: string) => Promise<void>;
  isLoading: boolean;
  requires2FA: boolean;
  errorMessage?: string | null;
}

const REGIONS = [
  { id: 'eu', label: 'Avrupa & Türkiye (EU)' },
  { id: 'na', label: 'Kuzey Amerika (NA)' },
  { id: 'ap', label: 'Asya Pasifik (AP)' },
  { id: 'kr', label: 'Kore (KR)' },
  { id: 'br', label: 'Brezilya (BR)' },
  { id: 'latam', label: 'Latin Amerika (LATAM)' },
];

const RIOT_AUTH_URL =
  'https://auth.riotgames.com/authorize?client_id=riot-client&response_type=token%20id_token&redirect_uri=http://localhost/redirect&scope=openid%20link%20ban%20lol_region&nonce=1';

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginCredentials,
  onLoginToken,
  isLoading,
  requires2FA,
  errorMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'credentials'>('url');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('eu');
  const [code, setCode] = useState('');
  const [tokenOrUrl, setTokenOrUrl] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showGuideAccordion, setShowGuideAccordion] = useState(true);

  const processToken = useCallback(
    (text: string) => {
      if (text && text.includes('access_token=') && !isLoading) {
        setTokenOrUrl(text);
        setAutoDetected(true);
        onLoginToken(text, region);
      }
    },
    [isLoading, onLoginToken, region]
  );

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const fullUrl = window.location.href;
      if (fullUrl.includes('access_token=')) {
        processToken(fullUrl);
      }
    }
  }, [processToken]);

  useEffect(() => {
    const handleWindowFocus = async () => {
      try {
        if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
          const clipText = await navigator.clipboard.readText();
          if (clipText && clipText.includes('access_token=') && clipText !== tokenOrUrl) {
            processToken(clipText);
          }
        }
      } catch {}
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [processToken, tokenOrUrl]);

  const handleClipboardPaste = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
        const text = await navigator.clipboard.readText();
        if (text && text.includes('access_token=')) {
          processToken(text);
        } else if (text) {
          setTokenOrUrl(text);
        }
      }
    } catch {}
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginCredentials(username, password, region, requires2FA ? code : undefined);
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginToken(tokenOrUrl, region);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Main Login Card */}
      <div className="w-full p-6 sm:p-8 bg-[#0f1923]/95 backdrop-blur-md rounded-3xl border border-red-500/30 shadow-2xl shadow-red-950/40 text-white transition-all">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 bg-red-600/20 rounded-2xl border border-red-500/40 flex items-center justify-center mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-[#ff4655]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-white">
            Riot Games Giriş
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Valorant Günlük Mağazanıza Güvenle Erişin
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#182531] border border-gray-800 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-[#ff4655] text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Resmi Bağlantı (%100)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'credentials'
                ? 'bg-[#ff4655] text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Kullanıcı Adı & Şifre</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/40 rounded-xl flex items-start gap-3 text-red-400 text-xs leading-relaxed animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Giriş Hatası</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Region Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-red-500" /> Hesap Bölgesi (Region)
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={isLoading}
            className="w-full bg-[#182531] border border-gray-700/80 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* TAB 1: OFFICIAL RIOT URL / TOKEN LOGIN */}
        {activeTab === 'url' && (
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resmi Riot Giriş & Otomatik Algılama</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-emerald-400 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Detaylı Rehber</span>
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                1. Butona tıklayıp Riot sayfasında giriş yapın.<br />
                2. Yönlendirildiğiniz sayfadaki adresi kopyalayıp buraya döndüğünüzde <strong>mağazanız otomatik açılır</strong>!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={RIOT_AUTH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-md shadow-emerald-900/30 cursor-pointer"
                >
                  <span>1. Riot Oturumu Aç</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleClipboardPaste}
                  className="bg-[#182531] hover:bg-gray-800 border border-emerald-500/40 text-emerald-300 font-bold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                >
                  <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Panodan Otomatik Al</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-300 mb-1.5 flex items-center justify-between">
                <span>Erişim Bağlantısı</span>
                {autoDetected && (
                  <span className="text-emerald-400 text-[11px] font-normal flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Otomatik Algılandı
                  </span>
                )}
              </label>
              <textarea
                rows={3}
                required
                value={tokenOrUrl}
                onChange={(e) => setTokenOrUrl(e.target.value)}
                disabled={isLoading}
                placeholder="http://localhost/redirect#access_token=eyJhbG..."
                className="w-full bg-[#182531] border border-gray-700/80 rounded-xl p-3 text-xs font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              suppressHydrationWarning
              disabled={!isMounted || isLoading || !tokenOrUrl.trim()}
              className="w-full mt-2 bg-[#ff4655] hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mağaza Yükleniyor...
                </>
              ) : (
                'Mağazayı Göster'
              )}
            </button>
          </form>
        )}

        {/* TAB 2: USERNAME & PASSWORD LOGIN */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {!requires2FA ? (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-red-500" /> Riot Giriş Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    placeholder="Giriş kullanıcı adınız"
                    className="w-full bg-[#182531] border border-gray-700/80 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-red-500" /> Şifre
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="••••••••••••"
                    className="w-full bg-[#182531] border border-gray-700/80 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-xl space-y-3 animate-in fade-in">
                <label className="block text-xs font-bold uppercase text-red-400 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-red-400" /> 2FA Doğrulama Kodu
                </label>
                <p className="text-xs text-gray-300 leading-snug">
                  E-postanıza veya doğrulayıcı uygulamanıza gelen 6 haneli kodu giriniz.
                </p>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                  placeholder="123456"
                  className="w-full bg-[#182531] border border-red-500 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
            )}

            <button
              type="submit"
              suppressHydrationWarning
              disabled={!isMounted || isLoading}
              className="w-full mt-6 bg-[#ff4655] hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Giriş Yapılıyor...
                </>
              ) : requires2FA ? (
                '2FA Kodunu Doğrula'
              ) : (
                'Mağazayı Gör'
              )}
            </button>
          </form>
        )}
      </div>

      {/* Prominent Always-Visible Visual Guide Section Below Login */}
      <div className="w-full bg-[#0f1923]/90 border border-gray-800 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-xl text-white">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowGuideAccordion(!showGuideAccordion)}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#ff4655]/20 text-[#ff4655] rounded-xl flex items-center justify-center border border-red-500/30">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                Nasıl Yapılır? (Adım Adım Rehber)
              </h3>
              <p className="text-[11px] text-gray-400">
                Mağazanızı açmak için izlemeniz gereken 4 basit adım
              </p>
            </div>
          </div>

          <button className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors">
            {showGuideAccordion ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showGuideAccordion && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-800/80 animate-in fade-in duration-300">
            {/* Step 1 */}
            <div className="p-3.5 bg-[#182531]/60 border border-gray-800 rounded-2xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-red-600/20 text-[#ff4655] font-black flex items-center justify-center shrink-0 text-xs border border-red-500/30">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Riot Oturumu Açın</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                  Yukarıdaki yeşil <strong>&quot;1. Riot Oturumu Aç&quot;</strong> butonuna basın ve giriş yapın.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 bg-[#182531]/60 border border-gray-800 rounded-2xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 font-black flex items-center justify-center shrink-0 text-xs border border-blue-500/30">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Adresi Kopyalayın</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                  Yönlendirildiğiniz sayfanın üst adres çubuğundaki linki kopyalayın (Ctrl + C).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 bg-[#182531]/60 border border-gray-800 rounded-2xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-yellow-600/20 text-yellow-400 font-black flex items-center justify-center shrink-0 text-xs border border-yellow-500/30">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Sekmeye Geri Dönün</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                  Bu sekmeye döndüğünüz anda token <strong>otomatik algılanır</strong> veya yapıştırıp butona basın.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0 text-xs border border-emerald-500/40">
                4
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <span>Mağazanızı İnceleyin!</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                  4 adet güncel skin, VP fiyatları, sayaç ve video önizlemeleri listelenir.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guide Modal */}
      <HowToUseModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
};
