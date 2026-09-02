# B2B SQL çalışma sırası

SQL dosyaları artık değiştirilmeyecek, numaralı güncellemeler halinde ilerleyecek.

## Daha önce ana kurulumu çalıştırdıysanız

`b2b_marketplace.sql` dosyasını **tekrar çalıştırmayın**. Aşağıdaki dosyaları sırayla, birer kez çalıştırın:

1. `b2b_updates/001_presence_and_messaging.sql`
2. `b2b_updates/002_trade_workflow.sql`
3. `b2b_updates/003_advertising.sql`
4. `b2b_updates/004_audit_logs.sql`
5. `b2b_updates/005_conversation_delete.sql`
6. `b2b_updates/006_notifications.sql`

Her dosya kendi içinde transaction kullanır. Hata oluşursa o dosyanın yaptığı işlemler geri alınır. Dosyalar mümkün olduğunca tekrar çalıştırılabilir hazırlanmıştır.

Eski `b2b_trade_network.sql` dosyasını daha önce çalıştırdıysanız da 001–006 dosyalarını sırayla çalıştırabilirsiniz. Komutlar mevcut tablo ve alanları koruyarak eksik kalan parçaları tamamlar.

## Takip kuralı

- `b2b_marketplace.sql`: İlk kurulum dosyasıdır ve artık değiştirilmeyecek.
- `b2b_updates/`: Sonradan gelen her özellik burada yeni bir sıra numarasıyla yer alacak.
- Çalıştırdığınız son dosyanın numarasını burada işaretleyebilirsiniz.

| Dosya | Özellik | Çalıştırıldı |
|---|---|---|
| 001 | Çevrimiçi kullanıcılar ve mesajlaşma | ☐ |
| 002 | Satın alma görüşmesi ve teklif akışı | ☐ |
| 003 | Bildirim ve popup reklamları | ☐ |
| 004 | Toptancı hareket kayıtları | ☐ |
| 005 | Mesaj görüşmesini kullanıcı bazında silme | ☐ |
| 006 | Gerçek zamanlı işlem ve mesaj bildirimleri | ☐ |
