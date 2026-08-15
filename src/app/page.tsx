'use client';

import React, { useState, useEffect } from 'react';
import {
  authenticate,
  getEntitlementsToken,
  getUserInfo,
  getDailyStore,
  extractTokens,
  DailyStoreRawResult,
} from '../services/riotAuthStoreService';
import { resolveSkinOffers, ResolvedSkinOffer } from '../services/skinResolverService';
import { LoginForm } from '../components/LoginForm';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { StoreCard } from '../components/StoreCard';
import { CountdownTimer } from '../components/CountdownTimer';
import { HowToUseModal } from '../components/HowToUseModal';
import { LogOut, ShoppingBag, UserCheck, HelpCircle } from 'lucide-react';

const SESSION_STORAGE_KEY = 'valorant_store_session';

interface StoredSession {
  username: string;
  region: string;
  puuid: string;
  storeData: DailyStoreRawResult;
  resolvedSkins: ResolvedSkinOffer[];
}

export default function Home() {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{
    username: string;
    password: string;
    region: string;
  } | null>(null);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StoredSession;
        if (parsed && parsed.resolvedSkins && parsed.resolvedSkins.length > 0) {
          setSession(parsed);
        }
      }
    } catch {
      // Ignore invalid session storage
    }
  }, []);

  const handleLoginCredentials = async (
    username: string,
    password: string,
    region: string,
    code?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let activeUsername = username;
      let activePassword = password;
      let activeRegion = region;

      if (requires2FA && pendingCredentials) {
        activeUsername = pendingCredentials.username;
        activePassword = pendingCredentials.password;
        activeRegion = pendingCredentials.region;
      } else {
        setPendingCredentials({ username, password, region });
      }

      const authResult = await authenticate(activeUsername, activePassword, code);

      if (authResult.requires2FA) {
        setRequires2FA(true);
        setIsLoading(false);
        return;
      }

      if (authResult.error) {
        throw new Error(authResult.error);
      }

      const { accessToken, idToken } = authResult;

      const entitlementsToken = await getEntitlementsToken(accessToken);
      const userInfo = await getUserInfo(accessToken, idToken);
      const puuid = userInfo.puuid;

      const storeData = await getDailyStore(
        activeRegion,
        puuid,
        accessToken,
        entitlementsToken,
        idToken
      );

      const finalRegion = storeData.detectedRegion || activeRegion.toUpperCase();

      const resolvedSkins = await resolveSkinOffers(
        storeData.singleItemOffers,
        storeData.rawOffers
      );

      const sessionObj: StoredSession = {
        username: activeUsername,
        region: finalRegion,
        puuid,
        storeData,
        resolvedSkins,
      };

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionObj));

      setSession(sessionObj);
      setRequires2FA(false);
      setPendingCredentials(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginToken = async (tokenOrUrl: string, region: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { accessToken, idToken } = extractTokens(tokenOrUrl);

      if (!accessToken || accessToken.length < 20) {
        throw new Error(
          'Yapıştırılan bağlantıda geçerli bir erişim anahtarı bulunamadı. Lütfen kopyaladığınız bağlantıyı kontrol ediniz.'
        );
      }

      const entitlementsToken = await getEntitlementsToken(accessToken);
      const userInfo = await getUserInfo(accessToken, idToken);
      const puuid = userInfo.puuid;

      const storeData = await getDailyStore(
        region,
        puuid,
        accessToken,
        entitlementsToken,
        idToken
      );

      const finalRegion = storeData.detectedRegion || region.toUpperCase();

      const resolvedSkins = await resolveSkinOffers(
        storeData.singleItemOffers,
        storeData.rawOffers
      );

      const sessionObj: StoredSession = {
        username: `Riot Oyuncusu (${finalRegion})`,
        region: finalRegion,
        puuid,
        storeData,
        resolvedSkins,
      };

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionObj));

      setSession(sessionObj);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bağlantı doğrulanırken hata oluştu.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setRequires2FA(false);
    setPendingCredentials(null);
    setErrorMessage(null);
  };

  return (
    <main className="min-h-screen bg-[#060b10] text-gray-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Header Bar (Mobile Optimized) */}
      <header className="w-full border-b border-gray-800/80 bg-[#0f1923]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#ff4655] rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg uppercase tracking-wider text-white flex items-center gap-1.5 leading-tight">
                VALORANT <span className="text-[#ff4655]">MAĞAZASI</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] text-gray-400 tracking-widest uppercase">
                Canlı Mağaza Takipçisi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Guide Button in Header */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1 text-xs font-bold text-gray-300 hover:text-white bg-[#182531] hover:bg-gray-800 border border-gray-700/80 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#ff4655]" />
              <span className="hidden sm:inline">Nasıl Kullanılır?</span>
            </button>

            {session && (
              <>
                <div className="flex items-center gap-1.5 text-xs bg-[#182531] border border-gray-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline text-gray-300 font-semibold text-xs truncate max-w-[120px]">
                    {session.username}
                  </span>
                  <span className="bg-red-600/20 text-red-400 font-mono text-[10px] px-1.5 py-0.2 rounded border border-red-500/30 font-bold">
                    {session.region}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs font-bold text-gray-300 hover:text-white bg-gray-800/60 hover:bg-red-600/20 border border-gray-700 hover:border-red-500/50 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all cursor-pointer shrink-0"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span className="hidden xs:inline">Çıkış</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area (Mobile Fluid) */}
      <div className="flex-1 flex flex-col justify-center items-center p-3 sm:p-6 md:p-8 w-full max-w-7xl mx-auto">
        {!session && !isLoading && (
          <div className="w-full my-auto py-4 animate-in fade-in zoom-in-95 duration-300">
            <LoginForm
              onLoginCredentials={handleLoginCredentials}
              onLoginToken={handleLoginToken}
              isLoading={isLoading}
              requires2FA={requires2FA}
              errorMessage={errorMessage}
            />
          </div>
        )}

        {isLoading && <SkeletonLoader />}

        {session && !isLoading && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 py-2 sm:py-4">
            {/* Store Top Info Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 bg-[#0f1923]/70 border border-gray-800 p-4 sm:p-5 rounded-2xl backdrop-blur-sm shadow-xl">
              <div>
                <h2 className="text-lg sm:text-2xl font-black uppercase text-white tracking-wide flex items-center gap-2">
                  <span>Günün Mağaza Teklifleri</span>
                  <span className="text-[11px] font-mono font-normal bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Canlı
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                  Mağazanız 24 saatte bir rastgele 4 adet silah kaplaması ile yenilenir.
                </p>
              </div>

              <CountdownTimer
                initialSeconds={session.storeData.remainingDurationInSeconds}
              />
            </div>

            {/* 4 Daily Store Offer Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {session.resolvedSkins.map((skin) => (
                <StoreCard key={skin.uuid} skin={skin} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guide Modal */}
      <HowToUseModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* Footer */}
      <footer className="w-full border-t border-gray-900 bg-[#04070a] py-4 sm:py-6 text-center text-[11px] sm:text-xs text-gray-500 px-4">
        <p>
          VALORANT Günlük Mağaza Takipçisi &bull; Mobil Uyumlu &bull; Resmi Riot OAuth API
        </p>
      </footer>
    </main>
  );
}
