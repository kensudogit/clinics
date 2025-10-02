# frozen_string_literal: true

class BookingReminderJob < ApplicationJob
  queue_as :default

  def perform(web_booking, reminder_type)
    case reminder_type
    when '24_hours'
      send_24_hour_reminder(web_booking)
    when '2_hours'
      send_2_hour_reminder(web_booking)
    end
  end

  private

  def send_24_hour_reminder(web_booking)
    # SMS通知
    if web_booking.patient.user.phone.present?
      SmsService.send_24_hour_reminder(web_booking)
    end

    # メール通知
    if web_booking.patient.user.email.present?
      BookingMailer.reminder_24_hours(web_booking).deliver_now
    end

    # プッシュ通知
    PushNotificationService.send_reminder(web_booking.patient.user, {
      title: '診療予約のリマインダー',
      body: "明日の#{web_booking.appointment_time}に診療予約があります",
      data: { booking_id: web_booking.id }
    })
  end

  def send_2_hour_reminder(web_booking)
    # SMS通知
    if web_booking.patient.user.phone.present?
      SmsService.send_2_hour_reminder(web_booking)
    end

    # プッシュ通知
    PushNotificationService.send_reminder(web_booking.patient.user, {
      title: '診療予約のリマインダー',
      body: "2時間後に診療予約があります",
      data: { booking_id: web_booking.id }
    })

    # オンライン診療の場合、会議室の準備
    if web_booking.online_consultation.present?
      MeetingRoomPreparationJob.perform_later(web_booking.online_consultation)
    end
  end
end
