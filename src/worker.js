// Kalki Screener — Cloudflare Worker
// Scans S&P 500 + Russell 1000 every 30 mins during market hours
// Sends scheduled Telegram alerts when: volume > 2x avg AND price up > 3% AND new 20-day high.
// Manual /scan calls return data only; the UI sends scored Telegram alerts after scoring is finalized.

// ─── Stock Universe: S&P 500 + Russell 1000 large/mid caps ───────────────────
const UNIVERSE = [
  // S&P 500 core
  'AAPL','MSFT','NVDA','AMZN','META','GOOGL','TSLA','BRK.B','JPM','UNH',
  'XOM','V','MA','LLY','AVGO','PG','JNJ','COST','HD','MRK',
  'ABBV','CVX','PEP','KO','WMT','BAC','CRM','ACN','MCD','TMO',
  'CSCO','ABT','DHR','TXN','NEE','PM','ADBE','DIS','WFC','VZ',
  'NFLX','INTC','CMCSA','AMD','AMGN','RTX','HON','QCOM','IBM','CAT',
  'GE','INTU','SBUX','SPGI','BLK','BA','GS','AXP','MS','ISRG',
  'NOW','BKNG','LRCX','MDLZ','ADI','VRTX','REGN','PLD','AMT','SYK',
  'GILD','MMC','CI','ZTS','ADP','CB','TJX','SO','DUK','BSX',
  'EOG','SLB','MO','PGR','HUM','ELV','MCO','USB','PNC','TFC',
  'D','EXC','AEP','XEL','WM','ECL','ITW','EMR','ETN','APD',
  'GD','LMT','NOC','RTX','HCA','MCK','CVS','UHS','THC','HUM',
  'CL','KMB','CHD','CLX','SJM','CAG','GIS','K','CPB','MKC',
  'F','GM','TM','STLA','RIVN','LCID','NIO','LI','XPEV','FSR',
  'UBER','LYFT','ABNB','DASH','SNAP','PINS','TWTR','RDDT','HOOD','COIN',
  'SQ','PYPL','AFRM','UPST','LC','SOFI','NU','OPEN','OPFI','CURO',
  'SHOP','ETSY','EBAY','W','AMZN','TGT','BBY','M','KSS','JWN',
  'SPG','O','VICI','WPC','NNN','STORE','ADC','EPRT','NTST','GTY',
  'DKNG','MGM','WYNN','LVS','CZR','PENN','RSI','GENI','GMBL','EVERI',
  'PLTR','SNOW','NET','DDOG','CRWD','S','ZS','OKTA','PANW','FTNT',
  'MDB','CFLT','ESTC','GTLB','HCP','SUMO','NEWR','DT','APPD','APPDX',
  'RBLX','U','TTWO','EA','ATVI','MSFT','NTES','SE','GRAB','GOOG',
  'SPOT','TMUS','T','VZ','LUMN','SATS','VSAT','DISH','IRDM','GSAT',
  'ZM','WORK','DBX','BOX','DOCU','DOCN','PATH','PEGA','APPF','HUBS',
  'AMAT','KLAC','ASML','ONTO','MKSI','CREE','WOLF','IIVI','LITE','FNSR',
  'MRVL','SWKS','QRVO','MPWR','SITM','FORM','ACLS','UCTT','ICHR','KLIC',
  'TSM','SMIC','UMC','MU','WDC','STX','NAND','NXPI','ON','STM',
  'CG','KKR','APO','BX','ARES','TPG','BAM','OWL','BLUE','HLNE',
  'GPN','FIS','FISV','WEX','PAYO','EVTC','I','PRFT','EPAM','GLOB',
  'CHWY','PETS','ZTS','IDXX','HESK','CVET','PETS','PZZA','YUM','QSR',
  'CMG','DPZ','MCD','SBUX','DRI','TXRH','EAT','CAKE','DENN','JACK',
  'DAL','UAL','AAL','LUV','ALK','HA','JBLU','SAVE','ULCC','SNCY',
  'CCL','RCL','NCLH','VIK','ACEL','LUCK','MCRI','MTN','VAIL','SIX',
  'HLT','MAR','H','IHG','CHH','WH','STAY','APLE','PK','RHP',
  'XOM','CVX','COP','EOG','PXD','DVN','MRO','APA','FANG','OXY',
  'LNG','RRC','EQT','SWN','AR','CNX','CTRA','SM','PDCE','MTDR',
  'NEM','GOLD','AEM','KGC','AG','HL','PAAS','CDE','EXK','SILV',
  'FCX','SCCO','TECK','AA','CENX','KALU','ACH','ARNC','CSTM','HAYN',
  'CF','MOS','NTR','UAN','IPI','WLKP','OLN','ASH','HUN','TROX',
  'LIN','APD','AIR','PX','AIRG','ITRN','OTIS','CARR','JCI','TT',
  'INOD','CRCL','QS','SOFI','OPEN','MSTR','RIOT','MARA','HUT','BITF',
  'SMCI','DELL','HPE','HPQ','NTAP','PSTG','NTNX','VNET','GDS','IREN',
  'IONQ','QMCO','ARQQ','QUBT','RGTI','QBTS','IQM','QTUM','QFIN','QDEL',
  'CELH','MNST','KDP','STZ','BUD','SAM','COORS','TAP','ABEV','DEO',
  'WOLF','CRDO','SGML','LAC','ALB','SQM','LTHM','LIVENT','PLL','ALTM',
  'ACHR','JOBY','LILM','EVEX','BLDE','WKHS','NKLA','HYZN','HYLN','AYRO',
  'RKLB','ASTR','MNTS','SPIR','ASTS','AST','OSAT','ORBK','MAXR','PL',
  'AAON','AEIS','AEHR','AEVA','AGCO','AIXI','AKAM','AKTS','ALCC','ALEC',
  'ALIT','ALKT','ALNY','ALPN','ALSN','ALTO','ALTR','ALVO','ALXO','AMBC',
  'AMED','AMEH','AMKR','AMPH','AMRX','AMSC','AMWD','ANAB','ANET','ANGI',
  'ANGO','ANF','ANIP','ANSS','ANTE','AORT','APAM','APLE','APLS','APLT',
  'APOG','APRE','APTV','APTX','APVO','APWC','AQMS','AQNA','AQST','ARAY',
  'ARCO','ARCT','ARDX','AREC','ARGX','ARLO','ARMP','ARNC','AROC','AROW',
  'ARQT','ARRY','ARTL','ARTNA','ARTW','ARVN','ARWR','ASAI','ASAX','ASGN',
  'ASIX','ASLV','ASND','ASPS','ASPU','ASRT','ASTC','ASTE','ASTH','ASTI',
  'ASTL','ASUR','ASYS','ATAI','ATEC','ATEN','ATEX','ATGL','ATHA','ATHE',
  'ATIF','ATIP','ATKR','ATLO','ATNF','ATNM','ATNO','ATOS','ATPC','ATRC',
  'ATRI','ATRS','ATRX','ATSG','ATTO','ATUS','ATVI','ATXI','ATYR','AUDC',
];

// Deduplicate
const TICKERS = [...new Set(UNIVERSE)];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isMarketHours() {
  const now = new Date();
  // Convert to ET
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const h = et.getHours();
  const m = et.getMinutes();
  const mins = h * 60 + m;
  // 9:30 AM to 4:00 PM ET
  return mins >= 570 && mins <= 960;
}

async function fetchQuote(ticker, env, asOfDate = null) {
  const range = asOfDate ? '1y' : '30d';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=${range}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 KalkiScreener/1.0',
    },
    cf: { cacheTtl: 60 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) return null;

  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const candles = timestamps.map((ts, i) => ({
    date: new Date(ts * 1000).toISOString().slice(0, 10),
    close: quote.close?.[i],
    volume: quote.volume?.[i],
    high: quote.high?.[i],
  })).filter(c => c.close != null && c.volume != null && c.high != null);

  if (candles.length < 22) return null;

  let idx = candles.length - 1;
  if (asOfDate) {
    idx = -1;
    for (let i = candles.length - 1; i >= 0; i--) {
      if (candles[i].date <= asOfDate) {
        idx = i;
        break;
      }
    }
  }

  if (idx < 21) return null;

  const currentCandle = candles[idx];
  const prevCandle = candles[idx - 1];
  const prior20 = candles.slice(idx - 20, idx);

  const current = currentCandle.close;
  const prev = prevCandle.close;
  const high20 = Math.max(...prior20.map(c => c.high));
  const avgVol20 = prior20.reduce((sum, c) => sum + c.volume, 0) / prior20.length;
  const todayVol = currentCandle.volume;
  const pctChange = ((current - prev) / prev) * 100;
  const volRatio = todayVol / avgVol20;

  const new20DayHigh = current > high20;
  return { ticker, date: currentCandle.date, current, prev, pctChange, volRatio, todayVol, avgVol20, high20, new20DayHigh };
}

async function sendTelegram(msg, env) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    throw new Error('Telegram secrets are not configured');
  }
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: msg,
      parse_mode: 'HTML',
    }),
  });
}

// ─── Main screener logic ──────────────────────────────────────────────────────

async function runScreener(env, options = {}) {
  const alerts = [];
  const asOfDate = options.date || null;
  const strict = Boolean(options.strict);
  const offset = Math.max(0, Number(options.offset) || 0);
  const limit = Math.min(20, Math.max(1, Number(options.limit) || 20));
  const tickers = TICKERS.slice(offset, offset + limit);

  // Batch fetch — 10 at a time to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(t => fetchQuote(t, env, asOfDate)));

    for (const res of results) {
      if (res.status !== 'fulfilled' || !res.value) continue;
      const q = res.value;

      // Strict criteria are for scheduled Telegram alerts.
      const volumeBreakout = q.volRatio >= 2.0;          // Volume > 2x 20-day avg
      const priceBreakout = q.pctChange >= 3.0;           // Price up > 3% today
      const new20DayHigh = q.current > q.high20;          // Breaking 20-day high
      const strictBreakout = volumeBreakout && priceBreakout && new20DayHigh;

      // Manual scans return all valid quotes so the UI/backtest controls filtering.
      if (strict ? strictBreakout : true) {
        alerts.push(q);
      }
    }

    // Small delay between batches
    await new Promise(r => setTimeout(r, 200));
  }

  const nextOffset = offset + tickers.length;
  return {
    alerts,
    scanned: TICKERS.length,
    processed: tickers.length,
    offset,
    nextOffset: nextOffset < TICKERS.length ? nextOffset : null,
    done: nextOffset >= TICKERS.length,
    date: asOfDate,
  };
}

// ─── Worker entry ─────────────────────────────────────────────────────────────

export default {
  // Cron trigger — runs every 30 mins
  async scheduled(event, env, ctx) {
    if (!isMarketHours()) return;
    ctx.waitUntil(runAndAlert(env));
  },

  // HTTP trigger — for manual testing: GET /scan
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const url = new URL(request.url);
    if (url.pathname === '/scan') {
      const date = normalizeDate(url.searchParams.get('date'));
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      const limit = parseInt(url.searchParams.get('limit') || '40', 10);
      const data = await runScreener(env, { date, strict: false, offset, limit });
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }

    if (url.pathname === '/alert' && request.method === 'POST') {
      try {
        const body = await request.json();
        const msg = buildManualAlertMessage(body);
        await sendTelegram(msg, env);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', ...cors },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...cors },
        });
      }
    }

    return new Response('Kalki Screener running. Hit /scan to trigger manually.', {
      status: 200, headers: cors,
    });
  },
};

async function runAndAlert(env, returnAlerts = false, date = null, options = {}) {
  const scanOptions = returnAlerts
    ? { date, strict: false, ...options }
    : { date, strict: true, offset: 0, limit: 40 };
  const data = await runScreener(env, scanOptions);
  const { alerts } = data;
  const now = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit', minute: '2-digit', hour12: true,
    month: '2-digit', day: '2-digit', year: 'numeric'
  });

  if (alerts.length === 0) {
    if (returnAlerts) return { ...data, alerts: [] };
    // Optionally send a "no alerts" message — commented out to avoid spam
    // await sendTelegram(`🔍 Kalki Scan ${now} — No breakouts found`, env);
    return;
  }

  const telegramAlerts = alerts.filter(isStrictBreakout);
  if (!returnAlerts && telegramAlerts.length === 0) return;

  for (const q of telegramAlerts) {
    const msg =
`⚡ <b>${q.ticker}</b>
💰 Price: $${q.current.toFixed(2)}
📈 Change: +${q.pctChange.toFixed(1)}%
📊 Volume: ${(q.volRatio).toFixed(1)}x avg (${(q.todayVol / 1_000_000).toFixed(1)}M shares)
🔝 Breaking 20-day high
⏰ ${now} ET
⚡ Kalki Screener`;

    await sendTelegram(msg, env);
    // Small delay between messages
    await new Promise(r => setTimeout(r, 300));
  }

  if (returnAlerts) return data;
}

function buildManualAlertMessage(body) {
  const q = body?.alert || {};
  const score = body?.score || null;
  if (!q.ticker) throw new Error('alert.ticker is required');

  const now = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit', minute: '2-digit', hour12: true,
    month: '2-digit', day: '2-digit', year: 'numeric'
  });

  const lines = [
    `⚡ <b>${escapeHtml(q.ticker)}</b>`,
  ];

  if (score) {
    lines.push(`🏆 Grade: ${score.grade || '—'} · Score: ${score.score ?? '—'}/10`);
  }

  lines.push(
    `💰 Price: $${formatNumber(q.current)}`,
    `📈 Change: ${formatSigned(q.pctChange)}%`,
    `📊 Volume: ${formatNumber(q.volRatio, 1)}x avg (${formatNumber((q.todayVol || 0) / 1_000_000, 1)}M shares)`,
    q.new20DayHigh ? '🔝 Breaking 20-day high' : '📍 Momentum alert',
    `⏰ ${now} ET`,
    '⚡ Kalki Screener'
  );

  return lines.join('\n');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatNumber(value, digits = 2) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(digits) : '—';
}

function formatSigned(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}`;
}

function isStrictBreakout(q) {
  return q.volRatio >= 2.0 && q.pctChange >= 3.0 && q.new20DayHigh;
}

function normalizeDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}
