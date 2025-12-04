export default function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const consultations = [
      {
        id: 1,
        patient_id: 1,
        doctor_id: 1,
        start_time: '2024-10-02T10:00:00Z',
        end_time: '2024-10-02T10:30:00Z',
        status: 'completed',
        diagnosis: '風邪',
        prescription: '解熱剤、咳止め',
        notes: '安静を心がける',
        video_url: 'https://example.com/consultation/1',
        duration: 30,
        created_at: '2024-10-02T09:00:00Z'
      },
      {
        id: 2,
        patient_id: 2,
        doctor_id: 2,
        start_time: '2024-10-02T14:00:00Z',
        end_time: null,
        status: 'in_progress',
        diagnosis: '',
        prescription: '',
        notes: '',
        video_url: 'https://example.com/consultation/2',
        duration: 0,
        created_at: '2024-10-02T13:30:00Z'
      }
    ];

    res.status(200).json(consultations);
  } else if (req.method === 'POST') {
    const newConsultation = {
      id: Math.floor(Math.random() * 10000),
      patient_id: req.body.patient_id,
      doctor_id: req.body.doctor_id,
      start_time: new Date().toISOString(),
      end_time: null,
      status: 'in_progress',
      diagnosis: '',
      prescription: '',
      notes: '',
      video_url: `https://example.com/consultation/${Math.floor(Math.random() * 10000)}`,
      duration: 0,
      created_at: new Date().toISOString()
    };

    res.status(201).json(newConsultation);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
