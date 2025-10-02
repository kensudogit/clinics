import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FileText, 
  User, 
  Save,
  Edit,
  Lock,
  Download,
  Share,
  Search,
  Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { apiService } from '../services/api';
import { cn } from '../lib/utils';

// 電子カルテフォームのスキーマ
const medicalRecordSchema = z.object({
  chief_complaint: z.string().min(1, '主訴を入力してください'),
  present_illness: z.string().optional(),
  past_history: z.string().optional(),
  family_history: z.string().optional(),
  social_history: z.string().optional(),
  physical_examination: z.string().optional(),
  assessment: z.string().min(1, '診断・評価を入力してください'),
  plan: z.string().min(1, '治療計画を入力してください'),
  vital_signs: z.object({
    blood_pressure: z.string().optional(),
    heart_rate: z.number().optional(),
    temperature: z.number().optional(),
    oxygen_saturation: z.number().optional(),
  }).optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    instructions: z.string().optional(),
  })).optional(),
  allergies: z.array(z.object({
    substance: z.string(),
    reaction: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
  })).optional(),
  follow_up_plan: z.string().optional(),
  icd10_codes: z.string().optional(),
});

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>;

interface ElectronicMedicalRecordProps {
  clinicId: string;
  patientId?: string;
  consultationId?: string;
  recordId?: string;
  userRole: 'doctor' | 'admin';
}

export const ElectronicMedicalRecord: React.FC<ElectronicMedicalRecordProps> = ({
  clinicId,
  patientId,
  consultationId,
  recordId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'history' | 'prescriptions'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'signed' | 'locked'>('all');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
  });

  // 患者情報の取得
  const { data: patient } = useQuery({
    queryKey: ['patient', clinicId, patientId],
    queryFn: () => apiService.getPatient(clinicId, patientId!),
    enabled: !!patientId,
  });

  // 電子カルテの取得
  const { data: medicalRecord } = useQuery({
    queryKey: ['medical-record', recordId],
    queryFn: () => apiService.getElectronicMedicalRecord(clinicId, recordId!),
    enabled: !!recordId,
  });

  // 患者の診療記録一覧
  const { data: patientRecords } = useQuery({
    queryKey: ['patient-records', clinicId, patientId],
    queryFn: () => apiService.getPatientMedicalRecords(clinicId, patientId!),
    enabled: !!patientId,
  });

  // 電子カルテ作成のミューテーション
  const createRecordMutation = useMutation({
    mutationFn: (data: MedicalRecordFormData) => 
      apiService.createElectronicMedicalRecord(clinicId, {
        patient_id: patientId!,
        doctor_id: consultationId ? undefined : undefined, // 実際の実装では現在の医師IDを設定
        online_consultation_id: consultationId,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-records', clinicId, patientId] });
      setIsEditing(false);
    },
  });

  // 電子カルテ更新のミューテーション
  const updateRecordMutation = useMutation({
    mutationFn: (data: MedicalRecordFormData) => 
      apiService.updateElectronicMedicalRecord(clinicId, recordId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-record', recordId] });
      setIsEditing(false);
    },
  });

  // 電子カルテ署名のミューテーション
  const signRecordMutation = useMutation({
    mutationFn: () => apiService.signElectronicMedicalRecord(clinicId, recordId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-record', recordId] });
    },
  });

  const onSubmit = (data: MedicalRecordFormData) => {
    if (recordId) {
      updateRecordMutation.mutate(data);
    } else {
      createRecordMutation.mutate(data);
    }
  };

  const handleSign = () => {
    if (window.confirm('この診療記録に署名しますか？署名後は修正できません。')) {
      signRecordMutation.mutate();
    }
  };

  const filteredRecords = patientRecords?.data?.filter((record: any) => {
    const matchesSearch = !searchTerm || 
      record.chief_complaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.assessment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (!patient && patientId) {
    return <div>患者情報を読み込み中...</div>;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">
              <FileText className="inline-block w-6 h-6 mr-2" />
              電子カルテ
            </h1>
            {patient && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{patient.user?.full_name}</span>
                <span>（{patient.age}歳）</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {medicalRecord && (
              <>
                {medicalRecord.status === 'draft' && (
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? '編集終了' : '編集'}
                  </Button>
                )}
                
                {medicalRecord.status === 'draft' && userRole === 'doctor' && (
                  <Button
                    onClick={handleSign}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={signRecordMutation.isPending}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    署名
                  </Button>
                )}
                
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  出力
                </Button>
                
                <Button variant="outline">
                  <Share className="w-4 h-4 mr-2" />
                  共有
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* サイドバー - 診療記録一覧 */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium mb-3">診療記録一覧</h3>
            
            {/* 検索・フィルター */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full p-2 border rounded"
              >
                <option value="all">すべて</option>
                <option value="draft">下書き</option>
                <option value="signed">署名済み</option>
                <option value="locked">ロック済み</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredRecords?.map((record: any) => (
              <div
                key={record.id}
                className={cn(
                  "p-3 border-b cursor-pointer hover:bg-gray-50",
                  record.id === recordId && "bg-blue-50 border-blue-200"
                )}
                onClick={() => {
                  // 記録の詳細を表示
                  window.location.href = `/clinics/${clinicId}/medical-records/${record.id}`;
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {new Date(record.created_at).toLocaleDateString('ja-JP')}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    record.status === 'draft' && "bg-yellow-100 text-yellow-800",
                    record.status === 'signed' && "bg-green-100 text-green-800",
                    record.status === 'locked' && "bg-gray-100 text-gray-800"
                  )}>
                    {record.status === 'draft' ? '下書き' :
                     record.status === 'signed' ? '署名済み' : 'ロック済み'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {record.chief_complaint}
                </p>
                <p className="text-xs text-gray-500">
                  {record.doctor?.user?.full_name} 医師
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col">
          {/* タブナビゲーション */}
          <div className="bg-white border-b">
            <div className="flex">
              {['overview', 'edit', 'history', 'prescriptions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2",
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  )}
                >
                  {tab === 'overview' && '概要'}
                  {tab === 'edit' && '編集'}
                  {tab === 'history' && '履歴'}
                  {tab === 'prescriptions' && '処方箋'}
                </button>
              ))}
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <OverviewTab 
                medicalRecord={medicalRecord} 
                patient={patient}
                isEditing={isEditing}
                register={register}
                errors={errors}
                onSubmit={handleSubmit(onSubmit)}
                isSubmitting={isSubmitting}
              />
            )}
            
            {activeTab === 'edit' && (
              <EditTab 
                medicalRecord={medicalRecord}
                register={register}
                errors={errors}
                setValue={setValue}
                onSubmit={handleSubmit(onSubmit)}
                isSubmitting={isSubmitting}
              />
            )}
            
            {activeTab === 'history' && (
              <HistoryTab patientRecords={patientRecords} />
            )}
            
            {activeTab === 'prescriptions' && (
              <PrescriptionsTab 
                medicalRecord={medicalRecord}
                register={register}
                setValue={setValue}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 概要タブコンポーネント
const OverviewTab: React.FC<any> = ({ 
  medicalRecord, 
  patient, 
  isEditing, 
  register, 
  errors, 
  onSubmit, 
  isSubmitting 
}) => {
  if (!medicalRecord) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">診療記録を選択してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 患者基本情報 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">患者基本情報</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">氏名:</span>
            <span className="ml-2">{patient?.user?.full_name}</span>
          </div>
          <div>
            <span className="text-gray-600">年齢:</span>
            <span className="ml-2">{patient?.age}歳</span>
          </div>
          <div>
            <span className="text-gray-600">性別:</span>
            <span className="ml-2">{patient?.gender === 'male' ? '男性' : patient?.gender === 'female' ? '女性' : 'その他'}</span>
          </div>
          <div>
            <span className="text-gray-600">診療日:</span>
            <span className="ml-2">{new Date(medicalRecord.created_at).toLocaleDateString('ja-JP')}</span>
          </div>
        </div>
      </div>

      {/* 主訴 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">主訴</h3>
        {isEditing ? (
          <textarea
            {...register('chief_complaint')}
            rows={2}
            className="w-full p-2 border rounded"
            placeholder="主訴を入力してください"
          />
        ) : (
          <p className="text-gray-800">{medicalRecord.chief_complaint}</p>
        )}
        {errors.chief_complaint && (
          <p className="text-red-500 text-sm mt-1">{errors.chief_complaint.message}</p>
        )}
      </div>

      {/* 現病歴 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">現病歴</h3>
        {isEditing ? (
          <textarea
            {...register('present_illness')}
            rows={4}
            className="w-full p-2 border rounded"
            placeholder="現病歴を入力してください"
          />
        ) : (
          <p className="text-gray-800">{medicalRecord.present_illness || '記録なし'}</p>
        )}
      </div>

      {/* 診断・評価 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">診断・評価</h3>
        {isEditing ? (
          <textarea
            {...register('assessment')}
            rows={3}
            className="w-full p-2 border rounded"
            placeholder="診断・評価を入力してください"
          />
        ) : (
          <p className="text-gray-800">{medicalRecord.assessment}</p>
        )}
        {errors.assessment && (
          <p className="text-red-500 text-sm mt-1">{errors.assessment.message}</p>
        )}
      </div>

      {/* 治療計画 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">治療計画</h3>
        {isEditing ? (
          <textarea
            {...register('plan')}
            rows={3}
            className="w-full p-2 border rounded"
            placeholder="治療計画を入力してください"
          />
        ) : (
          <p className="text-gray-800">{medicalRecord.plan}</p>
        )}
        {errors.plan && (
          <p className="text-red-500 text-sm mt-1">{errors.plan.message}</p>
        )}
      </div>

      {/* バイタルサイン */}
      {medicalRecord.vital_signs && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">バイタルサイン</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">血圧:</span>
              <span className="ml-2">{medicalRecord.vital_signs.blood_pressure}</span>
            </div>
            <div>
              <span className="text-gray-600">心拍数:</span>
              <span className="ml-2">{medicalRecord.vital_signs.heart_rate}</span>
            </div>
            <div>
              <span className="text-gray-600">体温:</span>
              <span className="ml-2">{medicalRecord.vital_signs.temperature}</span>
            </div>
            <div>
              <span className="text-gray-600">SpO2:</span>
              <span className="ml-2">{medicalRecord.vital_signs.oxygen_saturation}</span>
            </div>
          </div>
        </div>
      )}

      {/* 保存ボタン */}
      {isEditing && (
        <div className="flex justify-end">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? '保存中...' : '保存'}
          </Button>
        </div>
      )}
    </div>
  );
};

// 編集タブコンポーネント
const EditTab: React.FC<any> = ({ 
  medicalRecord, 
  register, 
  errors, 
  setValue, 
  onSubmit, 
  isSubmitting 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">既往歴</h3>
        <textarea
          {...register('past_history')}
          rows={3}
          className="w-full p-2 border rounded"
          placeholder="既往歴を入力してください"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">家族歴</h3>
        <textarea
          {...register('family_history')}
          rows={3}
          className="w-full p-2 border rounded"
          placeholder="家族歴を入力してください"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">社会歴</h3>
        <textarea
          {...register('social_history')}
          rows={3}
          className="w-full p-2 border rounded"
          placeholder="社会歴を入力してください"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">身体所見</h3>
        <textarea
          {...register('physical_examination')}
          rows={4}
          className="w-full p-2 border rounded"
          placeholder="身体所見を入力してください"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">フォローアップ計画</h3>
        <textarea
          {...register('follow_up_plan')}
          rows={3}
          className="w-full p-2 border rounded"
          placeholder="フォローアップ計画を入力してください"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">ICD-10コード</h3>
        <Input
          {...register('icd10_codes')}
          placeholder="例: I10, E11.9"
          className="w-full"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  );
};

// 履歴タブコンポーネント
const HistoryTab: React.FC<any> = ({ patientRecords }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">診療履歴</h3>
      {patientRecords?.data?.map((record: any) => (
        <div key={record.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">
              {new Date(record.created_at).toLocaleDateString('ja-JP')}
            </span>
            <span className="text-sm text-gray-600">
              {record.doctor?.user?.full_name} 医師
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{record.chief_complaint}</p>
          <p className="text-sm text-gray-800">{record.assessment}</p>
        </div>
      ))}
    </div>
  );
};

// 処方箋タブコンポーネント
const PrescriptionsTab: React.FC<any> = ({ medicalRecord, register, setValue }) => {
  const [prescriptions, setPrescriptions] = useState<any[]>(medicalRecord?.medications || []);

  const addPrescription = () => {
    const newPrescription = {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    };
    setPrescriptions([...prescriptions, newPrescription]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: string, value: string) => {
    const updated = prescriptions.map((prescription, i) => 
      i === index ? { ...prescription, [field]: value } : prescription
    );
    setPrescriptions(updated);
    setValue('medications', updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">処方箋</h3>
        <Button onClick={addPrescription} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          追加
        </Button>
      </div>

      {prescriptions.map((prescription, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label>薬剤名</Label>
              <Input
                value={prescription.name}
                onChange={(e) => updatePrescription(index, 'name', e.target.value)}
                placeholder="薬剤名を入力"
              />
            </div>
            <div>
              <Label>用量</Label>
              <Input
                value={prescription.dosage}
                onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                placeholder="例: 10mg"
              />
            </div>
            <div>
              <Label>服用頻度</Label>
              <Input
                value={prescription.frequency}
                onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                placeholder="例: 1日3回"
              />
            </div>
            <div>
              <Label>服用期間</Label>
              <Input
                value={prescription.duration}
                onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                placeholder="例: 7日間"
              />
            </div>
          </div>
          <div className="mb-4">
            <Label>服用指示</Label>
            <textarea
              value={prescription.instructions}
              onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
              rows={2}
              className="w-full p-2 border rounded"
              placeholder="服用指示を入力"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => removePrescription(index)}
              variant="outline"
              size="sm"
              className="text-red-600"
            >
              削除
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
