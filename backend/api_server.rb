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
    # まず、相対パスで計算
    relative_public_dir = File.expand_path(File.join(File.dirname(__FILE__), '..', 'public'))
    # 絶対パスも試す
    absolute_public_dir = '/app/public'
    # 現在の作業ディレクトリからの相対パスも試す
    cwd_public_dir = File.join(Dir.pwd, 'public')
    
    # 存在するパスを選択
    public_dir = if File.exist?(absolute_public_dir)
                   absolute_public_dir
                 elsif File.exist?(relative_public_dir)
                   relative_public_dir
                 elsif File.exist?(cwd_public_dir)
                   cwd_public_dir
                 else
                   absolute_public_dir  # デフォルトとして/app/publicを使用
                 end
    
    set :public_folder, public_dir
    set :static, true
    # デバッグ用ログ（stderrに出力してRailwayのログで確認可能）
    STDERR.puts "=" * 50
    STDERR.puts "Application starting..."
    STDERR.puts "api_server.rb location: #{__FILE__}"
    STDERR.puts "Current working directory: #{Dir.pwd}"
    STDERR.puts "Relative public dir: #{relative_public_dir} (exists: #{File.exist?(relative_public_dir)})"
    STDERR.puts "Absolute public dir: #{absolute_public_dir} (exists: #{File.exist?(absolute_public_dir)})"
    STDERR.puts "CWD public dir: #{cwd_public_dir} (exists: #{File.exist?(cwd_public_dir)})"
    STDERR.puts "Selected public folder path: #{public_dir}"
    STDERR.puts "Public folder exists: #{File.exist?(public_dir)}"
    
    if File.exist?(public_dir)
      STDERR.puts "Public folder contents: #{Dir.entries(public_dir).join(', ')}"
      static_dir = File.join(public_dir, 'static')
      if File.exist?(static_dir)
        STDERR.puts "Static directory exists: #{File.exist?(static_dir)}"
        STDERR.puts "Static directory contents: #{Dir.entries(static_dir).join(', ')}"
      else
        STDERR.puts "WARNING: Static directory does not exist!"
      end
    else
      STDERR.puts "WARNING: Public folder does not exist!"
    end
    
    index_path = File.join(public_dir, 'index.html')
    STDERR.puts "Index.html path: #{index_path}"
    STDERR.puts "Index.html exists: #{File.exist?(index_path)}"
    
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

  # オンライン診療一覧
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

  # オンライン診療の詳細取得
  get '/api/v1/clinics/:clinic_id/online_consultations/:consultation_id' do |clinic_id, consultation_id|
    content_type :json
    {
      id: consultation_id,
      clinic_id: clinic_id,
      consultation_type: 'video',
      scheduled_at: '2024-01-20T14:00:00Z',
      status: 'scheduled',
      patient: {
        id: 1,
        name: '山田 花子',
        role: 'patient'
      },
      doctor: {
        id: 1,
        name: '田中 太郎',
        role: 'doctor'
      },
      consultation_notes: '',
      diagnosis: '',
      treatment_plan: ''
    }.to_json
  end

  # オンライン診療の開始
  post '/api/v1/clinics/:clinic_id/online_consultations/:consultation_id/start' do |clinic_id, consultation_id|
    content_type :json
    STDERR.puts "[CONSULTATION] Starting consultation: #{consultation_id} for clinic: #{clinic_id}"
    {
      id: consultation_id,
      clinic_id: clinic_id,
      status: 'in_progress',
      started_at: Time.now.iso8601,
      message: '診療を開始しました'
    }.to_json
  end

  # オンライン診療の終了
  post '/api/v1/clinics/:clinic_id/online_consultations/:consultation_id/end' do |clinic_id, consultation_id|
    content_type :json
    request_data = JSON.parse(request.body.read) rescue {}
    notes = request_data['notes'] || ''
    
    STDERR.puts "[CONSULTATION] Ending consultation: #{consultation_id} for clinic: #{clinic_id}"
    STDERR.puts "[CONSULTATION] Notes: #{notes}"
    
    {
      id: consultation_id,
      clinic_id: clinic_id,
      status: 'completed',
      ended_at: Time.now.iso8601,
      notes: notes,
      message: '診療を終了しました'
    }.to_json
  end

  # バイタルサインの記録
  post '/api/v1/clinics/:clinic_id/online_consultations/:consultation_id/vital_signs' do |clinic_id, consultation_id|
    content_type :json
    request_data = JSON.parse(request.body.read) rescue {}
    
    STDERR.puts "[CONSULTATION] Recording vital signs for consultation: #{consultation_id}"
    STDERR.puts "[CONSULTATION] Vital signs: #{request_data.inspect}"
    
    {
      id: "vital_#{Time.now.to_i}",
      consultation_id: consultation_id,
      vital_signs: request_data,
      recorded_at: Time.now.iso8601,
      message: 'バイタルサインを記録しました'
    }.to_json
  end

  # 処方箋の追加
  post '/api/v1/clinics/:clinic_id/online_consultations/:consultation_id/prescriptions' do |clinic_id, consultation_id|
    content_type :json
    request_data = JSON.parse(request.body.read) rescue {}
    
    STDERR.puts "[CONSULTATION] Adding prescription for consultation: #{consultation_id}"
    STDERR.puts "[CONSULTATION] Prescription: #{request_data.inspect}"
    
    {
      id: "prescription_#{Time.now.to_i}",
      consultation_id: consultation_id,
      prescription: request_data,
      prescribed_at: Time.now.iso8601,
      message: '処方箋を追加しました'
    }.to_json
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
  # Sinatraのルーティングでは、より具体的なパターンが先に評価される
  # Sinatra 3.x では、^ と $ を含む正規表現は使用できないため、パスパターンを使用
  get '/static/*' do |path|
    # パスを正規化（URLデコードとパストラバーサル対策）
    safe_path = path.gsub(/\.\./, '').gsub(/[^a-zA-Z0-9._\/-]/, '')
    
    # 複数の可能なパスを試す（public/build/build/static を最優先）
    possible_paths = [
      File.join(settings.public_folder, 'build', 'build', 'static', safe_path),  # public/build/build/static/js/... または public/build/build/static/css/...
      File.join(settings.public_folder, 'build', 'static', safe_path),            # public/build/static/js/... または public/build/static/css/...
      File.join(settings.public_folder, 'static', safe_path)                     # public/static/js/... または public/static/css/...
    ]
    
    # デバッグログ（本番環境でも確認可能）
    STDERR.puts "[STATIC] ========================================"
    STDERR.puts "[STATIC] Request: #{request.path}"
    STDERR.puts "[STATIC] Safe path: #{safe_path}"
    STDERR.puts "[STATIC] Public folder: #{settings.public_folder}"
    STDERR.puts "[STATIC] Trying paths:"
    possible_paths.each_with_index do |p, i|
      exists = File.exist?(p)
      is_file = exists && File.file?(p)
      STDERR.puts "[STATIC]   #{i+1}. #{p} (exists: #{exists}, is_file: #{is_file})"
    end
    
    # ファイルが存在するパスを見つける
    file_path = possible_paths.find { |p| File.exist?(p) && File.file?(p) }
    
    if file_path
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
      STDERR.puts "[STATIC] ✓ Found file at: #{file_path}"
      STDERR.puts "[STATIC] MIME type: #{mime_type}"
      STDERR.puts "[STATIC] ========================================"
      content_type mime_type
      send_file file_path
    else
      # ファイルが見つからない場合の詳細なデバッグ情報
      STDERR.puts "[STATIC ERROR] ✗ File not found in any of the tried paths"
      STDERR.puts "[STATIC ERROR] Requested path: #{safe_path}"
      STDERR.puts "[STATIC ERROR] Public folder: #{settings.public_folder}"
      STDERR.puts "[STATIC ERROR] Public folder exists: #{File.exist?(settings.public_folder)}"
      
      if File.exist?(settings.public_folder)
        STDERR.puts "[STATIC ERROR] Public folder contents: #{Dir.entries(settings.public_folder).reject { |e| e.start_with?('.') }.join(', ')}"
        
        # build/build/static ディレクトリを最優先で確認
        build_build_static_dir = File.join(settings.public_folder, 'build', 'build', 'static')
        STDERR.puts "[STATIC ERROR] Checking build/build/static directory..."
        STDERR.puts "[STATIC ERROR] Build/build/static dir exists: #{File.exist?(build_build_static_dir)}"
        if File.exist?(build_build_static_dir)
          STDERR.puts "[STATIC ERROR] Build/build/static dir contents: #{Dir.entries(build_build_static_dir).reject { |e| e.start_with?('.') }.join(', ')}"
          build_build_js_dir = File.join(build_build_static_dir, 'js')
          build_build_css_dir = File.join(build_build_static_dir, 'css')
          STDERR.puts "[STATIC ERROR] Build/build/JS dir exists: #{File.exist?(build_build_js_dir)}"
          STDERR.puts "[STATIC ERROR] Build/build/CSS dir exists: #{File.exist?(build_build_css_dir)}"
          if File.exist?(build_build_js_dir)
            js_files = Dir.entries(build_build_js_dir).select { |f| f.end_with?('.js') && !f.start_with?('.') }
            STDERR.puts "[STATIC ERROR] Build/build/JS files (#{js_files.length}): #{js_files.join(', ')}"
            requested_filename = File.basename(safe_path)
            matching_file = js_files.find { |f| f == requested_filename }
            STDERR.puts "[STATIC ERROR] Requested filename: #{requested_filename}"
            STDERR.puts "[STATIC ERROR] Matching file found: #{matching_file ? 'YES' : 'NO'}"
          end
          if File.exist?(build_build_css_dir)
            css_files = Dir.entries(build_build_css_dir).select { |f| f.end_with?('.css') && !f.start_with?('.') }
            STDERR.puts "[STATIC ERROR] Build/build/CSS files (#{css_files.length}): #{css_files.join(', ')}"
            requested_filename = File.basename(safe_path)
            matching_file = css_files.find { |f| f == requested_filename }
            STDERR.puts "[STATIC ERROR] Requested filename: #{requested_filename}"
            STDERR.puts "[STATIC ERROR] Matching file found: #{matching_file ? 'YES' : 'NO'}"
          end
        end
        
        # build/static ディレクトリも確認（フォールバック）
        build_static_dir = File.join(settings.public_folder, 'build', 'static')
        STDERR.puts "[STATIC ERROR] Checking build/static directory..."
        STDERR.puts "[STATIC ERROR] Build/static dir exists: #{File.exist?(build_static_dir)}"
        if File.exist?(build_static_dir)
          STDERR.puts "[STATIC ERROR] Build/static dir contents: #{Dir.entries(build_static_dir).reject { |e| e.start_with?('.') }.join(', ')}"
          build_js_dir = File.join(build_static_dir, 'js')
          build_css_dir = File.join(build_static_dir, 'css')
          STDERR.puts "[STATIC ERROR] Build/JS dir exists: #{File.exist?(build_js_dir)}"
          STDERR.puts "[STATIC ERROR] Build/CSS dir exists: #{File.exist?(build_css_dir)}"
          if File.exist?(build_js_dir)
            js_files = Dir.entries(build_js_dir).select { |f| f.end_with?('.js') && !f.start_with?('.') }
            STDERR.puts "[STATIC ERROR] Build/JS files (#{js_files.length}): #{js_files.join(', ')}"
            # リクエストされたファイル名と一致するファイルを探す
            requested_filename = File.basename(safe_path)
            matching_file = js_files.find { |f| f == requested_filename }
            STDERR.puts "[STATIC ERROR] Requested filename: #{requested_filename}"
            STDERR.puts "[STATIC ERROR] Matching file found: #{matching_file ? 'YES' : 'NO'}"
          end
          if File.exist?(build_css_dir)
            css_files = Dir.entries(build_css_dir).select { |f| f.end_with?('.css') && !f.start_with?('.') }
            STDERR.puts "[STATIC ERROR] Build/CSS files (#{css_files.length}): #{css_files.join(', ')}"
            # リクエストされたファイル名と一致するファイルを探す
            requested_filename = File.basename(safe_path)
            matching_file = css_files.find { |f| f == requested_filename }
            STDERR.puts "[STATIC ERROR] Requested filename: #{requested_filename}"
            STDERR.puts "[STATIC ERROR] Matching file found: #{matching_file ? 'YES' : 'NO'}"
          end
        end
        
        # static ディレクトリも確認（フォールバック）
        static_dir = File.join(settings.public_folder, 'static')
        STDERR.puts "[STATIC ERROR] Checking static directory (fallback)..."
        STDERR.puts "[STATIC ERROR] Static dir exists: #{File.exist?(static_dir)}"
        if File.exist?(static_dir)
          STDERR.puts "[STATIC ERROR] Static dir contents: #{Dir.entries(static_dir).reject { |e| e.start_with?('.') }.join(', ')}"
          js_dir = File.join(static_dir, 'js')
          css_dir = File.join(static_dir, 'css')
          STDERR.puts "[STATIC ERROR] JS dir exists: #{File.exist?(js_dir)}"
          STDERR.puts "[STATIC ERROR] CSS dir exists: #{File.exist?(css_dir)}"
          if File.exist?(js_dir)
            js_files = Dir.entries(js_dir).select { |f| f.end_with?('.js') && !f.start_with?('.') }
            STDERR.puts "[STATIC ERROR] JS files (#{js_files.length}): #{js_files.join(', ')}"
          end
          if File.exist?(css_dir)
            css_files = Dir.entries(css_dir).select { |f| f.end_with?('.css') && !f.start_with?('.') }
            STDERR.puts "[STATIC ERROR] CSS files (#{css_files.length}): #{css_files.join(', ')}"
          end
        end
      end
      STDERR.puts "[STATIC ERROR] ========================================"
      
      # 404エラーを返す
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
      ''
    end
  end

  # ルートパス - フロントエンドのindex.htmlを返す
  get '/' do
    # 複数の可能なパスを試す（build/build を最優先）
    possible_paths = [
      File.join(settings.public_folder, 'build', 'build', 'index.html'),
      File.join(settings.public_folder, 'build', 'index.html'),
      File.join(settings.public_folder, 'index.html'),
      File.join('/app/public', 'build', 'build', 'index.html'),
      File.join('/app/public', 'build', 'index.html'),
      File.join('/app/public', 'index.html'),
      File.join(Dir.pwd, 'public', 'build', 'build', 'index.html'),
      File.join(Dir.pwd, 'public', 'build', 'index.html'),
      File.join(Dir.pwd, 'public', 'index.html'),
      File.join(File.dirname(__FILE__), '..', 'public', 'build', 'build', 'index.html'),
      File.join(File.dirname(__FILE__), '..', 'public', 'build', 'index.html'),
      File.join(File.dirname(__FILE__), '..', 'public', 'index.html')
    ]
    
    STDERR.puts "[ROOT] Serving index.html"
    STDERR.puts "[ROOT] Public folder: #{settings.public_folder}"
    STDERR.puts "[ROOT] Trying paths: #{possible_paths.join(', ')}"
    
    index_path = possible_paths.find { |p| File.exist?(p) && File.file?(p) }
    
    if index_path
      STDERR.puts "[ROOT] Found index.html at: #{index_path}"
      content_type 'text/html'
      send_file index_path
    else
      STDERR.puts "[ROOT ERROR] index.html not found in any location!"
      STDERR.puts "[ROOT ERROR] Public folder exists: #{File.exist?(settings.public_folder)}"
      if File.exist?(settings.public_folder)
        STDERR.puts "[ROOT ERROR] Public folder contents: #{Dir.entries(settings.public_folder).join(', ')}"
      end
      status 404
      content_type :json
      { 
        error: 'Not Found', 
        message: "Frontend build not found",
        public_folder: settings.public_folder,
        public_folder_exists: File.exist?(settings.public_folder),
        current_dir: Dir.pwd,
        tried_paths: possible_paths
      }.to_json
    end
  end

  # その他の静的ファイル（manifest.json、favicon.icoなど）
  get '/manifest.json' do
    # 複数の可能なパスを試す（build/build を最優先）
    possible_paths = [
      File.join(settings.public_folder, 'build', 'build', 'manifest.json'),
      File.join(settings.public_folder, 'build', 'manifest.json'),
      File.join(settings.public_folder, 'manifest.json'),
      File.join('/app/public', 'build', 'build', 'manifest.json'),
      File.join('/app/public', 'build', 'manifest.json'),
      File.join('/app/public', 'manifest.json')
    ]
    
    STDERR.puts "[MANIFEST] ========================================"
    STDERR.puts "[MANIFEST] Requested: #{request.path}"
    STDERR.puts "[MANIFEST] Public folder: #{settings.public_folder}"
    STDERR.puts "[MANIFEST] Trying paths:"
    possible_paths.each_with_index do |p, i|
      exists = File.exist?(p)
      is_file = exists && File.file?(p)
      STDERR.puts "[MANIFEST]   #{i+1}. #{p} (exists: #{exists}, is_file: #{is_file})"
    end
    
    file_path = possible_paths.find { |p| File.exist?(p) && File.file?(p) }
    
    if file_path
      STDERR.puts "[MANIFEST] ✓ Found at: #{file_path}"
      STDERR.puts "[MANIFEST] ========================================"
      content_type 'application/manifest+json'
      send_file file_path
    else
      STDERR.puts "[MANIFEST ERROR] ✗ Not found in any path"
      STDERR.puts "[MANIFEST ERROR] Public folder exists: #{File.exist?(settings.public_folder)}"
      if File.exist?(settings.public_folder)
        STDERR.puts "[MANIFEST ERROR] Public folder contents: #{Dir.entries(settings.public_folder).reject { |e| e.start_with?('.') }.join(', ')}"
        build_dir = File.join(settings.public_folder, 'build')
        STDERR.puts "[MANIFEST ERROR] Build dir exists: #{File.exist?(build_dir)}"
        if File.exist?(build_dir)
          STDERR.puts "[MANIFEST ERROR] Build dir contents: #{Dir.entries(build_dir).reject { |e| e.start_with?('.') }.join(', ')}"
          build_build_dir = File.join(build_dir, 'build')
          STDERR.puts "[MANIFEST ERROR] Build/build dir exists: #{File.exist?(build_build_dir)}"
          if File.exist?(build_build_dir)
            STDERR.puts "[MANIFEST ERROR] Build/build dir contents: #{Dir.entries(build_build_dir).reject { |e| e.start_with?('.') }.join(', ')}"
          end
        end
      end
      STDERR.puts "[MANIFEST ERROR] ========================================"
      status 404
      content_type 'application/json'
      { error: 'Not Found', message: 'manifest.json not found', debug: { tried_paths: possible_paths } }.to_json
    end
  end

  get '/favicon.ico' do
    # 複数の可能なパスを試す（build/build を最優先）
    possible_paths = [
      File.join(settings.public_folder, 'build', 'build', 'favicon.ico'),
      File.join(settings.public_folder, 'build', 'favicon.ico'),
      File.join(settings.public_folder, 'favicon.ico')
    ]
    
    file_path = possible_paths.find { |p| File.exist?(p) && File.file?(p) }
    
    if file_path
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
    STDERR.puts "[SPA] Catch-all route requested: #{request.path}"
    
    # 念のため、APIパスと静的ファイルパスは既に処理されているはずなので、
    # ここに来ることはないはずですが、ログを出力して確認
    if request.path.start_with?('/api/')
      STDERR.puts "[SPA WARNING] API path reached catch-all route: #{request.path}"
      status 404
      content_type :json
      return { error: 'Not Found', message: 'The requested resource was not found' }.to_json
    end
    
    if request.path.start_with?('/static/')
      STDERR.puts "[SPA WARNING] Static path reached catch-all route: #{request.path}"
      STDERR.puts "[SPA WARNING] This should not happen - /static/* route should have caught this"
      status 404
      content_type :json
      return { error: 'Not Found', message: 'Static file route should have handled this' }.to_json
    end
    
    # SPA用にindex.htmlを返す（複数のパスを試す、build/build を最優先）
    possible_paths = [
      File.join(settings.public_folder, 'build', 'build', 'index.html'),
      File.join(settings.public_folder, 'build', 'index.html'),
      File.join(settings.public_folder, 'index.html'),
      File.join('/app/public', 'build', 'build', 'index.html'),
      File.join('/app/public', 'build', 'index.html'),
      File.join('/app/public', 'index.html')
    ]
    
    index_path = possible_paths.find { |p| File.exist?(p) && File.file?(p) }
    
    if index_path
      STDERR.puts "[SPA] Serving index.html from: #{index_path}"
      content_type 'text/html'
      send_file index_path
    else
      STDERR.puts "[SPA ERROR] index.html not found in any path"
      status 404
      content_type :json
      { error: 'Not Found', message: "Frontend build not found", tried_paths: possible_paths }.to_json
    end
  end
end

# サーバー起動
if __FILE__ == $0
  ClinicsAPI.run!
end
