// Memeriksa pengurai alamat YouTube untuk video panduan.
import assert from "node:assert/strict";
import { youtubeId } from "../src/lib/tutorial.ts";
const id = "dQw4w9WgXcQ";
for (const u of [`https://www.youtube.com/watch?v=${id}`, `https://youtube.com/watch?feature=share&v=${id}`, `https://youtu.be/${id}?si=abc`, `https://www.youtube.com/shorts/${id}`, `https://youtube.com/shorts/${id}?feature=share`, `https://www.youtube.com/embed/${id}`, `https://m.youtube.com/watch?v=${id}&t=10s`, id])
  assert.equal(youtubeId(u), id, u);
for (const u of ["", "  ", "https://vimeo.com/123", "https://example.com/watch?v=abc"]) assert.equal(youtubeId(u), null, u);
console.log("PASS verify-panduan: pengurai alamat YouTube");
