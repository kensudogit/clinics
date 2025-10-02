# frozen_string_literal: true

class CreateBusinessAnalytics < ActiveRecord::Migration[7.0]
  def change
    create_table :business_analytics do |t|
      t.references :clinic, null: false, foreign_key: true
      t.date :analytics_date, null: false
      t.string :metric_type, null: false # 'daily', 'weekly', 'monthly', 'yearly'
      t.json :patient_metrics # 患者数、新規患者数など
      t.json :appointment_metrics # 予約数、キャンセル率など
      t.json :revenue_metrics # 売上、診療報酬など
      t.json :doctor_metrics # 医師別診療数、稼働率など
      t.json :efficiency_metrics # 業務効率指標
      t.json :quality_metrics # 医療品質指標
      t.json :patient_satisfaction # 患者満足度
      t.json :operational_metrics # 運営指標
      t.decimal :total_revenue, precision: 15, scale: 2
      t.decimal :total_costs, precision: 15, scale: 2
      t.decimal :profit_margin, precision: 5, scale: 2
      t.json :comparative_data # 前年同期比較データ
      t.json :metadata

      t.timestamps
    end

    add_index :business_analytics, [:clinic_id, :analytics_date, :metric_type], 
              unique: true, name: 'index_business_analytics_unique'
    add_index :business_analytics, :analytics_date
    add_index :business_analytics, :metric_type
  end
end
