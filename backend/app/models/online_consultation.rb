# frozen_string_literal: true

class OnlineConsultation < ApplicationRecord
  # Associations
  belongs_to :clinic
  belongs_to :doctor
  belongs_to :patient
  belongs_to :web_booking, optional: true
  has_one :electronic_medical_record, dependent: :destroy

  # Validations
  validates :consultation_type, presence: true, inclusion: { in: %w[video audio chat] }
  validates :status, presence: true, inclusion: { in: %w[scheduled in_progress completed cancelled] }
  validates :scheduled_at, presence: true
  validates :meeting_room_id, presence: true, uniqueness: true

  # Enums
  enum consultation_type: { video: 0, audio: 1, chat: 2 }
  enum status: { scheduled: 0, in_progress: 1, completed: 2, cancelled: 3 }

  # Scopes
  scope :upcoming, -> { where('scheduled_at >= ?', Time.current) }
  scope :today, -> { where(scheduled_at: Date.current.beginning_of_day..Date.current.end_of_day) }
  scope :by_type, ->(type) { where(consultation_type: type) }

  # Callbacks
  before_validation :generate_meeting_room_id, on: :create
  after_create :setup_meeting_room
  after_update :handle_status_change

  # Methods
  def start_consultation
    return false unless scheduled?
    
    update!(
      status: :in_progress,
      started_at: Time.current
    )
    
    # 診療開始の通知
    ConsultationStartedJob.perform_later(self)
  end

  def end_consultation(notes: nil)
    return false unless in_progress?
    
    update!(
      status: :completed,
      ended_at: Time.current,
      duration_minutes: calculate_duration,
      consultation_notes: notes
    )
    
    # 診療終了の処理
    ConsultationCompletedJob.perform_later(self)
  end

  def cancel_consultation(reason: nil)
    return false if completed?
    
    update!(
      status: :cancelled,
      ended_at: Time.current
    )
    
    # キャンセル通知
    ConsultationCancelledJob.perform_later(self, reason)
  end

  def calculate_duration
    return 0 unless started_at && ended_at
    ((ended_at - started_at) / 1.minute).round
  end

  def is_late?
    return false unless scheduled?
    Time.current > scheduled_at + 15.minutes && !in_progress?
  end

  def can_be_started?
    scheduled? && scheduled_at <= Time.current + 30.minutes
  end

  def generate_meeting_url
    # 実際の実装では外部ビデオ会議サービス（Zoom、Teams等）のAPIを呼び出し
    case consultation_type
    when 'video'
      "https://meeting.clinics.com/#{meeting_room_id}"
    when 'audio'
      "tel:+81-3-1234-5678,#{meeting_room_id}"
    when 'chat'
      "https://chat.clinics.com/#{meeting_room_id}"
    end
  end

  def record_vital_signs(vitals)
    update!(vital_signs: vitals)
  end

  def add_prescription(prescription_data)
    current_prescriptions = prescriptions || []
    current_prescriptions << prescription_data
    update!(prescriptions: current_prescriptions)
  end

  def add_follow_up_instruction(instruction)
    current_instructions = follow_up_instructions || []
    current_instructions << instruction
    update!(follow_up_instructions: current_instructions)
  end

  def technical_quality_score
    return nil unless technical_issues.present?
    
    issues = technical_issues['issues'] || []
    base_score = 100
    
    issues.each do |issue|
      case issue['severity']
      when 'minor' then base_score -= 5
      when 'moderate' then base_score -= 15
      when 'major' then base_score -= 30
      end
    end
    
    [base_score, 0].max
  end

  def generate_consultation_summary
    {
      duration: duration_minutes,
      type: consultation_type,
      quality_score: technical_quality_score,
      prescriptions_count: prescriptions&.length || 0,
      follow_up_count: follow_up_instructions&.length || 0,
      vital_signs_recorded: vital_signs.present?,
      recording_available: recording_url.present?
    }
  end

  private

  def generate_meeting_room_id
    self.meeting_room_id = SecureRandom.alphanumeric(12)
  end

  def setup_meeting_room
    # 外部ビデオ会議サービスの会議室セットアップ
    MeetingRoomSetupJob.perform_later(self)
  end

  def handle_status_change
    case status
    when 'in_progress'
      # 診療開始時の処理
      update_doctor_availability
    when 'completed'
      # 診療終了時の処理
      create_medical_record
      update_analytics
    when 'cancelled'
      # キャンセル時の処理
      handle_cancellation
    end
  end

  def update_doctor_availability
    doctor.update!(status: 'busy')
  end

  def create_medical_record
    ElectronicMedicalRecord.create!(
      clinic: clinic,
      patient: patient,
      doctor: doctor,
      online_consultation: self,
      record_type: 'consultation',
      status: 'draft'
    )
  end

  def update_analytics
    # 診療データの分析更新
    AnalyticsUpdateJob.perform_later(clinic, 'consultation_completed', self)
  end

  def handle_cancellation
    # キャンセル時の後処理
    doctor.update!(status: 'active')
  end
end
