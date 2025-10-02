# frozen_string_literal: true

class CreateWebBookings < ActiveRecord::Migration[7.0]
  def change
    create_table :web_bookings do |t|
      t.references :clinic, null: false, foreign_key: true
      t.references :doctor, null: false, foreign_key: true
      t.references :patient, null: false, foreign_key: true
      t.datetime :appointment_date, null: false
      t.string :appointment_time, null: false
      t.integer :duration, default: 30, null: false
      t.string :status, default: 'pending', null: false
      t.text :patient_notes
      t.text :admin_notes
      t.string :booking_source, default: 'web', null: false
      t.string :confirmation_code, null: false
      t.datetime :confirmed_at
      t.datetime :cancelled_at
      t.text :cancellation_reason
      t.boolean :sms_notification_sent, default: false
      t.boolean :email_notification_sent, default: false
      t.json :metadata # 追加の予約情報を格納

      t.timestamps
    end

    add_index :web_bookings, :appointment_date
    add_index :web_bookings, :status
    add_index :web_bookings, :confirmation_code, unique: true
    add_index :web_bookings, [:clinic_id, :appointment_date]
    add_index :web_bookings, [:doctor_id, :appointment_date]
  end
end
