export enum LoginTypes {
  PLAIN = "plain",
  PHONE = "phone",
  EMAIL = "email",
  VK = "vk",
  FACEBOOK = "facebook",
  GOOGLE = "google",
  YANDEX = "yandex",
}

export enum TokenTypes {
  Bearer = "Bearer",
}

export enum Genders {
  MALE = "male",
  FEMALE = "female",
}

export enum AspectRatios {
  "1_1" = "1:1",
  "16_9" = "16:9",
  "4_5" = "4:5",
  "4_3" = "4:3",
}

export enum NotificationTypes {
  SMS = "sms",
  Email = "email",
  Push = "push",
}

export enum FilesRelations {
  Preview = "preview",
  JPG = "jpg",
  Crop = "crop",
}

export enum ReceiptsTypes {
  BUY_ITEM = "buy_item", // покупка астрогочи
  BUY_WEEK = "buy_week", // покупка прогноза на неделю
  BUY_DAILY_CATEGORY = "buy_daily_category", // покупка доступа к категории цитат
}

export enum DynamicScales {
  DAY = "day", // день
  WEEK = "week", // неделя
  MONTH = "month", // месяц
  YEAR = "year", // год
}

export enum ReceiptsStatuses {
  NEW = "new", // новый
  READY = "ready", // готов к отправке
  PROCESS = "process", // обрабатывается
  SUCCESS = "success", // готов
  ERROR = "error", // ошибка
}

export enum PaymentsStatuses {
  NEW = "new", // новый
  WAIT_PAYMENT = "wait_payment", // ожидает оплаты
  PAID = "paid", // оплачен
  DECLINED = "declined", // отменен
  ERROR = "error", // ошибка
}

export enum PaymentsServicesTypes {
  YOO_KASSA = "yoo_kassa", // ю-касса
  TINKOFF_KASSA = "tinkoff_kassa", // tinkoff-касса
  STRIPE = "stripe", // stripe.com
  // PAYPAL = "paypal", // paypal.com
  // BLUESNAP = "bluesnap", // bluesnap.com
  // CRYPTO = "crypto", // какая-то крипта
  // MANUAL = "manual", // ручная оплата
}

export enum ReceiptsServicesTypes {
  KIT_ONLINE = "kit_online", // https://online.kit-invest.ru
  CLOUD_KASSIR = "cloud_kassir", // https://cloudkassir.ru
}

// платежные отсылки
export enum PaymentsReferences {
  ItemsCategories = "ItemsCategories",
  AstroWeeks = "ContentsAstroWeeks",
  DailyQuotesCategories = "ContentsDailyQuotesCategories",
}

// допустимые сущности для комментирования
export enum CommentsReferences {
  PUBLICATIONS = "Publications", // публикации
}

// приложения к публикациям
export enum PublicationsAttachmentsReferences {
  ITEMS = "Items", // предметы
  USERS = "Users", // пользователи
}
