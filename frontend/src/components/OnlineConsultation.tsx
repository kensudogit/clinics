import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  MessageCircle,
  Monitor,
  MonitorOff,
  Settings,
  User,
  Clock,
  Heart,
  Activity,
  Thermometer,
  Pill
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { apiService } from '../services/api';
import { cn } from '../lib/utils';

interface OnlineConsultationProps {
  consultationId: string;
  clinicId: string;
  userRole: 'doctor' | 'patient';
}

export const OnlineConsultation: React.FC<OnlineConsultationProps> = ({
  consultationId,
  clinicId,
  userRole
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [consultationStatus, setConsultationStatus] = useState<'scheduled' | 'in_progress' | 'completed'>('scheduled');
  const [vitalSigns, setVitalSigns] = useState<any>({});
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const queryClient = useQueryClient();

  // 診療情報の取得
  const { data: consultation } = useQuery({
    queryKey: ['consultation', consultationId],
    queryFn: () => apiService.getOnlineConsultation(clinicId, consultationId),
  });

  // 診療開始のミューテーション
  const startConsultationMutation = useMutation({
    mutationFn: () => apiService.startConsultation(clinicId, consultationId),
    onSuccess: () => {
      setConsultationStatus('in_progress');
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
    },
  });

  // 診療終了のミューテーション
  const endConsultationMutation = useMutation({
    mutationFn: (notes: string) => apiService.endConsultation(clinicId, consultationId, notes),
    onSuccess: () => {
      setConsultationStatus('completed');
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
    },
  });

  // バイタルサイン記録のミューテーション
  const recordVitalSignsMutation = useMutation({
    mutationFn: (vitals: any) => apiService.recordVitalSigns(clinicId, consultationId, vitals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
    },
  });

  // 処方箋追加のミューテーション
  const addPrescriptionMutation = useMutation({
    mutationFn: (prescription: any) => apiService.addPrescription(clinicId, consultationId, prescription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
    },
  });

  // WebRTC接続の初期化
  useEffect(() => {
    if (consultationStatus === 'in_progress') {
      initializeWebRTC();
    }
  }, [consultationStatus]);

  const initializeWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // WebRTC接続の確立（実際の実装ではシグナリングサーバーを使用）
      // ここでは簡略化
    } catch (error) {
      console.error('WebRTC初期化エラー:', error);
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // 実際の実装ではWebRTCのトラックを制御
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // 実際の実装ではWebRTCのトラックを制御
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // 画面共有の実装
  };

  const startConsultation = () => {
    startConsultationMutation.mutate();
  };

  const endConsultation = () => {
    const notes = prompt('診療記録を入力してください:');
    if (notes) {
      endConsultationMutation.mutate(notes);
    }
  };

  const recordVitalSigns = () => {
    const vitals = {
      blood_pressure: vitalSigns.blood_pressure || '',
      heart_rate: vitalSigns.heart_rate || '',
      temperature: vitalSigns.temperature || '',
      oxygen_saturation: vitalSigns.oxygen_saturation || '',
      recorded_at: new Date().toISOString()
    };
    
    recordVitalSignsMutation.mutate(vitals);
  };

  const addPrescription = () => {
    const prescription = {
      medication_name: prompt('薬剤名:'),
      dosage: prompt('用量:'),
      frequency: prompt('服用頻度:'),
      duration: prompt('服用期間:'),
      instructions: prompt('服用指示:')
    };
    
    if (prescription.medication_name) {
      addPrescriptionMutation.mutate(prescription);
    }
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: userRole,
        content: newMessage,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  if (!consultation) {
    return <div>診療情報を読み込み中...</div>;
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">
            {consultation.consultation_type === 'video' ? 'ビデオ診療' :
             consultation.consultation_type === 'audio' ? '音声診療' : 'チャット診療'}
          </h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{consultation.scheduled_at}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {consultation.doctor?.user?.full_name} 医師
          </span>
          <span className="text-sm text-gray-600">-</span>
          <span className="text-sm text-gray-600">
            {consultation.patient?.user?.full_name} 患者
          </span>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* メイン診療エリア */}
        <div className="flex-1 flex flex-col">
          {/* ビデオエリア */}
          <div className="flex-1 bg-black relative">
            {consultationStatus === 'in_progress' ? (
              <>
                {/* リモートビデオ */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
                
                {/* ローカルビデオ */}
                <video
                  ref={localVideoRef}
                  className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* 診療ステータス */}
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  診療中
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">
                    {consultationStatus === 'scheduled' ? '診療開始をお待ちください' : '診療が終了しました'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* コントロールパネル */}
          <div className="bg-white p-4 flex items-center justify-center space-x-4">
            {consultationStatus === 'scheduled' && userRole === 'doctor' && (
              <Button
                onClick={startConsultation}
                className="bg-green-600 hover:bg-green-700"
                disabled={startConsultationMutation.isPending}
              >
                <Phone className="w-4 h-4 mr-2" />
                診療開始
              </Button>
            )}
            
            {consultationStatus === 'in_progress' && (
              <>
                <Button
                  onClick={toggleVideo}
                  variant={isVideoOn ? "default" : "destructive"}
                >
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  onClick={toggleAudio}
                  variant={isAudioOn ? "default" : "destructive"}
                >
                  {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  onClick={toggleScreenShare}
                  variant={isScreenSharing ? "default" : "outline"}
                >
                  {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                </Button>
                
                {userRole === 'doctor' && (
                  <Button
                    onClick={endConsultation}
                    variant="destructive"
                    disabled={endConsultationMutation.isPending}
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    診療終了
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* サイドパネル */}
        <div className="w-80 bg-white border-l flex flex-col">
          {/* タブナビゲーション */}
          <div className="flex border-b">
            <button className="flex-1 p-3 text-sm font-medium border-b-2 border-blue-600 text-blue-600">
              チャット
            </button>
            {userRole === 'doctor' && (
              <>
                <button className="flex-1 p-3 text-sm font-medium text-gray-600">
                  バイタル
                </button>
                <button className="flex-1 p-3 text-sm font-medium text-gray-600">
                  処方箋
                </button>
              </>
            )}
          </div>

          {/* チャットエリア */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "mb-3 p-2 rounded-lg",
                    message.sender === userRole
                      ? "bg-blue-600 text-white ml-8"
                      : "bg-gray-100 text-gray-800 mr-8"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="メッセージを入力..."
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <Button onClick={sendChatMessage}>
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 医師専用のバイタルサイン記録パネル */}
      {userRole === 'doctor' && consultationStatus === 'in_progress' && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-medium mb-3">バイタルサイン記録</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">血圧</Label>
              <Input
                placeholder="120/80"
                value={vitalSigns.blood_pressure || ''}
                onChange={(e) => setVitalSigns({...vitalSigns, blood_pressure: e.target.value})}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">心拍数</Label>
              <Input
                placeholder="72"
                value={vitalSigns.heart_rate || ''}
                onChange={(e) => setVitalSigns({...vitalSigns, heart_rate: e.target.value})}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">体温</Label>
              <Input
                placeholder="36.5"
                value={vitalSigns.temperature || ''}
                onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">SpO2</Label>
              <Input
                placeholder="98"
                value={vitalSigns.oxygen_saturation || ''}
                onChange={(e) => setVitalSigns({...vitalSigns, oxygen_saturation: e.target.value})}
                className="text-sm"
              />
            </div>
          </div>
          <Button
            onClick={recordVitalSigns}
            className="w-full mt-3"
            size="sm"
            disabled={recordVitalSignsMutation.isPending}
          >
            記録
          </Button>
        </div>
      )}
    </div>
  );
};
