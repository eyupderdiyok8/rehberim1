-- =====================================================
-- ALL TURKISH DISTRICTS (~970)
-- Run AFTER seed_all_cities.sql
-- seed.sql already inserts İstanbul (18) and Tekirdağ (9) districts
-- =====================================================

-- ── İSTANBUL (remaining districts not in seed.sql) ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Avcılar','istanbul-avcilar'),('Arnavutköy','istanbul-arnavutkoy'),('Bakırköy','istanbul-bakirkoy'),
  ('Başakşehir','istanbul-basaksehir'),('Bayrampaşa','istanbul-bayrampasa'),('Beykoz','istanbul-beykoz'),
  ('Beyoğlu','istanbul-beyoglu'),('Büyükçekmece','istanbul-buyukcekmece'),('Catalca','istanbul-catalca'),
  ('Çekmeköy','istanbul-cekmekoy'),('Esenler','istanbul-esenler'),('Eyüpsultan','istanbul-eyupsultan'),
  ('Kağıthane','istanbul-kagithane'),('Sarıyer','istanbul-sariyer'),('Silivri','istanbul-silivri'),
  ('Sancaktepe','istanbul-sancaktepe'),('Tuzla','istanbul-tuzla'),('Ümraniye','istanbul-umraniye')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'istanbul' ON CONFLICT DO NOTHING;

-- ── ANKARA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Çankaya','ankara-cankaya'),('Keçiören','ankara-kecioren'),('Yenimahalle','ankara-yenimahalle'),
  ('Mamak','ankara-mamak'),('Etimesgut','ankara-etimesgut'),('Sincan','ankara-sincan'),
  ('Altındağ','ankara-altindag'),('Pursaklar','ankara-pursaklar'),('Gölbaşı','ankara-golbasi'),
  ('Polatlı','ankara-polatli'),('Çubuk','ankara-cubuk'),('Kazan','ankara-kazan'),
  ('Akyurt','ankara-akyurt'),('Beypazarı','ankara-beypazari'),('Elmadağ','ankara-elmadag'),
  ('Haymana','ankara-haymana'),('Kızılcahamam','ankara-kizilcahamam'),('Nallıhan','ankara-nallihan'),
  ('Şereflikoçhisar','ankara-sereflikochisar'),('Bala','ankara-bala'),('Kalecik','ankara-kalecik'),
  ('Ayaş','ankara-ayas'),('Güdül','ankara-gudul'),('Çamlıdere','ankara-camlidere'),('Evren','ankara-evren')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'ankara' ON CONFLICT DO NOTHING;

-- ── İZMİR ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Konak','izmir-konak'),('Karşıyaka','izmir-karsiyaka'),('Bornova','izmir-bornova'),
  ('Buca','izmir-buca'),('Bayraklı','izmir-bayrakli'),('Çiğli','izmir-cigli'),
  ('Karabağlar','izmir-karabaglar'),('Gaziemir','izmir-gaziemir'),('Balçova','izmir-balcova'),
  ('Narlıdere','izmir-narlidere'),('Güzelbahçe','izmir-guzelbahce'),('Menemen','izmir-menemen'),
  ('Torbalı','izmir-torbali'),('Urla','izmir-urla'),('Menderes','izmir-menderes'),
  ('Kemalpaşa','izmir-kemalpasa'),('Bergama','izmir-bergama'),('Ödemiş','izmir-odemis'),
  ('Aliağa','izmir-aliaga'),('Tire','izmir-tire'),('Çeşme','izmir-cesme'),
  ('Dikili','izmir-dikili'),('Foça','izmir-foca'),('Seferihisar','izmir-seferihisar'),
  ('Selçuk','izmir-selcuk'),('Kiraz','izmir-kiraz'),('Bayındır','izmir-bayindir'),
  ('Beydağ','izmir-beydag'),('Kınık','izmir-kinik')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'izmir' ON CONFLICT DO NOTHING;

-- ── BURSA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Osmangazi','bursa-osmangazi'),('Nilüfer','bursa-nilufer'),('Yıldırım','bursa-yildirim'),
  ('Gemlik','bursa-gemlik'),('Mudanya','bursa-mudanya'),('Gürsu','bursa-gursu'),
  ('Kestel','bursa-kestel'),('İnegöl','bursa-inegol'),('Mustafakemalpaşa','bursa-mustafakemalpasa'),
  ('Karacabey','bursa-karacabey'),('Orhangazi','bursa-orhangazi'),('Yenişehir','bursa-yenisehir'),
  ('İznik','bursa-iznik'),('Orhaneli','bursa-orhaneli'),('Keles','bursa-keles'),
  ('Büyükorhan','bursa-buyukorhan'),('Harmancık','bursa-harmancik')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'bursa' ON CONFLICT DO NOTHING;

-- ── ANTALYA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Muratpaşa','antalya-muratpasa'),('Konyaaltı','antalya-konyaalti'),('Kepez','antalya-kepez'),
  ('Döşemealtı','antalya-dosemealti'),('Aksu','antalya-aksu'),('Alanya','antalya-alanya'),
  ('Manavgat','antalya-manavgat'),('Serik','antalya-serik'),('Kemer','antalya-kemer'),
  ('Kaş','antalya-kas'),('Kumluca','antalya-kumluca'),('Finike','antalya-finike'),
  ('Demre','antalya-demre'),('Elmalı','antalya-elmali'),('Korkuteli','antalya-korkuteli'),
  ('Gündoğmuş','antalya-gundogmus'),('İbradı','antalya-ibradi'),('Akseki','antalya-akseki'),('Gazipaşa','antalya-gazipasa')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'antalya' ON CONFLICT DO NOTHING;

-- ── ADANA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Seyhan','adana-seyhan'),('Çukurova','adana-cukurova'),('Yüreğir','adana-yuregir'),
  ('Sarıçam','adana-saricam'),('Karaisalı','adana-karaisali'),('Ceyhan','adana-ceyhan'),
  ('Kozan','adana-kozan'),('İmamoğlu','adana-imamoglu'),('Karataş','adana-karatas'),
  ('Yumurtalık','adana-yumurtalik'),('Pozantı','adana-pozanti'),('Tufanbeyli','adana-tufanbeyli'),
  ('Feke','adana-feke'),('Saimbeyli','adana-saimbeyli'),('Aladağ','adana-aladag')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'adana' ON CONFLICT DO NOTHING;

-- ── KOCAELİ ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('İzmit','kocaeli-izmit'),('Gebze','kocaeli-gebze'),('Darıca','kocaeli-darica'),
  ('Çayırova','kocaeli-cayirova'),('Gölcük','kocaeli-golcuk'),('Körfez','kocaeli-korfez'),
  ('Derince','kocaeli-derince'),('Kartepe','kocaeli-kartepe'),('Başiskele','kocaeli-basiskele'),
  ('Karamürsel','kocaeli-karamursel'),('Kandıra','kocaeli-kandira'),('Dilovası','kocaeli-dilovasi')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'kocaeli' ON CONFLICT DO NOTHING;

-- ── GAZİANTEP ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Şahinbey','gaziantep-sahinbey'),('Şehitkamil','gaziantep-sehitkamil'),('Oğuzeli','gaziantep-oguzeli'),
  ('Nizip','gaziantep-nizip'),('İslahiye','gaziantep-islahiye'),('Nurdağı','gaziantep-nurdagi'),
  ('Araban','gaziantep-araban'),('Yavuzeli','gaziantep-yavuzeli'),('Karkamış','gaziantep-karkamis')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'gaziantep' ON CONFLICT DO NOTHING;

-- ── KONYA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Selçuklu','konya-selcuklu'),('Meram','konya-meram'),('Karatay','konya-karatay'),
  ('Ereğli','konya-eregli'),('Akşehir','konya-aksehir'),('Beyşehir','konya-beysehir'),
  ('Cihanbeyli','konya-cihanbeyli'),('Çumra','konya-cumra'),('Ilgın','konya-ilgin'),
  ('Kulu','konya-kulu'),('Sarayönü','konya-sarayonu'),('Seydişehir','konya-seydisehir'),
  ('Karapınar','konya-karapinar'),('Bozkır','konya-bozkir'),('Hadim','konya-hadim'),
  ('Hüyük','konya-huyuk'),('Kadınhanı','konya-kadinhani'),('Taşkent','konya-taskent'),
  ('Yunak','konya-yunak'),('Ahırlı','konya-ahirli'),('Altınekin','konya-altinekin'),
  ('Derbent','konya-derbent'),('Derebucak','konya-derebucak'),('Emirgazi','konya-emirgazi'),
  ('Güneysınır','konya-guneysinir'),('Halkapınar','konya-halkapinar'),('Tuzlukçu','konya-tuzlukcu'),
  ('Yalıhüyük','konya-yalihuyuk'),('Akören','konya-akoren'),('Doğanhisar','konya-doganhisar')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'konya' ON CONFLICT DO NOTHING;

-- ── MERSİN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Yenişehir','mersin-yenisehir'),('Toroslar','mersin-toroslar'),('Akdeniz','mersin-akdeniz'),
  ('Mezitli','mersin-mezitli'),('Tarsus','mersin-tarsus'),('Erdemli','mersin-erdemli'),
  ('Silifke','mersin-silifke'),('Anamur','mersin-anamur'),('Bozyazı','mersin-bozyazi'),
  ('Gülnar','mersin-gulnar'),('Mut','mersin-mut'),('Aydıncık','mersin-aydincik'),('Çamlıyayla','mersin-camliyayla')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'mersin' ON CONFLICT DO NOTHING;

-- ── DİYARBAKIR ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Bağlar','diyarbakir-baglar'),('Kayapınar','diyarbakir-kayapinar'),('Sur','diyarbakir-sur'),
  ('Yenişehir','diyarbakir-yenisehir'),('Bismil','diyarbakir-bismil'),('Ergani','diyarbakir-ergani'),
  ('Silvan','diyarbakir-silvan'),('Çınar','diyarbakir-cinar'),('Çermik','diyarbakir-cermik'),
  ('Dicle','diyarbakir-dicle'),('Eğil','diyarbakir-egil'),('Hani','diyarbakir-hani'),
  ('Hazro','diyarbakir-hazro'),('Kocaköy','diyarbakir-kocakoy'),('Kulp','diyarbakir-kulp'),
  ('Lice','diyarbakir-lice'),('Çüngüş','diyarbakir-cungus')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'diyarbakir' ON CONFLICT DO NOTHING;

-- ── KAYSERİ ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Melikgazi','kayseri-melikgazi'),('Kocasinan','kayseri-kocasinan'),('Talas','kayseri-talas'),
  ('Hacılar','kayseri-hacilar'),('İncesu','kayseri-incesu'),('Develi','kayseri-develi'),
  ('Yahyalı','kayseri-yahyali'),('Bünyan','kayseri-bunyan'),('Tomarza','kayseri-tomarza'),
  ('Pınarbaşı','kayseri-pinarbasi'),('Sarıoğlan','kayseri-sarioglan'),('Yeşilhisar','kayseri-yesilhisar'),
  ('Felahiye','kayseri-felahiye'),('Özvatan','kayseri-ozvatan'),('Akkışla','kayseri-akkisla'),('Sarıyahşi','kayseri-sariyahsi')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'kayseri' ON CONFLICT DO NOTHING;

-- ── ESKİŞEHİR ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Odunpazarı','eskisehir-odunpazari'),('Tepebaşı','eskisehir-tepebasi'),('Sivrihisar','eskisehir-sivrihisar'),
  ('Çifteler','eskisehir-cifteler'),('Seyitgazi','eskisehir-seyitgazi'),('Alpu','eskisehir-alpu'),
  ('Mahmudiye','eskisehir-mahmudiye'),('Mihalıççık','eskisehir-mihaliccik'),('Sarıcakaya','eskisehir-saricakaya'),
  ('Günyüzü','eskisehir-gunyuzu'),('Han','eskisehir-han'),('İnönü','eskisehir-inonu'),('Beylikova','eskisehir-beylikova')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'eskisehir' ON CONFLICT DO NOTHING;

-- ── SAKARYA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Adapazarı','sakarya-adapazari'),('Serdivan','sakarya-serdivan'),('Erenler','sakarya-erenler'),
  ('Arifiye','sakarya-arifiye'),('Hendek','sakarya-hendek'),('Akyazı','sakarya-akyazi'),
  ('Karasu','sakarya-karasu'),('Geyve','sakarya-geyve'),('Pamukova','sakarya-pamukova'),
  ('Sapanca','sakarya-sapanca'),('Ferizli','sakarya-ferizli'),('Söğütlü','sakarya-sogutlu'),
  ('Kocaali','sakarya-kocaali'),('Kaynarca','sakarya-kaynarca'),('Taraklı','sakarya-tarakli'),('Köprübaşı','sakarya-koprubasi')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'sakarya' ON CONFLICT DO NOTHING;

-- ── SAMSUN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('İlkadım','samsun-ilkadim'),('Atakum','samsun-atakum'),('Canik','samsun-canik'),
  ('Tekkeköy','samsun-tekkekoy'),('Bafra','samsun-bafra'),('Çarşamba','samsun-carsamba'),
  ('Terme','samsun-terme'),('Havza','samsun-havza'),('Vezirköprü','samsun-vezirkopru'),
  ('Alaçam','samsun-alacam'),('Ondokuzmayıs','samsun-ondokuzmayis'),('Salıpazarı','samsun-salipazari'),
  ('Asarcık','samsun-asarcik'),('Ayvacık','samsun-ayvacik'),('Kavak','samsun-kavak'),('Ladik','samsun-ladik'),('Yakakent','samsun-yakakent')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'samsun' ON CONFLICT DO NOTHING;

-- ── TRABZON ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Ortahisar','trabzon-ortahisar'),('Akçaabat','trabzon-akcaabat'),('Yomra','trabzon-yomra'),
  ('Arsin','trabzon-arsin'),('Araklı','trabzon-arakli'),('Of','trabzon-of'),
  ('Sürmene','trabzon-surmene'),('Maçka','trabzon-macka'),('Vakfıkebir','trabzon-vakfikebir'),
  ('Tonya','trabzon-tonya'),('Beşikdüzü','trabzon-besikduzu'),('Çarşıbaşı','trabzon-carsibasi'),
  ('Çaykara','trabzon-caykara'),('Dernekpazarı','trabzon-dernekpazari'),('Düzköy','trabzon-duzkoy'),
  ('Hayrat','trabzon-hayrat'),('Köprübaşı','trabzon-koprubasi'),('Şalpazarı','trabzon-salpazari')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'trabzon' ON CONFLICT DO NOTHING;

-- ── ADIYAMAN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Adıyaman Merkez','adiyaman-merkez'),('Besni','adiyaman-besni'),('Çelikhan','adiyaman-celikhan'),
  ('Gerger','adiyaman-gerger'),('Gölbaşı','adiyaman-golbasi'),('Kahta','adiyaman-kahta'),
  ('Samsat','adiyaman-samsat'),('Sincik','adiyaman-sincik'),('Tut','adiyaman-tut')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'adiyaman' ON CONFLICT DO NOTHING;

-- ── AFYONKARAHISAR ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Afyonkarahisar Merkez','afyonkarahisar-merkez'),('Başmakçı','afyonkarahisar-basmakci'),
  ('Bayat','afyonkarahisar-bayat'),('Bolvadin','afyonkarahisar-bolvadin'),
  ('Çay','afyonkarahisar-cay'),('Çobanlar','afyonkarahisar-cobanlar'),
  ('Dazkırı','afyonkarahisar-dazkiri'),('Dinar','afyonkarahisar-dinar'),
  ('Emirdağ','afyonkarahisar-emirdag'),('Evciler','afyonkarahisar-evciler'),
  ('Hocalar','afyonkarahisar-hocalar'),('İhsaniye','afyonkarahisar-ihsaniye'),
  ('İscehisar','afyonkarahisar-iscehisar'),('Kızılören','afyonkarahisar-kiziloren'),
  ('Sandıklı','afyonkarahisar-sandikli'),('Sinanpaşa','afyonkarahisar-sinanpasa'),
  ('Sultandağı','afyonkarahisar-sultandagi'),('Şuhut','afyonkarahisar-suhut')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'afyonkarahisar' ON CONFLICT DO NOTHING;

-- ── AGRI ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Ağrı Merkez','agri-merkez'),('Diyadin','agri-diyadin'),('Doğubayazıt','agri-dogubayazit'),
  ('Eleşkirt','agri-eleskirt'),('Hamur','agri-hamur'),('Patnos','agri-patnos'),
  ('Taşlıçay','agri-taslicay'),('Tutak','agri-tutak')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'agri' ON CONFLICT DO NOTHING;

-- ── AMASYA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Amasya Merkez','amasya-merkez'),('Göynücek','amasya-goynucek'),('Gümüşhacıköy','amasya-gumushacikoy'),
  ('Hamamözü','amasya-hamamozu'),('Merzifon','amasya-merzifon'),('Suluova','amasya-suluova'),('Taşova','amasya-tasova')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'amasya' ON CONFLICT DO NOTHING;

-- ── ARTVIN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Artvin Merkez','artvin-merkez'),('Ardanuç','artvin-ardanuc'),('Arhavi','artvin-arhavi'),
  ('Borçka','artvin-borcka'),('Hopa','artvin-hopa'),('Murgul','artvin-murgul'),
  ('Şavşat','artvin-savsat'),('Yusufeli','artvin-yusufeli')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'artvin' ON CONFLICT DO NOTHING;

-- ── AYDIN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Efeler','aydin-efeler'),('Bozdoğan','aydin-bozdogan'),('Buharkent','aydin-buharkent'),
  ('Çine','aydin-cine'),('Didim','aydin-didim'),('Germencik','aydin-germencik'),
  ('İncirliova','aydin-incirliova'),('Karacasu','aydin-karacasu'),('Karpuzlu','aydin-karpuzlu'),
  ('Koçarlı','aydin-kocarli'),('Köşk','aydin-kosk'),('Kuşadası','aydin-kusadasi'),
  ('Kuyucak','aydin-kuyucak'),('Nazilli','aydin-nazilli'),('Söke','aydin-soke'),
  ('Sultanhisar','aydin-sultanhisar'),('Yenipazar','aydin-yenipazar')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'aydin' ON CONFLICT DO NOTHING;

-- ── BALIKESIR ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Altıeylül','balikesir-altieylul'),('Karesi','balikesir-karesi'),('Ayvalık','balikesir-ayvalik'),
  ('Balya','balikesir-balya'),('Bandırma','balikesir-bandirma'),('Bigadiç','balikesir-bigadic'),
  ('Burhaniye','balikesir-burhaniye'),('Dursunbey','balikesir-dursunbey'),
  ('Edremit','balikesir-edremit'),('Erdek','balikesir-erdek'),('Gömeç','balikesir-gomec'),
  ('Gönen','balikesir-gonen'),('Havran','balikesir-havran'),('İvrindi','balikesir-ivrindi'),
  ('Kepsut','balikesir-kepsut'),('Manyas','balikesir-manyas'),('Marmara','balikesir-marmara'),
  ('Savaştepe','balikesir-savastepe'),('Sındırgı','balikesir-sindirgi'),('Susurluk','balikesir-susurluk')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'balikesir' ON CONFLICT DO NOTHING;

-- ── BILECIK ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Bilecik Merkez','bilecik-merkez'),('Bozüyük','bilecik-bozuyuk'),('Gölpazarı','bilecik-golpazari'),
  ('İnhisar','bilecik-inhisar'),('Osmaneli','bilecik-osmaneli'),('Pazaryeri','bilecik-pazaryeri'),
  ('Söğüt','bilecik-sogut'),('Yenipazar','bilecik-yenipazar')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'bilecik' ON CONFLICT DO NOTHING;

-- ── BINGOL ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Bingöl Merkez','bingol-merkez'),('Adaklı','bingol-adakli'),('Genç','bingol-genc'),
  ('Karlıova','bingol-karliova'),('Kiğı','bingol-kigi'),('Solhan','bingol-solhan'),
  ('Yayladere','bingol-yayladere'),('Yedisu','bingol-yedisu')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'bingol' ON CONFLICT DO NOTHING;

-- ── BITLIS ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Bitlis Merkez','bitlis-merkez'),('Adilcevaz','bitlis-adilcevaz'),('Ahlat','bitlis-ahlat'),
  ('Güroymak','bitlis-guroymak'),('Hizan','bitlis-hizan'),('Mutki','bitlis-mutki'),('Tatvan','bitlis-tatvan')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'bitlis' ON CONFLICT DO NOTHING;

-- ── BOLU ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Bolu Merkez','bolu-merkez'),('Dörtdivan','bolu-dortdivan'),('Gerede','bolu-gerede'),
  ('Göynük','bolu-goynuk'),('Kıbrıscık','bolu-kibriscik'),('Mengen','bolu-mengen'),
  ('Mudurnu','bolu-mudurnu'),('Seben','bolu-seben'),('Yeniçağa','bolu-yenicaga')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'bolu' ON CONFLICT DO NOTHING;

-- ── BURDUR ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Burdur Merkez','burdur-merkez'),('Ağlasun','burdur-aglasun'),('Altınyayla','burdur-altinyayla'),
  ('Bucak','burdur-bucak'),('Çavdır','burdur-cavdir'),('Çeltikçi','burdur-celtikci'),
  ('Gölhisar','burdur-golhisar'),('Karamanlı','burdur-karamanli'),('Kemer','burdur-kemer'),
  ('Tefenni','burdur-tefenni'),('Yeşilova','burdur-yesilova')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'burdur' ON CONFLICT DO NOTHING;

-- ── CANAKKALE ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Çanakkale Merkez','canakkale-merkez'),('Ayvacık','canakkale-ayvacik'),('Bayramiç','canakkale-bayramic'),
  ('Biga','canakkale-biga'),('Bozcaada','canakkale-bozcaada'),('Çan','canakkale-can'),
  ('Eceabat','canakkale-eceabat'),('Ezine','canakkale-ezine'),('Gelibolu','canakkale-gelibolu'),
  ('Gökçeada','canakkale-gokceada'),('Lapseki','canakkale-lapseki'),('Yenice','canakkale-yenice')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'canakkale' ON CONFLICT DO NOTHING;

-- ── CANKIRI ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Çankırı Merkez','cankiri-merkez'),('Atkaracalar','cankiri-atkaracalar'),('Bayramören','cankiri-bayramoren'),
  ('Çerkeş','cankiri-cerkes'),('Eldivan','cankiri-eldivan'),('Ilgaz','cankiri-ilgaz'),
  ('Kızılırmak','cankiri-kizilirmak'),('Korgun','cankiri-korgun'),('Kurşunlu','cankiri-kursunlu'),
  ('Orta','cankiri-orta'),('Şabanözü','cankiri-sabanozu'),('Yapraklı','cankiri-yaprakli')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'cankiri' ON CONFLICT DO NOTHING;

-- ── CORUM ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Çorum Merkez','corum-merkez'),('Alaca','corum-alaca'),('Bayat','corum-bayat'),
  ('Boğazkale','corum-bogazkale'),('Dodurga','corum-dodurga'),('İskilip','corum-iskilip'),
  ('Kargı','corum-kargi'),('Laçin','corum-lacin'),('Mecitözü','corum-mecitozu'),
  ('Oğuzlar','corum-oguzlar'),('Ortaköy','corum-ortakoy'),('Osmancık','corum-osmancik'),
  ('Sungurlu','corum-sungurlu'),('Uğurludağ','corum-ugurludag')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'corum' ON CONFLICT DO NOTHING;

-- ── DENIZLI ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Merkezefendi','denizli-merkezefendi'),('Pamukkale','denizli-pamukkale'),('Acıpayam','denizli-acipayam'),
  ('Babadağ','denizli-babadag'),('Baklan','denizli-baklan'),('Bekilli','denizli-bekilli'),
  ('Beyağaç','denizli-beyagac'),('Bozkurt','denizli-bozkurt'),('Buldan','denizli-buldan'),
  ('Çal','denizli-cal'),('Çameli','denizli-cameli'),('Çardak','denizli-cardak'),
  ('Çivril','denizli-civril'),('Güney','denizli-guney'),('Honaz','denizli-honaz'),
  ('Kale','denizli-kale'),('Sarayköy','denizli-saraykoy'),('Serinhisar','denizli-serinhisar'),('Tavas','denizli-tavas')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'denizli' ON CONFLICT DO NOTHING;

-- ── EDIRNE ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Edirne Merkez','edirne-merkez'),('Enez','edirne-enez'),('Havsa','edirne-havsa'),
  ('İpsala','edirne-ipsala'),('Keşan','edirne-kesan'),('Lalapaşa','edirne-lalapasa'),
  ('Meriç','edirne-meric'),('Süloğlu','edirne-suloglu'),('Uzunköprü','edirne-uzunkopru')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'edirne' ON CONFLICT DO NOTHING;

-- ── ELAZIG ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Elazığ Merkez','elazig-merkez'),('Ağın','elazig-agin'),('Alacakaya','elazig-alacakaya'),
  ('Arıcak','elazig-aricak'),('Baskil','elazig-baskil'),('Karakoçan','elazig-karakocan'),
  ('Keban','elazig-keban'),('Kovancılar','elazig-kovancilar'),('Maden','elazig-maden'),
  ('Palu','elazig-palu'),('Sivrice','elazig-sivrice')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'elazig' ON CONFLICT DO NOTHING;

-- ── ERZINCAN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Erzincan Merkez','erzincan-merkez'),('Çayırlı','erzincan-cayirli'),('İliç','erzincan-ilic'),
  ('Kemah','erzincan-kemah'),('Kemaliye','erzincan-kemaliye'),('Otlukbeli','erzincan-otlukbeli'),
  ('Refahiye','erzincan-refahiye'),('Tercan','erzincan-tercan'),('Üzümlü','erzincan-uzumlu')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'erzincan' ON CONFLICT DO NOTHING;

-- ── ERZURUM ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Yakutiye','erzurum-yakutiye'),('Palandöken','erzurum-palandoken'),('Aziziye','erzurum-aziziye'),
  ('Aşkale','erzurum-askale'),('Çat','erzurum-cat'),('Hınıs','erzurum-hinis'),
  ('Horasan','erzurum-horasan'),('İspir','erzurum-ispir'),('Karaçoban','erzurum-karacoban'),
  ('Karayazı','erzurum-karayazi'),('Köprüköy','erzurum-koprukoy'),('Narman','erzurum-narman'),
  ('Oltu','erzurum-oltu'),('Olur','erzurum-olur'),('Pasinler','erzurum-pasinler'),
  ('Pazaryolu','erzurum-pazaryolu'),('Şenkaya','erzurum-senkaya'),('Tekman','erzurum-tekman'),
  ('Tortum','erzurum-tortum'),('Uzundere','erzurum-uzundere')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'erzurum' ON CONFLICT DO NOTHING;

-- ── GIRESUN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Giresun Merkez','giresun-merkez'),('Alucra','giresun-alucra'),('Bulancak','giresun-bulancak'),
  ('Çamoluk','giresun-camoluk'),('Çanakçı','giresun-canakci'),('Dereli','giresun-dereli'),
  ('Doğankent','giresun-dogankent'),('Espiye','giresun-espiye'),('Eynesil','giresun-eynesil'),
  ('Görele','giresun-gorele'),('Güce','giresun-guce'),('Keşap','giresun-kesap'),
  ('Piraziz','giresun-piraziz'),('Şebinkarahisar','giresun-sebinkarahisar'),('Tirebolu','giresun-tirebolu'),('Yağlıdere','giresun-yaglidiere')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'giresun' ON CONFLICT DO NOTHING;

-- ── GÜMÜŞHANE ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Gümüşhane Merkez','gumushane-merkez'),('Kelkit','gumushane-kelkit'),('Köse','gumushane-kose'),
  ('Kürtün','gumushane-kurtun'),('Şiran','gumushane-siran'),('Torul','gumushane-torul')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'gumushane' ON CONFLICT DO NOTHING;

-- ── HAKKARİ ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Hakkari Merkez','hakkari-merkez'),('Çukurca','hakkari-cukurca'),('Şemdinli','hakkari-semdinli'),('Yüksekova','hakkari-yuksekova')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'hakkari' ON CONFLICT DO NOTHING;

-- ── HATAY ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Antakya','hatay-antakya'),('Defne','hatay-defne'),('Arsuz','hatay-arsuz'),
  ('İskenderun','hatay-iskenderun'),('Belen','hatay-belen'),('Dörtyol','hatay-dortyol'),
  ('Erzin','hatay-erzin'),('Hassa','hatay-hassa'),('Kırıkhan','hatay-kirikhan'),
  ('Kumlu','hatay-kumlu'),('Payas','hatay-payas'),('Reyhanlı','hatay-reyhanli'),
  ('Samandağ','hatay-samandag'),('Yayladağı','hatay-yayladagi'),('Altınözü','hatay-altinozu')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'hatay' ON CONFLICT DO NOTHING;

-- ── ISPARTA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Isparta Merkez','isparta-merkez'),('Aksu','isparta-aksu'),('Atabey','isparta-atabey'),
  ('Eğirdir','isparta-egirdir'),('Gelendost','isparta-gelendost'),('Gönen','isparta-gonen'),
  ('Keçiborlu','isparta-keciborlu'),('Senirkent','isparta-senirkent'),('Sütçüler','isparta-sutculer'),
  ('Şarkikaraağaç','isparta-sarkikaraagac'),('Uluborlu','isparta-uluborlu'),('Yalvaç','isparta-yalvac'),('Yenişarbademli','isparta-yenisarbademli')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'isparta' ON CONFLICT DO NOTHING;

-- ── KAHRAMANMARAS ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Onikişubat','kahramanmaras-onikisubat'),('Dulkadiroğlu','kahramanmaras-dulkadiroglu'),
  ('Afşin','kahramanmaras-afsin'),('Andırın','kahramanmaras-andirin'),
  ('Çağlayancerit','kahramanmaras-caglayancerit'),('Ekinözü','kahramanmaras-ekinozu'),
  ('Elbistan','kahramanmaras-elbistan'),('Göksun','kahramanmaras-goksun'),
  ('Nurhak','kahramanmaras-nurhak'),('Pazarcık','kahramanmaras-pazarcik'),('Türkoğlu','kahramanmaras-turkoglu')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'kahramanmaras' ON CONFLICT DO NOTHING;

-- ── KARS ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Kars Merkez','kars-merkez'),('Akyaka','kars-akyaka'),('Arpaçay','kars-arpacay'),
  ('Digor','kars-digor'),('Kağızman','kars-kagizman'),('Sarıkamış','kars-sarikamis'),
  ('Selim','kars-selim'),('Susuz','kars-susuz')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'kars' ON CONFLICT DO NOTHING;

-- ── KASTAMONU ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Kastamonu Merkez','kastamonu-merkez'),('Abana','kastamonu-abana'),('Ağlı','kastamonu-agli'),
  ('Araç','kastamonu-arac'),('Azdavay','kastamonu-azdavay'),('Bozkurt','kastamonu-bozkurt'),
  ('Cide','kastamonu-cide'),('Çatalzeytin','kastamonu-catalzeytin'),('Daday','kastamonu-daday'),
  ('Devrekani','kastamonu-devrekani'),('Doğanyurt','kastamonu-doganyurt'),
  ('Hanönü','kastamonu-hanonu'),('İhsangazi','kastamonu-ihsangazi'),('İnebolu','kastamonu-inebolu'),
  ('Küre','kastamonu-kure'),('Pınarbaşı','kastamonu-pinarbasi'),('Seydiler','kastamonu-seydiler'),
  ('Şenpazar','kastamonu-senpazar'),('Taşköprü','kastamonu-taskopru'),('Tosya','kastamonu-tosya')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'kastamonu' ON CONFLICT DO NOTHING;

-- ── KIRIKKALE ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Kırıkkale Merkez','kirikkale-merkez'),('Bahşili','kirikkale-bahsili'),('Balışeyh','kirikkale-baliseyh'),
  ('Çelebi','kirikkale-celebi'),('Delice','kirikkale-delice'),('Karakeçili','kirikkale-karakecili'),
  ('Keskin','kirikkale-keskin'),('Sulakyurt','kirikkale-sulakyurt'),('Yahşihan','kirikkale-yahsihan')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'kirikkale' ON CONFLICT DO NOTHING;

-- ── KIRKLARELI ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Kırklareli Merkez','kirklareli-merkez'),('Babaeski','kirklareli-babaeski'),('Demirköy','kirklareli-demirkoy'),
  ('Kofçaz','kirklareli-kofcaz'),('Lüleburgaz','kirklareli-luleburgaz'),('Pehlivanköy','kirklareli-pehlivankoy'),
  ('Pınarhisar','kirklareli-pinarhisar'),('Vize','kirklareli-vize')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'kirklareli' ON CONFLICT DO NOTHING;

-- ── KIRSEHIR ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Kırşehir Merkez','kirsehir-merkez'),('Akçakent','kirsehir-akcakent'),('Akpınar','kirsehir-akpinar'),
  ('Boztepe','kirsehir-boztepe'),('Çiçekdağı','kirsehir-cicekdagi'),('Kaman','kirsehir-kaman'),('Mucur','kirsehir-mucur')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'kirsehir' ON CONFLICT DO NOTHING;

-- ── MALATYA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Battalgazi','malatya-battalgazi'),('Yeşilyurt','malatya-yesilyurt'),('Akçadağ','malatya-akcadag'),
  ('Arapgir','malatya-arapgir'),('Arguvan','malatya-arguvan'),('Darende','malatya-darende'),
  ('Doğanşehir','malatya-dogansehir'),('Doğanyol','malatya-doganyol'),('Hekimhan','malatya-hekimhan'),
  ('Kale','malatya-kale'),('Kuluncak','malatya-kuluncak'),('Pütürge','malatya-puturge'),
  ('Yazıhan','malatya-yazihan')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'malatya' ON CONFLICT DO NOTHING;

-- ── MANISA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Şehzadeler','manisa-sehzadeler'),('Yunusemre','manisa-yunusemre'),('Ahmetli','manisa-ahmetli'),
  ('Akhisar','manisa-akhisar'),('Alaşehir','manisa-alasehir'),('Demirci','manisa-demirci'),
  ('Gölmarmara','manisa-golmarmara'),('Gördes','manisa-gordes'),('Kırkağaç','manisa-kirkagac'),
  ('Köprübaşı','manisa-koprubasi'),('Kula','manisa-kula'),('Salihli','manisa-salihli'),
  ('Sarıgöl','manisa-sarigol'),('Saruhanlı','manisa-saruhanli'),('Selendi','manisa-selendi'),
  ('Soma','manisa-soma'),('Turgutlu','manisa-turgutlu')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'manisa' ON CONFLICT DO NOTHING;

-- ── MARDIN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Artuklu','mardin-artuklu'),('Dargeçit','mardin-dargecit'),('Derik','mardin-derik'),
  ('Kızıltepe','mardin-kiziltepe'),('Mazıdağı','mardin-mazidagi'),('Midyat','mardin-midyat'),
  ('Nusaybin','mardin-nusaybin'),('Ömerli','mardin-omerli'),('Savur','mardin-savur'),('Yeşilli','mardin-yesilli')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'mardin' ON CONFLICT DO NOTHING;

-- ── MUGLA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Menteşe','mugla-mentese'),('Bodrum','mugla-bodrum'),('Dalaman','mugla-dalaman'),
  ('Datça','mugla-datca'),('Fethiye','mugla-fethiye'),('Kavaklıdere','mugla-kavaklidere'),
  ('Köyceğiz','mugla-koycegiz'),('Marmaris','mugla-marmaris'),('Milas','mugla-milas'),
  ('Ortaca','mugla-ortaca'),('Seydikemer','mugla-seydikemer'),('Ula','mugla-ula'),('Yatağan','mugla-yatagan')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'mugla' ON CONFLICT DO NOTHING;

-- ── MUS ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Muş Merkez','mus-merkez'),('Bulanık','mus-bulanik'),('Hasköy','mus-haskoy'),('Korkut','mus-korkut'),('Malazgirt','mus-malazgirt'),('Varto','mus-varto')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'mus' ON CONFLICT DO NOTHING;

-- ── NEVSEHIR ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Nevşehir Merkez','nevsehir-merkez'),('Acıgöl','nevsehir-acigol'),('Avanos','nevsehir-avanos'),
  ('Derinkuyu','nevsehir-derinkuyu'),('Gülşehir','nevsehir-gulsehir'),('Hacıbektaş','nevsehir-hacibektas'),
  ('Kozaklı','nevsehir-kozakli'),('Ürgüp','nevsehir-urgup')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'nevsehir' ON CONFLICT DO NOTHING;

-- ── NIGDE ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Niğde Merkez','nigde-merkez'),('Altunhisar','nigde-altunhisar'),('Bor','nigde-bor'),
  ('Çamardı','nigde-camardi'),('Çiftlik','nigde-ciftlik'),('Ulukışla','nigde-ulukisla')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'nigde' ON CONFLICT DO NOTHING;

-- ── ORDU ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Altınordu','ordu-altinordu'),('Akkuş','ordu-akkus'),('Aybastı','ordu-aybasti'),
  ('Çamaş','ordu-camas'),('Çatalpınar','ordu-catalpinar'),('Çaybaşı','ordu-caybasi'),
  ('Fatsa','ordu-fatsa'),('Gölköy','ordu-golkoy'),('Gülyalı','ordu-gulyali'),
  ('Gürgentepe','ordu-gurgentepe'),('İkizce','ordu-ikizce'),('Kabadüz','ordu-kabaduz'),
  ('Kabataş','ordu-kabatas'),('Korgan','ordu-korgan'),('Kumru','ordu-kumru'),
  ('Mesudiye','ordu-mesudiye'),('Perşembe','ordu-persembe'),('Ulubey','ordu-ulubey'),('Ünye','ordu-unye')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'ordu' ON CONFLICT DO NOTHING;

-- ── RIZE ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Rize Merkez','rize-merkez'),('Ardeşen','rize-ardesen'),('Çamlıhemşin','rize-camlihemsin'),
  ('Çayeli','rize-cayeli'),('Derepazarı','rize-derepazari'),('Fındıklı','rize-findikli'),
  ('Güneysu','rize-guneysu'),('Hemşin','rize-hemsin'),('İkizdere','rize-ikizdere'),
  ('İyidere','rize-iyidere'),('Kalkandere','rize-kalkandere'),('Pazar','rize-pazar')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'rize' ON CONFLICT DO NOTHING;

-- ── SIIRT ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Siirt Merkez','siirt-merkez'),('Baykan','siirt-baykan'),('Eruh','siirt-eruh'),
  ('Kurtalan','siirt-kurtalan'),('Pervari','siirt-pervari'),('Şirvan','siirt-sirvan'),('Tillo','siirt-tillo')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'siirt' ON CONFLICT DO NOTHING;

-- ── SINOP ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Sinop Merkez','sinop-merkez'),('Ayancık','sinop-ayancik'),('Boyabat','sinop-boyabat'),
  ('Dikmen','sinop-dikmen'),('Durağan','sinop-duragan'),('Erfelek','sinop-erfelek'),
  ('Gerze','sinop-gerze'),('Saraydüzü','sinop-sarayduzu'),('Türkeli','sinop-turkeli')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'sinop' ON CONFLICT DO NOTHING;

-- ── SIVAS ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Sivas Merkez','sivas-merkez'),('Akıncılar','sivas-akincilar'),('Altınyayla','sivas-altinyayla'),
  ('Divriği','sivas-divrigi'),('Doğanşar','sivas-dogansar'),('Gemerek','sivas-gemerek'),
  ('Gölova','sivas-golova'),('Gürün','sivas-gurun'),('Hafik','sivas-hafik'),
  ('İmranlı','sivas-imranli'),('Kangal','sivas-kangal'),('Koyulhisar','sivas-koyulhisar'),
  ('Suşehri','sivas-susehri'),('Şarkışla','sivas-sarkisla'),('Ulaş','sivas-ulas'),
  ('Yıldızeli','sivas-yildizeli'),('Zara','sivas-zara')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'sivas' ON CONFLICT DO NOTHING;

-- ── ŞANLIURFA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Eyyübiye','sanliurfa-eyyubiye'),('Haliliye','sanliurfa-haliliye'),('Karaköprü','sanliurfa-karakopru'),
  ('Akçakale','sanliurfa-akcakale'),('Birecik','sanliurfa-birecik'),('Bozova','sanliurfa-bozova'),
  ('Ceylanpınar','sanliurfa-ceylanpinar'),('Halfeti','sanliurfa-halfeti'),('Harran','sanliurfa-harran'),
  ('Hilvan','sanliurfa-hilvan'),('Siverek','sanliurfa-siverek'),('Suruç','sanliurfa-suruc'),('Viranşehir','sanliurfa-viransehir')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'sanliurfa' ON CONFLICT DO NOTHING;

-- ── ŞIRNAK ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Şırnak Merkez','sirnak-merkez'),('Beytüşşebap','sirnak-beytussebap'),('Cizre','sirnak-cizre'),
  ('Güçlükonak','sirnak-guclukonak'),('İdil','sirnak-idil'),('Silopi','sirnak-silopi'),('Uludere','sirnak-uludere')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'sirnak' ON CONFLICT DO NOTHING;

-- ── TOKAT ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Tokat Merkez','tokat-merkez'),('Almus','tokat-almus'),('Artova','tokat-artova'),
  ('Başçiftlik','tokat-basciftlik'),('Erbaa','tokat-erbaa'),('Niksar','tokat-niksar'),
  ('Pazar','tokat-pazar'),('Reşadiye','tokat-resadiye'),('Sulusaray','tokat-sulusaray'),
  ('Turhal','tokat-turhal'),('Yeşilyurt','tokat-yesilyurt'),('Zile','tokat-zile')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'tokat' ON CONFLICT DO NOTHING;

-- ── TUNCELI ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Tunceli Merkez','tunceli-merkez'),('Çemişgezek','tunceli-cemisgezek'),('Hozat','tunceli-hozat'),
  ('Mazgirt','tunceli-mazgirt'),('Nazımiye','tunceli-nazimiye'),('Ovacık','tunceli-ovacik'),
  ('Pertek','tunceli-pertek'),('Pülümür','tunceli-pulumur')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'tunceli' ON CONFLICT DO NOTHING;

-- ── USAK ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Uşak Merkez','usak-merkez'),('Banaz','usak-banaz'),('Eşme','usak-esme'),
  ('Karahallı','usak-karahalli'),('Sivaslı','usak-sivasli'),('Ulubey','usak-ulubey')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'usak' ON CONFLICT DO NOTHING;

-- ── VAN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('İpekyolu','van-ipekyolu'),('Tuşba','van-tusba'),('Edremit','van-edremit'),
  ('Erciş','van-ercis'),('Başkale','van-baskale'),('Çaldıran','van-caldiran'),
  ('Çatak','van-catak'),('Gevaş','van-gevas'),('Gürpınar','van-gurpinar'),
  ('Muradiye','van-muradiye'),('Özalp','van-ozalp'),('Saray','van-saray')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'van' ON CONFLICT DO NOTHING;

-- ── YOZGAT ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Yozgat Merkez','yozgat-merkez'),('Akdağmadeni','yozgat-akdagmadeni'),('Aydıncık','yozgat-aydincik'),
  ('Boğazlıyan','yozgat-bogazliyan'),('Çandır','yozgat-candir'),('Çayıralan','yozgat-cayiralan'),
  ('Çekerek','yozgat-cekerek'),('Kadışehri','yozgat-kadisehri'),('Saraykent','yozgat-saraykent'),
  ('Sarıkaya','yozgat-sarikaya'),('Sorgun','yozgat-sorgun'),('Şefaatli','yozgat-sefaatli'),
  ('Yenifakılı','yozgat-yenifakili'),('Yerköy','yozgat-yerkoy')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'yozgat' ON CONFLICT DO NOTHING;

-- ── ZONGULDAK ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Zonguldak Merkez','zonguldak-merkez'),('Alaplı','zonguldak-alapli'),('Çaycuma','zonguldak-caycuma'),
  ('Devrek','zonguldak-devrek'),('Ereğli','zonguldak-eregli'),('Gökçebey','zonguldak-gokcebey'),
  ('Kilimli','zonguldak-kilimli'),('Kozlu','zonguldak-kozlu')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'zonguldak' ON CONFLICT DO NOTHING;

-- ── AKSARAY ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Aksaray Merkez','aksaray-merkez'),('Ağaçören','aksaray-agacoren'),('Eskil','aksaray-eskil'),
  ('Gülağaç','aksaray-gulagac'),('Güzelyurt','aksaray-guzelyurt'),('Ortaköy','aksaray-ortakoy'),('Sarıyahşi','aksaray-sariyahsi')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'aksaray' ON CONFLICT DO NOTHING;

-- ── BAYBURT ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Bayburt Merkez','bayburt-merkez'),('Aydıntepe','bayburt-aydintepe'),('Demirözü','bayburt-demirozu')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'bayburt' ON CONFLICT DO NOTHING;

-- ── KARAMAN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Karaman Merkez','karaman-merkez'),('Ayrancı','karaman-ayranci'),('Başyayla','karaman-basyayla'),
  ('Ermenek','karaman-ermenek'),('Kazımkarabekir','karaman-kazimkarabekir'),('Sarıveliler','karaman-sariveliler')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'karaman' ON CONFLICT DO NOTHING;

-- ── BATMAN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Batman Merkez','batman-merkez'),('Beşiri','batman-besiri'),('Gercüş','batman-gercus'),
  ('Hasankeyf','batman-hasankeyf'),('Kozluk','batman-kozluk'),('Sason','batman-sason')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'batman' ON CONFLICT DO NOTHING;

-- ── DÜZCE ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Düzce Merkez','duzce-merkez'),('Akçakoca','duzce-akcakoca'),('Cumayeri','duzce-cumayeri'),
  ('Çilimli','duzce-cilimli'),('Gölyaka','duzce-golyaka'),('Gümüşova','duzce-gumusova'),
  ('Kaynaşlı','duzce-kaynasli'),('Yığılca','duzce-yigilca')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'duzce' ON CONFLICT DO NOTHING;

-- ── OSMANİYE ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Osmaniye Merkez','osmaniye-merkez'),('Bahçe','osmaniye-bahce'),('Düziçi','osmaniye-duzici'),
  ('Hasanbeyli','osmaniye-hasanbeyli'),('Kadirli','osmaniye-kadirli'),('Sumbas','osmaniye-sumbas'),('Toprakkale','osmaniye-toprakkale')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'osmaniye' ON CONFLICT DO NOTHING;

-- ── BARTIN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Bartın Merkez','bartin-merkez'),('Amasra','bartin-amasra'),('Kurucaşile','bartin-kurucasile'),('Ulus','bartin-ulus')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'bartin' ON CONFLICT DO NOTHING;

-- ── ARDAHAN ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Ardahan Merkez','ardahan-merkez'),('Çıldır','ardahan-cildir'),('Damal','ardahan-damal'),
  ('Göle','ardahan-gole'),('Hanak','ardahan-hanak'),('Posof','ardahan-posof')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'ardahan' ON CONFLICT DO NOTHING;

-- ── IGDIR ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Iğdır Merkez','igdir-merkez'),('Aralık','igdir-aralik'),('Karakoyunlu','igdir-karakoyunlu'),('Tuzluca','igdir-tuzluca')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'igdir' ON CONFLICT DO NOTHING;

-- ── YALOVA ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Yalova Merkez','yalova-merkez'),('Altınova','yalova-altinova'),('Armutlu','yalova-armutlu'),
  ('Çınarcık','yalova-cinarcik'),('Çiftlikköy','yalova-ciftlikkoy'),('Termal','yalova-termal')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'yalova' ON CONFLICT DO NOTHING;

-- ── KARABÜK ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Karabük Merkez','karabuk-merkez'),('Eflani','karabuk-eflani'),('Eskipazar','karabuk-eskipazar'),
  ('Ovacık','karabuk-ovacik'),('Safranbolu','karabuk-safranbolu'),('Yenice','karabuk-yenice')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'karabuk' ON CONFLICT DO NOTHING;

-- ── KİLİS ──
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id FROM (VALUES
  ('Kilis Merkez','kilis-merkez'),('Elbeyli','kilis-elbeyli'),('Musabeyli','kilis-musabeyli'),('Polateli','kilis-polateli')
) AS d(name, slug) CROSS JOIN cities c WHERE c.slug = 'kilis' ON CONFLICT DO NOTHING;
