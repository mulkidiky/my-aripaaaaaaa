import React, { useState, useRef } from "react";
import { MemoryPhoto } from "../types";
import { Heart, Plus, Trash2, Camera, Calendar, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Import our beautiful local generated images
import catHugImg from "../assets/images/regenerated_image_1780907443816.jpg";
import catSunsetImg from "../assets/images/regenerated_image_1780907516732.jpg";
import catMoonImg from "../assets/images/regenerated_image_1780907599590.jpg";

const PRESET_IMAGES: Record<string, string> = {
  hug: catHugImg,
  sunset: catSunsetImg,
  moon: catMoonImg,
};

interface GalleryProps {
  photos: MemoryPhoto[];
  onAddPhoto: (photo: Omit<MemoryPhoto, "id">) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
}

export default function Gallery(props: GalleryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Image type selection: 'preset' | 'url' | 'upload'
  const [imageType, setImageType] = useState<"preset" | "url" | "upload">("preset");
  const [selectedPreset, setSelectedPreset] = useState("hug");
  const [customUrl, setCustomUrl] = useState("");
  const [uploadedBase64, setUploadedBase64] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manage file reading
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Sayang, mohon pilih file gambar ya meow! 🐱");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedBase64(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("Harap berikan nama untuk kenangan indah ini meow!");
      return;
    }

    let finalUrl = "";
    if (imageType === "preset") {
      finalUrl = selectedPreset; // store string key
    } else if (imageType === "url") {
      if (!customUrl) {
        alert("Harap masukkan URL foto meow!");
        return;
      }
      finalUrl = customUrl;
    } else {
      if (!uploadedBase64) {
        alert("Silakan unggah foto kamu terlebih dahulu!");
        return;
      }
      finalUrl = uploadedBase64;
    }

    setIsSubmitting(true);
    try {
      await props.onAddPhoto({
        url: finalUrl,
        title,
        date,
        description,
      });

      // Reset
      setTitle("");
      setDescription("");
      setCustomUrl("");
      setUploadedBase64("");
      setImageType("preset");
      setSelectedPreset("hug");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to resolve actual image source URL
  const resolveImageSource = (url: string) => {
    if (PRESET_IMAGES[url]) {
      return PRESET_IMAGES[url];
    }
    return url; // base64 or custom remote URL
  };

  return (
    <div id="gallery-module" className="my-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-2 mb-6 border-b border-rose-100 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-sans font-semibold text-gray-850 flex items-center gap-2">
            📸 Galeri Istimewa
          </h2>
          <p className="text-sm font-sans text-gray-500 font-normal">
            Potret manis Aripaa.
          </p>
        </div>
        <button
          id="btn-trigger-add-photo"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Potret Kenangan</span>
        </button>
      </div>

      {/* Add Memory Polaroid Modal/Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-rose-500/5 hover:bg-rose-500/[0.08] p-6 rounded-2xl border border-rose-100 shadow-inner mb-8"
          >
            <h3 className="text-lg font-sans font-semibold text-rose-700 mb-4 flex items-center gap-1.5">
              <Camera className="w-5 h-5" />
              <span>Simpan Foto Baru di Gallery Cinta</span>
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Form: Meta Details */}
              <div id="form-metadata-block" className="space-y-4">
                <div>
                  <label className="block text-xs font-sans font-medium text-gray-650 uppercase tracking-widest mb-1.5">
                    Judul Kenangan
                  </label>
                  <input
                    id="input-photo-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Piknik Pertama di Taman"
                    className="w-full bg-white px-4 py-2.5 rounded-xl border border-rose-105 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-gray-650 uppercase tracking-widest mb-1.5">
                    Tanggal Kejadian
                  </label>
                  <div className="relative">
                    <input
                      id="input-photo-date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white px-4 py-2.5 rounded-xl border border-rose-105 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                    <Calendar className="absolute right-3.5 top-3.5 w-4 h-4 text-rose-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-gray-650 uppercase tracking-widest mb-1.5">
                    Catatan Manis (Cerita Singkat)
                  </label>
                  <textarea
                    id="input-photo-description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan kisah lucu atau ungkapan cintamu di balik foto ini..."
                    className="w-full bg-white px-4 py-2.5 rounded-xl border border-rose-105 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              {/* Right Form: Image Sources */}
              <div id="form-image-block" className="space-y-4">
                <div>
                  <label className="block text-xs font-sans font-medium text-gray-650 uppercase tracking-widest mb-2">
                    Sumber Foto Cinta
                  </label>
                  <div className="flex bg-rose-100/60 p-1 rounded-xl gap-1">
                    <button
                      type="button"
                      onClick={() => setImageType("preset")}
                      className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${
                        imageType === "preset" ? "bg-white text-rose-600 shadow-sm" : "text-gray-550 hover:text-rose-500"
                      }`}
                    >
                      Kucing Lucu
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageType("upload")}
                      className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${
                        imageType === "upload" ? "bg-white text-rose-600 shadow-sm" : "text-gray-550 hover:text-rose-500"
                      }`}
                    >
                      Unggah File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageType("url")}
                      className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${
                        imageType === "url" ? "bg-white text-rose-600 shadow-sm" : "text-gray-550 hover:text-rose-500"
                      }`}
                    >
                      Input URL
                    </button>
                  </div>
                </div>

                {/* Preset Picker */}
                {imageType === "preset" && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 italic">Pilih ilustrasi kucing romantis yang kami buatkan khusus untukmu:</p>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedPreset("hug")}
                        className={`border rounded-xl p-1.5 overflow-hidden transition-all ${
                          selectedPreset === "hug" ? "border-rose-500 ring-2 ring-rose-200 bg-rose-50/50" : "border-gray-200 hover:border-rose-300"
                        }`}
                      >
                        <img src={catHugImg} alt="Hug" className="w-full h-16 object-cover rounded-md" referrerPolicy="no-referrer" />
                        <span className="block text-[10px] text-center mt-1 text-gray-650 font-sans truncate">Pelukan Meow</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPreset("sunset")}
                        className={`border rounded-xl p-1.5 overflow-hidden transition-all ${
                          selectedPreset === "sunset" ? "border-rose-500 ring-2 ring-rose-200 bg-rose-50/50" : "border-gray-200 hover:border-rose-300"
                        }`}
                      >
                        <img src={catSunsetImg} alt="Sunset" className="w-full h-16 object-cover rounded-md" referrerPolicy="no-referrer" />
                        <span className="block text-[10px] text-center mt-1 text-gray-650 font-sans truncate">Senja Sakura</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPreset("moon")}
                        className={`border rounded-xl p-1.5 overflow-hidden transition-all ${
                          selectedPreset === "moon" ? "border-rose-500 ring-2 ring-rose-200 bg-rose-50/50" : "border-gray-200 hover:border-rose-300"
                        }`}
                      >
                        <img src={catMoonImg} alt="Moon" className="w-full h-16 object-cover rounded-md" referrerPolicy="no-referrer" />
                        <span className="block text-[10px] text-center mt-1 text-gray-650 font-sans truncate">Bulan Impian</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* File Upload Area */}
                {imageType === "upload" && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                      dragOver ? "border-rose-500 bg-rose-50" : "border-rose-200 bg-white hover:border-rose-400"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {uploadedBase64 ? (
                      <div className="relative">
                        <img
                          src={uploadedBase64}
                          alt="Pratinjau"
                          className="max-h-24 object-contain rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedBase64("");
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-rose-550 text-white rounded-full p-1 shadow hover:bg-rose-650"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-rose-400 mb-1.5" />
                        <p className="text-xs font-sans text-gray-600 font-medium">
                          Seret & letakkan foto di sini, atau <span className="text-rose-500 underline">pilih file</span>
                        </p>
                        <p className="text-[10px] font-mono text-gray-400 mt-1">PNG, JPG, Up to 15MB</p>
                      </>
                    )}
                  </div>
                )}

                {/* Internet URL Input */}
                {imageType === "url" && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 italic">Masukkan URL publik gambar kenangan kalian:</p>
                    <input
                      id="input-photo-url"
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://contoh.com/foto-sayang.jpg"
                      className="w-full bg-white px-4 py-2.5 rounded-xl border border-rose-105 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                )}

                {/* Save button */}
                <div className="flex justify-end pt-2">
                  <button
                    id="btn-save-photo"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold font-sans text-sm rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>{isSubmitting ? "Sedang Menyimpan..." : "Sematkan di Album Cinta"}</span>
                  </button>
                </div>

              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photos Grid configured like retro Polaroids */}
      <div id="photos-polaroids-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {props.photos.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-rose-100 p-8 shadow-sm">
            <span className="text-5xl">🐱🔍</span>
            <h3 className="text-gray-800 font-semibold mt-4">Belum ada foto kenangan meow</h3>
            <p className="text-sm text-gray-500 mt-1">Ketuk tombol di atas untuk menyematkan foto pertama perjalanan romantis kalian!</p>
          </div>
        ) : (
          props.photos.map((photo, idx) => {
            // Apply slight random offset angle to make polaroids look casual and laid out physically
            const subtleRotations = ["-rotate-1", "-rotate-2", "rotate-1", "rotate-2", "rotate-3", "-rotate-3"];
            const rotationClass = subtleRotations[idx % subtleRotations.length];

            return (
              <motion.div
                key={photo.id}
                whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
                className={`bg-white rounded-t-sm rounded-b-md p-4 shadow-md border border-gray-100 ${rotationClass} transition-shadow duration-300 hover:shadow-xl relative group overflow-hidden`}
              >
                {/* Custom Overlay Delete Form */}
                {confirmDeleteId === photo.id && (
                  <div className="absolute inset-0 bg-stone-900/90 rounded-sm z-30 flex flex-col items-center justify-center p-3 text-center transition-all">
                    <p className="text-white text-xs font-sans font-semibold mb-3">Hapus foto kenangan ini? 😿</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onDeletePhoto(photo.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-sans font-bold shadow transition-all active:scale-95 cursor-pointer"
                      >
                        Ya, Hapus
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1 bg-stone-700 hover:bg-[#444] text-stone-200 rounded text-[10px] font-sans transition-all active:scale-95 cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* Trash delete button */}
                <button
                  id={`btn-delete-photo-${photo.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(photo.id);
                  }}
                  className="absolute top-2 right-2 bg-black/55 hover:bg-rose-600 text-white p-1.5 rounded-full z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 shadow cursor-pointer justify-center items-center flex"
                  title="Hapus foto ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Decorative Pin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-rose-200/50 rounded-sm shadow-sm backdrop-blur-[1px] rotate-11"></div>

                {/* Main Photo Frame */}
                <div className="aspect-[4/3] bg-gray-50 rounded-sm overflow-hidden border border-gray-100 flex items-center justify-center relative">
                  <img
                    src={resolveImageSource(photo.url)}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback if image link broken
                      e.currentTarget.src = "https://picsum.photos/seed/cutecat/400/300";
                    }}
                  />
                  
                  {/* Decorative Heart Overlay */}
                  <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/5 transition-colors flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white scale-0 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm pointer-events-none fill-rose-500 border-none" />
                  </div>
                </div>

                {/* Polaroid Bottom Title & Date in cute handwriting/vintage look */}
                <div className="pt-3.5 pb-2">
                  <div className="flex items-center justify-between gap-2.5">
                    <h4 className="font-sans font-semibold text-gray-800 text-base leading-tight truncate">
                      {photo.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-mono font-medium text-rose-500/80">
                    <Calendar className="w-3 h-3 text-rose-400" />
                    <span>{photo.date}</span>
                  </div>
                  {photo.description && (
                    <p className="mt-2 text-xs font-sans text-gray-500 leading-relaxed font-normal italic border-t border-rose-50/50 pt-1.5 bg-rose-50/10 p-1 rounded">
                      "{photo.description}"
                    </p>
                  )}
                </div>

              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
