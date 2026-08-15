import React from 'react';
import { X, ExternalLink, ShieldCheck, Zap, Copy, CheckCircle2, ShoppingBag, HelpCircle } from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0f1923] border border-red-500/40 rounded-3xl p-5 sm:p-8 text-white shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-xl border border-red-500/40 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-[#ff4655]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide">
                Nasıl Kullanılır?
              </h3>
              <p className="text-xs text-gray-400">
                4 Adımda Günlük Valorant Mağazanızı Görüntüleyin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="mt-6 space-y-4">
          {/* Step 1 */}
          <div className="p-4 bg-[#182531]/70 border border-gray-800 rounded-2xl flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-[#ff4655] font-black flex items-center justify-center shrink-0 text-sm border border-red-500/30">
              1
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Riot Resmi Sayfasında Oturum Açın</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              </h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Yeşil renkli <strong>&quot;1. Riot Oturumu Aç&quot;</strong> butonuna tıklayın. Açılan resmi Riot Games sayfasında hesabınıza güvenle giriş yapın.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-[#182531]/70 border border-gray-800 rounded-2xl flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-[#ff4655] font-black flex items-center justify-center shrink-0 text-sm border border-red-500/30">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Adres Çubuğundaki Bağlantıyı Kopyalayın</span>
                <Copy className="w-3.5 h-3.5 text-blue-400" />
              </h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Giriş yaptıktan sonra tarayıcınız <code>http://localhost/redirect#access_token=...</code> sayfasına yönlenecektir. Sayfa açılmasa bile üstteki <strong>adres çubuğundaki tüm yazıyı kopyalayın</strong> (Ctrl + C).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-[#182531]/70 border border-gray-800 rounded-2xl flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-[#ff4655] font-black flex items-center justify-center shrink-0 text-sm border border-red-500/30">
              3
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Sekmeye Geri Dönün (Otomatik Algılama)</span>
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
              </h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Uygulama sekmesine döndüğünüz anda kopyaladığınız bağlantı <strong>otomatik olarak algılanır</strong> ve mağazanız yüklenir. Dilerseniz <strong>&quot;Panodan Otomatik Al&quot;</strong> butonuna da basabilirsiniz.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0 text-sm border border-emerald-500/40">
              4
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <span>Mağazanızı İnceleyin!</span>
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              </h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Bugünün 4 özel kaplaması, VP fiyatları, kalan süre sayacı ve oyun içi video önizlemeleri ekranınızda listelenir.
              </p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-start gap-3 text-blue-300 text-xs">
          <ShieldCheck className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Güvenlik Garantisi:</strong> Giriş doğrudan resmi Riot Games OAuth sunucuları üzerinden yapılır. Şifreniz asla sunucularımızda saklanmaz.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#ff4655] hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-600/30 uppercase tracking-wider text-xs cursor-pointer"
        >
          Anladım, Kapat
        </button>
      </div>
    </div>
  );
};
