(() => {
  const root = (globalThis.Chatmask = globalThis.Chatmask || {});
  const consonants = "bcdfghjklmnpqrstvwxyz";
  const vowels = "aeiou";

  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    let a = seed;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function coverChar(char, rng) {
    if (/\s/.test(char)) return char;
    if (char === "·" || char === "-" || char === "—" || char === "/") return char;

    const useVowel = rng() < 0.38;
    const pool = useVowel ? vowels : consonants;
    const next = pool[Math.floor(rng() * pool.length)];
    return /[A-Z]/.test(char) ? next.toUpperCase() : next;
  }

  root.coverText = function coverText(id, original) {
    const source = original ?? "";
    const rng = mulberry32(hashString(String(id || "chat")));
    if (!source) {
      return Array.from({ length: 12 }, (_, i) =>
        coverChar(i % 6 === 5 ? " " : "x", rng)
      ).join("");
    }
    return Array.from(source, (char) => coverChar(char, rng)).join("");
  };
})();
