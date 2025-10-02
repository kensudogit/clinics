# frozen_string_literal: true

class Clinic < ApplicationRecord
  # Associations
  belongs_to :user
  has_many :doctors, dependent: :destroy
  has_many :patients, dependent: :destroy
  has_many :appointments, dependent: :destroy
  has_many :medical_records, dependent: :destroy

  # Validations
  validates :name, presence: true
  validates :address, presence: true
  validates :phone, presence: true, format: { with: /\A\d{10,15}\z/ }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :license_number, presence: true, uniqueness: true

  # Enums
  enum status: { active: 0, inactive: 1, suspended: 2 }

  # Scopes
  scope :active, -> { where(status: :active) }
  scope :by_location, ->(city) { where('address ILIKE ?', "%#{city}%") }

  # Methods
  def full_address
    "#{address}, #{city}, #{state} #{zip_code}"
  end

  def active?
    status == 'active'
  end

  def total_doctors
    doctors.count
  end

  def total_patients
    patients.count
  end

  def total_appointments
    appointments.count
  end

  def upcoming_appointments
    appointments.where('appointment_date >= ?', Time.current).order(:appointment_date)
  end
end
