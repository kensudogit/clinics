import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Heart, 
  Activity,
  Pill,
  Stethoscope
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { apiService } from '../services/api';
import { cn } from '../lib/utils';

// 問診フォームのスキーマ
const questionnaireSchema = z.object({
  symptoms: z.array(z.object({
    type: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe'] as const),
    duration: z.number(),
    description: z.string(),
  })).min(1, '症状を1つ以上選択してください'),
  medical_history: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  allergies: z.array(z.object({
    substance: z.string(),
    reaction: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe'] as const),
  })).optional(),
  lifestyle: z.object({
    smoking: z.boolean(),
    alcohol: z.boolean(),
    exercise: z.enum(['none', 'light', 'moderate', 'intense'] as const),
    sleep_hours: z.number().min(0).max(24),
  }).optional(),
});

type QuestionnaireFormData = z.infer<typeof questionnaireSchema>;

interface WebQuestionnaireProps {
  clinicId: string;
  patientId: string;
  bookingId?: string;
  questionnaireType?: 'initial' | 'follow_up' | 'specialized';
}

export const WebQuestionnaire: React.FC<WebQuestionnaireProps> = ({
  clinicId,
  patientId,
  bookingId,
  questionnaireType = 'initial'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
  });

  const watchedValues = watch();

  // 問診送信のミューテーション
  const submitQuestionnaireMutation = useMutation({
    mutationFn: (data: QuestionnaireFormData) => 
      apiService.createWebQuestionnaire(clinicId, {
        patient_id: patientId,
        web_booking_id: bookingId,
        questionnaire_type: questionnaireType,
        responses: data,
      }),
    onSuccess: (response: any) => {
      setAiAnalysis(response.ai_analysis);
      setRiskScore(response.risk_score);
      queryClient.invalidateQueries({ queryKey: ['questionnaires', clinicId] });
    },
    onError: (error: any) => {
      alert(`問診の送信に失敗しました: ${error.message}`);
    },
  });

  const onSubmit = (data: QuestionnaireFormData) => {
    submitQuestionnaireMutation.mutate(data);
  };

  // リスクスコアの計算
  useEffect(() => {
    const calculateRiskScore = () => {
      let score = 0;
      
      // 症状の緊急度チェック
      if (watchedValues.symptoms) {
        watchedValues.symptoms.forEach((symptom: any) => {
          if (symptom.severity === 'severe') score += 3;
          else if (symptom.severity === 'moderate') score += 1;
        });
      }
      
      // 既往歴のリスク要因
      if (watchedValues.medical_history?.includes('heart_disease')) score += 2;
      if (watchedValues.medical_history?.includes('diabetes')) score += 1;
      
      // アレルギーのリスク
      if (watchedValues.allergies) {
        watchedValues.allergies.forEach((allergy: any) => {
          if (allergy.severity === 'severe') score += 2;
        });
      }
      
      setRiskScore(score);
    };

    calculateRiskScore();
  }, [watchedValues]);

  const steps = [
    {
      title: '現在の症状',
      icon: <Stethoscope className="w-5 h-5" />,
      component: <SymptomsStep register={register} errors={errors} />
    },
    {
      title: '既往歴・薬歴',
      icon: <FileText className="w-5 h-5" />,
      component: <MedicalHistoryStep register={register} errors={errors} />
    },
    {
      title: '生活習慣',
      icon: <Activity className="w-5 h-5" />,
      component: <LifestyleStep register={register} errors={errors} />
    },
    {
      title: '確認・送信',
      icon: <CheckCircle className="w-5 h-5" />,
      component: <ConfirmationStep 
        data={watchedValues} 
        riskScore={riskScore}
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
      />
    }
  ];

  const getRiskLevel = (score: number) => {
    if (score >= 5) return { level: 'high', color: 'text-red-600', bg: 'bg-red-50' };
    if (score >= 3) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'low', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          <FileText className="inline-block w-6 h-6 mr-2" />
          オンライン問診
        </h2>
        <p className="text-gray-600">
          診療前に症状や既往歴をお聞かせください
        </p>
      </div>

      {/* 進捗バー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2",
                index <= currentStep 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : "border-gray-300 text-gray-400"
              )}>
                {step.icon}
              </div>
              <span className={cn(
                "ml-2 text-sm font-medium",
                index <= currentStep ? "text-blue-600" : "text-gray-400"
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* リスクスコア表示 */}
      {riskScore > 0 && (
        <div className={cn("mb-6 p-4 rounded-lg border", riskLevel.bg)}>
          <div className="flex items-center">
            <AlertTriangle className={cn("w-5 h-5 mr-2", riskLevel.color)} />
            <span className={cn("font-medium", riskLevel.color)}>
              リスクレベル: {riskLevel.level === 'high' ? '高' : riskLevel.level === 'medium' ? '中' : '低'}
            </span>
          </div>
          <p className={cn("text-sm mt-1", riskLevel.color)}>
            スコア: {riskScore} - {riskLevel.level === 'high' ? '緊急度の高い症状が含まれています' : 
            riskLevel.level === 'medium' ? '注意が必要な症状があります' : '一般的な症状です'}
          </p>
        </div>
      )}

      {/* ステップコンテンツ */}
      <div className="mb-6">
        {steps[currentStep].component}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          前へ
        </Button>
        
        {currentStep < steps.length - 1 && (
          <Button
            type="button"
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          >
            次へ
          </Button>
        )}
      </div>

      {/* AI分析結果 */}
      {aiAnalysis && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">AI分析結果</h3>
          <div className="text-sm text-blue-700">
            <p><strong>主要症状:</strong> {aiAnalysis.primary_symptoms?.join(', ')}</p>
            <p><strong>推奨アクション:</strong> {aiAnalysis.recommended_actions?.join(', ')}</p>
            <p><strong>フォローアップ質問:</strong> {aiAnalysis.follow_up_questions?.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 症状ステップコンポーネント
const SymptomsStep: React.FC<any> = ({ register, errors }) => {
  const [symptoms, setSymptoms] = useState<any[]>([]);

  const addSymptom = () => {
    setSymptoms([...symptoms, { type: '', severity: 'mild', duration: 1, description: '' }]);
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">現在の症状</h3>
      
      {symptoms.map((_, index) => (
        <div key={index} className="p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label>症状の種類</Label>
              <select {...register(`symptoms.${index}.type`)} className="w-full p-2 border rounded">
                <option value="">選択してください</option>
                <option value="fever">発熱</option>
                <option value="cough">咳</option>
                <option value="headache">頭痛</option>
                <option value="chest_pain">胸痛</option>
                <option value="abdominal_pain">腹痛</option>
                <option value="fatigue">倦怠感</option>
                <option value="nausea">吐き気</option>
                <option value="other">その他</option>
              </select>
            </div>
            
            <div>
              <Label>重症度</Label>
              <select {...register(`symptoms.${index}.severity`)} className="w-full p-2 border rounded">
                <option value="mild">軽度</option>
                <option value="moderate">中等度</option>
                <option value="severe">重度</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label>持続期間（日数）</Label>
              <Input
                type="number"
                {...register(`symptoms.${index}.duration`, { valueAsNumber: true })}
                min="1"
                max="365"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => removeSymptom(index)}
                className="text-red-600"
              >
                削除
              </Button>
            </div>
          </div>
          
          <div>
            <Label>詳細な説明</Label>
            <textarea
              {...register(`symptoms.${index}.description`)}
              rows={2}
              className="w-full p-2 border rounded"
              placeholder="症状の詳細を教えてください"
            />
          </div>
        </div>
      ))}
      
      <Button type="button" onClick={addSymptom} variant="outline">
        症状を追加
      </Button>
    </div>
  );
};

// 既往歴ステップコンポーネント
const MedicalHistoryStep: React.FC<any> = ({ register, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">既往歴・薬歴</h3>
      
      <div>
        <Label>既往歴（該当するものを選択）</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['heart_disease', 'diabetes', 'hypertension', 'asthma', 'cancer', 'mental_health'].map((condition) => (
            <label key={condition} className="flex items-center space-x-2">
              <input type="checkbox" {...register('medical_history')} value={condition} />
              <span>{condition}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <Label>現在服用中の薬</Label>
        <textarea
          {...register('medications')}
          rows={3}
          className="w-full p-2 border rounded"
          placeholder="薬の名前と服用量を教えてください"
        />
      </div>
      
      <div>
        <Label>アレルギー</Label>
        <textarea
          {...register('allergies')}
          rows={3}
          className="w-full p-2 border rounded"
          placeholder="アレルギーがある場合は教えてください"
        />
      </div>
    </div>
  );
};

// 生活習慣ステップコンポーネント
const LifestyleStep: React.FC<any> = ({ register, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">生活習慣</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>喫煙</Label>
          <select {...register('lifestyle.smoking')} className="w-full p-2 border rounded">
            <option value="false">吸わない</option>
            <option value="true">吸う</option>
          </select>
        </div>
        
        <div>
          <Label>飲酒</Label>
          <select {...register('lifestyle.alcohol')} className="w-full p-2 border rounded">
            <option value="false">飲まない</option>
            <option value="true">飲む</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>運動習慣</Label>
          <select {...register('lifestyle.exercise')} className="w-full p-2 border rounded">
            <option value="none">運動しない</option>
            <option value="light">軽い運動</option>
            <option value="moderate">適度な運動</option>
            <option value="intense">激しい運動</option>
          </select>
        </div>
        
        <div>
          <Label>睡眠時間（時間）</Label>
          <Input
            type="number"
            {...register('lifestyle.sleep_hours', { valueAsNumber: true })}
            min="0"
            max="24"
            step="0.5"
          />
        </div>
      </div>
    </div>
  );
};

// 確認ステップコンポーネント
const ConfirmationStep: React.FC<any> = ({ data, riskScore, onSubmit, isSubmitting }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">確認・送信</h3>
      
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">入力内容の確認</h4>
        <div className="text-sm space-y-1">
          <p><strong>症状:</strong> {data.symptoms?.length || 0}件</p>
          <p><strong>既往歴:</strong> {data.medical_history?.length || 0}件</p>
          <p><strong>薬歴:</strong> {data.medications ? 'あり' : 'なし'}</p>
          <p><strong>アレルギー:</strong> {data.allergies ? 'あり' : 'なし'}</p>
        </div>
      </div>
      
      {riskScore > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="font-medium text-yellow-800">
              リスクスコア: {riskScore}
            </span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            {riskScore >= 5 ? '緊急度の高い症状が含まれています。早急な診療をお勧めします。' :
             riskScore >= 3 ? '注意が必要な症状があります。' : '一般的な症状です。'}
          </p>
        </div>
      )}
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">送信後の流れ</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 問診内容を医師が確認します</li>
          <li>• 診療前に追加の質問がある場合があります</li>
          <li>• 診療時間の短縮に役立ちます</li>
        </ul>
      </div>
      
      <Button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isSubmitting ? '送信中...' : '問診を送信する'}
      </Button>
    </div>
  );
};
