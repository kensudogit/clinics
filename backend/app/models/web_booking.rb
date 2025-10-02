# frozen_string_literal: true

class WebBooking < ApplicationRecord
  # Associations
  belongs_to :clinic
  belongs_to :doctor
  belongs_to :patient
  has_one :web_questionnaire, dependent: :destroy
  has_one :online_consultation, dependent: :destroy
  has_one :electronic_medical_record, dependent: :destroy

  # Validations
  validates :appointment_date, presence: true
  validates :appointment_time, presence: true
  validates :duration, presence: true, numericality: { greater_than: 0 }
  validates :status, presence: true, inclusion: { in: %w[pending confirmed cancelled completed no_show] }
  validates :booking_source, presence: true
  validates :confirmation_code, presence: true, uniqueness: true

  # Enums
  enum status: { pending: 0, confirmed: 1, cancelled: 2, completed: 3, no_show: 4 }
  enum booking_source: { web: 0, phone: 1, walk_in: 2, admin: 3 }

  # Scopes
  scope :upcoming, -> { where('appointment_date >= ?', Time.current) }
  scope :past, -> { where('appointment_date < ?', Time.current) }
  scope :by_date_range, ->(start_date, end_date) { where(appointment_date: start_date..end_date) }
  scope :by_status, ->(status) { where(status: status) }

  # Callbacks
  before_validation :generate_confirmation_code, on: :create
  after_create :send_confirmation_notifications

  # Methods
  def full_appointment_datetime
    "#{appointment_date.strftime('%Y年%m月%d日')} #{appointment_time}"
  end

  def can_be_cancelled?
    confirmed? && appointment_date > 24.hours.from_now
  end

  def can_be_rescheduled?
    confirmed? && appointment_date > 2.hours.from_now
  end

  def time_until_appointment
    appointment_datetime = DateTime.parse("#{appointment_date} #{appointment_time}")
    appointment_datetime - Time.current
  end

  def send_reminder_notifications
    return unless confirmed?
    
    # 24時間前のリマインダー
    if time_until_appointment.between?(23.hours, 25.hours)
      BookingReminderJob.perform_later(self, '24_hours')
    end
    
    # 2時間前のリマインダー
    if time_until_appointment.between?(1.hour, 3.hours)
      BookingReminderJob.perform_later(self, '2_hours')
    end
  end

  def calculate_no_show_penalty
    return 0 unless no_show?
    
    # ノーショーペナルティの計算ロジック
    base_penalty = 1000
    repeat_offense_multiplier = patient.no_show_count > 1 ? 1.5 : 1.0
    base_penalty * repeat_offense_multiplier
  end

  private

  def generate_confirmation_code
    self.confirmation_code = SecureRandom.alphanumeric(8).upcase
  end

  def send_confirmation_notifications
    BookingConfirmationJob.perform_later(self)
  end
end
