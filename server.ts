import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
const PORT = 3000;

// Set up Gemini AI client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI loaded successfully in server.");
  } catch (err) {
    console.error("Failed to load Gemini AI:", err);
  }
} else {
  console.log("No GEMINI_API_KEY found, fallback to cute templates.");
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "db.json");

// Define defaults
const DEFAULT_DATA = {
  photos: [
    {
      id: "photo_1",
      url: "hug", // maps to local static illustration cat_couple_hug
      title: "Pertemuan Pertama Meow",
      date: "2025-02-14",
      description: "Hari pertama kita bertemu dan bernapas di bawah langit yang sama. Rasanya seperti semesta berbisik meow ke hati kita."
    },
    {
      id: "photo_2",
      url: "sunset", // maps to local static illustration cat_couple_sunset
      title: "Kencan Senja Romantis",
      date: "2025-04-10",
      description: "Menatap senja bersama di bukit bunga sakura. Menghitung kelopak yang jatuh, berjanji untuk terus bersama meow-selamanya."
    },
    {
      id: "photo_3",
      url: "moon", // maps to local static illustration cat_couple_moon
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
    },
    {
      id: "msg_4",
      catIcon: "stretching",
      message: "Setiap hari bersamamu rasanya seperti tidur siang di bawah hangatnya sinar matahari pagi. Nyaman sekali.",
      from: "Anak Kucing Manja"
    },
    {
      id: "msg_5",
      catIcon: "happy",
      message: "No meow-tter what happens, aku akan selalu ada di sampingmu untuk mengelus pipimu dan membuatmu tersenyum.",
      from: "Penjaga Hatimu"
    },
    {
      id: "msg_6",
      catIcon: "snuggling",
      message: "Kamu adalah rumahku. Tempat aku pulang, mendengkur puas, dan memejamkan mata dengan tenang bersamamu.",
      from: "Pasangan Kucingmu"
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
    },
    {
      id: "letter_2",
      title: "Cinta Sehangat Sinar Pagi",
      body: "Untuk pemilik senyum termanis,\n\nSeperti kucing yang paling malas menyukai sinar matahari pagi, begitulah aku menyukai keberadaanmu di hidupku. Bersamamu adalah kenyamanan terbesarku. Terima kasih sudah menerima keanehanku, manja-manjaku, dan selalu mengusap kepalaku dengan penuh kasih sayang.\n\nSurat ini bisa dibuka kapan saja untuk mengingatkanmu bahwa di sudut bumi mana pun aku berada, hatiku terkunci rapat hanya untukmu.\n\nDengan meow hangat,\nPuan Kucing",
      sender: "Puan Kucing",
      recipient: "Tuan Kucing",
      createdAt: "2026-06-08T07:45:30Z",
      unlockDate: null
    }
  ]
};

// Ensure database helper
async function readDB() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      const data = await fs.readFile(DB_PATH, "utf-8");
      return JSON.parse(data);
    } catch {
      await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2), "utf-8");
      return DEFAULT_DATA;
    }
  } catch (error) {
    console.error("Error reading database file:", error);
    return DEFAULT_DATA;
  }
}

async function writeDB(data: any) {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to database file:", error);
  }
}

// Fallback letter generator when Gemini API is busy or unconfigured
function makeFallbackCatLetter(body: string, sender: string, recipient: string): string {
  const catIntros = [
    `Meoww ${recipient}! ✨`,
    `Untuk ${recipient} kesayanganku yang paling gemas, purr...`,
    `Halo ${recipient}, meow manis datang membawakan getaran cinta untukmu! 🐾`
  ];
  const catPuns = [
    `Dengkur nafasku selalu membisikkan namamu. Kamu adalah segalanya bagiku, purr-fect meow!`,
    `Cintaku padamu lebih lapang dari tempat bermain kucing tercanggih dan lebih lezat dari semangkuk penuh camilan tuna segar! 🐟`,
    `Aku berjanji meow-lindungi hatimu dengan seluruh cakarku, menjagamu tetap hangat di sampingku selamanya.`
  ];
  const catOutros = [
    `Peluk mesra dan meow hangat dari kucing manjamu,\n${sender} 🐾`,
    `Selamanya meringkuk di sisimu,\n${sender} ❤️`,
    `Dengkur kasih sayang tanpa batas,\n${sender} (Meow!) 🐱`
  ];

  const intro = catIntros[Math.floor(Math.random() * catIntros.length)];
  const pun = catPuns[Math.floor(Math.random() * catPuns.length)];
  const outro = catOutros[Math.floor(Math.random() * catOutros.length)];

  return `${intro}\n\n${body}\n\n${pun}\n\n${outro}`;
}

async function startServer() {
  // Support request body limits for base64 photo uploads
  app.use(express.json({ limit: "25mb" }));

  // API: Get all memory data
  app.get("/api/data", async (req, res) => {
    try {
      const data = await readDB();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Add Photo
  app.post("/api/photos", async (req, res) => {
    try {
      const { url, title, date, description } = req.body;
      if (!url || !title) {
        return res.status(400).json({ error: "URL dan Judul foto wajib diisi meow!" });
      }
      const data = await readDB();
      const newPhoto = {
        id: `photo_${Date.now()}`,
        url,
        title,
        date: date || new Date().toISOString().split("T")[0],
        description: description || ""
      };
      data.photos.unshift(newPhoto); // Add to beginning
      await writeDB(data);
      res.status(201).json(newPhoto);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Delete Photo
  app.delete("/api/photos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await readDB();
      data.photos = data.photos.filter((p: any) => p.id !== id);
      await writeDB(data);
      res.json({ success: true, message: "Foto berhasil dihapus meow!" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Add Secret Message
  app.post("/api/messages", async (req, res) => {
    try {
      const { catIcon, message, from } = req.body;
      if (!message || !from) {
        return res.status(400).json({ error: "Pesan dan pengirim wajib diisi meow!" });
      }
      const data = await readDB();
      const icons = ["sleeping", "winking", "love_eyes", "stretching", "happy", "snuggling"];
      const selectedIcon = icons.includes(catIcon) ? catIcon : "love_eyes";

      const newMessage = {
        id: `msg_${Date.now()}`,
        catIcon: selectedIcon,
        message,
        from
      };
      data.secretMessages.push(newMessage);
      await writeDB(data);
      res.status(201).json(newMessage);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Delete Secret Message
  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await readDB();
      data.secretMessages = data.secretMessages.filter((m: any) => m.id !== id);
      await writeDB(data);
      res.json({ success: true, message: "Pesan rahasia dihapus!" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Add Letter
  app.post("/api/letters", async (req, res) => {
    try {
      const { title, body, sender, recipient, unlockDate } = req.body;
      if (!title || !body || !sender || !recipient) {
        return res.status(400).json({ error: "Judul, isi surat, pengirim, dan penerima wajib diisi meow!" });
      }
      const data = await readDB();
      const newLetter = {
        id: `letter_${Date.now()}`,
        title,
        body,
        sender,
        recipient,
        createdAt: new Date().toISOString(),
        unlockDate: unlockDate || null
      };
      data.letters.unshift(newLetter);
      await writeDB(data);
      res.status(201).json(newLetter);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Delete Letter
  app.delete("/api/letters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await readDB();
      data.letters = data.letters.filter((l: any) => l.id !== id);
      await writeDB(data);
      res.json({ success: true, message: "Surat kasih sayang berhasil dihapus!" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Gemini letter helper (Cupid Meow AI)
  app.post("/api/ai/suggest-letter", async (req, res) => {
    try {
      const { body, sender, recipient } = req.body;
      if (!body) {
        return res.status(400).json({ error: "Isi draf atau ide surat harus ada meow!" });
      }

      const cleanSender = sender || "Tuan Kucing";
      const cleanRecipient = recipient || "Puan Kucing";

      if (!ai) {
        // Fallback generator
        const fallbackText = makeFallbackCatLetter(body, cleanSender, cleanRecipient);
        return res.json({ text: fallbackText, isFallback: true });
      }

      const prompt = `Kamu adalah asisten kucing romantis (Cupid Meow). Tugasmu adalah mengubah pesan, draf surat, atau ide surat kasih sayang menjadi surat cinta yang sangat manis, hangat, romantis, dipenuhi dengan unsur bertema kucing lucu, dengkuran (purring), cakaran pelindung, kata-kata indah bertema kucing seperti "meow-ntai cinta", "purr-fect", "meringkuk manis", "berselimut cinta bulu hangat", dll dalam bahasa Indonesia.
Target pembaca adalah pasangan sang penulis.

Draf / Keinginan penulis: "${body}"
Pengirim: "${cleanSender}"
Penerima: "${cleanRecipient}"
Gaya: Romantis, lucu, ramah kucing, menyentuh hati, penyayang, penuh metafora kucing manis.

Berikan hasilnya dalam bentuk surat cinta yang utuh, mengalir indah, ramah, puitis namun tetap lucu dan menggemaskan. Jangan tambahkan penjelasan pembuka atau penjelasan penutup lainnya di luar surat tersebut. Mulai langsung dari sapaan manis (misal "Sayangku...") dan akhiri dengan salam penutup hangat atau tanda sayang (misalnya meow cinta).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.9,
          systemInstruction: "You are Cupid Meow, an expert romantic cat love guru creating cute cat themed letters in Indonesian."
        }
      });

      const textOutput = response.text || makeFallbackCatLetter(body, cleanSender, cleanRecipient);
      res.json({ text: textOutput, isFallback: false });

    } catch (err: any) {
      console.error("Error in AI letter suggestion:", err);
      res.status(500).json({ error: err.message || "Gagal menghubungi meow AI. Menggunakan kekuatan meow dasar!" });
    }
  });

  // API: Proxy Audio to resolve CORS and referrer-block issues
  app.get("/api/proxy-audio", async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).send("Parameter url wajib diisi");
    }
    try {
      let targetUrl = url;
      if (targetUrl.includes(" ")) {
        targetUrl = targetUrl.replace(/ /g, "%20");
      }
      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      };

      // Forward range requests to support audio scrubbers/seeking
      if (req.headers.range) {
        headers["range"] = req.headers.range;
      }

      const response = await fetch(targetUrl, { headers });
      
      // Set the response status code
      res.status(response.status);

      // Copy response headers back
      const headersToCopy = [
        "content-type",
        "content-length",
        "content-range",
        "accept-ranges",
        "cache-control",
      ];

      headersToCopy.forEach(h => {
        const value = response.headers.get(h);
        if (value) {
          res.setHeader(h, value);
        }
      });

      if (!res.getHeader("content-type")) {
        res.setHeader("content-type", "audio/mpeg");
      }

      if (response.body) {
        const reader = (response.body as any).getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        res.end();
      }
    } catch (err: any) {
      console.error("Error in audio proxy route:", err);
      if (!res.headersSent) {
        res.status(500).send("Gagal meneruskan audio: " + err.message);
      }
    }
  });

  // Configure Vite or Static Assets handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve static files such as custom uploaded images or generated images in the src/assets
    app.use("/src/assets", express.static(path.join(process.cwd(), "src/assets")));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
