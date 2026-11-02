// İZLENEBİLİRLİK RAPORU
//
// Amaç: PDF'teki HER gereksinimin (kabul kriteri, test senaryosu, işlevsel olmayan
// gereksinim, ders sorumlusu beklentisi) durumunu tek tabloda göstermek:
// Başarılı / Başarısız / Test edilmedi  (PDF Bölüm 7'deki üç durum).
//
// TEMEL İLKE: Rapor TEST listesinden değil, GEREKSİNİM listesinden başlar.
// Test listesinden başlasaydık, hiç testi olmayan bir kriter raporda hiç görünmezdi
// ve "her şey yeşil" gibi yanıltıcı bir tablo elde ederdik.
//
// Kullanım:
//   npx playwright test                      → test-results/results.json üretilir
//   node scripts/traceability.mjs            → docs/TRACEABILITY.md üretilir
//   node scripts/traceability.mjs --strict   → otomatik bir madde Başarısız veya
//                                               Test edilmedi ise çıkış kodu 1 (CI kapısı)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = {
  gereksinimler: path.join(ROOT, 'traceability', 'requirements.json'),
  elleSonuclar: path.join(ROOT, 'traceability', 'manual-results.json'),
  playwrightJson: path.join(ROOT, 'test-results', 'results.json'),
  cikti: path.join(ROOT, 'docs', 'TRACEABILITY.md'),
};
const STRICT = process.argv.includes('--strict');

const DURUM = {
  BASARILI: 'Başarılı',
  KARARSIZ: 'Başarılı (kararsız)',
  BASARISIZ: 'Başarısız',
  TEST_EDILMEDI: 'Test edilmedi',
  KAPSAM_DISI: 'Kapsam dışı',
};
const IKON = {
  [DURUM.BASARILI]: '✅',
  [DURUM.KARARSIZ]: '⚠️',
  [DURUM.BASARISIZ]: '❌',
  [DURUM.TEST_EDILMEDI]: '⏳',
  [DURUM.KAPSAM_DISI]: '➖',
};

// Gereksinim etiketi biçimleri. US-xx ve P1/P2/P3 etiketleri gruplama içindir,
// gereksinim değildir; bu yüzden "bilinmeyen etiket" kontrolüne girmezler.
const GEREKSINIM_ETIKETI = /^(AC-\d{2}\.\d+|T\d+|NFR-\d+|DS-\d+|VM-\d+)$/;

const readJson = (p) => JSON.parse(readFileSync(p, 'utf-8'));

// ---------------------------------------------------------------------------
// 1) Playwright JSON raporunu oku ve düzleştir
// ---------------------------------------------------------------------------
// Rapor ağaç yapısındadır:
//   suite (dosya) → suite (describe) → spec (tek bir test() çağrısı)
//     → tests[]   : spec'in HER PROJEDEKİ koşusu (chromium, webkit, mobil...)
//       → results[]: her DENEME (retry) için bir sonuç
// Her koşunun özet durumu dört değerden biridir:
//   expected   → beklendiği gibi geçti
//   unexpected → düştü
//   flaky      → önce düştü, yeniden denemede geçti
//   skipped    → atlandı (test.skip / test.fixme)

function spectleriTopla(suite, dosya, birikim) {
  const buDosya = suite.file ?? dosya;
  for (const spec of suite.specs ?? []) birikim.push({ ...spec, file: spec.file ?? buDosya });
  for (const alt of suite.suites ?? []) spectleriTopla(alt, buDosya, birikim);
  return birikim;
}

// Aynı test() çağrısı, proje başına AYRI bir spec kaydı olarak gelebilir
// (özellikle describe dışındaki testlerde). Bunları tek kayıtta birleştirmezsek
// testler çift sayılır. Anahtar: dosya + satır + sütun + BAŞLIK.
// Başlık şart: veri güdümlü testler (for döngüsü) aynı satırda ama farklı başlıktadır.
function specleriBirlestir(specler) {
  const harita = new Map();
  for (const spec of specler) {
    const anahtar = `${spec.file}:${spec.line}:${spec.column}:${spec.title}`;
    const mevcut = harita.get(anahtar);
    if (mevcut) mevcut.tests.push(...(spec.tests ?? []));
    else harita.set(anahtar, { ...spec, tests: [...(spec.tests ?? [])] });
  }
  return [...harita.values()];
}

function etiketleriAl(spec) {
  // JSON raporunda etiketler "@" olmadan gelir; yine de iki biçime de dayanıklı olalım.
  const etiketler = new Set((spec.tags ?? []).map((t) => t.replace(/^@/, '')));
  // Eski yöntem: etiket başlığa yazılmış olabilir ("... @AC-01.1").
  for (const m of spec.title.matchAll(/@([\w.-]+)/g)) etiketler.add(m[1]);
  return [...etiketler];
}

function playwrightKosulariniOku() {
  if (!existsSync(PATHS.playwrightJson)) {
    console.warn(`⚠️  ${path.relative(ROOT, PATHS.playwrightJson)} bulunamadı.`);
    console.warn('   Önce "npx playwright test" çalıştır. Şimdilik tüm otomatik maddeler "Test edilmedi" görünecek.\n');
    return { kosular: new Map(), bagsizTestler: [], bilinmeyenEtiketler: new Map() };
  }

  const rapor = readJson(PATHS.playwrightJson);
  const specler = specleriBirlestir((rapor.suites ?? []).flatMap((s) => spectleriTopla(s, s.file, [])));

  const kosular = new Map();             // gereksinim kodu → [{ baslik, dosya, proje, durum }]
  const bagsizTestler = [];              // hiçbir gereksinime bağlı olmayan testler
  const bilinmeyenEtiketler = new Map(); // etiket → [test başlıkları]

  for (const spec of specler) {
    const gereksinimEtiketleri = etiketleriAl(spec).filter((e) => GEREKSINIM_ETIKETI.test(e));
    if (gereksinimEtiketleri.length === 0) {
      bagsizTestler.push(`${spec.file} › ${spec.title}`);
      continue;
    }
    for (const etiket of gereksinimEtiketleri) {
      if (!kosular.has(etiket)) kosular.set(etiket, []);
      for (const test of spec.tests ?? []) {
        kosular.get(etiket).push({
          baslik: spec.title,
          dosya: spec.file,
          proje: test.projectName || '(proje yok)',
          durum: test.status,
        });
      }
    }
  }
  return { kosular, bagsizTestler, bilinmeyenEtiketler };
}

// ---------------------------------------------------------------------------
// 2) Bir gereksinimin koşularını TEK sonuca indirge
// ---------------------------------------------------------------------------
// "En zayıf halka" ilkesi: kriter, en kötü koşusu kadar sağlamdır.
// Safari'de çalışmayan bir özellik, kullanıcı için çalışmıyor demektir.
function otomatikDurum(kosular) {
  if (kosular.length === 0) return DURUM.TEST_EDILMEDI;
  if (kosular.some((k) => k.durum === 'unexpected')) return DURUM.BASARISIZ;

  // Bilerek atlanan koşular sonucu etkilemez (ör. a11y testi yalnızca chromium'da çalışır).
  const calisan = kosular.filter((k) => k.durum !== 'skipped');
  if (calisan.length === 0) return DURUM.TEST_EDILMEDI; // hepsi atlandıysa kanıt yok

  // Kararsız test gizlenmez: geçmiş sayılır ama işaretlenir, kök nedeni araştırılmalıdır.
  if (calisan.some((k) => k.durum === 'flaky')) return DURUM.KARARSIZ;
  return DURUM.BASARILI;
}

function elleDurum(kod, elleKayitlari) {
  const kayit = elleKayitlari[kod];
  if (!kayit) return { durum: DURUM.TEST_EDILMEDI };
  if (kayit.sonuc !== DURUM.BASARILI && kayit.sonuc !== DURUM.BASARISIZ) {
    console.warn(`⚠️  manual-results.json: ${kod} için geçersiz sonuç "${kayit.sonuc}" (Başarılı | Başarısız olmalı)`);
    return { durum: DURUM.TEST_EDILMEDI };
  }
  return { durum: kayit.sonuc, kayit };
}

// ---------------------------------------------------------------------------
// 3) Raporu üret
// ---------------------------------------------------------------------------
const hucre = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

function main() {
  const { gruplar, gereksinimler, kaynak } = readJson(PATHS.gereksinimler);
  const elleKayitlari = existsSync(PATHS.elleSonuclar) ? readJson(PATHS.elleSonuclar).sonuclar ?? {} : {};
  const { kosular, bagsizTestler, bilinmeyenEtiketler } = playwrightKosulariniOku();

  // Geri yönlü izlenebilirlik: testte kullanılan ama listede olmayan etiketler (yazım hatası?)
  const bilinenKodlar = new Set(gereksinimler.map((g) => g.kod));
  for (const [etiket, liste] of kosular) {
    if (!bilinenKodlar.has(etiket)) bilinmeyenEtiketler.set(etiket, [...new Set(liste.map((k) => k.baslik))]);
  }

  // Her gereksinim için sonucu hesapla
  const satirlar = gereksinimler.map((g) => {
    const ilgili = kosular.get(g.kod) ?? [];
    let durum;
    let ekNot = g.not ?? '';
    if (g.yontem === 'kapsam-disi') {
      durum = DURUM.KAPSAM_DISI;
    } else if (g.yontem === 'elle') {
      const sonuc = elleDurum(g.kod, elleKayitlari);
      durum = sonuc.durum;
      if (sonuc.kayit) ekNot = `${sonuc.kayit.kontrolEden ?? '?'}, ${sonuc.kayit.tarih ?? '?'}: ${sonuc.kayit.not ?? ''}`;
    } else {
      durum = otomatikDurum(ilgili);
    }
    const testSayisi = new Set(ilgili.map((k) => `${k.dosya}›${k.baslik}`)).size;
    return { ...g, durum, ekNot, testSayisi, kosuSayisi: ilgili.length, ilgili };
  });

  // Özet sayımlar
  const say = (liste) => {
    const s = Object.fromEntries(Object.values(DURUM).map((d) => [d, 0]));
    for (const r of liste) s[r.durum]++;
    return s;
  };
  const genel = say(satirlar);
  const basariliToplam = genel[DURUM.BASARILI] + genel[DURUM.KARARSIZ];

  // ----- Markdown -----
  const md = [];
  md.push('# İzlenebilirlik Raporu', '');
  md.push(`Kaynak: ${kaynak}  `);
  md.push(`Oluşturulma: ${new Date().toLocaleString('tr-TR')}  `);
  md.push(`Toplam madde: ${satirlar.length}`, '');
  md.push('## Özet', '');
  md.push('| Grup | Başarılı | Başarısız | Test edilmedi | Kapsam dışı |', '|---|---|---|---|---|');
  for (const grup of gruplar) {
    const s = say(satirlar.filter((r) => r.grup === grup.kod));
    const kararsizNotu = s[DURUM.KARARSIZ] ? ` (${s[DURUM.KARARSIZ]} kararsız)` : '';
    md.push(`| ${grup.kod} ${hucre(grup.baslik)} | ${s[DURUM.BASARILI] + s[DURUM.KARARSIZ]}${kararsizNotu} | ${s[DURUM.BASARISIZ]} | ${s[DURUM.TEST_EDILMEDI]} | ${s[DURUM.KAPSAM_DISI]} |`);
  }
  md.push(`| **Toplam** | **${basariliToplam}** | **${genel[DURUM.BASARISIZ]}** | **${genel[DURUM.TEST_EDILMEDI]}** | **${genel[DURUM.KAPSAM_DISI]}** |`, '');

  md.push('## Ayrıntı', '');
  for (const grup of gruplar) {
    const oncelik = grup.oncelik ? ` (${grup.oncelik})` : '';
    md.push(`### ${grup.kod} ${grup.baslik}${oncelik}`, '');
    md.push('| Kod | Gereksinim | Yöntem | Test / koşu | Sonuç | Not |', '|---|---|---|---|---|---|');
    for (const r of satirlar.filter((x) => x.grup === grup.kod)) {
      const testKosu = r.yontem === 'otomatik' ? `${r.testSayisi} / ${r.kosuSayisi}` : '—';
      md.push(`| ${r.kod} | ${hucre(r.metin)} | ${r.yontem} | ${testKosu} | ${IKON[r.durum]} ${r.durum} | ${hucre(r.ekNot)} |`);
    }
    md.push('');
  }

  // Başarısızlar: hangi test, hangi projede düştü? (hata ayıklamaya başlangıç noktası)
  const basarisizlar = satirlar.filter((r) => r.durum === DURUM.BASARISIZ && r.yontem === 'otomatik');
  if (basarisizlar.length) {
    md.push('## Başarısız maddelerin ayrıntısı', '');
    for (const r of basarisizlar) {
      md.push(`**${r.kod}**: ${r.metin}`, '');
      const dusenler = new Map();
      for (const k of r.ilgili.filter((x) => x.durum === 'unexpected')) {
        const anahtar = `${k.dosya} › ${k.baslik}`;
        if (!dusenler.has(anahtar)) dusenler.set(anahtar, []);
        dusenler.get(anahtar).push(k.proje);
      }
      for (const [test, projeler] of dusenler) md.push(`- ${test} → ${projeler.join(', ')}`);
      md.push('');
    }
  }

  // Uyarılar: izlenebilirlik zincirindeki kopukluklar
  if (bilinmeyenEtiketler.size || bagsizTestler.length) {
    md.push('## Uyarılar', '');
    for (const [etiket, testler] of bilinmeyenEtiketler) {
      md.push(`- Bilinmeyen etiket \`@${etiket}\` (gereksinim listesinde yok, yazım hatası olabilir): ${testler.join('; ')}`);
    }
    for (const t of bagsizTestler) md.push(`- Hiçbir gereksinime bağlı olmayan test: ${t}`);
    md.push('');
  }

  mkdirSync(path.dirname(PATHS.cikti), { recursive: true });
  writeFileSync(PATHS.cikti, md.join('\n'), 'utf-8');

  // ----- Konsol özeti -----
  console.log(`İzlenebilirlik: ${satirlar.length} madde`);
  console.log(`  ✅ Başarılı      : ${basariliToplam}${genel[DURUM.KARARSIZ] ? ` (${genel[DURUM.KARARSIZ]} kararsız)` : ''}`);
  console.log(`  ❌ Başarısız     : ${genel[DURUM.BASARISIZ]}`);
  console.log(`  ⏳ Test edilmedi : ${genel[DURUM.TEST_EDILMEDI]}`);
  console.log(`  ➖ Kapsam dışı   : ${genel[DURUM.KAPSAM_DISI]}`);
  if (bilinmeyenEtiketler.size) console.log(`  ⚠️  Bilinmeyen etiket: ${[...bilinmeyenEtiketler.keys()].map((e) => '@' + e).join(', ')}`);
  if (bagsizTestler.length) console.log(`  ⚠️  Gereksinime bağlı olmayan test: ${bagsizTestler.length}`);
  console.log(`Rapor: ${path.relative(ROOT, PATHS.cikti)}`);

  if (STRICT) {
    const eksik = satirlar.filter(
      (r) => r.yontem === 'otomatik' && (r.durum === DURUM.BASARISIZ || r.durum === DURUM.TEST_EDILMEDI),
    );
    if (eksik.length || bilinmeyenEtiketler.size) {
      console.error(`\n--strict: ${eksik.length} otomatik madde karşılanmadı, ${bilinmeyenEtiketler.size} bilinmeyen etiket.`);
      process.exit(1);
    }
  }
}

main();
