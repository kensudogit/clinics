# frozen_string_literal: true

# 患者モデル
# 患者の基本情報と診療履歴を管理する
class Patient < ApplicationRecord
  # アソシエーション（関連付け）
  belongs_to :clinic # 所属クリニックとの関連
  belongs_to :user # ユーザーアカウントとの関連
  has_many :appointments, dependent: :destroy # 予約との関連（削除時は関連予約も削除）
  has_many :medical_records, dependent: :destroy # 診療記録との関連（削除時は関連記録も削除）

  # バリデーション（検証）
  validates :date_of_birth, presence: true # 生年月日は必須
  validates :phone, presence: true, format: { with: /\A\d{10,15}\z/ } # 電話番号は必須（10-15桁の数字）
  validates :emergency_contact_name, presence: true # 緊急連絡先名は必須
  validates :emergency_contact_phone, presence: true, format: { with: /\A\d{10,15}\z/ } # 緊急連絡先電話番号は必須（10-15桁の数字）

  # 列挙型（ステータス管理）
  enum gender: { male: 0, female: 1, other: 2 } # 男性、女性、その他
  enum status: { active: 0, inactive: 1 } # アクティブ、非アクティブ

  # スコープ（検索条件）
  scope :active, -> { where(status: :active) } # アクティブな患者のみ
  scope :by_age_range, ->(min_age, max_age) { where(date_of_birth: max_age.years.ago..min_age.years.ago) } # 年齢範囲で検索

  # メソッド（機能）
  def full_name
    # 患者のフルネームを取得（ユーザー情報から）
    user.full_name
  end

  def age
    # 現在の年齢を計算
    return nil unless date_of_birth
    ((Time.current - date_of_birth) / 1.year).floor
  end

  def active?
    # 患者がアクティブかどうかを判定
    status == 'active'
  end

  def total_appointments
    # 総予約数を取得
    appointments.count
  end

  def upcoming_appointments
    # 今後の予約一覧を取得（現在時刻以降の予約を日時順でソート）
    appointments.where('appointment_date >= ?', Time.current).order(:appointment_date)
  end

  def latest_medical_record
    # 最新の診療記録を取得（作成日時降順）
    medical_records.order(created_at: :desc).first
  end
end
