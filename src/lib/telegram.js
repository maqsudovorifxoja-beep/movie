// Telegram Bot Integration Service for CineFlow
const TELEGRAM_CONFIG_KEY = 'cineflow_telegram_config';
const DEFAULT_BOT_TOKEN = '8690944939:AAFAoy4ubx52L3BK5xM0p2IBSnBlwUd3qSY';
const DEFAULT_CHAT_ID = '5389465132';

export function getTelegramConfig() {
  try {
    const raw = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        botToken: parsed.botToken || DEFAULT_BOT_TOKEN,
        chatId: parsed.chatId || DEFAULT_CHAT_ID,
        enabled: parsed.enabled !== false,
      };
    }
  } catch (e) {
    console.warn('Error reading telegram config:', e);
  }
  return {
    botToken: DEFAULT_BOT_TOKEN,
    chatId: DEFAULT_CHAT_ID,
    enabled: true,
  };
}

export function saveTelegramConfig(config) {
  try {
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Error saving telegram config:', e);
  }
}

/**
 * Send a movie poster with rich caption & inline buttons to Telegram channel or chat
 */
export async function sendMovieToTelegram(movie, customConfig = null) {
  const config = customConfig || getTelegramConfig();

  const botToken = config.botToken || DEFAULT_BOT_TOKEN;
  const chatId = config.chatId || DEFAULT_CHAT_ID;

  if (!botToken || !chatId) {
    console.info('Telegram Bot Token yoki Chat ID sozlanmagan. Xabar yuborilmadi.');
    return { success: false, reason: 'unconfigured' };
  }

  const title = movie.title_uz || movie.title;
  const originalTitle = movie.title !== title ? ` (${movie.title})` : '';
  const genres = Array.isArray(movie.genres) ? movie.genres.join(', ') : 'Kino';
  const year = movie.release_year || new Date().getFullYear();
  const rating = movie.rating || '7.5';
  const duration = movie.duration ? `${movie.duration} daqiqa` : '120 daqiqa';
  const quality = movie.quality || '4K Ultra HD';
  const desc = (movie.description_uz || movie.description || '').slice(0, 450);

  // Formatted caption with Cinema aesthetics
  const caption = 
`🎬 <b>YANGI FILM PREMYERASI!</b>

🍿 <b>Nomi:</b> ${title}${originalTitle}
📅 <b>Yili:</b> ${year}-yil
⭐️ <b>IMDb Reyting:</b> ${rating} / 10
⏱ <b>Davomiyligi:</b> ${duration}
🎭 <b>Janr:</b> ${genres}
📺 <b>Sifati:</b> ${quality}

📝 <b>Film haqida:</b>
<i>${desc}...</i>

✨ <i>CineFlow kino portalida tomosha qiling!</i>`;

  // Inline keyboard buttons
  const siteUrl = window.location.origin ? `${window.location.origin}/movie/${movie.id}` : 'https://cineflow.uz';
  const inlineButtons = [];

  const row1 = [{ text: "🎬 Saytda tomosha qilish", url: siteUrl }];
  if (movie.trailer_url) {
    row1.push({ text: "🍿 Treylerni ko'rish", url: movie.trailer_url });
  }
  inlineButtons.push(row1);

  const replyMarkup = {
    inline_keyboard: inlineButtons
  };

  const endpoint = `https://api.telegram.org/bot${botToken}/sendPhoto`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: movie.poster_url,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      })
    });

    const result = await response.json();

    if (!result.ok) {
      console.warn('Telegram sendPhoto failed, trying fallback to sendMessage:', result.description);
      return await sendFallbackMessage(botToken, chatId, movie, caption, replyMarkup);
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Telegram notification error:', error);
    return { success: false, error: error.message };
  }
}

// Fallback text message if photo URL is blocked/unreachable
async function sendFallbackMessage(botToken, chatId, movie, caption, replyMarkup) {
  try {
    const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `${caption}\n\n🖼 <b>Poster:</b> ${movie.poster_url}`,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      })
    });
    const res = await response.json();
    return { success: res.ok, data: res };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send a test ping to check if Bot Token & Chat ID are correct
 */
export async function testTelegramConnection(botToken, chatId) {
  const token = botToken || DEFAULT_BOT_TOKEN;
  const targetChat = chatId || DEFAULT_CHAT_ID;

  if (!token || !targetChat) {
    throw new Error("Bot Token va Chat ID to'ldirilishi shart!");
  }

  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: targetChat,
      text: `✅ <b>CineFlow Telegram Bot muvaffaqiyatli ulandi!</b>\n\nEndi har safar saytga yangi kino qo'shilganda rasmi va treyleri bilan avtomatik sizga yuboriladi. 🎬🍿`,
      parse_mode: 'HTML',
    })
  });

  const res = await response.json();
  if (!res.ok) {
    throw new Error(res.description || "Telegram botga ulanib bo'lmadi. Token yoki Chat ID ni tekshiring.");
  }

  return res;
}
