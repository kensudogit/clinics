# frozen_string_literal: true

class Doctor < ApplicationRecord
  # Associations
  belongs_to :clinic
  belongs_to :user
  has_many :appointments, dependent: :destroy
  has_many :medical_records, dependent: :destroy

  # Validations
  validates :specialization, presence: true
  validates :license_number, presence: true, uniqueness: true
  validates :years_of_experience, presence: true, numericality: { greater_than: 0 }

  # Enums
  enum status: { active: 0, inactive: 1, on_leave: 2 }

  # Scopes
  scope :active, -> { where(status: :active) }
  scope :by_specialization, ->(specialization) { where(specialization: specialization) }

  # Methods
  def full_name
    user.full_name
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

  def available_slots(date)
    # This would typically integrate with a scheduling system
    # For now, return a simple availability check
    appointments.where(appointment_date: date.beginning_of_day..date.end_of_day).count < 8
  end
end
