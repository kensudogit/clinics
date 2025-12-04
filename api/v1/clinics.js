// クリニック情報取得API
// 医療機関の基本情報と専門分野を提供する
export default function handler(req, res) {
  // CORS設定（クロスオリジンリクエストの許可）
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONSリクエストの処理（プリフライトリクエスト）
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GETリクエストの処理（クリニック一覧の取得）
  if (req.method === 'GET') {
    // デモ用クリニックデータ
    const clinics = [
      {
        id: 1,
        name: '総合クリニック',
        address: '東京都渋谷区',
        phone: '03-1234-5678',
        specialties: ['内科', '外科', '小児科'],
        description: '地域密着型の総合医療クリニック',
        hours: '9:00-18:00',
        website: 'https://sogo-clinic.example.com'
      },
      {
        id: 2,
        name: '心臓血管クリニック',
        address: '東京都新宿区',
        phone: '03-2345-6789',
        specialties: ['循環器内科', '心臓外科'],
        description: '心臓・血管疾患の専門クリニック',
        hours: '8:30-17:30',
        website: 'https://heart-clinic.example.com'
      },
      {
        id: 3,
        name: '小児科専門クリニック',
        address: '東京都世田谷区',
        phone: '03-3456-7890',
        specialties: ['小児科', '小児外科'],
        description: 'お子様の健康をサポートする専門クリニック',
        hours: '9:00-17:00',
        website: 'https://pediatric-clinic.example.com'
      }
    ];

    // クリニック一覧をJSON形式で返す
    res.status(200).json(clinics);
  } else {
    // 許可されていないHTTPメソッドの場合
    res.status(405).json({ error: 'Method not allowed' });
  }
}
