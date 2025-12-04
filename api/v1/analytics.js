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
    const analytics = {
      total_patients: 150,
      total_consultations: 300,
      monthly_revenue: 2500000,
      average_consultation_time: 25,
      patient_satisfaction: 4.8,
      charts: {
        consultations_by_month: [
          { month: '2024-07', count: 45 },
          { month: '2024-08', count: 52 },
          { month: '2024-09', count: 48 },
          { month: '2024-10', count: 35 }
        ],
        specialties_distribution: [
          { specialty: '内科', count: 120 },
          { specialty: '小児科', count: 80 },
          { specialty: '外科', count: 60 },
          { specialty: '循環器内科', count: 40 }
        ],
        revenue_by_month: [
          { month: '2024-07', revenue: 2200000 },
          { month: '2024-08', revenue: 2400000 },
          { month: '2024-09', revenue: 2300000 },
          { month: '2024-10', revenue: 2500000 }
        ],
        patient_age_distribution: [
          { age_group: '0-10', count: 25 },
          { age_group: '11-20', count: 15 },
          { age_group: '21-30', count: 30 },
          { age_group: '31-40', count: 35 },
          { age_group: '41-50', count: 25 },
          { age_group: '51-60', count: 15 },
          { age_group: '61+', count: 5 }
        ]
      },
      kpis: {
        new_patients_this_month: 12,
        returning_patients_this_month: 28,
        average_wait_time: 15,
        appointment_cancellation_rate: 0.05,
        online_consultation_rate: 0.3
      }
    };

    res.status(200).json(analytics);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
