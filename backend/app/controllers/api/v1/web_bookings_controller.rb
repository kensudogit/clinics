# frozen_string_literal: true

module Api
  module V1
    class WebBookingsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_clinic
      before_action :set_web_booking, only: [:show, :update, :destroy, :confirm, :cancel]

      # GET /api/v1/clinics/:clinic_id/web_bookings
      def index
        @web_bookings = @clinic.web_bookings
                               .includes(:patient, :doctor)
                               .order(appointment_date: :desc)
        
        if params[:status].present?
          @web_bookings = @web_bookings.where(status: params[:status])
        end
        
        if params[:date_from].present? && params[:date_to].present?
          @web_bookings = @web_bookings.by_date_range(
            Date.parse(params[:date_from]),
            Date.parse(params[:date_to])
          )
        end

        render_paginated(@web_bookings, WebBookingSerializer)
      end

      # GET /api/v1/clinics/:clinic_id/web_bookings/:id
      def show
        render json: WebBookingSerializer.new(@web_booking).as_json
      end

      # POST /api/v1/clinics/:clinic_id/web_bookings
      def create
        @web_booking = @clinic.web_bookings.build(web_booking_params)
        
        if @web_booking.save
          render json: WebBookingSerializer.new(@web_booking).as_json, 
                 status: :created
        else
          render json: { errors: @web_booking.errors.full_messages }, 
                 status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/clinics/:clinic_id/web_bookings/:id
      def update
        if @web_booking.update(web_booking_params)
          render json: WebBookingSerializer.new(@web_booking).as_json
        else
          render json: { errors: @web_booking.errors.full_messages }, 
                 status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/clinics/:clinic_id/web_bookings/:id
      def destroy
        @web_booking.destroy
        head :no_content
      end

      # POST /api/v1/clinics/:clinic_id/web_bookings/:id/confirm
      def confirm
        if @web_booking.confirm!
          render json: WebBookingSerializer.new(@web_booking).as_json
        else
          render json: { errors: @web_booking.errors.full_messages }, 
                 status: :unprocessable_entity
        end
      end

      # POST /api/v1/clinics/:clinic_id/web_bookings/:id/cancel
      def cancel
        if @web_booking.cancel!
          render json: WebBookingSerializer.new(@web_booking).as_json
        else
          render json: { errors: @web_booking.errors.full_messages }, 
                 status: :unprocessable_entity
        end
      end

      # GET /api/v1/clinics/:clinic_id/web_bookings/availability
      def availability
        doctor_id = params[:doctor_id]
        date = Date.parse(params[:date])
        
        availability = BookingAvailabilityService.new(@clinic, doctor_id, date).call
        
        render json: { availability: availability }
      end

      private

      def set_clinic
        @clinic = Clinic.find(params[:clinic_id])
      end

      def set_web_booking
        @web_booking = @clinic.web_bookings.find(params[:id])
      end

      def web_booking_params
        params.require(:web_booking).permit(
          :doctor_id, :patient_id, :appointment_date, :appointment_time,
          :duration, :patient_notes, :admin_notes, :booking_source
        )
      end
    end
  end
end
