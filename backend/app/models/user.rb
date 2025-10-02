# frozen_string_literal: true

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  # Associations
  has_many :clinics, dependent: :destroy
  has_many :appointments, dependent: :destroy
  has_many :medical_records, dependent: :destroy

  # Validations
  validates :email, presence: true, uniqueness: true
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :role, presence: true, inclusion: { in: %w[admin doctor patient] }

  # Enums
  enum role: { admin: 0, doctor: 1, patient: 2 }
  enum status: { active: 0, inactive: 1, suspended: 2 }

  # Scopes
  scope :active, -> { where(status: :active) }
  scope :by_role, ->(role) { where(role: role) }

  # Methods
  def full_name
    "#{first_name} #{last_name}"
  end

  def admin?
    role == 'admin'
  end

  def doctor?
    role == 'doctor'
  end

  def patient?
    role == 'patient'
  end

  def active?
    status == 'active'
  end

  def can_manage_clinic?(clinic)
    admin? || (doctor? && clinic.user_id == id)
  end

  def can_view_medical_record?(medical_record)
    admin? || medical_record.patient_id == id || medical_record.doctor_id == id
  end
end
