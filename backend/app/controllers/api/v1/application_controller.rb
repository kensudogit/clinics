# frozen_string_literal: true

module Api
  module V1
    class ApplicationController < ActionController::API
      include ActionController::MimeResponds
      include ActionController::ImplicitRender
      
      # Error handling
      rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :record_invalid
      rescue_from ActionController::ParameterMissing, with: :parameter_missing
      rescue_from StandardError, with: :internal_server_error

      # Authentication
      before_action :authenticate_user!, except: [:health]

      # Pagination
      before_action :set_pagination_params

      private

      def record_not_found(exception)
        render json: {
          error: 'Record not found',
          message: exception.message
        }, status: :not_found
      end

      def record_invalid(exception)
        render json: {
          error: 'Validation failed',
          message: exception.message,
          details: exception.record.errors.full_messages
        }, status: :unprocessable_entity
      end

      def parameter_missing(exception)
        render json: {
          error: 'Parameter missing',
          message: exception.message
        }, status: :bad_request
      end

      def internal_server_error(exception)
        Rails.logger.error "Internal Server Error: #{exception.message}"
        Rails.logger.error exception.backtrace.join("\n")
        
        render json: {
          error: 'Internal server error',
          message: Rails.env.development? ? exception.message : 'Something went wrong'
        }, status: :internal_server_error
      end

      def set_pagination_params
        @page = params[:page]&.to_i || 1
        @per_page = params[:per_page]&.to_i || 25
        @per_page = 100 if @per_page > 100 # Limit max per page
      end

      def paginate(collection)
        collection.page(@page).per(@per_page)
      end

      def render_paginated(collection, serializer_class = nil)
        paginated_collection = paginate(collection)
        
        render json: {
          data: serializer_class ? 
            paginated_collection.map { |item| serializer_class.new(item).as_json } :
            paginated_collection.as_json,
          pagination: {
            current_page: paginated_collection.current_page,
            total_pages: paginated_collection.total_pages,
            total_count: paginated_collection.total_count,
            per_page: paginated_collection.limit_value
          }
        }
      end
    end
  end
end
