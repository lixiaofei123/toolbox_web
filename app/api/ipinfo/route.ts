export const runtime = 'edge';

function fakeUUID(): string {
  return Date.now().toString() + Math.floor(Math.random() * 1e8).toString();
}

// 简单国家信息映射示例
const countryInfoMap: Record<string, { name: string; alpha3: string; numeric: string }> = {
  CN: { name: 'China', alpha3: 'CHN', numeric: '156' },
  US: { name: 'United States', alpha3: 'USA', numeric: '840' },
  JP: { name: 'Japan', alpha3: 'JPN', numeric: '392' },
  DE: { name: 'Germany', alpha3: 'DEU', numeric: '276' },
  FR: { name: 'France', alpha3: 'FRA', numeric: '250' },
};

export async function GET(request: Request) {
  const headers = request.headers;

  const asn = 0; // 你没有提供 ASN 头，固定为0
  const cisp = 'Unknown'; // 运营商，当前无对应头，统一返回 Unknown

  const countryCodeAlpha2 = (headers.get('x-vercel-ip-country') || '').toUpperCase() || 'Unknown';

  // 根据国家码映射名称和其它码
  const countryInfo = countryInfoMap[countryCodeAlpha2] || {
    name: 'Unknown',
    alpha3: 'Unknown',
    numeric: 'Unknown',
  };

  // 省份名
  const regionName = headers.get('x-vercel-ip-region') || 'Unknown';
  // 省份代码：构造示例：CN-省份简称，简化为 CN-省份名首字母大写（非标准，仅示例）
  const regionCode =
    countryCodeAlpha2 !== 'Unknown' && regionName !== 'Unknown'
      ? `${countryCodeAlpha2}-${regionName.substring(0, 2).toUpperCase()}`
      : 'Unknown';

  // 城市名
  const cityName = headers.get('x-vercel-ip-city') || 'Unknown';

  // 纬度经度
  const latitude = parseFloat(headers.get('x-vercel-ip-latitude') ?? '') || 0;
  const longitude = parseFloat(headers.get('x-vercel-ip-longitude') ?? '') || 0;

  // ip
  const clientIp =
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('x-vercel-ip') ||
    'Unknown';

  const data = {
    geo: {
      asn,
      countryName: countryInfo.name,
      countryCodeAlpha2,
      countryCodeAlpha3: countryInfo.alpha3,
      countryCodeNumeric: countryInfo.numeric,
      regionName,
      regionCode,
      cityName,
      latitude,
      longitude,
      cisp,
    },
    uuid: fakeUUID(),
    clientIp,
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
