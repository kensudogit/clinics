# frozen_string_literal: true

class BookingConfirmationJob < ApplicationJob
  queue_as :default

  def perform(web_booking)
    # SMS通知
    if web_booking.patient.user.phone.present?
      SmsService.send_booking_confirmation(web_booking)
      web_booking.update!(sms_notification_sent: true)
    end

    # メール通知
    if web_booking.patient.user.email.present?
      BookingMailer.confirmation_email(web_booking).deliver_now
      web_booking.update!(email_notification_sent: true)
    end

    # 診療機関への通知
    ClinicNotificationJob.perform_later(web_booking.clinic, 'new_booking', web_booking)
  end
end
