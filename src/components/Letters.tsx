import React, { useState } from "react";
import { AffectionLetter } from "../types";
import { Calendar, PenTool, Sparkles, Mail, Eye, Clock, Trash2, Heart, Lock, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LettersProps {
  letters: AffectionLetter[];
  onAddLetter: (letter: Omit<AffectionLetter, "id" | "createdAt">) => Promise<void>;
  onDeleteLetter: (id: string) => Promise<void>;
}

export default function Letters(props: LettersProps) {
  const [activeLetter, setActiveLetter] = useState<AffectionLetter | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sender, setSender] = useState("Tuan Kucing");
  const [recipient, setRecipient] = useState("Puan Kucing");
  const [customSender, setCustomSender] = useState("");
  const [customRecipient, setCustomRecipient] = useState("");
  const [hasUnlockDate, setHasUnlockDate] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ask Gemini AI to generate custom poetic cat themed letter from simple inputs
  const handleAiAssist = async () => {
    if (!body) {
      alert("Minta tolong masukkan ide tulisan kasar atau draf singkat dulu ya, biar Kucing AI bisa menghiasnya meow! 🐾");
      return;
    }

    setIsAiLoading(true);
    const finalSender = sender === "Lainnya" ? customSender : sender;
    const finalRecipient = recipient === "Lainnya" ? customRecipient : recipient;

    try {
      const res = await fetch("/api/ai/suggest-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body,
          sender: finalSender,
          recipient: finalRecipient,
        }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setBody(data.text);
      } else {
        alert(data.error || "Gagal memanggil meow AI.");
      }
    } catch {
      alert("Ups! Gagal menghubungi Kucing AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      alert("Judul dan surat wajib ditulis meow!");
      return;
    }

    const finalSender = sender === "Lainnya" ? customSender : sender;
    const finalRecipient = recipient === "Lainnya" ? customRecipient : recipient;

    if (!finalSender || !finalRecipient) {
      alert("Mohon lengkapi nama pengirim dan penerima nya ya!");
      return;
    }

    setIsSubmitting(true);
    try {
      await props.onAddLetter({
        title,
        body,
        sender: finalSender,
        recipient: finalRecipient,
        unlockDate: hasUnlockDate && unlockDate ? new Date(unlockDate).toISOString() : null,
      });

      // Reset
      setTitle("");
      setBody("");
      setSender("Tuan Kucing");
      setRecipient("Puan Kucing");
      setCustomSender("");
      setCustomRecipient("");
      setHasUnlockDate(false);
      setUnlockDate("");
      setShowCompose(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if a letter is locked
  const isLetterLocked = (letter: AffectionLetter): boolean => {
    if (!letter.unlockDate) return false;
    const now = new Date();
    const unlock = new Date(letter.unlockDate);
    return now < unlock;
  };

  // Format date readable
  const formatDateStr = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div id="letters-module" className="my-10">
      
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-2 mb-6 border-b border-rose-100 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-sans font-semibold text-gray-850 flex items-center gap-2">
            ✍️ Meja Surat Kasih Sayang
          </h2>
          <p className="text-sm font-sans text-gray-500 font-normal leading-relaxed">
            Sebuah <span className="text-rose-600 font-semibold drop-shadow-[0_0_8px_rgba(244,63,94,0.1)]">pesan pengingat dirimu yang istimewa</span> 
          </p>
        </div>
        <button
          id="btn-trigger-compose"
          onClick={() => setShowCompose(!showCompose)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-550 hover:bg-rose-650 text-white font-medium text-sm rounded-xl transition-all shadow-md active:scale-95"
        >
          <PenTool className="w-4 h-4" />
          <span>Tulis Surat Cinta</span>
        </button>
      </div>

      {/* Compose Form Modal overlay */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[3px]"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-rose-100 space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h3 className="text-lg font-sans font-semibold text-rose-600 flex items-center gap-2">
                  ✍️ Menulis Surat Berbulu Hangat
                </h3>
                <button
                  id="btn-close-compose"
                  onClick={() => setShowCompose(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm p-1.5 px-2.5 rounded-lg border border-gray-100 hover:bg-gray-50"
                >
                  Tutup
                </button>
              </div>

              <form onSubmit={handleComposeSubmit} className="space-y-4">
                
                {/* Senders & Receivers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sender selection */}
                  <div>
                    <label className="block text-xs font-sans font-medium text-gray-500 uppercase tracking-widest mb-1">
                      Sayap Kasih Dari (Pengirim)
                    </label>
                    <select
                      id="select-sender"
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      className="w-full bg-rose-50/25 border border-rose-100 px-3 py-2 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="Tuan Kucing">🐱 Tuan Kucing</option>
                      <option value="Puan Kucing">🎀 Puan Kucing</option>
                      <option value="Lainnya">Lainnya...</option>
                    </select>
                    {sender === "Lainnya" && (
                      <input
                        id="input-custom-sender"
                        type="text"
                        required
                        value={customSender}
                        onChange={(e) => setCustomSender(e.target.value)}
                        placeholder="Ketik namamu..."
                        className="w-full mt-2 bg-white border border-rose-105 p-2 rounded-xl text-xs focus:ring-1.5 focus:ring-rose-200"
                      />
                    )}
                  </div>

                  {/* Recipient selection */}
                  <div>
                    <label className="block text-xs font-sans font-medium text-gray-500 uppercase tracking-widest mb-1">
                      Kirim Kepada (Penerima)
                    </label>
                    <select
                      id="select-recipient"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full bg-rose-50/25 border border-rose-100 px-3 py-2 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="Puan Kucing">🎀 Puan Kucing</option>
                      <option value="Tuan Kucing">🐱 Tuan Kucing</option>
                      <option value="Lainnya">Lainnya...</option>
                    </select>
                    {recipient === "Lainnya" && (
                      <input
                        id="input-custom-recipient"
                        type="text"
                        required
                        value={customRecipient}
                        onChange={(e) => setCustomRecipient(e.target.value)}
                        placeholder="Ketik namamu..."
                        className="w-full mt-2 bg-white border border-rose-105 p-2 rounded-xl text-xs focus:ring-1.5 focus:ring-rose-200"
                      />
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-sans font-medium text-gray-500 uppercase tracking-widest mb-1">
                    Judul Surat Kasih Sayang
                  </label>
                  <input
                    id="input-letter-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Surat Rahasia Untuk Dipeluk..."
                    className="w-full bg-rose-50/25 border border-rose-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                {/* Draft text, with Cupid Meow AI embellisher layout */}
                <div className="relative">
                  <label className="block text-xs font-sans font-medium text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                    <span>Isi Surat Kucing</span>
                    <button
                      id="btn-ai-letter-assist"
                      type="button"
                      disabled={isAiLoading || !body}
                      onClick={handleAiAssist}
                      className="text-[10px] font-sans font-semibold text-rose-600 bg-rose-50 active:scale-95 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-100 flex items-center gap-1 transition-all"
                      title="Ubah draf tulisan sederhanamu menjadi surat cinta berbulu kucing romantis lewat bantuan Gemini AI!"
                    >
                      <Sparkles className="w-3 h-3 fill-rose-500 text-rose-500 animate-pulse" />
                      <span>{isAiLoading ? "Sedang Menghias meow..." : "Hias Menjadi Romantis meow!"}</span>
                    </button>
                  </label>
                  <textarea
                    id="input-letter-body"
                    required
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Tuliskan draf kasarmu di sini. Lalu klik tombol 'Hias Menjadi Romantis meow!' di atas untuk bantuan dandan surat puitis oleh Kucing AI!"
                    className="w-full bg-rose-50/15 border border-rose-100 px-4 py-3 rounded-2xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-rose-200 leading-relaxed scrollbar-thin"
                  />
                </div>

                {/* Locked Time controller */}
                <div id="unlock-date-controller" className="bg-amber-50/40 p-4 border border-amber-100 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      id="checkbox-lock-letter"
                      type="checkbox"
                      checked={hasUnlockDate}
                      onChange={(e) => setHasUnlockDate(e.target.checked)}
                      className="accent-amber-500 rounded cursor-pointer"
                    />
                    <label className="text-xs font-sans text-gray-700 font-medium cursor-pointer flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Kunci surat ini agar hanya bisa dibaca pada tanggal tertentu</span>
                    </label>
                  </div>
                  
                  {hasUnlockDate && (
                    <div className="flex items-center gap-2 pl-6">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <input
                        id="input-letter-unlock"
                        type="date"
                        required
                        value={unlockDate}
                        onChange={(e) => setUnlockDate(e.target.value)}
                        className="bg-white border border-amber-105 p-1 px-3 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Submission button */}
                <div className="flex justify-end pt-2">
                  <button
                    id="btn-save-letter"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-750 text-white font-semibold font-sans rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Mail className="w-4 h-4 fill-white" />
                    <span>{isSubmitting ? "Sedang Mengirim..." : "Kirim Masuk Kotak Pos Cinta"}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of existing letters - displayed like sweet vintage letters or envelopes */}
      <div id="envelopes-collection-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {props.letters.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-rose-100 p-8 shadow-sm">
            <span className="text-5xl">💌🐾</span>
            <h3 className="text-gray-800 font-semibold mt-4">Kotak surat masih kosong meow</h3>
            <p className="text-sm text-gray-500 mt-1">Saling kirimlah surat kasih sayang romantis pertama di meja menulis!</p>
          </div>
        ) : (
          props.letters.map((letter) => {
            const lockedState = isLetterLocked(letter);

            return (
              <motion.div
                key={letter.id}
                whileHover={{ scale: 1.03 }}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  lockedState
                    ? "bg-gradient-to-br from-amber-50/40 to-yellow-50/20 border-amber-205/60 text-amber-900"
                    : "bg-white hover:bg-rose-50/10 border-rose-100 text-gray-850"
                }`}
              >
                
                {/* Custom Overlay Delete */}
                {confirmDeleteId === letter.id && (
                  <div className="absolute inset-0 bg-stone-900/95 rounded-2xl z-20 flex flex-col items-center justify-center p-4 text-center transition-all">
                    <p className="text-white text-xs font-sans font-semibold mb-3">Hapus surat ini? 😿</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onDeleteLetter(letter.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs font-sans font-semibold shadow transition-all active:scale-95 cursor-pointer"
                      >
                        Hapus
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="px-3 py-1 bg-stone-700 hover:bg-[#444] text-stone-200 rounded text-xs font-sans transition-all active:scale-95 cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete button (accessible anytime for users) */}
                <button
                  id={`btn-delete-letter-${letter.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(letter.id);
                  }}
                  className="absolute top-3 right-3 text-gray-300 hover:text-rose-600 p-1 rounded-md transition-colors z-10 cursor-pointer"
                  title="Hapus surat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Envelope style seal decoration */}
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-rose-500/10 rounded-full select-none pointer-events-none"></div>

                {/* Meta header */}
                <div className="space-y-1.5 pb-2 border-b border-rose-50/60 select-none">
                  <div className="text-[10px] font-mono tracking-wider font-semibold text-rose-500 flex items-center gap-1.5 uppercase">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Dipesankan {formatDateStr(letter.createdAt)}</span>
                  </div>
                  <h3 className="font-sans font-bold text-gray-800 text-base leading-tight truncate">
                    {letter.title}
                  </h3>
                </div>

                {/* Envelope Sender tag lines */}
                <div className="py-4 space-y-1.5">
                  <div className="text-xs text-gray-500">
                    <span className="font-sans font-medium">Dari:</span>{" "}
                    <span className="font-sans font-semibold text-gray-700 bg-rose-50/60 p-1 px-2 rounded-lg text-[11px]">
                      🐱 {letter.sender}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-sans font-medium">Kepada:</span>{" "}
                    <span className="font-sans font-semibold text-gray-700 bg-rose-50/60 p-1 px-2 rounded-lg text-[11px]">
                      🎀 {letter.recipient}
                    </span>
                  </div>
                </div>

                {/* Unlock status info & Action button */}
                <div className="pt-3 border-t border-rose-50/60 flex items-center justify-between">
                  {lockedState ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold font-sans">
                      <Lock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>Kunci meow ({formatDateStr(letter.unlockDate!)})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium font-sans">
                      <Clock className="w-3.5 h-3.5 text-green-500" />
                      <span>Terbuka meow-selamanya</span>
                    </div>
                  )}

                  <button
                    id={`btn-open-letter-${letter.id}`}
                    disabled={lockedState}
                    onClick={() => setActiveLetter(letter)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      lockedState
                        ? "bg-gray-100 text-gray-400 border border-gray-200 count-lock cursor-not-allowed"
                        : "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200"
                    }`}
                  >
                    {lockedState ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Terkunci</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Baca Surat</span>
                      </>
                    )}
                  </button>
                </div>

              </motion.div>
            );
          })
        )}
      </div>

      {/* Render Active Opened Letter View Modal overlay */}
      <AnimatePresence>
        {activeLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLetter(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
          >
            {/* The stationary / letter pad illustration */}
            <motion.div
              initial={{ rotate: -1, scale: 0.95 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: 1, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()} // stop close on card click
              className="bg-[#faf8f5] shadow-2xl rounded-3xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto border-2 border-[#eee3d1] relative font-sans space-y-4 shadow-rose-100/40"
            >
              
              {/* Retro envelope stamp ornamentation */}
              <div className="absolute top-4 right-4 bg-rose-50 border border-dashed border-rose-300 rounded px-2.5 py-1.5 text-center text-xs font-mono rotate-12 rotate-[-5deg] opacity-70">
                <span className="block text-[8px] tracking-wider font-bold">MEOW EXPRESS</span>
                <span className="block text-[10px] text-rose-500 font-bold font-sans">PASPOR CINTA</span>
              </div>

              {/* Paw prints background watermark */}
              <div className="absolute bottom-4 left-4 text-6xl text-rose-100/40 select-none">🐾</div>

              {/* Close button */}
              <button
                id="btn-close-active-letter"
                onClick={() => setActiveLetter(null)}
                className="absolute top-4 left-4 text-xs font-sans font-semibold text-gray-500 hover:text-gray-800 bg-[#f3eae0] hover:bg-[#eadecc] px-2.5 py-1.5 rounded-lg transition-colors border border-[#e2d5c3]"
              >
                Tutup Sila
              </button>

              <div className="text-center pt-8 pb-4 space-y-1 select-none border-b border-[#e9decb]">
                <h4 className="text-gray-400 font-mono text-[10px] uppercase tracking-widest font-bold">Surat Kasih Sayang Terbuka</h4>
                <p className="text-[#a48e71] font-sans font-bold text-lg md:text-xl">{activeLetter.title}</p>
                <p className="text-xs text-gray-400 font-mono">Diposting pada {formatDateStr(activeLetter.createdAt)}</p>
              </div>

              {/* Letter Scroll content container */}
              <div className="py-4 font-sans text-stone-750 text-sm md:text-base leading-relaxed tracking-normal font-normal max-h-[40vh] overflow-y-auto scrollbar-thin overflow-x-hidden whitespace-pre-wrap select-text pr-2 min-h-[150px]">
                {activeLetter.body}
              </div>

              {/* Signature area */}
              <div className="pt-4 border-t border-[#e9decb] flex flex-col items-end pr-2 font-sans select-none">
                <p className="text-xs text-gray-400 font-normal italic">Dari segenap detak purr,</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-xl">🐾</span>
                  <span className="font-sans font-semibold text-[#8b7557] bg-[#f0e4d0]/60 p-1.5 px-3 rounded-xl border border-[#decfa2]/30">
                    {activeLetter.sender}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 italic mt-1 font-mono">Tertuju kepada: {activeLetter.recipient}</p>
              </div>

              <div className="flex justify-center select-none">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-300 animate-ping" />
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
