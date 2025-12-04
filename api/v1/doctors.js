// 医師情報取得API
// 医師の基本情報、専門分野、経験年数、資格を提供する
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

  // GETリクエストの処理（医師一覧の取得）
  if (req.method === 'GET') {
    // デモ用医師データ
    const doctors = [
      {
        id: 1,
        name: '田中太郎',
        specialty: '内科',
        clinic_id: 1,
        experience_years: 10,
        education: '東京大学医学部卒業',
        certifications: ['日本内科学会認定医', '循環器専門医'],
        languages: ['日本語', '英語'],
        profile_image: '/images/doctors/tanaka.jpg'
      },
      {
        id: 2,
        name: '佐藤花子',
        specialty: '小児科',
        clinic_id: 1,
        experience_years: 8,
        education: '慶應義塾大学医学部卒業',
        certifications: ['日本小児科学会専門医'],
        languages: ['日本語'],
        profile_image: '/images/doctors/sato.jpg'
      },
      {
        id: 3,
        name: '山田一郎',
        specialty: '循環器内科',
        clinic_id: 2,
        experience_years: 15,
        education: '大阪大学医学部卒業',
        certifications: ['日本循環器学会専門医', '心臓血管外科専門医'],
        languages: ['日本語', '英語', '中国語'],
        profile_image: '/images/doctors/yamada.jpg'
      }
    ];

    // 医師一覧をJSON形式で返す
    res.status(200).json(doctors);
  } else {
    // 許可されていないHTTPメソッドの場合
    res.status(405).json({ error: 'Method not allowed' });
  }
}
