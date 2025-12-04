// 患者情報取得API
// 患者の基本情報、診療履歴、アレルギー情報を提供する
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

  // GETリクエストの処理（患者一覧の取得）
  if (req.method === 'GET') {
    // デモ用患者データ
    const patients = [
      {
        id: 1,
        name: '山田一郎',
        age: 45,
        gender: 'male',
        phone: '090-1234-5678',
        email: 'yamada@example.com',
        address: '東京都渋谷区',
        emergency_contact: '山田花子 (妻) 090-2345-6789',
        medical_history: ['高血圧', '糖尿病'],
        allergies: ['ペニシリン'],
        last_visit: '2024-09-15',
        next_appointment: '2024-10-15'
      },
      {
        id: 2,
        name: '鈴木美咲',
        age: 32,
        gender: 'female',
        phone: '090-2345-6789',
        email: 'suzuki@example.com',
        address: '東京都新宿区',
        emergency_contact: '鈴木太郎 (夫) 090-3456-7890',
        medical_history: [],
        allergies: [],
        last_visit: '2024-09-20',
        next_appointment: '2024-10-20'
      },
      {
        id: 3,
        name: '田中健太',
        age: 8,
        gender: 'male',
        phone: '090-3456-7890',
        email: 'tanaka@example.com',
        address: '東京都世田谷区',
        emergency_contact: '田中由美 (母) 090-4567-8901',
        medical_history: ['喘息'],
        allergies: ['ダニ', 'ハウスダスト'],
        last_visit: '2024-09-25',
        next_appointment: '2024-10-25'
      }
    ];

    // 患者一覧をJSON形式で返す
    res.status(200).json(patients);
  } else {
    // 許可されていないHTTPメソッドの場合
    res.status(405).json({ error: 'Method not allowed' });
  }
}
