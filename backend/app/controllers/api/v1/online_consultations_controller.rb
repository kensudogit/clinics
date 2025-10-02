# frozen_string_literal: true

module Api
  module V1
    class OnlineConsultationsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_clinic
      before_action :set_online_consultation, only: [:show, :update, :destroy, :start, :end, :cancel]

      # GET /api/v1/clinics/:clinic_id/online_consultations
      def index
        @online_consultations = @clinic.online_consultations
                                     .includes(:patient, :doctor)
                                     .order(scheduled_at: :desc)
        
        if params[:status].present?
          @online_consultations = @online_consultations.where(status: params[:status])
        end
        
        if params[:doctor_id].present?
          @online_consultations = @online_consultations.where(doctor_id: params[:doctor_id])
        end

        render_paginated(@online_consultations, OnlineConsultationSerializer)
      end

      # GET /api/v1/clinics/:clinic_id/online_consultations/:id
      def show
        render json: OnlineConsultationSerializer.new(@online_consultation).as_json
      end

      # POST /api/v1/clinics/:clinic_id/online_consultations
      def create
        @online_consultation = @clinic.online_consultations.build(online_consultation_params)
        
        if @online_consultation.save
          render json: OnlineConsultationSerializer.new(@online_consultation).as_json, 
                 status: :created
        else
          render json: { errors: @online_consultation.errors.full_messages }, 
                 status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/clinics/:clinic_id/online_consultations/:id
      def update
        if @online_consultation.update(online_consultation_params)
          render json: OnlineConsultationSerializer.new(@online_consultation).as_json
        else
          render json: { errors: @online_consultation.errors.full_messages }, 
                 status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/clinics/:clinic_id/online_consultations/:id
      def destroy
        @online_consultation.destroy
        head :no_content
      end

      # POST /api/v1/clinics/:clinic_id/online_consultations/:id/start
      def start
        if @online_consultation.start_consultation
          render json: OnlineConsultationSerializer.new(@online_consultation).as_json
        else
          render json: { errors: ['診療を開始できませんでした'] }, 
                 status: :unprocessable_entity
        end
      end

      # POST /api/v1/clinics/:clinic_id/online_consultations/:id/end
      def end
        if @online_consultation.end_consultation(notes: params[:notes])
          render json: OnlineConsultationSerializer.new(@online_consultation).as_json
        else
          render json: { errors: ['診療を終了できませんでした'] }, 
                 status: :unprocessable_entity
        end
      end

      # POST /api/v1/clinics/:clinic_id/online_consultations/:id/cancel
      def cancel
        if @online_consultation.cancel_consultation(reason: params[:reason])
          render json: OnlineConsultationSerializer.new(@online_consultation).as_json
        else
          render json: { errors: ['診療をキャンセルできませんでした'] }, 
                 status: :unprocessable_entity
        end
      end

      # POST /api/v1/clinics/:clinic_id/online_consultations/:id/vital_signs
      def record_vital_signs
        if @online_consultation.record_vital_signs(params[:vital_signs])
          render json: OnlineConsultationSerializer.new(@online_consultation).as_json
        else
          render json: { errors: ['バイタルサインの記録に失敗しました'] }, 
                 status: :unprocessable_entity
        end
      end

      # POST /api/v1/clinics/:clinic_id/online_consultations/:id/prescription
      def add_prescription
        if @online_consultation.add_prescription(params[:prescription])
          render json: OnlineConsultationSerializer.new(@online_consultation).as_json
        else
          render json: { errors: ['処方箋の追加に失敗しました'] }, 
                 status: :unprocessable_entity
        end
      end

      # GET /api/v1/clinics/:clinic_id/online_consultations/:id/meeting_url
      def meeting_url
        render json: { 
          meeting_url: @online_consultation.generate_meeting_url,
          meeting_room_id: @online_consultation.meeting_room_id
        }
      end

      private

      def set_clinic
        @clinic = Clinic.find(params[:clinic_id])
      end

      def set_online_consultation
        @online_consultation = @clinic.online_consultations.find(params[:id])
      end

      def online_consultation_params
        params.require(:online_consultation).permit(
          :doctor_id, :patient_id, :web_booking_id, :consultation_type,
          :scheduled_at, :recording_consent
        )
      end
    end
  end
end
