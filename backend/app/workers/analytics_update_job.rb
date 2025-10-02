# frozen_string_literal: true

class AnalyticsUpdateJob < ApplicationJob
  queue_as :analytics

  def perform(clinic, event_type, data)
    case event_type
    when 'consultation_completed'
      update_consultation_analytics(clinic, data)
    when 'booking_created'
      update_booking_analytics(clinic, data)
    when 'patient_registered'
      update_patient_analytics(clinic, data)
    when 'billing_completed'
      update_revenue_analytics(clinic, data)
    end

    # リアルタイムダッシュボードの更新
    update_realtime_dashboard(clinic)
  end

  private

  def update_consultation_analytics(clinic, consultation)
    today = Date.current
    
    analytics = BusinessAnalytics.find_or_initialize_by(
      clinic: clinic,
      analytics_date: today,
      metric_type: 'daily'
    )

    analytics.consultation_metrics ||= {}
    analytics.consultation_metrics['total_consultations'] ||= 0
    analytics.consultation_metrics['total_consultations'] += 1
    
    analytics.consultation_metrics['total_duration'] ||= 0
    analytics.consultation_metrics['total_duration'] += consultation.duration_minutes || 0
    
    analytics.consultation_metrics['average_duration'] = 
      analytics.consultation_metrics['total_duration'] / analytics.consultation_metrics['total_consultations']

    analytics.save!
  end

  def update_booking_analytics(clinic, booking)
    today = Date.current
    
    analytics = BusinessAnalytics.find_or_initialize_by(
      clinic: clinic,
      analytics_date: today,
      metric_type: 'daily'
    )

    analytics.appointment_metrics ||= {}
    analytics.appointment_metrics['total_bookings'] ||= 0
    analytics.appointment_metrics['total_bookings'] += 1
    
    analytics.appointment_metrics['web_bookings'] ||= 0
    analytics.appointment_metrics['web_bookings'] += 1 if booking.booking_source == 'web'

    analytics.save!
  end

  def update_patient_analytics(clinic, patient)
    today = Date.current
    
    analytics = BusinessAnalytics.find_or_initialize_by(
      clinic: clinic,
      analytics_date: today,
      metric_type: 'daily'
    )

    analytics.patient_metrics ||= {}
    analytics.patient_metrics['new_patients'] ||= 0
    analytics.patient_metrics['new_patients'] += 1
    
    analytics.patient_metrics['total_patients'] = clinic.patients.count

    analytics.save!
  end

  def update_revenue_analytics(clinic, billing_record)
    today = Date.current
    
    analytics = BusinessAnalytics.find_or_initialize_by(
      clinic: clinic,
      analytics_date: today,
      metric_type: 'daily'
    )

    analytics.revenue_metrics ||= {}
    analytics.revenue_metrics['total_revenue'] ||= 0
    analytics.revenue_metrics['total_revenue'] += billing_record.total_amount
    
    analytics.revenue_metrics['insurance_revenue'] ||= 0
    analytics.revenue_metrics['insurance_revenue'] += billing_record.insurance_amount
    
    analytics.revenue_metrics['patient_revenue'] ||= 0
    analytics.revenue_metrics['patient_revenue'] += billing_record.patient_amount

    analytics.total_revenue = analytics.revenue_metrics['total_revenue']
    analytics.save!
  end

  def update_realtime_dashboard(clinic)
    # WebSocket経由でリアルタイムダッシュボードを更新
    RealtimeDashboardChannel.broadcast_to(clinic, {
      type: 'analytics_update',
      timestamp: Time.current,
      data: generate_realtime_data(clinic)
    })
  end

  def generate_realtime_data(clinic)
    today = Date.current
    analytics = BusinessAnalytics.find_by(
      clinic: clinic,
      analytics_date: today,
      metric_type: 'daily'
    )

    {
      today_bookings: analytics&.appointment_metrics&.dig('total_bookings') || 0,
      today_consultations: analytics&.consultation_metrics&.dig('total_consultations') || 0,
      today_revenue: analytics&.total_revenue || 0,
      active_consultations: clinic.online_consultations.where(status: 'in_progress').count,
      pending_bookings: clinic.web_bookings.where(status: 'pending').count
    }
  end
end
