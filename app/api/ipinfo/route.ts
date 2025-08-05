export const runtime = 'edge'; // 声明为边缘函数

function fakeUUID(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'fake-uuid-';
  for (let i = 0; i < 22; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getAlpha3(alpha2: string): string {
  const map: Record<string, string> = {
    CN: 'CHN',
    US: 'USA',
    JP: 'JPN',
    DE: 'DEU',
    FR: 'FRA',
  };
  return map[alpha2.toUpperCase()] ?? 'Unknown';
}

// Alpha-2 转数字国家码
function getCountryNumeric(alpha2: string): string {
  const map: Record<string, string> = {
    CN: '156',
    US: '840',
    JP: '392',
    DE: '276',
    FR: '250',
  };
  return map[alpha2.toUpperCase()] ?? 'Unknown';
}

function getISP(asn: string): string {
  const map: Record<string, string> = {
    '4134': 'China Telecom',
    '4837': 'China Unicom',
    '9808': 'China Mobile',
    '7018': 'AT&T',
    '3320': 'Deutsche Telekom',
  };
  return map[asn] ?? 'Unknown';
}

export async function GET(request: Request) {
  const headers = request.headers;

  const asnRaw = headers.get('x-vercel-ip-asn') ?? '';
  const countryAlpha2 = headers.get('x-vercel-ip-country') ?? '';

  const geo = {
    asn: parseInt(asnRaw) || 'Unknown',
    countryName: headers.get('x-vercel-ip-country-region') || 'Unknown',
    countryCodeAlpha2: countryAlpha2 || 'Unknown',
    countryCodeAlpha3: getAlpha3(countryAlpha2),
    countryCodeNumeric: getCountryNumeric(countryAlpha2),
    regionName: headers.get('x-vercel-ip-region') || 'Unknown',
    regionCode: headers.get('x-vercel-ip-region-code') || 'Unknown',
    cityName: headers.get('x-vercel-ip-city') || 'Unknown',
    latitude: parseFloat(headers.get('x-vercel-ip-latitude') ?? '') || 'Unknown',
    longitude: parseFloat(headers.get('x-vercel-ip-longitude') ?? '') || 'Unknown',
    cisp: getISP(asnRaw),
  };

  const clientIp =
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'Unknown';

  const data = {
    geo,
    uuid: fakeUUID(),
    clientIp,
  };

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}
