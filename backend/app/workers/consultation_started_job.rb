# frozen_string_literal: true

class ConsultationStartedJob < ApplicationJob
  queue_as :default

  def perform(online_consultation)
    # 患者への通知
    notify_patient(online_consultation)
    
    # 診療機関への通知
    notify_clinic(online_consultation)
    
    # 診療記録の開始
    start_consultation_logging(online_consultation)
    
    # 技術的品質監視の開始
    start_quality_monitoring(online_consultation)
  end

  private

  def notify_patient(online_consultation)
    PushNotificationService.send_notification(online_consultation.patient.user, {
      title: '診療開始',
      body: "#{online_consultation.doctor.user.full_name}医師との診療が開始されました",
      data: { 
        consultation_id: online_consultation.id,
        meeting_url: online_consultation.generate_meeting_url
      }
    })
  end

  def notify_clinic(online_consultation)
    # 診療機関のスタッフへの通知
    online_consultation.clinic.users.where(role: 'admin').each do |admin|
      AdminNotificationService.send_consultation_started(admin, online_consultation)
    end
  end

  def start_consultation_logging(online_consultation)
    # 診療ログの開始
    ConsultationLog.create!(
      online_consultation: online_consultation,
      started_at: Time.current,
      status: 'active'
    )
  end

  def start_quality_monitoring(online_consultation)
    # 技術的品質監視の開始
    QualityMonitoringJob.perform_later(online_consultation)
  end
end
