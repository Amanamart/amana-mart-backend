import { prisma } from '../../../common/lib/prisma';

const DEFAULT_SETTINGS = [
  { key: 'free_posting_limit', value: '5', group: 'posting' },
  { key: 'ad_expiry_days', value: '30', group: 'posting' },
  { key: 'auto_approve_trusted_sellers', value: 'false', group: 'moderation' },
  { key: 'max_images_free', value: '4', group: 'posting' },
  { key: 'max_images_member', value: '12', group: 'posting' },
  { key: 'phone_reveal_enabled', value: 'true', group: 'contact' },
  { key: 'chat_enabled', value: 'true', group: 'contact' },
  { key: 'whatsapp_enabled', value: 'true', group: 'contact' },
  { key: 'ad_cooldown_hours', value: '2', group: 'posting' },
  { key: 'prohibited_words', value: '[]', group: 'moderation' },
  { key: 'report_reasons', value: JSON.stringify(['fraud', 'wrong_category', 'offensive', 'duplicate', 'fake_price', 'prohibited', 'misleading']), group: 'moderation' },
  { key: 'safety_message', value: 'Always meet in a safe public place. Check item before paying. Beware of fraud.', group: 'safety' },
];

export class ClassifiedSettingsService {
  async getSettings() {
    const settings = await prisma.classifiedSetting.findMany();
    return settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  }

  async updateSettings(data: Record<string, string>) {
    for (const [key, value] of Object.entries(data)) {
      await prisma.classifiedSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
    return this.getSettings();
  }

  async seedDefaults() {
    let created = 0;
    for (const setting of DEFAULT_SETTINGS) {
      const exists = await prisma.classifiedSetting.findUnique({ where: { key: setting.key } });
      if (!exists) { await prisma.classifiedSetting.create({ data: setting }); created++; }
    }
    return { created };
  }
}

export default new ClassifiedSettingsService();
