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
    # api_server.rbは/app/backend/にあるので、/app/publicを指す
    public_dir = File.expand_path(File.join(File.dirname(__FILE__), '..', 'public'))
    set :public_folder, public_dir
    set :static, true
    # デバッグ用ログ（stderrに出力してRailwayのログで確認可能）
    STDERR.puts "=" * 50
    STDERR.puts "Application starting..."
    STDERR.puts "Public folder path: #{public_dir}"
    STDERR.puts "Public folder exists: #{File.exist?(public_dir)}"
    STDERR.puts "Current working directory: #{Dir.pwd}"
    STDERR.puts "api_server.rb location: #{__FILE__}"
    
    if File.exist?(public_dir)
      STDERR.puts "Public folder contents: #{Dir.entries(public_dir).join(', ')}"
    else
      STDERR.puts "WARNING: Public folder does not exist!"
    end
    
    index_path = File.join(public_dir, 'index.html')
    STDERR.puts "Index.html path: #{index_path}"
    STDERR.puts "Index.html exists: #{File.exist?(index_path)}"
    
    # 代替パスも確認
    alt_paths = ['/app/public', File.join(Dir.pwd, 'public')]
    alt_paths.each do |alt|
      STDERR.puts "Alternative path #{alt} exists: #{File.exist?(alt)}"
      if File.exist?(alt) && File.exist?(File.join(alt, 'index.html'))
        STDERR.puts "Found index.html at alternative path: #{File.join(alt, 'index.html')}"
      end
    end
    
    STDERR.puts "=" * 50
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

  # 静的ファイルの配信（CSS、JS、画像など）
  # 注意: このルーティングはエラーハンドラーの前に定義する必要がある
  get '/static/*' do
    file_path = File.join(settings.public_folder, 'static', params[:splat].first)
    STDERR.puts "=" * 50
    STDERR.puts "Static file requested: #{request.path}"
    STDERR.puts "Splat param: #{params[:splat].inspect}"
    STDERR.puts "File path: #{file_path}"
    STDERR.puts "File exists: #{File.exist?(file_path)}"
    STDERR.puts "Is file: #{File.file?(file_path) if File.exist?(file_path)}"
    STDERR.puts "Public folder: #{settings.public_folder}"
    STDERR.puts "Public folder exists: #{File.exist?(settings.public_folder)}"
    if File.exist?(settings.public_folder)
      STDERR.puts "Public folder contents: #{Dir.entries(settings.public_folder).join(', ')}"
      static_dir = File.join(settings.public_folder, 'static')
      STDERR.puts "Static directory exists: #{File.exist?(static_dir)}"
      if File.exist?(static_dir)
        STDERR.puts "Static directory contents: #{Dir.entries(static_dir).join(', ')}"
        # リクエストされたファイルの親ディレクトリも確認
        requested_dir = File.dirname(file_path)
        STDERR.puts "Requested file directory: #{requested_dir}"
        STDERR.puts "Requested file directory exists: #{File.exist?(requested_dir)}"
        if File.exist?(requested_dir)
          STDERR.puts "Requested file directory contents: #{Dir.entries(requested_dir).join(', ')}"
        end
      end
    end
    STDERR.puts "=" * 50
    
    if File.exist?(file_path) && File.file?(file_path)
      # MIMEタイプを正しく設定
      ext = File.extname(file_path).downcase
      mime_type = case ext
                   when '.js' then 'application/javascript'
                   when '.css' then 'text/css'
                   when '.png' then 'image/png'
                   when '.jpg', '.jpeg' then 'image/jpeg'
                   when '.gif' then 'image/gif'
                   when '.svg' then 'image/svg+xml'
                   when '.ico' then 'image/x-icon'
                   when '.json' then 'application/json'
                   when '.woff' then 'font/woff'
                   when '.woff2' then 'font/woff2'
                   when '.ttf' then 'font/ttf'
                   when '.eot' then 'application/vnd.ms-fontobject'
                   else 'application/octet-stream'
                   end
      STDERR.puts "Serving file with MIME type: #{mime_type}"
      content_type mime_type
      send_file file_path
    else
      STDERR.puts "ERROR: Static file not found!"
      # 404エラーを返すが、MIMEタイプは適切に設定する
      ext = File.extname(file_path).downcase
      mime_type = case ext
                   when '.js' then 'application/javascript'
                   when '.css' then 'text/css'
                   when '.png' then 'image/png'
                   when '.jpg', '.jpeg' then 'image/jpeg'
                   when '.gif' then 'image/gif'
                   when '.svg' then 'image/svg+xml'
                   when '.ico' then 'image/x-icon'
                   when '.json' then 'application/json'
                   else 'text/plain'
                   end
      status 404
      content_type mime_type
      # JSONではなく、適切なMIMEタイプで404を返す
      # ただし、デバッグ情報はJSONで返す
      if mime_type == 'application/json'
        { error: 'Not Found', message: "Static file not found: #{request.path}", debug: { file_path: file_path, exists: File.exist?(file_path) } }.to_json
      else
        # JavaScriptやCSSの場合は、空のレスポンスまたはエラーメッセージを返す
        ''
      end
    end
  end

  # ルートパス - フロントエンドのindex.htmlを返す
  get '/' do
    index_path = File.join(settings.public_folder, 'index.html')
    
    # デバッグログ（stderrに出力してRailwayのログで確認可能）
    STDERR.puts "=" * 50
    STDERR.puts "Root path requested"
    STDERR.puts "Public folder: #{settings.public_folder}"
    STDERR.puts "Index path: #{index_path}"
    STDERR.puts "Index exists: #{File.exist?(index_path)}"
    STDERR.puts "Current working directory: #{Dir.pwd}"
    
    if File.exist?(settings.public_folder)
      STDERR.puts "Public folder contents: #{Dir.entries(settings.public_folder).join(', ')}"
    else
      STDERR.puts "ERROR: Public folder does not exist!"
      # 代替パスを試す
      alt_paths = [
        '/app/public',
        File.join(Dir.pwd, 'public'),
        File.join(File.dirname(__FILE__), '..', 'public')
      ]
      alt_paths.each do |alt|
        STDERR.puts "Checking alternative path: #{alt} (exists: #{File.exist?(alt)})"
        if File.exist?(alt) && File.exist?(File.join(alt, 'index.html'))
          STDERR.puts "Found index.html at: #{File.join(alt, 'index.html')}"
          content_type 'text/html'
          return send_file File.join(alt, 'index.html')
        end
      end
    end
    STDERR.puts "=" * 50
    
    if File.exist?(index_path)
      content_type 'text/html'
      send_file index_path
    else
      status 404
      content_type :json
      { 
        error: 'Not Found', 
        message: "Frontend build not found. Index path: #{index_path}",
        public_folder: settings.public_folder,
        public_folder_exists: File.exist?(settings.public_folder),
        public_folder_contents: File.exist?(settings.public_folder) ? Dir.entries(settings.public_folder).join(', ') : 'N/A',
        current_dir: Dir.pwd,
        debug_info: "Please check Railway logs for detailed information"
      }.to_json
    end
  end

  # その他の静的ファイル（manifest.json、favicon.icoなど）
  get '/manifest.json' do
    file_path = File.join(settings.public_folder, 'manifest.json')
    if File.exist?(file_path)
      content_type 'application/manifest+json'
      send_file file_path
    else
      status 404
      content_type :json
      { error: 'Not Found', message: 'manifest.json not found' }.to_json
    end
  end

  get '/favicon.ico' do
    file_path = File.join(settings.public_folder, 'favicon.ico')
    if File.exist?(file_path)
      content_type 'image/x-icon'
      send_file file_path
    else
      status 404
      content_type 'text/plain'
      'Not Found'
    end
  end

  # エラーハンドリング（ルーティングの後に定義）
  # 注意: 静的ファイルの404は既に適切なMIMEタイプで処理されているため、
  # このエラーハンドラーは主にAPIエンドポイントの404を処理します
  error 404 do
    # 静的ファイルパスの場合は、既に処理されているはずなので、ここには来ない
    if request.path.start_with?('/static/') || 
       request.path.start_with?('/assets/') ||
       request.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
      # 静的ファイルの404は、適切なMIMEタイプで処理されているはず
      # ここに来る場合は、ルーティングの問題の可能性がある
      STDERR.puts "WARNING: Static file 404 reached error handler: #{request.path}"
      content_type 'text/plain'
      'Not Found'
    else
      # APIエンドポイントの404
      content_type :json
      { error: 'Not Found', message: 'The requested resource was not found' }.to_json
    end
  end

  error 500 do
    content_type :json
    { error: 'Internal Server Error', message: 'Something went wrong' }.to_json
  end

  # SPA用のルーティング - すべてのパスでindex.htmlを返す（APIパスと静的ファイルパス以外）
  # このルーティングは最後に定義する必要がある（APIエンドポイントの後に）
  # 注意: Sinatraでは、より具体的なルーティング（/static/*など）が先に評価されるため、
  # このルーティングは/static/*や/manifest.jsonなどにはマッチしないはずです
  get '/*' do
    STDERR.puts "SPA route (catch-all) requested: #{request.path}"
    
    # 念のため、APIパスと静的ファイルパスは既に処理されているはずなので、
    # ここに来ることはないはずですが、ログを出力して確認
    if request.path.start_with?('/api/')
      STDERR.puts "WARNING: API path reached catch-all route: #{request.path}"
      status 404
      content_type :json
      return { error: 'Not Found', message: 'The requested resource was not found' }.to_json
    end
    
    if request.path.start_with?('/static/')
      STDERR.puts "WARNING: Static path reached catch-all route: #{request.path}"
      STDERR.puts "This should not happen - /static/* route should have caught this"
      status 404
      content_type :json
      return { error: 'Not Found', message: 'Static file route should have handled this' }.to_json
    end
    
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

# サーバー起動
if __FILE__ == $0
  ClinicsAPI.run!
end
