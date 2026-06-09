import React, { useState } from "react";
import { SecretMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Smile, Send, Trash2, Heart, Lock, Key, Sparkles } from "lucide-react";

interface SecretMessagesProps {
  messages: SecretMessage[];
  onAddMessage: (msg: Omit<SecretMessage, "id">) => Promise<void>;
  onDeleteMessage: (id: string) => Promise<void>;
}

export default function SecretMessages(props: SecretMessagesProps) {
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [fromName, setFromName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<SecretMessage["catIcon"]>("sleeping");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Particles state for click feedback
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Sound effect generator for "cue-meow"
  const playMeowSound = (freq: number = 800) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      // Meow pitch curves upwards rapidly
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.1, audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {}
  };

  const handleReveal = (id: string, e: React.MouseEvent) => {
    if (revealedIds.includes(id)) return; // already revealed
    
    // Play sweet cat sound chirp
    playMeowSound(850 + Math.random() * 200);

    // Add heart particles
    const rect = e.currentTarget.getBoundingClientRect();
    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: e.clientX - rect.left + (Math.random() * 40 - 20),
      y: e.clientY - rect.top + (Math.random() * 20 - 40),
    }));

    setParticles((prev) => [...prev, ...newParticles]);
    setRevealedIds((prev) => [...prev, id]);

    // Clear particle after animation
    setTimeout(() => {
      setParticles([]);
    }, 2000);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage || !fromName) {
      alert("Isi pesan cinta dan pengirimnya meow! 🐾");
      return;
    }
    setIsSubmitting(true);
    try {
      await props.onAddMessage({
        message: newMessage,
        from: fromName,
        catIcon: selectedIcon,
      });
      setNewMessage("");
      setFromName("");
      setSelectedIcon("sleeping");
      setShowForm(false);
      playMeowSound(1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const catVisuals = {
    sleeping: { emoji: "💤🐱", label: "Kucing Bobo", color: "bg-purple-100 hover:bg-purple-150 border-purple-250 text-purple-600" },
    winking: { emoji: "😉🐱", label: "Meow Genit", color: "bg-blue-100 hover:bg-blue-150 border-blue-250 text-blue-600" },
    love_eyes: { emoji: "😍🐱", label: "Mata Cinta", color: "bg-rose-100 hover:bg-rose-150 border-rose-250 text-rose-600" },
    stretching: { emoji: "🥱🐱", label: "Geliat Manja", color: "bg-amber-100 hover:bg-amber-150 border-amber-250 text-amber-700" },
    happy: { emoji: "😺🐱", label: "Meow Happy", color: "bg-green-100 hover:bg-green-150 border-green-250 text-green-700" },
    snuggling: { emoji: "🤗🐱", label: "Peluk Hangat", color: "bg-orange-100 hover:bg-orange-150 border-orange-250 text-orange-700" },
  };

  return (
    <div id="secret-messages-module" className="my-10 bg-gradient-to-br from-rose-50/40 to-amber-50/20 p-6 rounded-3xl border border-rose-100/60 shadow-sm relative overflow-hidden">
      
      {/* Decorative illustrations background */}
      <div className="absolute -bottom-6 -right-6 text-7xl opacity-8 select-none pointer-events-none">🐾</div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 pb-4 mb-6 relative z-10">
        <div>
          <h2 className="text-2xl font-sans font-semibold text-gray-850 flex items-center gap-2">
            💌 Pesan Cinta Tersembunyi
          </h2>
          <p className="text-sm font-sans text-gray-500 font-normal">
            Sebuah Pesan 
          </p>
        </div>
        <button
          id="btn-trigger-add-message"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs border border-amber-500 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Sembunyikan Pesan Baru</span>
        </button>
      </div>

      {/* Add Secret Message Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white/90 backdrop-blur-sm p-5 border border-amber-200/50 rounded-2xl mb-6 shadow-sm relative z-10"
          >
            <h3 className="text-sm font-sans font-semibold text-amber-700 mb-3 flex items-center gap-1">
              <Key className="w-4 h-4" />
              <span>Sembunyikan Surat Rahasia</span>
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                    Nama/Julukan Kucingmu (Pengirim)
                  </label>
                  <input
                    id="input-msg-from"
                    type="text"
                    required
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Contoh: Kucing Manjamu"
                    className="w-full bg-orange-50/20 px-3 py-2 rounded-lg border border-amber-100 text-sm focus:outline-none focus:ring-1.5 focus:ring-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                    Gaya Kucing Penjaga Pesan
                  </label>
                  <select
                    id="select-msg-icon"
                    value={selectedIcon}
                    onChange={(e) => setSelectedIcon(e.target.value as any)}
                    className="w-full bg-orange-50/20 px-3 py-2 rounded-lg border border-amber-105 text-sm font-sans focus:outline-none focus:ring-1.5 focus:ring-amber-300"
                  >
                    {Object.entries(catVisuals).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.emoji} {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                  Isi Pesan Rahasia Manis
                </label>
                <textarea
                  id="input-msg-body"
                  required
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tuliskan kata sayang tersembunyi... (misal: Aku bersyukur memilikimu, meow-ntai cinta pertamaku!)"
                  className="w-full bg-orange-50/20 px-3 py-2 rounded-lg border border-amber-100 text-sm focus:outline-none focus:ring-1.5 focus:ring-amber-300"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  id="btn-save-message"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-sans text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kunci Pesan meow!</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secrets Grid */}
      <div id="secrets-cushions-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 relative z-10">
        {props.messages.map((msg, index) => {
          const isRevealed = revealedIds.includes(msg.id);
          const iconConfig = catVisuals[msg.catIcon] || catVisuals.sleeping;

          return (
            <div key={msg.id} className="relative group">
              <motion.div
                id={`secret-card-${msg.id}`}
                onClick={(e) => handleReveal(msg.id, e)}
                whileHover={{ scale: isRevealed ? 1.02 : 1.06 }}
                whileTap={{ scale: 0.95 }}
                className={`cursor-pointer aspect-square rounded-2xl flex flex-col items-center justify-center border p-4 shadow-sm text-center transition-all duration-300 relative overflow-hidden ${
                  isRevealed
                    ? "bg-white border-rose-100 text-gray-800"
                    : `${iconConfig.color} border-dashed border-2 animate-pulse`
                }`}
                style={{ animationDuration: isRevealed ? "0s" : "3s", animationDelay: `${index * 0.25}s` }}
              >
                
                {/* Custom Overlay Delete */}
                {confirmDeleteId === msg.id && (
                  <div className="absolute inset-0 bg-stone-900/90 rounded-2xl z-30 flex flex-col items-center justify-center p-2 text-center transition-all">
                    <p className="text-white text-[11px] font-sans font-semibold mb-2">Hapus pesan? 😿</p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onDeleteMessage(msg.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-[9px] font-sans font-bold shadow transition-all active:scale-95 cursor-pointer"
                      >
                        Hapus
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="px-2 py-0.5 bg-stone-700 hover:bg-[#444] text-stone-200 rounded text-[9px] font-sans transition-all active:scale-95 cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Micro heart explosion inside cell */}
                {isRevealed && particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ scale: 0.5, opacity: 1, x: 0, y: 0 }}
                    animate={{ scale: [0.5, 1.2, 0], opacity: [1, 1, 0], x: p.x * 0.8, y: p.y * 1.5 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute text-rose-500 drop-shadow-sm pointer-events-none text-sm"
                  >
                    ❤️
                  </motion.div>
                ))}

                {/* Display Cat Expression or Message */}
                <AnimatePresence mode="wait">
                  {!isRevealed ? (
                    <motion.div
                      key="locked"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span className="text-3xl select-none" role="img" aria-label="Sleeping cat">
                        {iconConfig.emoji}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold block mt-1">
                        🔒 KETUK MEOW
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="revealed"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col justify-between h-full w-full"
                    >
                      <div className="flex-1 flex items-center justify-center p-1 overflow-y-auto">
                        <p className="text-xs font-sans text-gray-800 leading-normal font-medium italic">
                          "{msg.message}"
                        </p>
                      </div>

                      <div className="border-t border-rose-50/60 pt-1.5 mt-1 flex items-center justify-between select-none">
                        <span className="text-[10px] font-sans font-semibold text-rose-500 truncate">
                          🐱 {msg.from}
                        </span>
                        
                        <button
                          id={`btn-delete-msg-${msg.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(msg.id);
                          }}
                          className="text-gray-350 hover:text-rose-600 p-0.5 rounded transition-colors"
                          title="Hapus pesan"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sparkling icon hover ornament */}
                {!isRevealed && (
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-3 h-3 text-amber-500 animate-bounce" />
                  </div>
                )}

              </motion.div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
