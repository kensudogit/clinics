require 'sinatra'
require 'json'
require 'mysql2'
require 'redis'

class ClinicsAPI < Sinatra::Base
  configure do
    enable :logging
    set :port, ENV.fetch('PORT', 3000).to_i
    set :bind, '0.0.0.0'
    # 静的ファイルの配信設定
    public_dir = File.join(File.dirname(__FILE__), '..', 'public')
    set :public_folder, public_dir
    set :static, true
    # デバッグ用ログ
    puts "Public folder path: #{public_dir}"
    puts "Public folder exists: #{File.exist?(public_dir)}"
    puts "Index.html exists: #{File.exist?(File.join(public_dir, 'index.html'))}"
  end

  # CORS設定
  before do
    headers 'Access-Control-Allow-Origin' => '*'
    headers 'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS'
    headers 'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
  end

  options '*' do
    200
  end

  # APIエンドポイント（先に定義する必要がある）
  get '/api/v1/health' do
    content_type :json
    { status: 'healthy', timestamp: Time.now.iso8601 }.to_json
  end

  # クリニック一覧
  get '/api/v1/clinics' do
    content_type :json
    [
      {
        id: 1,
        name: '総合クリニック',
        address: '東京都渋谷区',
        phone: '03-1234-5678',
        specialties: ['内科', '外科', '小児科']
      },
      {
        id: 2,
        name: '心臓血管クリニック',
        address: '東京都新宿区',
        phone: '03-2345-6789',
        specialties: ['循環器内科', '心臓外科']
      }
    ].to_json
  end

  # 医師一覧
  get '/api/v1/doctors' do
    content_type :json
    [
      {
        id: 1,
        name: '田中太郎',
        specialty: '内科',
        clinic_id: 1,
        experience_years: 10
      },
      {
        id: 2,
        name: '佐藤花子',
        specialty: '小児科',
        clinic_id: 1,
        experience_years: 8
      }
    ].to_json
  end

  # 患者一覧
  get '/api/v1/patients' do
    content_type :json
    [
      {
        id: 1,
        name: '山田一郎',
        age: 45,
        gender: 'male',
        phone: '090-1234-5678',
        email: 'yamada@example.com'
      },
      {
        id: 2,
        name: '鈴木美咲',
        age: 32,
        gender: 'female',
        phone: '090-2345-6789',
        email: 'suzuki@example.com'
      }
    ].to_json
  end

  # 予約一覧
  get '/api/v1/bookings' do
    content_type :json
    [
      {
        id: 1,
        patient_id: 1,
        doctor_id: 1,
        clinic_id: 1,
        appointment_date: '2024-10-03',
        appointment_time: '10:00',
        status: 'confirmed',
        notes: '定期健診'
      },
      {
        id: 2,
        patient_id: 2,
        doctor_id: 2,
        clinic_id: 1,
        appointment_date: '2024-10-04',
        appointment_time: '14:30',
        status: 'pending',
        notes: '初診'
      }
    ].to_json
  end

  # オンライン診療
  get '/api/v1/consultations' do
    content_type :json
    [
      {
        id: 1,
        patient_id: 1,
        doctor_id: 1,
        start_time: '2024-10-02T10:00:00Z',
        end_time: '2024-10-02T10:30:00Z',
        status: 'completed',
        diagnosis: '風邪',
        prescription: '解熱剤'
      }
    ].to_json
  end

  # 電子カルテ
  get '/api/v1/medical_records' do
    content_type :json
    [
      {
        id: 1,
        patient_id: 1,
        doctor_id: 1,
        visit_date: '2024-10-02',
        symptoms: '発熱、咳',
        diagnosis: '風邪',
        treatment: '解熱剤、咳止め',
        notes: '安静を心がける'
      }
    ].to_json
  end

  # 問診票
  get '/api/v1/questionnaires' do
    content_type :json
    [
      {
        id: 1,
        patient_id: 1,
        questions: [
          { id: 1, question: '現在の症状は？', answer: '発熱、咳' },
          { id: 2, question: '症状の期間は？', answer: '3日間' },
          { id: 3, question: '既往歴は？', answer: '特になし' }
        ],
        submitted_at: '2024-10-02T09:00:00Z'
      }
    ].to_json
  end

  # ビジネス分析データ
  get '/api/v1/analytics' do
    content_type :json
    {
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
        ]
      }
    }.to_json
  end

  # POST エンドポイント（新規作成）
  post '/api/v1/bookings' do
    content_type :json
    request_data = JSON.parse(request.body.read)
    
    booking = {
      id: rand(1000..9999),
      patient_id: request_data['patient_id'],
      doctor_id: request_data['doctor_id'],
      clinic_id: request_data['clinic_id'],
      appointment_date: request_data['appointment_date'],
      appointment_time: request_data['appointment_time'],
      status: 'pending',
      notes: request_data['notes'] || ''
    }
    
    status 201
    booking.to_json
  end

  post '/api/v1/consultations' do
    content_type :json
    request_data = JSON.parse(request.body.read)
    
    consultation = {
      id: rand(1000..9999),
      patient_id: request_data['patient_id'],
      doctor_id: request_data['doctor_id'],
      start_time: Time.now.iso8601,
      status: 'in_progress',
      diagnosis: '',
      prescription: ''
    }
    
    status 201
    consultation.to_json
  end

  # エラーハンドリング
  error 404 do
    content_type :json
    { error: 'Not Found', message: 'The requested resource was not found' }.to_json
  end

  error 500 do
    content_type :json
    { error: 'Internal Server Error', message: 'Something went wrong' }.to_json
  end

  # 静的ファイルの配信（CSS、JS、画像など）
  get '/static/*' do
    send_file File.join(settings.public_folder, 'static', params[:splat].first)
  end

  # ルートパス - フロントエンドのindex.htmlを返す
  get '/' do
    index_path = File.join(settings.public_folder, 'index.html')
    puts "Root path requested. Index path: #{index_path}"
    puts "Index exists: #{File.exist?(index_path)}"
    if File.exist?(index_path)
      content_type 'text/html'
      send_file index_path
    else
      status 404
      content_type :json
      { error: 'Not Found', message: "Frontend build not found. Index path: #{index_path}" }.to_json
    end
  end

  # SPA用のルーティング - すべてのパスでindex.htmlを返す（APIパス以外）
  # このルーティングは最後に定義する必要がある（APIエンドポイントの後に）
  get '/*' do
    # APIパスは既に処理されているので、ここには来ない
    file_path = File.join(settings.public_folder, request.path)
    puts "SPA route requested: #{request.path}, file_path: #{file_path}"
    
    # 静的ファイルが存在する場合はそれを返す
    if File.exist?(file_path) && File.file?(file_path)
      send_file file_path
    else
      # SPA用にindex.htmlを返す
      index_path = File.join(settings.public_folder, 'index.html')
      if File.exist?(index_path)
        content_type 'text/html'
        send_file index_path
      else
        status 404
        content_type :json
        { error: 'Not Found', message: "Frontend build not found. Index path: #{index_path}" }.to_json
      end
    end
  end
end

# サーバー起動
if __FILE__ == $0
  ClinicsAPI.run!
end
