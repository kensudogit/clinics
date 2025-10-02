# frozen_string_literal: true

class CreateMedicalBillingRecords < ActiveRecord::Migration[7.0]
  def change
    create_table :medical_billing_records do |t|
      t.references :clinic, null: false, foreign_key: true
      t.references :patient, null: false, foreign_key: true
      t.references :doctor, null: false, foreign_key: true
      t.references :electronic_medical_record, foreign_key: true
      t.string :billing_type, null: false # 'insurance', 'self_pay', 'mixed'
      t.string :insurance_provider # 保険者
      t.string :insurance_number # 保険証番号
      t.string :patient_category # 患者区分
      t.decimal :total_amount, precision: 10, scale: 2, null: false
      t.decimal :insurance_amount, precision: 10, scale: 2, default: 0
      t.decimal :patient_amount, precision: 10, scale: 2, default: 0
      t.json :billing_items # 診療項目詳細
      t.json :insurance_calculation # 保険計算詳細
      t.string :status, default: 'pending', null: false
      t.datetime :billed_at
      t.datetime :paid_at
      t.string :payment_method
      t.text :notes
      t.string :receipt_number
      t.json :audit_trail
      t.json :metadata

      t.timestamps
    end

    add_index :medical_billing_records, :billing_type
    add_index :medical_billing_records, :status
    add_index :medical_billing_records, :billed_at
    add_index :medical_billing_records, :paid_at
    add_index :medical_billing_records, :receipt_number, unique: true
    add_index :medical_billing_records, [:clinic_id, :billed_at]
  end
end
