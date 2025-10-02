# frozen_string_literal: true

class ElectronicMedicalRecord < ApplicationRecord
  # Associations
  belongs_to :clinic
  belongs_to :patient
  belongs_to :doctor
  belongs_to :online_consultation, optional: true
  belongs_to :signed_by, class_name: 'User', optional: true
  has_many :medical_billing_records, dependent: :destroy

  # Validations
  validates :record_type, presence: true, inclusion: { in: %w[consultation examination treatment prescription] }
  validates :status, presence: true, inclusion: { in: %w[draft signed locked] }
  validates :assessment, presence: true, if: :signed?
  validates :plan, presence: true, if: :signed?

  # Enums
  enum record_type: { consultation: 0, examination: 1, treatment: 2, prescription: 3 }
  enum status: { draft: 0, signed: 1, locked: 2 }

  # Scopes
  scope :signed, -> { where(status: :signed) }
  scope :draft, -> { where(status: :draft) }
  scope :by_patient, ->(patient_id) { where(patient_id: patient_id) }
  scope :by_doctor, ->(doctor_id) { where(doctor_id: doctor_id) }
  scope :recent, -> { order(created_at: :desc) }

  # Callbacks
  before_save :update_audit_trail
  after_save :create_billing_record, if: :saved_change_to_status?

  # Methods
  def sign_record(user)
    return false unless draft?
    
    update!(
      status: :signed,
      signed_at: Time.current,
      signed_by: user
    )
    
    # 署名後の処理
    RecordSignedJob.perform_later(self)
  end

  def lock_record
    return false unless signed?
    
    update!(status: :locked)
    
    # ロック後の処理
    RecordLockedJob.perform_later(self)
  end

  def can_be_modified?
    draft? || (signed? && signed_at > 24.hours.ago)
  end

  def add_icd10_code(code, description)
    current_codes = icd10_codes.present? ? icd10_codes.split(',') : []
    current_codes << "#{code}: #{description}"
    update!(icd10_codes: current_codes.join(','))
  end

  def add_laboratory_result(result_data)
    current_results = laboratory_results || []
    current_results << result_data.merge(timestamp: Time.current)
    update!(laboratory_results: current_results)
  end

  def add_imaging_result(result_data)
    current_results = imaging_results || []
    current_results << result_data.merge(timestamp: Time.current)
    update!(imaging_results: current_results)
  end

  def add_medication(medication_data)
    current_medications = medications || []
    current_medications << medication_data.merge(added_at: Time.current)
    update!(medications: current_medications)
  end

  def add_allergy(allergy_data)
    current_allergies = allergies || []
    current_allergies << allergy_data.merge(added_at: Time.current)
    update!(allergies: current_allergies)
  end

  def generate_summary
    {
      patient_name: patient.user.full_name,
      doctor_name: doctor.user.full_name,
      consultation_date: created_at.strftime('%Y年%m月%d日'),
      chief_complaint: chief_complaint,
      assessment: assessment,
      plan: plan,
      medications_count: medications&.length || 0,
      laboratory_results_count: laboratory_results&.length || 0,
      imaging_results_count: imaging_results&.length || 0
    }
  end

  def calculate_complexity_score
    score = 0
    
    # 症状の複雑さ
    score += 1 if chief_complaint&.length > 100
    score += 2 if assessment&.include?('複数')
    
    # 検査結果の数
    score += laboratory_results&.length || 0
    score += imaging_results&.length || 0
    
    # 薬剤の数
    score += medications&.length || 0
    
    # ICD-10コードの数
    score += icd10_codes&.split(',')&.length || 0
    
    score
  end

  def generate_billing_items
    items = []
    
    # 診療行為の請求項目
    case record_type
    when 'consultation'
      items << { code: '001', description: '初診料', amount: 3000 }
    when 'examination'
      items << { code: '002', description: '検査料', amount: 2000 }
    when 'treatment'
      items << { code: '003', description: '治療料', amount: 5000 }
    when 'prescription'
      items << { code: '004', description: '処方箋料', amount: 1000 }
    end
    
    # 検査結果に基づく追加項目
    laboratory_results&.each do |result|
      items << { 
        code: result['code'], 
        description: result['description'], 
        amount: result['amount'] || 0 
      }
    end
    
    items
  end

  def export_to_pdf
    # PDF出力のロジック
    MedicalRecordPdfJob.perform_later(self)
  end

  def share_with_patient
    return false unless signed?
    
    # 患者への記録共有
    PatientRecordShareJob.perform_later(self)
  end

  def anonymize_for_research
    return false unless locked?
    
    # 研究用の匿名化処理
    ResearchAnonymizationJob.perform_later(self)
  end

  private

  def update_audit_trail
    self.audit_trail ||= []
    
    audit_trail << {
      action: 'updated',
      user_id: Current.user&.id,
      timestamp: Time.current,
      changes: saved_changes
    }
  end

  def create_billing_record
    return unless signed?
    
    billing_items = generate_billing_items
    total_amount = billing_items.sum { |item| item[:amount] }
    
    MedicalBillingRecord.create!(
      clinic: clinic,
      patient: patient,
      doctor: doctor,
      electronic_medical_record: self,
      billing_type: 'insurance',
      total_amount: total_amount,
      billing_items: billing_items,
      status: 'pending'
    )
  end
end
