# frozen_string_literal: true

class Patient < ApplicationRecord
  # Associations
  belongs_to :clinic
  belongs_to :user
  has_many :appointments, dependent: :destroy
  has_many :medical_records, dependent: :destroy

  # Validations
  validates :date_of_birth, presence: true
  validates :phone, presence: true, format: { with: /\A\d{10,15}\z/ }
  validates :emergency_contact_name, presence: true
  validates :emergency_contact_phone, presence: true, format: { with: /\A\d{10,15}\z/ }

  # Enums
  enum gender: { male: 0, female: 1, other: 2 }
  enum status: { active: 0, inactive: 1 }

  # Scopes
  scope :active, -> { where(status: :active) }
  scope :by_age_range, ->(min_age, max_age) { where(date_of_birth: max_age.years.ago..min_age.years.ago) }

  # Methods
  def full_name
    user.full_name
  end

  def age
    return nil unless date_of_birth
    ((Time.current - date_of_birth) / 1.year).floor
  end

  def active?
    status == 'active'
  end

  def total_appointments
    appointments.count
  end

  def upcoming_appointments
    appointments.where('appointment_date >= ?', Time.current).order(:appointment_date)
  end

  def latest_medical_record
    medical_records.order(created_at: :desc).first
  end
end
