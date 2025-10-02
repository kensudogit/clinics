# frozen_string_literal: true

class CreateElectronicMedicalRecords < ActiveRecord::Migration[7.0]
  def change
    create_table :electronic_medical_records do |t|
      t.references :clinic, null: false, foreign_key: true
      t.references :patient, null: false, foreign_key: true
      t.references :doctor, null: false, foreign_key: true
      t.references :online_consultation, foreign_key: true
      t.string :record_type, null: false # 'consultation', 'examination', 'treatment', 'prescription'
      t.text :chief_complaint # 主訴
      t.text :present_illness # 現病歴
      t.text :past_history # 既往歴
      t.text :family_history # 家族歴
      t.text :social_history # 社会歴
      t.text :physical_examination # 身体所見
      t.text :assessment # 診断・評価
      t.text :plan # 治療計画
      t.json :vital_signs # バイタルサイン
      t.json :laboratory_results # 検査結果
      t.json :imaging_results # 画像検査結果
      t.json :medications # 薬剤情報
      t.json :allergies # アレルギー情報
      t.text :follow_up_plan # フォローアップ計画
      t.string :icd10_codes # ICD-10コード
      t.string :status, default: 'draft', null: false
      t.datetime :signed_at
      t.references :signed_by, foreign_key: { to_table: :users }
      t.json :audit_trail # 監査証跡
      t.json :metadata

      t.timestamps
    end

    add_index :electronic_medical_records, :record_type
    add_index :electronic_medical_records, :status
    add_index :electronic_medical_records, :signed_at
    add_index :electronic_medical_records, [:patient_id, :created_at]
    add_index :electronic_medical_records, [:doctor_id, :created_at]
  end
end
