// Fetches the feeds in feeds.json and writes news.json. Needs Node 18+ and fast-xml-parser.
import { XMLParser } from "fast-xml-parser";
import fs from "fs";
const cfg = JSON.parse(fs.readFileSync("feeds.json", "utf8"));
const px = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
const arr = x => (x == null ? [] : Array.isArray(x) ? x : [x]);
const txt = x => String(typeof x === "object" && x ? x["#text"] ?? "" : x ?? "");
const strip = s => txt(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const get = async u => {
  const r = await fetch(u, { headers: { "user-agent": "DailyGrindBot/1.0" }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(r.status);
  return r.text();
};
function image(it) {
  for (const k of ["media:content", "media:thumbnail", "enclosure"]) {
    const f = arr(it[k])[0];
    if (f && f["@_url"] && (!f["@_type"] || String(f["@_type"]).startsWith("image"))) return f["@_url"];
  }
  const m = txt(it["content:encoded"] || it.description).match(/<img[^>]+src=["']([^"']+)/i);
  return m ? m[1] : "";
}
const stories = [], videos = [];
for (const f of cfg.feeds) {
  try {
    const d = px.parse(await get(f.url));
    for (const it of arr(d.rss?.channel?.item).slice(0, 25)) {
      const t = new Date(it.pubDate || Date.now()).getTime();
      if (!it.link || !it.title) continue;
      stories.push({ title: strip(it.title), summary: strip(it.description).slice(0, 220), link: txt(it.link), image: image(it), source: f.name, region: f.region, ts: t });
    }
  } catch (e) { console.error("feed failed:", f.name, e.message); }
}
for (const c of cfg.youtube) {
  try {
    const d = px.parse(await get("https://www.youtube.com/feeds/videos.xml?channel_id=" + c.channelId));
    for (const e of arr(d.feed?.entry).slice(0, 6)) videos.push({ id: e["yt:videoId"], title: strip(e.title), source: c.name, ts: new Date(e.published).getTime() });
  } catch (e) { console.error("channel failed:", c.name, e.message); }
}
stories.sort((a, b) => b.ts - a.ts); videos.sort((a, b) => b.ts - a.ts);
fs.writeFileSync("news.json", JSON.stringify({ updated: Date.now(), stories: stories.slice(0, 120), videos: videos.slice(0, 24) }));
console.log(stories.length, "stories,", videos.length, "videos");
