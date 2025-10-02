# frozen_string_literal: true

class CreateOnlineConsultations < ActiveRecord::Migration[7.0]
  def change
    create_table :online_consultations do |t|
      t.references :clinic, null: false, foreign_key: true
      t.references :doctor, null: false, foreign_key: true
      t.references :patient, null: false, foreign_key: true
      t.references :web_booking, foreign_key: true
      t.string :consultation_type, null: false # 'video', 'audio', 'chat'
      t.string :status, default: 'scheduled', null: false
      t.datetime :scheduled_at, null: false
      t.datetime :started_at
      t.datetime :ended_at
      t.integer :duration_minutes
      t.string :meeting_room_id, null: false
      t.string :meeting_url
      t.text :consultation_notes
      t.json :vital_signs # バイタルサイン記録
      t.json :prescriptions # 処方箋情報
      t.json :follow_up_instructions # フォローアップ指示
      t.string :recording_url # 診療録画URL
      t.boolean :recording_consent, default: false
      t.json :technical_issues # 技術的問題の記録
      t.json :metadata

      t.timestamps
    end

    add_index :online_consultations, :scheduled_at
    add_index :online_consultations, :status
    add_index :online_consultations, :meeting_room_id, unique: true
    add_index :online_consultations, [:clinic_id, :scheduled_at]
    add_index :online_consultations, [:doctor_id, :scheduled_at]
  end
end
