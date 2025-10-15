# frozen_string_literal: true

# オンライン診療モデル
# ビデオ通話、音声通話、チャットによるオンライン診療を管理する
class OnlineConsultation < ApplicationRecord
  # アソシエーション（関連付け）
  belongs_to :clinic # 所属クリニックとの関連
  belongs_to :doctor # 担当医師との関連
  belongs_to :patient # 患者との関連
  belongs_to :web_booking, optional: true # Web予約との関連（オプション）
  has_one :electronic_medical_record, dependent: :destroy # 電子カルテとの関連（削除時は関連記録も削除）

  # バリデーション（検証）
  validates :consultation_type, presence: true, inclusion: { in: %w[video audio chat] } # 診療タイプは必須（ビデオ、音声、チャット）
  validates :status, presence: true, inclusion: { in: %w[scheduled in_progress completed cancelled] } # ステータスは必須（予約済み、進行中、完了、キャンセル）
  validates :scheduled_at, presence: true # 診療予定日時は必須
  validates :meeting_room_id, presence: true, uniqueness: true # 会議室IDは必須かつ一意

  # 列挙型（ステータス管理）
  enum consultation_type: { video: 0, audio: 1, chat: 2 } # ビデオ、音声、チャット
  enum status: { scheduled: 0, in_progress: 1, completed: 2, cancelled: 3 } # 予約済み、進行中、完了、キャンセル

  # スコープ（検索条件）
  scope :upcoming, -> { where('scheduled_at >= ?', Time.current) } # 今後の診療のみ
  scope :today, -> { where(scheduled_at: Date.current.beginning_of_day..Date.current.end_of_day) } # 今日の診療のみ
  scope :by_type, ->(type) { where(consultation_type: type) } # 診療タイプで検索

  # コールバック（処理フック）
  before_validation :generate_meeting_room_id, on: :create # 作成時に会議室IDを自動生成
  after_create :setup_meeting_room # 作成後に会議室をセットアップ
  after_update :handle_status_change # 更新後にステータス変更を処理

  # メソッド（機能）
  def start_consultation
    # 診療を開始する
    return false unless scheduled?
    
    update!(
      status: :in_progress,
      started_at: Time.current
    )
    
    # 診療開始の通知
    ConsultationStartedJob.perform_later(self)
  end

  def end_consultation(notes: nil)
    # 診療を終了する
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
    # 診療をキャンセルする
    return false if completed?
    
    update!(
      status: :cancelled,
      ended_at: Time.current
    )
    
    # キャンセル通知
    ConsultationCancelledJob.perform_later(self, reason)
  end

  def calculate_duration
    # 診療時間を計算（分単位）
    return 0 unless started_at && ended_at
    ((ended_at - started_at) / 1.minute).round
  end

  def is_late?
    # 診療が遅れているかチェック（15分以上遅延かつ未開始）
    return false unless scheduled?
    Time.current > scheduled_at + 15.minutes && !in_progress?
  end

  def can_be_started?
    # 診療を開始できるかチェック（予約済みかつ30分以内）
    scheduled? && scheduled_at <= Time.current + 30.minutes
  end

  def generate_meeting_url
    # 会議室URLを生成
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
    # バイタルサインを記録
    update!(vital_signs: vitals)
  end

  def add_prescription(prescription_data)
    # 処方箋を追加
    current_prescriptions = prescriptions || []
    current_prescriptions << prescription_data
    update!(prescriptions: current_prescriptions)
  end

  def add_follow_up_instruction(instruction)
    # フォローアップ指示を追加
    current_instructions = follow_up_instructions || []
    current_instructions << instruction
    update!(follow_up_instructions: current_instructions)
  end

  def technical_quality_score
    # 技術的な品質スコアを計算
    return nil unless technical_issues.present?
    
    issues = technical_issues['issues'] || []
    base_score = 100
    
    issues.each do |issue|
      case issue['severity']
      when 'minor' then base_score -= 5 # 軽微な問題
      when 'moderate' then base_score -= 15 # 中程度の問題
      when 'major' then base_score -= 30 # 重大な問題
      end
    end
    
    [base_score, 0].max
  end

  def generate_consultation_summary
    # 診療サマリーを生成
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
    # 会議室IDを自動生成（12文字の英数字）
    self.meeting_room_id = SecureRandom.alphanumeric(12)
  end

  def setup_meeting_room
    # 外部ビデオ会議サービスの会議室セットアップ
    MeetingRoomSetupJob.perform_later(self)
  end

  def handle_status_change
    # ステータス変更時の処理
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
    # 医師の稼働状況を更新（診療中に設定）
    doctor.update!(status: 'busy')
  end

  def create_medical_record
    # 診療記録を作成
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
    # キャンセル時の後処理（医師をアクティブに戻す）
    doctor.update!(status: 'active')
  end
end
