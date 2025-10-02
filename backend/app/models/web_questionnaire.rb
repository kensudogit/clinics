# frozen_string_literal: true

class WebQuestionnaire < ApplicationRecord
  # Associations
  belongs_to :clinic
  belongs_to :patient
  belongs_to :web_booking, optional: true
  belongs_to :reviewed_by, class_name: 'User', optional: true

  # Validations
  validates :questionnaire_type, presence: true, inclusion: { in: %w[initial follow_up specialized] }
  validates :responses, presence: true
  validates :status, presence: true, inclusion: { in: %w[draft submitted reviewed] }

  # Enums
  enum questionnaire_type: { initial: 0, follow_up: 1, specialized: 2 }
  enum status: { draft: 0, submitted: 1, reviewed: 2 }

  # Scopes
  scope :submitted, -> { where(status: :submitted) }
  scope :requires_review, -> { where(requires_urgent_review: true) }
  scope :by_type, ->(type) { where(questionnaire_type: type) }

  # Callbacks
  after_update :analyze_responses, if: :saved_change_to_responses?

  # Methods
  def calculate_risk_score
    return 0 unless responses.present?
    
    risk_factors = []
    
    # 症状の緊急度チェック
    if responses['symptoms']&.any? { |s| s['severity'] == 'severe' }
      risk_factors << 3
    end
    
    # 既往歴のリスク要因
    if responses['medical_history']&.any? { |h| h['condition'] == 'heart_disease' }
      risk_factors << 2
    end
    
    # 薬物アレルギー
    if responses['allergies']&.any? { |a| a['severity'] == 'severe' }
      risk_factors << 2
    end
    
    risk_factors.sum
  end

  def requires_urgent_review?
    calculate_risk_score >= 5 || 
    responses['symptoms']&.any? { |s| s['urgent'] == true }
  end

  def generate_ai_summary
    return unless responses.present?
    
    # AI分析のロジック（実際の実装では外部AIサービスを呼び出し）
    summary = {
      primary_symptoms: extract_primary_symptoms,
      risk_level: determine_risk_level,
      recommended_actions: generate_recommendations,
      follow_up_questions: generate_follow_up_questions
    }
    
    update(ai_analysis: summary)
  end

  def extract_primary_symptoms
    responses['symptoms']&.select { |s| s['severity'] == 'moderate' || s['severity'] == 'severe' }
  end

  def determine_risk_level
    score = calculate_risk_score
    case score
    when 0..2 then 'low'
    when 3..4 then 'medium'
    else 'high'
    end
  end

  def generate_recommendations
    recommendations = []
    
    if calculate_risk_score >= 5
      recommendations << 'urgent_consultation'
    end
    
    if responses['symptoms']&.any? { |s| s['duration'] > 7 }
      recommendations << 'follow_up_needed'
    end
    
    recommendations
  end

  def generate_follow_up_questions
    questions = []
    
    if responses['symptoms']&.any? { |s| s['type'] == 'chest_pain' }
      questions << 'chest_pain_details'
    end
    
    if responses['medications']&.any?
      questions << 'medication_effectiveness'
    end
    
    questions
  end

  def can_be_modified?
    draft? || (submitted? && submitted_at > 1.hour.ago)
  end

  def time_since_submission
    return nil unless submitted_at
    Time.current - submitted_at
  end

  private

  def analyze_responses
    return unless responses.present?
    
    # リスク評価の更新
    update(requires_urgent_review: requires_urgent_review?)
    
    # AI分析の実行
    generate_ai_summary
  end
end
