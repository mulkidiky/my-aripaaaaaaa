var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_promises = __toESM(require("fs/promises"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var app = (0, import_express.default)();
var DEFAULT_PORT = Number(process.env.PORT) || 3e3;
var MAX_PORT_SEARCH = DEFAULT_PORT + 10;
var ai = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
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
var DB_DIR = import_path.default.join(process.cwd(), "data");
var DB_PATH = import_path.default.join(DB_DIR, "db.json");
var DEFAULT_DATA = {
  photos: [
    {
      id: "photo_1",
      url: "hug",
      // maps to local static illustration cat_couple_hug
      title: "Pertemuan Pertama Meow",
      date: "2025-02-14",
      description: "Hari pertama kita bertemu dan bernapas di bawah langit yang sama. Rasanya seperti semesta berbisik meow ke hati kita."
    },
    {
      id: "photo_2",
      url: "sunset",
      // maps to local static illustration cat_couple_sunset
      title: "Kencan Senja Romantis",
      date: "2025-04-10",
      description: "Menatap senja bersama di bukit bunga sakura. Menghitung kelopak yang jatuh, berjanji untuk terus bersama meow-selamanya."
    },
    {
      id: "photo_3",
      url: "moon",
      // maps to local static illustration cat_couple_moon
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
async function readDB() {
  try {
    await import_promises.default.mkdir(DB_DIR, { recursive: true });
    try {
      const data = await import_promises.default.readFile(DB_PATH, "utf-8");
      return JSON.parse(data);
    } catch {
      await import_promises.default.writeFile(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2), "utf-8");
      return DEFAULT_DATA;
    }
  } catch (error) {
    console.error("Error reading database file:", error);
    return DEFAULT_DATA;
  }
}
async function writeDB(data) {
  try {
    await import_promises.default.mkdir(DB_DIR, { recursive: true });
    await import_promises.default.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to database file:", error);
  }
}
function makeFallbackCatLetter(body, sender, recipient) {
  const catIntros = [
    `Meoww ${recipient}! \u2728`,
    `Untuk ${recipient} kesayanganku yang paling gemas, purr...`,
    `Halo ${recipient}, meow manis datang membawakan getaran cinta untukmu! \u{1F43E}`
  ];
  const catPuns = [
    `Dengkur nafasku selalu membisikkan namamu. Kamu adalah segalanya bagiku, purr-fect meow!`,
    `Cintaku padamu lebih lapang dari tempat bermain kucing tercanggih dan lebih lezat dari semangkuk penuh camilan tuna segar! \u{1F41F}`,
    `Aku berjanji meow-lindungi hatimu dengan seluruh cakarku, menjagamu tetap hangat di sampingku selamanya.`
  ];
  const catOutros = [
    `Peluk mesra dan meow hangat dari kucing manjamu,
${sender} \u{1F43E}`,
    `Selamanya meringkuk di sisimu,
${sender} \u2764\uFE0F`,
    `Dengkur kasih sayang tanpa batas,
${sender} (Meow!) \u{1F431}`
  ];
  const intro = catIntros[Math.floor(Math.random() * catIntros.length)];
  const pun = catPuns[Math.floor(Math.random() * catPuns.length)];
  const outro = catOutros[Math.floor(Math.random() * catOutros.length)];
  return `${intro}

${body}

${pun}

${outro}`;
}
async function startServer() {
  app.use(import_express.default.json({ limit: "25mb" }));
  app.get("/api/data", async (req, res) => {
    try {
      const data = await readDB();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
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
        date: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        description: description || ""
      };
      data.photos.unshift(newPhoto);
      await writeDB(data);
      res.status(201).json(newPhoto);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/photos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await readDB();
      data.photos = data.photos.filter((p) => p.id !== id);
      await writeDB(data);
      res.json({ success: true, message: "Foto berhasil dihapus meow!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await readDB();
      data.secretMessages = data.secretMessages.filter((m) => m.id !== id);
      await writeDB(data);
      res.json({ success: true, message: "Pesan rahasia dihapus!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
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
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        unlockDate: unlockDate || null
      };
      data.letters.unshift(newLetter);
      await writeDB(data);
      res.status(201).json(newLetter);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/letters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await readDB();
      data.letters = data.letters.filter((l) => l.id !== id);
      await writeDB(data);
      res.json({ success: true, message: "Surat kasih sayang berhasil dihapus!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/ai/suggest-letter", async (req, res) => {
    try {
      const { body, sender, recipient } = req.body;
      if (!body) {
        return res.status(400).json({ error: "Isi draf atau ide surat harus ada meow!" });
      }
      const cleanSender = sender || "Arifaa";
      const cleanRecipient = recipient || "Putri Sabilaah";
      if (!ai) {
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
    } catch (err) {
      console.error("Error in AI letter suggestion:", err);
      res.status(500).json({ error: err.message || "Gagal menghubungi meow AI. Menggunakan kekuatan meow dasar!" });
    }
  });
  app.get("/api/proxy-audio", async (req, res) => {
    const url = req.query.url;
    if (!url) {
      return res.status(400).send("Parameter url wajib diisi");
    }
    try {
      let targetUrl = url;
      if (targetUrl.includes(" ")) {
        targetUrl = targetUrl.replace(/ /g, "%20");
      }
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      };
      if (req.headers.range) {
        headers["range"] = req.headers.range;
      }
      const response = await fetch(targetUrl, { headers });
      res.status(response.status);
      const headersToCopy = [
        "content-type",
        "content-length",
        "content-range",
        "accept-ranges",
        "cache-control"
      ];
      headersToCopy.forEach((h) => {
        const value = response.headers.get(h);
        if (value) {
          res.setHeader(h, value);
        }
      });
      if (!res.getHeader("content-type")) {
        res.setHeader("content-type", "audio/mpeg");
      }
      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        res.end();
      }
    } catch (err) {
      console.error("Error in audio proxy route:", err);
      if (!res.headersSent) {
        res.status(500).send("Gagal meneruskan audio: " + err.message);
      }
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.use("/src/assets", import_express.default.static(import_path.default.join(process.cwd(), "src/assets")));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  for (let port = DEFAULT_PORT; port <= MAX_PORT_SEARCH; port++) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port, "0.0.0.0", () => resolve());
        server.on("error", reject);
      });
      console.log(`Server running on http://0.0.0.0:${port}`);
      break;
    } catch (err) {
      if (err && err.code === "EADDRINUSE" && port < MAX_PORT_SEARCH) {
        console.warn(`Port ${port} is in use, trying port ${port + 1}...`);
        continue;
      }
      console.error("Failed to start server:", err);
      process.exit(1);
    }
  }
}
startServer();
//# sourceMappingURL=server.cjs.map
