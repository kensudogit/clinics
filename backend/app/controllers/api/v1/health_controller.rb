# frozen_string_literal: true

module Api
  module V1
    class HealthController < ApplicationController
      def index
        render json: {
          status: 'ok',
          timestamp: Time.current.iso8601,
          version: '1.0.0',
          environment: Rails.env
        }
      end
    end
  end
end
