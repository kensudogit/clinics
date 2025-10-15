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
  Clock,
  Heart,
  Pill,
  Users,
  Download,
  Play,
  Square,
  Circle,
  Film,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { apiService } from '../services/api';
import { cn } from '../lib/utils';
import { ClinicsDataManager } from '../lib/localStorage';

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
  const [meetingRoomId, setMeetingRoomId] = useState('room-001');
  const [consultationStatus, setConsultationStatus] = useState<'scheduled' | 'in_progress' | 'completed'>('scheduled');
  const [vitalSigns, setVitalSigns] = useState<any>({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    weight: '',
    height: ''
  });
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, sender: 'system', message: '診療が開始されました', timestamp: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  
  // 動画録画・出力機能の状態
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState<any[]>([]);
  const [sampleVideos, setSampleVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'video' | 'vitals' | 'prescriptions'>('chat');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const queryClient = useQueryClient();

  // サンプル動画データの初期化
  useEffect(() => {
    const sampleVideosData = [
      {
        id: 'sample-1',
        title: '内科診療サンプル',
        description: '風邪の診療サンプル動画',
        duration: '15分30秒',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE2MCIgY3k9IjkwIiByPSI0MCIgZmlsbD0iIzM0NzVEQiIvPgo8cGF0aCBkPSJNMTQwIDgwTDE2MCA5MEwxNDAgMTAwVjgwWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        url: 'blob:video-sample-1',
        createdAt: new Date('2024-01-15').toISOString(),
        type: 'sample'
      },
      {
        id: 'sample-2',
        title: '小児科診療サンプル',
        description: '小児の定期健診サンプル動画',
        duration: '12分45秒',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRkZGN0U3Ii8+CjxjaXJjbGUgY3g9IjE2MCIgY3k9IjkwIiByPSI0MCIgZmlsbD0iI0ZGQjkwMCIvPgo8cGF0aCBkPSJNMTQwIDgwTDE2MCA5MEwxNDAgMTAwVjgwWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        url: 'blob:video-sample-2',
        createdAt: new Date('2024-01-20').toISOString(),
        type: 'sample'
      },
      {
        id: 'sample-3',
        title: 'オンライン診療デモ',
        description: 'オンライン診療の流れデモンストレーション',
        duration: '8分20秒',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRURGNUY1Ii8+CjxjaXJjbGUgY3g9IjE2MCIgY3k9IjkwIiByPSI0MCIgZmlsbD0iIzEwQjk0NyIvPgo8cGF0aCBkPSJNMTQwIDgwTDE2MCA5MEwxNDAgMTAwVjgwWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        url: 'blob:video-sample-3',
        createdAt: new Date('2024-01-25').toISOString(),
        type: 'sample'
      }
    ];
    setSampleVideos(sampleVideosData);
  }, []);

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

  // ローカルストレージからデータを読み込み
  useEffect(() => {
    const savedConsultation = ClinicsDataManager.getConsultationById(consultationId);
    if (savedConsultation) {
      setConsultationStatus(savedConsultation.status || 'scheduled');
      setVitalSigns(savedConsultation.vitalSigns || {});
      setPrescriptions(savedConsultation.prescriptions || []);
      setChatMessages(savedConsultation.chatMessages || []);
      setConsultationNotes(savedConsultation.notes || '');
      setDiagnosis(savedConsultation.diagnosis || '');
      setTreatmentPlan(savedConsultation.treatmentPlan || '');
    }
  }, [consultationId]);

  // データの自動保存
  useEffect(() => {
    const consultationData = {
      status: consultationStatus,
      vitalSigns,
      prescriptions,
      chatMessages,
      notes: consultationNotes,
      diagnosis,
      treatmentPlan,
      lastUpdated: new Date().toISOString()
    };
    
    ClinicsDataManager.saveConsultationData(consultationId, consultationData);
  }, [consultationStatus, vitalSigns, prescriptions, chatMessages, consultationNotes, diagnosis, treatmentPlan, consultationId]);

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
      blood_pressure: vitalSigns.bloodPressure || '',
      heart_rate: vitalSigns.heartRate || '',
      temperature: vitalSigns.temperature || '',
      oxygen_saturation: vitalSigns.oxygenSaturation || '',
      weight: vitalSigns.weight || '',
      height: vitalSigns.height || '',
      recorded_at: new Date().toISOString()
    };
    
    // ローカルストレージに保存
    ClinicsDataManager.saveVitalSignsHistory('patient-001', vitals);
    
    // APIにも送信（オフライン対応）
    try {
      recordVitalSignsMutation.mutate(vitals);
    } catch (error) {
      console.log('オフライン状態のため、ローカルストレージに保存しました');
      ClinicsDataManager.markDataAsPending(`vital_signs_${Date.now()}`);
    }
  };

  const addPrescription = () => {
    const prescription = {
      medication_name: prompt('薬剤名:'),
      dosage: prompt('用量:'),
      frequency: prompt('服用頻度:'),
      duration: prompt('服用期間:'),
      instructions: prompt('服用指示:'),
      prescribed_at: new Date().toISOString()
    };
    
    if (prescription.medication_name) {
      // ローカルストレージに保存
      ClinicsDataManager.savePrescriptionHistory('patient-001', prescription);
      
      // APIにも送信（オフライン対応）
      try {
        addPrescriptionMutation.mutate(prescription);
      } catch (error) {
        console.log('オフライン状態のため、ローカルストレージに保存しました');
        ClinicsDataManager.markDataAsPending(`prescription_${Date.now()}`);
      }
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

  // 動画録画機能
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const newVideo = {
          id: `recorded-${Date.now()}`,
          title: `診療録画 ${new Date().toLocaleString()}`,
          description: '診療セッションの録画',
          duration: '録画中...',
          thumbnail: url,
          url: url,
          createdAt: new Date().toISOString(),
          type: 'recorded'
        };
        
        setRecordedVideos(prev => [newVideo, ...prev]);
        setSelectedVideo(newVideo);
        
        // ストリームを停止
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('録画開始エラー:', error);
      alert('録画を開始できませんでした。カメラとマイクのアクセス許可を確認してください。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // サンプル動画の再生
  const playSampleVideo = (video: any) => {
    setSelectedVideo(video);
    setIsPlayingSample(true);
    
    // サンプル動画のシミュレーション
    setTimeout(() => {
      setIsPlayingSample(false);
      alert(`サンプル動画「${video.title}」の再生が完了しました。`);
    }, 3000);
  };

  // 動画のダウンロード
  const downloadVideo = (video: any) => {
    if (video.type === 'recorded') {
      const a = document.createElement('a');
      a.href = video.url;
      a.download = `${video.title}.webm`;
      a.click();
    } else {
      // サンプル動画の場合はダミーファイルをダウンロード
      const dummyContent = `サンプル動画: ${video.title}\n説明: ${video.description}\n時間: ${video.duration}`;
      const blob = new Blob([dummyContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // 動画の削除
  const deleteVideo = (videoId: string) => {
    if (window.confirm('この動画を削除しますか？')) {
      setRecordedVideos(prev => prev.filter(v => v.id !== videoId));
      if (selectedVideo?.id === videoId) {
        setSelectedVideo(null);
      }
    }
  };

  if (!consultation) {
    return <div>診療情報を読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー - Dr.JOYスタイル */}
        <div className="clinics-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="clinics-feature-icon">
                <Video className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {consultation?.consultation_type === 'video' ? 'ビデオ診療' :
                   consultation?.consultation_type === 'audio' ? '音声診療' : 'オンライン診療'}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{consultation?.scheduled_at || '2024年1月15日 14:00'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">田中 太郎 医師</p>
                <p className="text-xs text-gray-600">-</p>
                <p className="text-sm font-medium text-gray-900">山田 花子 患者</p>
              </div>
              <span className={cn(
                "clinics-status-badge",
                consultationStatus === 'scheduled' && "clinics-status-pending",
                consultationStatus === 'in_progress' && "clinics-status-active",
                consultationStatus === 'completed' && "clinics-status-completed"
              )}>
                {consultationStatus === 'scheduled' && '予約済み'}
                {consultationStatus === 'in_progress' && '診療中'}
                {consultationStatus === 'completed' && '完了'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインビデオエリア */}
          <div className="lg:col-span-2">
            <div className="clinics-card p-6">
              {/* ビデオ表示エリア */}
              <div className="relative bg-gray-900 rounded-lg mb-4" style={{ aspectRatio: '16/9' }}>
                {consultationStatus === 'in_progress' ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover rounded-lg"
                      autoPlay
                      playsInline
                    />
                    <div className="absolute top-4 left-4">
                      <div className="bg-black bg-opacity-50 rounded-lg p-2">
                        <video
                          ref={localVideoRef}
                          className="w-32 h-24 object-cover rounded"
                          autoPlay
                          playsInline
                          muted
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-2 text-white">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>患者: 山田 花子</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
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
              <div className="flex items-center justify-center space-x-4 mt-6">
                {consultationStatus === 'scheduled' && userRole === 'doctor' && (
                  <Button
                    onClick={startConsultation}
                    className="clinics-button-primary bg-green-600 hover:bg-green-700"
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
                      className="clinics-button-secondary"
                    >
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      onClick={toggleAudio}
                      variant={isAudioOn ? "default" : "destructive"}
                      className="clinics-button-secondary"
                    >
                      {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      onClick={toggleScreenShare}
                      variant={isScreenSharing ? "default" : "outline"}
                      className="clinics-button-secondary"
                    >
                      {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    </Button>
                    
                    {/* 動画録画コントロール */}
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      className="clinics-button-secondary"
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          録画停止
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 mr-2" />
                          録画開始
                        </>
                      )}
                    </Button>
                    
                    {userRole === 'doctor' && (
                      <Button
                        onClick={endConsultation}
                        variant="destructive"
                        className="clinics-button-primary"
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
          </div>
        </div>

          {/* サイドパネル */}
          <div className="w-80 bg-white border-l flex flex-col">
            {/* タブナビゲーション */}
            <div className="flex border-b">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 p-3 text-sm font-medium ${
                  activeTab === 'chat' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600'
                }`}
              >
                チャット
              </button>
              <button 
                onClick={() => setActiveTab('video')}
                className={`flex-1 p-3 text-sm font-medium ${
                  activeTab === 'video' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600'
                }`}
              >
                動画
              </button>
              {userRole === 'doctor' && (
                <>
                  <button 
                    onClick={() => setActiveTab('vitals')}
                    className={`flex-1 p-3 text-sm font-medium ${
                      activeTab === 'vitals' 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-600'
                    }`}
                  >
                    バイタル
                  </button>
                  <button 
                    onClick={() => setActiveTab('prescriptions')}
                    className={`flex-1 p-3 text-sm font-medium ${
                      activeTab === 'prescriptions' 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-600'
                    }`}
                  >
                    処方箋
                  </button>
                </>
              )}
          </div>

            {/* タブコンテンツ */}
            <div className="flex-1 flex flex-col">
              {activeTab === 'chat' && (
                <>
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
                </>
              )}

              {activeTab === 'video' && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {/* サンプル動画セクション */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Film className="w-5 h-5 mr-2 text-blue-500" />
                        サンプル動画
                      </h3>
                      <div className="space-y-3">
                        {sampleVideos.map((video) => (
                          <div key={video.id} className="border rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={video.thumbnail} 
                                alt={video.title}
                                className="w-16 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{video.title}</h4>
                                <p className="text-sm text-gray-600">{video.description}</p>
                                <p className="text-xs text-gray-500">{video.duration}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => playSampleVideo(video)}
                                  size="sm"
                                  className="clinics-button-secondary"
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => downloadVideo(video)}
                                  size="sm"
                                  className="clinics-button-secondary"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 録画動画セクション */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Circle className="w-5 h-5 mr-2 text-red-500" />
                        録画動画
                      </h3>
                      {recordedVideos.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Circle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>まだ録画された動画がありません</p>
                          <p className="text-sm">診療中に録画ボタンを押して動画を記録できます</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recordedVideos.map((video) => (
                            <div key={video.id} className="border rounded-lg p-3 hover:bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title}
                                  className="w-16 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{video.title}</h4>
                                  <p className="text-sm text-gray-600">{video.description}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(video.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => downloadVideo(video)}
                                    size="sm"
                                    className="clinics-button-secondary"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => deleteVideo(video.id)}
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vitals' && userRole === 'doctor' && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">バイタルサイン記録</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bloodPressure">血圧</Label>
                        <Input
                          id="bloodPressure"
                          value={vitalSigns.bloodPressure}
                          onChange={(e) => setVitalSigns({...vitalSigns, bloodPressure: e.target.value})}
                          placeholder="120/80"
                        />
                      </div>
                      <div>
                        <Label htmlFor="heartRate">心拍数</Label>
                        <Input
                          id="heartRate"
                          value={vitalSigns.heartRate}
                          onChange={(e) => setVitalSigns({...vitalSigns, heartRate: e.target.value})}
                          placeholder="72"
                        />
                      </div>
                      <div>
                        <Label htmlFor="temperature">体温</Label>
                        <Input
                          id="temperature"
                          value={vitalSigns.temperature}
                          onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
                          placeholder="36.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="oxygenSaturation">酸素飽和度</Label>
                        <Input
                          id="oxygenSaturation"
                          value={vitalSigns.oxygenSaturation}
                          onChange={(e) => setVitalSigns({...vitalSigns, oxygenSaturation: e.target.value})}
                          placeholder="98"
                        />
                      </div>
                    </div>
                    <Button onClick={recordVitalSigns} className="w-full clinics-button-primary">
                      <Heart className="w-4 h-4 mr-2" />
                      バイタルサイン記録
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'prescriptions' && userRole === 'doctor' && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">処方箋管理</h3>
                    <Button onClick={addPrescription} className="w-full clinics-button-primary">
                      <Pill className="w-4 h-4 mr-2" />
                      処方箋追加
                    </Button>
                    {prescriptions.length > 0 && (
                      <div className="space-y-2">
                        {prescriptions.map((prescription, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <h4 className="font-medium">{prescription.medication_name}</h4>
                            <p className="text-sm text-gray-600">{prescription.dosage} - {prescription.frequency}</p>
                            <p className="text-sm text-gray-600">{prescription.duration}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  value={vitalSigns.bloodPressure || ''}
                  onChange={(e) => setVitalSigns({...vitalSigns, bloodPressure: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">心拍数</Label>
                <Input
                  placeholder="72"
                  value={vitalSigns.heartRate || ''}
                  onChange={(e) => setVitalSigns({...vitalSigns, heartRate: e.target.value})}
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
                  value={vitalSigns.oxygenSaturation || ''}
                  onChange={(e) => setVitalSigns({...vitalSigns, oxygenSaturation: e.target.value})}
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
