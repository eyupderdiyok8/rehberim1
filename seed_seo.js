const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function seedSeoContent() {
  console.log("Fetching page_urls...");
  const { data: pages, error } = await supabase
    .from('page_urls')
    .select(`
      id, page_type,
      city:cities(name),
      district:districts(name),
      service:services(name)
    `);

  if (error) {
    console.error("Error fetching pages:", error);
    return;
  }

  console.log(`Found ${pages.length} pages. Generating content...`);

  let updatedCount = 0;

  for (const page of pages) {
    const cityName = page.city?.name || "";
    const districtName = page.district?.name || "";
    const serviceName = page.service?.name || "Su Arıtma Hizmetleri";
    const serviceLower = serviceName.toLowerCase();

    let regionName = cityName;
    if (districtName) regionName = `${cityName} / ${districtName}`;

    let articleHtml = "";
    let faqs = [];

    if (page.page_type.includes('firms')) {
      articleHtml = `
        <h3>${regionName} En İyi ${serviceName} Firmaları</h3>
        <p>${regionName} bölgesinde güvenilir ve kaliteli <strong>${serviceLower}</strong> arayışındaysanız doğru yerdesiniz. Sağlıklı ve temiz suya ulaşmak, ailenizin ve işletmenizin sağlığı için en kritik adımlardan biridir. Sitemizde listelenen firmalar, ${regionName} genelinde uzun yıllardır hizmet veren, müşteri memnuniyetine önem gösteren sertifikalı uzmanlardan oluşmaktadır.</p>
        <p>Firmaların sunduğu hizmetler arasında cihaz kurulumu, periyodik filtre değişimi ve teknik servis desteği yer almaktadır. Kendinize en uygun firmayı seçmek için yukarıdaki listeden müşteri yorumlarını ve puanlarını inceleyebilir, firmalarla doğrudan iletişime geçerek anında randevu alabilirsiniz.</p>
      `;

      faqs = [
        {
          question: `${regionName} bölgesinde ${serviceLower} seçerken nelere dikkat etmeliyim?`,
          answer: `Öncelikle firmanın yetkili servis ağına ve kullandığı filtrelerin NSF gibi uluslararası sertifikalara sahip olup olmadığına dikkat etmelisiniz. Ayrıca sitemizdeki müşteri yorumlarını okuyarak firmanın satış sonrası hizmet kalitesini değerlendirebilirsiniz.`
        },
        {
          question: `Periyodik bakım ve filtre değişim sıklığı nedir?`,
          answer: `Genel olarak ${serviceLower} için ön filtrelerin 6 ayda bir, ana membran filtrenin ise kullanım yoğunluğuna ve şebeke suyunun kirlilik oranına bağlı olarak 1-2 yılda bir değişmesi önerilir. Listelediğimiz uzman firmalar periyodik bakımlarınızı sizin adınıza takip edebilir.`
        },
        {
          question: `Sitenizdeki firmalar ${regionName} genelinde her mahalleye hizmet veriyor mu?`,
          answer: `Evet, listelediğimiz premium ve onaylı firmaların birçoğu ${regionName} merkez ve çevre ilçelerine mobil teknik servis araçlarıyla aynı gün veya ertesi gün hızlı servis imkanı sunmaktadır.`
        }
      ];
    } else if (page.page_type.includes('price')) {
      articleHtml = `
        <h3>${regionName} ${serviceName} Fiyatları Nasıl Belirlenir?</h3>
        <p>${regionName} çevresinde <strong>${serviceLower}</strong> fiyatları, tercih edilen cihazın teknolojisine (örneğin ters osmoz), filtre sayısına ve firmanın sunduğu ekstra servis hizmetlerine göre değişiklik göstermektedir. Piyasada her bütçeye uygun seçenekler bulunmakla birlikte, çok ucuz cihazların uzun vadede daha yüksek bakım maliyetleri çıkarabileceğini unutmamak gerekir.</p>
        <p>Aşağıdaki tabloda firmaların sunduğu yaklaşık fiyat aralıklarını görebilirsiniz. En güncel ve net fiyat teklifini almak için doğrudan firma profiline tıklayarak yetkililerle görüşebilirsiniz.</p>
      `;

      faqs = [
        {
          question: `${regionName} bölgesinde ortalama ${serviceLower} fiyatları ne kadar?`,
          answer: `Fiyatlar cihazın kalitesine göre değişiklik gösterse de ortalama giriş seviyesi sistemler 2.500 TL'den başlarken, premium cihazlar 8.000 TL ile 15.000 TL arasına çıkabilmektedir.`
        },
        {
          question: `Fiyatlara kurulum (montaj) dahil mi?`,
          answer: `${regionName} içindeki çoğu profesyonel firma, satın aldığınız sistemler için ücretsiz montaj hizmeti sunmaktadır. Ancak yine de firmayla iletişime geçerken kurulumun dahil olup olmadığını teyit etmenizi öneririz.`
        }
      ];
    }

    if (articleHtml) {
      const { error: updError } = await supabase
        .from('page_urls')
        .update({
          seo_content: articleHtml.trim(),
          faqs: faqs
        })
        .eq('id', page.id);

      if (!updError) {
        updatedCount++;
      }
    }
  }

  console.log(`Successfully generated SEO content for ${updatedCount} pages!`);
}

seedSeoContent();
