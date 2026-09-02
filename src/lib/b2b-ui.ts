export const B2B_STATUS_LABELS: Record<string, string> = {
  requested: "Talep satıcıya iletildi",
  quoted: "Teklif gönderildi",
  accepted: "Teklif kabul edildi",
  completed: "Ticaret tamamlandı",
  cancelled: "Görüşme kapatıldı",
  disputed: "İnceleme sürüyor",
};

export const B2B_STATUS_STEPS = ["requested", "quoted", "accepted", "completed"] as const;

export function getB2BErrorMessage(error: unknown, fallback = "İşlem tamamlanamadı. Lütfen yeniden deneyin.") {
  const message = error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error && typeof error.message === "string"
        ? error.message
        : "";
  if (!message) return fallback;
  if (message.includes("row-level security")) return "Bu işlem için hesabınızın yetkisi bulunmuyor.";
  if (message.includes("duplicate key")) return "Bu kayıt daha önce oluşturulmuş.";
  if (message.includes("Failed to fetch")) return "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip yeniden deneyin.";
  if (message.includes("JWT") || message.includes("session")) return "Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.";
  return message;
}
