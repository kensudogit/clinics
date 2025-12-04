// 予約管理API
// 診療予約の作成、取得、更新、削除を管理する
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

  // GETリクエストの処理（予約一覧の取得）
  if (req.method === 'GET') {
    // デモ用予約データ
    const bookings = [
      {
        id: 1,
        patient_id: 1,
        doctor_id: 1,
        clinic_id: 1,
        appointment_date: '2024-10-03',
        appointment_time: '10:00',
        status: 'confirmed',
        notes: '定期健診',
        duration: 30,
        created_at: '2024-09-20T09:00:00Z',
        updated_at: '2024-09-20T09:00:00Z'
      },
      {
        id: 2,
        patient_id: 2,
        doctor_id: 2,
        clinic_id: 1,
        appointment_date: '2024-10-04',
        appointment_time: '14:30',
        status: 'pending',
        notes: '初診',
        duration: 45,
        created_at: '2024-09-21T10:00:00Z',
        updated_at: '2024-09-21T10:00:00Z'
      },
      {
        id: 3,
        patient_id: 3,
        doctor_id: 2,
        clinic_id: 3,
        appointment_date: '2024-10-05',
        appointment_time: '15:00',
        status: 'confirmed',
        notes: '喘息の定期チェック',
        duration: 20,
        created_at: '2024-09-22T11:00:00Z',
        updated_at: '2024-09-22T11:00:00Z'
      }
    ];

    // 予約一覧をJSON形式で返す
    res.status(200).json(bookings);
  } else if (req.method === 'POST') {
    // POSTリクエストの処理（新規予約の作成）
    const newBooking = {
      id: Math.floor(Math.random() * 10000), // ランダムなID生成
      patient_id: req.body.patient_id,
      doctor_id: req.body.doctor_id,
      clinic_id: req.body.clinic_id,
      appointment_date: req.body.appointment_date,
      appointment_time: req.body.appointment_time,
      status: 'pending', // 新規予約は「保留中」ステータス
      notes: req.body.notes || '',
      duration: req.body.duration || 30, // デフォルト30分
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 新規予約をJSON形式で返す
    res.status(201).json(newBooking);
  } else {
    // 許可されていないHTTPメソッドの場合
    res.status(405).json({ error: 'Method not allowed' });
  }
}
