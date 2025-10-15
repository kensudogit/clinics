# frozen_string_literal: true

# 医師モデル
# 医師の基本情報と専門分野、経験年数を管理する
class Doctor < ApplicationRecord
  # アソシエーション（関連付け）
  belongs_to :clinic # 所属クリニックとの関連
  belongs_to :user # ユーザーアカウントとの関連
  has_many :appointments, dependent: :destroy # 予約との関連（削除時は関連予約も削除）
  has_many :medical_records, dependent: :destroy # 診療記録との関連（削除時は関連記録も削除）

  # バリデーション（検証）
  validates :specialization, presence: true # 専門分野は必須
  validates :license_number, presence: true, uniqueness: true # 医師免許番号は必須かつ一意
  validates :years_of_experience, presence: true, numericality: { greater_than: 0 } # 経験年数は必須（0より大きい）

  # 列挙型（ステータス管理）
  enum status: { active: 0, inactive: 1, on_leave: 2 } # アクティブ、非アクティブ、休職中

  # スコープ（検索条件）
  scope :active, -> { where(status: :active) } # アクティブな医師のみ
  scope :by_specialization, ->(specialization) { where(specialization: specialization) } # 専門分野で検索

  # メソッド（機能）
  def full_name
    # 医師のフルネームを取得（ユーザー情報から）
    user.full_name
  end

  def active?
    # 医師がアクティブかどうかを判定
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

  def available_slots(date)
    # 指定日の空き時間枠をチェック
    # 通常はスケジューリングシステムと連携するが、
    # 現在は1日8枠までの簡単な空き状況チェック
    appointments.where(appointment_date: date.beginning_of_day..date.end_of_day).count < 8
  end
end
