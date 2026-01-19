require 'sinatra'
require 'json'

class ClinicsAPI < Sinatra::Base
  configure do
    enable :logging
    set :port, ENV.fetch('PORT', 3000).to_i
    set :bind, '0.0.0.0'

    # React build を配信
    set :public_folder, File.expand_path('../public', __dir__)
    set :static, true
  end

  before do
    headers 'Access-Control-Allow-Origin' => '*'
    headers 'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS'
    headers 'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
  end

  options '*' do
    200
  end

  # API
  get '/api/v1/health' do
    content_type :json
    { status: 'healthy' }.to_json
  end

  # SPA fallback（★これだけ）
  get '/*' do
    send_file File.join(settings.public_folder, 'index.html')
  end
end

if __FILE__ == $0
  ClinicsAPI.run!
end
