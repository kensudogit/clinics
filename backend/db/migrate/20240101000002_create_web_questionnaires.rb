# frozen_string_literal: true

class CreateWebQuestionnaires < ActiveRecord::Migration[7.0]
  def change
    create_table :web_questionnaires do |t|
      t.references :clinic, null: false, foreign_key: true
      t.references :patient, null: false, foreign_key: true
      t.references :web_booking, foreign_key: true
      t.string :questionnaire_type, null: false # 'initial', 'follow_up', 'specialized'
      t.json :responses, null: false # 問診回答データ
      t.json :ai_analysis # AI分析結果
      t.string :status, default: 'draft', null: false
      t.datetime :submitted_at
      t.datetime :reviewed_at
      t.references :reviewed_by, foreign_key: { to_table: :users }
      t.text :reviewer_notes
      t.json :risk_assessment # リスク評価結果
      t.boolean :requires_urgent_review, default: false
      t.json :metadata

      t.timestamps
    end

    add_index :web_questionnaires, :questionnaire_type
    add_index :web_questionnaires, :status
    add_index :web_questionnaires, :submitted_at
    add_index :web_questionnaires, :requires_urgent_review
  end
end
