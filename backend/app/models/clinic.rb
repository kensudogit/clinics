# frozen_string_literal: true

# クリニックモデル
# 医療機関の基本情報と関連データを管理する
class Clinic < ApplicationRecord
  # アソシエーション（関連付け）
  belongs_to :user # ユーザー（クリニック管理者）との関連
  has_many :doctors, dependent: :destroy # 医師との関連（削除時は関連医師も削除）
  has_many :patients, dependent: :destroy # 患者との関連（削除時は関連患者も削除）
  has_many :appointments, dependent: :destroy # 予約との関連（削除時は関連予約も削除）
  has_many :medical_records, dependent: :destroy # 診療記録との関連（削除時は関連記録も削除）

  # バリデーション（検証）
  validates :name, presence: true # クリニック名は必須
  validates :address, presence: true # 住所は必須
  validates :phone, presence: true, format: { with: /\A\d{10,15}\z/ } # 電話番号は必須（10-15桁の数字）
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP } # メールアドレスは必須（正しい形式）
  validates :license_number, presence: true, uniqueness: true # 医療機関番号は必須かつ一意

  # 列挙型（ステータス管理）
  enum status: { active: 0, inactive: 1, suspended: 2 } # アクティブ、非アクティブ、停止中

  # スコープ（検索条件）
  scope :active, -> { where(status: :active) } # アクティブなクリニックのみ
  scope :by_location, ->(city) { where('address ILIKE ?', "%#{city}%") } # 都市名で検索

  # メソッド（機能）
  def full_address
    # 完全な住所を返す（住所、都市、都道府県、郵便番号）
    "#{address}, #{city}, #{state} #{zip_code}"
  end

  def active?
    # クリニックがアクティブかどうかを判定
    status == 'active'
  end

  def total_doctors
    # 登録医師数を取得
    doctors.count
  end

  def total_patients
    # 登録患者数を取得
    patients.count
  end

  def total_appointments
    # 総予約数を取得
    appointments.count
  end

  def upcoming_appointments
    # 今後の予約一覧を取得（現在時刻以降の予約を日時順でソート）
    appointments.where('appointment_date >= ?', Time.current).order(:appointment_date)
  end
end
