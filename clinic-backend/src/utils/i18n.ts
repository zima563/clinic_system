export type Lang = 'ar' | 'en';

export const getLangFromRequest = (acceptLanguageHeader?: string): Lang => {
  if (!acceptLanguageHeader) return 'ar';
  return acceptLanguageHeader.toLowerCase().includes('en') ? 'en' : 'ar';
};

const messages = {
  noToken: {
    ar: 'لم يتم توفير رمز التوثيق (Token)',
    en: 'No token provided'
  },
  userNotFound: {
    ar: 'المستخدم غير موجود',
    en: 'User not found'
  },
  userNotActive: {
    ar: 'حساب المستخدم غير مفعل',
    en: 'User account is not active'
  },
  userDeleted: {
    ar: 'حساب المستخدم محذوف',
    en: 'User account is deleted'
  },
  serverError: {
    ar: 'حدث خطأ غير متوقع في الخادم',
    en: 'An unexpected server error occurred'
  },
  unauthorized: {
    ar: 'غير مصرح لك بالوصول',
    en: 'Unauthorized access'
  }
};

export const getTranslation = (key: keyof typeof messages, lang: Lang = 'ar'): string => {
  return messages[key]?.[lang] || messages[key]?.['ar'] || key;
};
