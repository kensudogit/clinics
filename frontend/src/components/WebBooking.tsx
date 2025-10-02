import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, User, Stethoscope, Video, Phone, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiService } from '../services/api';
import { cn } from '../lib/utils';

// 予約フォームのスキーマ
const bookingSchema = z.object({
  doctor_id: z.string().min(1, '医師を選択してください'),
  appointment_date: z.string().min(1, '日付を選択してください'),
  appointment_time: z.string().min(1, '時間を選択してください'),
  duration: z.number().min(15).max(120),
  patient_notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface WebBookingProps {
  clinicId: string;
  patientId: string;
}

export const WebBooking: React.FC<WebBookingProps> = ({ clinicId, patientId }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      duration: 30,
    }
  });

  const selectedDoctorId = watch('doctor_id');
  const selectedDateValue = watch('appointment_date');

  // 医師一覧の取得
  const { data: doctors } = useQuery({
    queryKey: ['doctors', clinicId],
    queryFn: () => apiService.getDoctors(clinicId),
  });

  // 利用可能時間の取得
  const { data: availability } = useQuery({
    queryKey: ['availability', clinicId, selectedDoctorId, selectedDateValue],
    queryFn: () => apiService.getAvailability(clinicId, selectedDoctorId, selectedDateValue),
    enabled: !!(selectedDoctorId && selectedDateValue),
  });

  // 予約作成のミューテーション
  const createBookingMutation = useMutation({
    mutationFn: (data: BookingFormData) => 
      apiService.createWebBooking(clinicId, { ...data, patient_id: patientId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', clinicId] });
      alert('予約が完了しました！確認メールをお送りします。');
    },
    onError: (error: any) => {
      alert(`予約に失敗しました: ${error.message}`);
    },
  });

  const onSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate(data);
  };

  // 日付変更時の処理
  useEffect(() => {
    if (selectedDateValue && selectedDoctorId) {
      setAvailableSlots(availability?.slots || []);
    }
  }, [selectedDateValue, selectedDoctorId, availability]);

  // 今日から30日後までの日付を生成
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })
      });
    }
    
    return dates;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          <Calendar className="inline-block w-6 h-6 mr-2" />
          オンライン予約
        </h2>
        <p className="text-gray-600">
          お好きな時間にオンライン診療をご予約いただけます
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 医師選択 */}
        <div className="space-y-2">
          <Label htmlFor="doctor_id" className="flex items-center">
            <Stethoscope className="w-4 h-4 mr-2" />
            診療医師
          </Label>
          <select
            {...register('doctor_id')}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">医師を選択してください</option>
            {doctors?.data?.map((doctor: any) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.user?.full_name} - {doctor.specialization}
              </option>
            ))}
          </select>
          {errors.doctor_id && (
            <p className="text-red-500 text-sm">{errors.doctor_id.message}</p>
          )}
        </div>

        {/* 診療形式選択 */}
        <div className="space-y-2">
          <Label className="flex items-center">
            <Video className="w-4 h-4 mr-2" />
            診療形式
          </Label>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input type="radio" value="video" defaultChecked className="text-blue-600" />
              <Video className="w-4 h-4" />
              <span>ビデオ診療</span>
            </label>
            <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input type="radio" value="audio" className="text-blue-600" />
              <Phone className="w-4 h-4" />
              <span>音声診療</span>
            </label>
            <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input type="radio" value="chat" className="text-blue-600" />
              <MessageCircle className="w-4 h-4" />
              <span>チャット診療</span>
            </label>
          </div>
        </div>

        {/* 日付選択 */}
        <div className="space-y-2">
          <Label htmlFor="appointment_date" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            診療日
          </Label>
          <select
            {...register('appointment_date')}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">日付を選択してください</option>
            {generateDateOptions().map((date) => (
              <option key={date.value} value={date.value}>
                {date.label}
              </option>
            ))}
          </select>
          {errors.appointment_date && (
            <p className="text-red-500 text-sm">{errors.appointment_date.message}</p>
          )}
        </div>

        {/* 時間選択 */}
        {selectedDateValue && (
          <div className="space-y-2">
            <Label htmlFor="appointment_time" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              診療時間
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => setValue('appointment_time', slot.time)}
                  className={cn(
                    "p-2 text-sm border rounded-md hover:bg-blue-50",
                    slot.available 
                      ? "border-gray-300 text-gray-700" 
                      : "border-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                  disabled={!slot.available}
                >
                  {slot.time}
                </button>
              ))}
            </div>
            {errors.appointment_time && (
              <p className="text-red-500 text-sm">{errors.appointment_time.message}</p>
            )}
          </div>
        )}

        {/* 診療時間 */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            診療時間（分）
          </Label>
          <select
            {...register('duration', { valueAsNumber: true })}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={15}>15分</option>
            <option value={30}>30分</option>
            <option value={45}>45分</option>
            <option value={60}>60分</option>
          </select>
        </div>

        {/* 症状・ご質問 */}
        <div className="space-y-2">
          <Label htmlFor="patient_notes">
            症状・ご質問（任意）
          </Label>
          <textarea
            {...register('patient_notes')}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="現在の症状やご質問があればお聞かせください"
          />
        </div>

        {/* 予約ボタン */}
        <Button
          type="submit"
          disabled={isSubmitting || createBookingMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium"
        >
          {isSubmitting || createBookingMutation.isPending ? '予約処理中...' : '予約を確定する'}
        </Button>
      </form>

      {/* 注意事項 */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="font-medium text-yellow-800 mb-2">予約時の注意事項</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 予約は診療日の24時間前までキャンセル可能です</li>
          <li>• 診療開始15分前までに接続準備をお願いします</li>
          <li>• インターネット環境とカメラ・マイクの準備をお願いします</li>
          <li>• 緊急時は119番にご連絡ください</li>
        </ul>
      </div>
    </div>
  );
};
