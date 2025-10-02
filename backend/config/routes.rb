Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication routes
      devise_for :users, controllers: {
        sessions: 'api/v1/users/sessions',
        registrations: 'api/v1/users/registrations'
      }

      # Health check
      get 'health', to: 'health#index'

      # Clinic management
      resources :clinics do
        resources :doctors, only: [:index, :show, :create, :update, :destroy]
        resources :patients, only: [:index, :show, :create, :update, :destroy]
        resources :appointments, only: [:index, :show, :create, :update, :destroy]
        resources :medical_records, only: [:index, :show, :create, :update, :destroy]
      end

      # User management
      resources :users, only: [:index, :show, :update, :destroy] do
        member do
          patch :activate
          patch :deactivate
        end
      end

      # Analytics and reporting
      namespace :analytics do
        get 'dashboard', to: 'dashboard#index'
        get 'reports', to: 'reports#index'
        get 'statistics', to: 'statistics#index'
      end

      # Search
      get 'search', to: 'search#index'
    end
  end

  # Sidekiq web interface (only in development)
  if Rails.env.development?
    require 'sidekiq/web'
    mount Sidekiq::Web => '/sidekiq'
  end

  # API documentation
  mount Rswag::Api::Engine => '/api-docs'
  mount Rswag::Ui::Engine => '/api-docs'

  # Root route
  root 'api/v1/health#index'
end
