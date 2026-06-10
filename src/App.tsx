import React, { useState, useEffect } from "react";
import { MemoryPhoto, SecretMessage, AffectionLetter } from "./types";
import Gallery from "./components/Gallery";
import SecretMessages from "./components/SecretMessages";
import Letters from "./components/Letters";
import { Heart, Sparkles, Settings, Users, Smile, Compass, BookOpen, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);
  const [secretMessages, setSecretMessages] = useState<SecretMessage[]>([]);
  const [letters, setLetters] = useState<AffectionLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [offlineMessage, setOfflineMessage] = useState("");
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);

  const FALLBACK_DATA = {
    photos: [
      {
        id: "photo_1",
        url: "hug",
        title: "Pertemuan Pertama Meow",
        date: "2025-02-14",
        description: "Hari pertama kita bertemu dan bernapas di bawah langit yang sama. Rasanya seperti semesta berbisik meow ke hati kita."
      },
      {
        id: "photo_2",
        url: "sunset",
        title: "Kencan Senja Romantis",
        date: "2025-04-10",
        description: "Menatap senja bersama di bukit bunga sakura. Menghitung kelopak yang jatuh, berjanji untuk terus bersama meow-selamanya."
      },
      {
        id: "photo_3",
        url: "moon",
        title: "Mimpi Di Bulan Sabit",
        date: "2025-06-01",
        description: "Terbawa mimpi indah bersamamu, memancing lentera cinta di atas bulan sabit yang tenang. Selalu berselimut pelukmu."
      }
    ],
    secretMessages: [
      {
        id: "msg_1",
        catIcon: "sleeping",
        message: "Tahukah kamu? Setiap kali aku mendengar suaramu, jantung meong-ku berdegup kencang berirama purr!",
        from: "Kucing Manismu"
      },
      {
        id: "msg_2",
        catIcon: "winking",
        message: "Aku mencintaimu lebih dari semua ikan tuna yang ada di dunia ini! Kamu adalah kelezatan hidupku.",
        from: "Tuan Kucing"
      },
      {
        id: "msg_3",
        catIcon: "love_eyes",
        message: "Melihat matamu adalah pemandangan terindah di alam semesta, bagai kilau bintang yang menuntun langkahku.",
        from: "Puan Kucing"
      }
    ],
    letters: [
      {
        id: "letter_1",
        title: "Janji Setia Meow-selamanya",
        body: "Hai kesayanganku,\n\nAku menulis ini saat sedang meringkuk di dekat bantalmu, mencium aroma tubuhmu yang menenangkan. Kamu tahu tidak, setiap kali kamu tidak ada, duniatahu sepi tanpa dengkur kebahagiaan. Aku ingin terus menemanimu di setiap musim, berbagi kehangatan di malam-malam dingin, dan tumbuh menua bersama.\n\nJanji meow-ku, aku akan selalu menyayangimu, melindungimu dengan cakar cintaku, dan takkan pernah melepaskan dekapanku.\n\nSelalu milikmu,\nTuan Kucing",
        sender: "Tuan Kucing",
        recipient: "Puan Kucing",
        createdAt: "2026-06-08T07:45:00Z",
        unlockDate: null
      }
    ]
  };

  const applyFallbackData = () => {
    setPhotos(FALLBACK_DATA.photos);
    setSecretMessages(FALLBACK_DATA.secretMessages);
    setLetters(FALLBACK_DATA.letters);
  };

  // Couple names stored in localStorage
  const [yourName, setYourName] = useState(() => localStorage.getItem("meow_your_name") || "Arifaa");
  const [partnerName, setPartnerName] = useState(() => localStorage.getItem("meow_partner_name") || "Putri Sabilaah");
  const [showSettings, setShowSettings] = useState(false);

  // Active viewing Tab: 'gallery' | 'secrets' | 'letters'
  const [activeTab, setActiveTab] = useState<"gallery" | "secrets" | "letters">("gallery");

  const isLocalHost = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const shouldUseBackend = import.meta.env.DEV || isLocalHost;

  // Fetch all initial data
  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    if (!shouldUseBackend) {
      applyFallbackData();
      setIsBackendAvailable(false);
      setErrorMessage("");
      setOfflineMessage("");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/data");
      if (!res.ok) throw new Error("Gagal mengambil data dari server meow!");
      const data = await res.json();
      setPhotos(data.photos || []);
      setSecretMessages(data.secretMessages || []);
      setLetters(data.letters || []);
      setIsBackendAvailable(true);
      setErrorMessage("");
      setOfflineMessage("");
    } catch (err: any) {
      console.error(err);
      setIsBackendAvailable(false);
      setErrorMessage("");
      setOfflineMessage("Mode offline: backend tidak tersedia, menampilkan konten cadangan.");
      applyFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveNames = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("meow_your_name", yourName);
    localStorage.setItem("meow_partner_name", partnerName);
    setShowSettings(false);
  };

  // Callback: Add Photo
  const handleAddPhoto = async (newPhoto: Omit<MemoryPhoto, "id">) => {
    const fallbackPhoto: MemoryPhoto = {
      id: `photo_${Date.now()}`,
      ...newPhoto,
    };
    if (!isBackendAvailable) {
      setPhotos((prev) => [fallbackPhoto, ...prev]);
      alert("Mode offline: foto disimpan sementara di sesi ini.");
      return;
    }

    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPhoto),
      });
      if (!res.ok) throw new Error("Gagal menyematkan foto meow.");
      const photo = await res.json();
      setPhotos((prev) => [photo, ...prev]);
    } catch (err: any) {
      console.error(err);
      setIsBackendAvailable(false);
      setPhotos((prev) => [fallbackPhoto, ...prev]);
      alert("Backend tidak tersedia, foto disimpan sementara di sesi ini.");
    }
  };

  // Callback: Delete Photo
  const handleDeletePhoto = async (id: string) => {
    if (!isBackendAvailable) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      alert("Mode offline: foto dihapus dari sesi ini.");
      return;
    }

    try {
      const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus foto meow.");
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err);
      setIsBackendAvailable(false);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      alert("Backend tidak tersedia, foto dihapus dari sesi ini.");
    }
  };

  // Callback: Add Secret Message
  const handleAddMessage = async (newMsg: Omit<SecretMessage, "id">) => {
    const fallbackMsg: SecretMessage = {
      id: `msg_${Date.now()}`,
      ...newMsg,
    };
    if (!isBackendAvailable) {
      setSecretMessages((prev) => [...prev, fallbackMsg]);
      alert("Mode offline: pesan disimpan sementara di sesi ini.");
      return;
    }

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
      if (!res.ok) throw new Error("Gagal menyembunyikan pesan meow.");
      const msg = await res.json();
      setSecretMessages((prev) => [...prev, msg]);
    } catch (err: any) {
      console.error(err);
      setIsBackendAvailable(false);
      setSecretMessages((prev) => [...prev, fallbackMsg]);
      alert("Backend tidak tersedia, pesan disimpan sementara di sesi ini.");
    }
  };

  // Callback: Delete Secret Message
  const handleDeleteMessage = async (id: string) => {
    if (!isBackendAvailable) {
      setSecretMessages((prev) => prev.filter((m) => m.id !== id));
      alert("Mode offline: pesan dihapus dari sesi ini.");
      return;
    }

    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus pesan rahasia meow.");
      setSecretMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      console.error(err);
      setIsBackendAvailable(false);
      setSecretMessages((prev) => prev.filter((m) => m.id !== id));
      alert("Backend tidak tersedia, pesan dihapus dari sesi ini.");
    }
  };

  // Callback: Add Letter
  const handleAddLetter = async (newLetter: Omit<AffectionLetter, "id" | "createdAt">) => {
    const fallbackLetter: AffectionLetter = {
      id: `letter_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...newLetter,
    };
    if (!isBackendAvailable) {
      setLetters((prev) => [fallbackLetter, ...prev]);
      alert("Mode offline: surat disimpan sementara di sesi ini.");
      return;
    }

    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLetter),
      });
      if (!res.ok) throw new Error("Gagal mengirim surat meow.");
      const letter = await res.json();
      setLetters((prev) => [letter, ...prev]);
    } catch (err: any) {
      console.error(err);
      setIsBackendAvailable(false);
      setLetters((prev) => [fallbackLetter, ...prev]);
      alert("Backend tidak tersedia, surat disimpan sementara di sesi ini.");
    }
  };

  // Callback: Delete Letter
  const handleDeleteLetter = async (id: string) => {
    if (!isBackendAvailable) {
      setLetters((prev) => prev.filter((l) => l.id !== id));
      alert("Mode offline: surat dihapus dari sesi ini.");
      return;
    }

    try {
      const res = await fetch(`/api/letters/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal membuang draf surat meow.");
      setLetters((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      console.error(err);
      setIsBackendAvailable(false);
      setLetters((prev) => prev.filter((l) => l.id !== id));
      alert("Backend tidak tersedia, surat dihapus dari sesi ini.");
    }
  };

  return (
    <div id="fullstack-cat-app" className="min-h-screen bg-[#FFFbf8] text-stone-800 selection:bg-rose-100 selection:text-rose-700 relative overflow-x-hidden font-sans pb-16">
      
      {/* Dynamic visual romantic overlay: soft pink abstract blurred lights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none select-none z-0"></div>
      <div className="absolute top-96 left-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none select-none z-0"></div>

      {/* Decorative Hearts and Paw watermarks */}
      <div className="absolute top-12 left-[10%] text-2xl text-rose-300/30 select-none animate-bounce" style={{ animationDuration: "5s" }}>💖</div>
      <div className="absolute top-48 right-[15%] text-xl text-amber-300/40 select-none animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>🐾</div>
      <div className="absolute bottom-28 left-[12%] text-2xl text-amber-200/30 select-none animate-pulse">🐾</div>
      <div className="absolute bottom-40 right-[10%] text-3xl text-rose-200/45 select-none animate-pulse">✨</div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">

        {/* Global Alert Frame for Server Errors */}
        {(errorMessage || offlineMessage) && (
          <div className={`mt-4 p-4 rounded-2xl flex items-center justify-between text-sm ${errorMessage ? "bg-rose-50 border border-rose-105 text-rose-700" : "bg-amber-50 border border-amber-100 text-amber-700"}`}>
            <span>{errorMessage ? `😿 ${errorMessage}` : `ℹ️ ${offlineMessage}`}</span>
            <button
              onClick={fetchData}
              className="bg-white hover:bg-gray-100 p-1.5 px-3 rounded-lg text-xs font-semibold border border-transparent hover:border-gray-200"
            >
              Muat Ulang
            </button>
          </div>
        )}

        {/* Header App Title Area */}
        <header id="site-header" className="pt-8 md:pt-12 pb-6 max-w-4xl mx-auto text-center flex flex-col items-center">
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center text-4xl shadow-sm border border-rose-50 relative"
          >
            😽
            <div className="absolute -top-1 -right-1 bg-red-400 text-white p-1 rounded-full text-xs">
              ❤️
            </div>
          </motion.div>

          <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-gray-850 mt-5 tracking-tight flex items-center gap-2">
            My Beautiful Girl
          </h1>
          <p className="text-gray-500 font-sans text-sm mt-1 max-w-lg">
            Halaman kenangan romantisnya aripaaaa
          </p>

          {/* Interactive names greeting & configuration */}
          <div className="mt-4 flex items-center justify-center gap-2 bg-rose-500/[0.04] p-2.5 px-5 rounded-2xl border border-rose-100/60 shadow-sm relative">
            <Users className="w-4 h-4 text-rose-500" />
            <span className="text-xs md:text-sm font-sans font-semibold text-rose-700 select-none">
              🐱 {yourName} <span className="text-amber-500 font-serif">🐾💖🐾</span> {partnerName} 🎀
            </span>
            <button
              id="btn-edit-names"
              onClick={() => setShowSettings(!showSettings)}
              className="ml-2 hover:bg-rose-100 text-rose-500 p-1 rounded-lg transition-colors"
              title="Atur Nama Pasangan"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Settings overlay pop */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border border-rose-100/80 rounded-2xl p-5 shadow-xl mt-3 text-left w-full max-w-sm absolute z-30"
              >
                <form onSubmit={handleSaveNames} className="space-y-4">
                  <h3 className="text-sm font-sans font-bold text-gray-800 flex items-center gap-1">
                    <Smile className="w-4 h-4 text-rose-500" />
                    <span>Lengkapi Identitas Rahasia</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 mb-1">Nama Kamu</label>
                      <input
                        id="setting-your-name"
                        type="text"
                        required
                        value={yourName}
                        onChange={(e) => setYourName(e.target.value)}
                        className="w-full bg-rose-50/10 border border-rose-105 p-2 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 mb-1">Nama Pasangan</label>
                      <input
                        id="setting-partner-name"
                        type="text"
                        required
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        className="w-full bg-rose-50/10 border border-rose-105 p-2 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="bg-rose-550 hover:bg-rose-650 text-white rounded-lg text-[11px] font-sans font-semibold p-1.5 px-3.5 transition-all shadow-sm active:scale-95"
                    >
                      Perbarui Nama Meow
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </header>

        {/* Core Sections Toggle TABS */}
        <nav id="view-selector-tabs" className="flex items-center justify-center p-1 bg-white/75 backdrop-blur shadow-sm border border-rose-100 max-w-md mx-auto rounded-2xl mb-8 relative z-10">
          <button
            id="tab-gallery"
            onClick={() => setActiveTab("gallery")}
            className={`flex-1 py-3 text-center rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "gallery" 
                ? "bg-rose-500 text-white shadow-md font-bold" 
                : "text-gray-500 hover:text-rose-500 hover:bg-rose-50/40"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>📸 Potret</span>
          </button>

          <button
            id="tab-secrets"
            onClick={() => setActiveTab("secrets")}
            className={`flex-1 py-3 text-center rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "secrets" 
                ? "bg-rose-500 text-white shadow-md font-bold" 
                : "text-gray-500 hover:text-rose-500 hover:bg-rose-50/40"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>💌 Rahasia</span>
          </button>

          <button
            id="tab-letters"
            onClick={() => setActiveTab("letters")}
            className={`flex-1 py-3 text-center rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "letters" 
                ? "bg-rose-500 text-white shadow-md font-bold" 
                : "text-gray-500 hover:text-rose-500 hover:bg-rose-50/40"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>✍️ Surat Cinta</span>
          </button>
        </nav>

        {/* Main Display: Content Area */}
        <main id="app-dynamic-content" className="relative z-10 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/80 rounded-3xl border border-rose-50 shadow-sm p-8 text-center">
              <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
              <p className="text-xs font-mono text-gray-400 mt-4 uppercase tracking-widest font-bold">Sedang Menghubungkan Meow...</p>
              <p className="text-xs text-gray-500 italic mt-1.5">"Membangunkan kucing-kucing romantis dan mempersiapkan kertas surat..."</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "gallery" && (
                  <Gallery
                    photos={photos}
                    onAddPhoto={handleAddPhoto}
                    onDeletePhoto={handleDeletePhoto}
                  />
                )}

                {activeTab === "secrets" && (
                  <SecretMessages
                    messages={secretMessages}
                    onAddMessage={handleAddMessage}
                    onDeleteMessage={handleDeleteMessage}
                  />
                )}

                {activeTab === "letters" && (
                  <Letters
                    letters={letters}
                    onAddLetter={handleAddLetter}
                    onDeleteLetter={handleDeleteLetter}
                  />
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* Soft Footer Credit */}
        <footer id="app-footer" className="mt-16 text-center select-none font-sans text-xs text-gray-400 font-medium">
          <p className="flex items-center justify-center gap-1">
            <span>Dibuat dengan segenap kasih sayang yang sangat penuh</span>
            <span className="text-rose-405 font-bold text-sm">🐱</span>
          </p>
          <p className="font-mono text-[10px] text-gray-350 mt-1 uppercase tracking-wider">
            Copyright By Mulkidiky © 2026 — My Arifah Putri Sabilah
          </p>
        </footer>

      </div>
    </div>
  );
}
