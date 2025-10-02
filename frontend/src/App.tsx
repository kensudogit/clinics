import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { 
  Stethoscope, 
  Calendar, 
  FileText, 
  Video, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';
import { WebBooking } from './components/WebBooking';
import { WebQuestionnaire } from './components/WebQuestionnaire';
import { OnlineConsultation } from './components/OnlineConsultation';
import { ElectronicMedicalRecord } from './components/ElectronicMedicalRecord';
import { BusinessAnalytics } from './components/BusinessAnalytics';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime is deprecated)
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRole] = useState<'admin' | 'doctor' | 'patient'>('doctor'); // デモ用
  const [clinicId] = useState('clinic-001'); // デモ用
  const [patientId] = useState('patient-001'); // デモ用

  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: BarChart3, color: 'text-blue-600' },
    { id: 'booking', label: 'Web予約', icon: Calendar, color: 'text-green-600' },
    { id: 'questionnaire', label: 'Web問診', icon: FileText, color: 'text-purple-600' },
    { id: 'consultation', label: 'オンライン診療', icon: Video, color: 'text-orange-600' },
    { id: 'medical-record', label: '電子カルテ', icon: Stethoscope, color: 'text-red-600' },
    { id: 'analytics', label: '経営分析', icon: Activity, color: 'text-indigo-600' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'booking':
        return <WebBooking clinicId={clinicId} patientId={patientId} />;
      case 'questionnaire':
        return <WebQuestionnaire clinicId={clinicId} patientId={patientId} />;
      case 'consultation':
        return <OnlineConsultation consultationId="consultation-001" clinicId={clinicId} userRole={userRole as 'doctor' | 'patient'} />;
      case 'medical-record':
        return <ElectronicMedicalRecord clinicId={clinicId} patientId={patientId} userRole={userRole as 'admin' | 'doctor'} />;
      case 'analytics':
        return <BusinessAnalytics clinicId={clinicId} userRole={userRole as 'admin' | 'doctor'} />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CLINICS</h1>
                  <p className="text-sm text-gray-600">クラウド診療支援システム</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">田中 太郎 医師</p>
                <p className="text-xs text-gray-600">東京クリニック</p>
              </div>
              <button className="p-2 rounded-md hover:bg-gray-100">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* サイドバー */}
          {isSidebarOpen && (
            <aside className="w-64 bg-white shadow-sm min-h-screen">
              <nav className="p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeTab === item.id
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${activeTab === item.id ? item.color : 'text-gray-500'}`} />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>
          )}

          {/* メインコンテンツ */}
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// ダッシュボードコンテンツ
const DashboardContent = () => {
  const stats = [
    { label: '今日の予約数', value: '12', icon: Calendar, color: 'bg-blue-500' },
    { label: '進行中の診療', value: '3', icon: Video, color: 'bg-green-500' },
    { label: '待機患者数', value: '5', icon: Clock, color: 'bg-yellow-500' },
    { label: '完了した診療', value: '8', icon: CheckCircle, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ダッシュボード</h2>
        <p className="text-gray-600">診療機関の運営状況をリアルタイムで確認できます</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 機能紹介 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">システム機能</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Web予約システム</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">Web問診システム</span>
            </div>
            <div className="flex items-center space-x-3">
              <Video className="w-5 h-5 text-orange-600" />
              <span className="text-gray-700">オンライン診療</span>
            </div>
            <div className="flex items-center space-x-3">
              <Stethoscope className="w-5 h-5 text-red-600" />
              <span className="text-gray-700">電子カルテ</span>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-700">経営分析</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">今日の予定</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">09:00 - 山田 花子</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">予約済み</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Video className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">10:30 - 佐藤 太郎</span>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">診療中</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">14:00 - 鈴木 美咲</span>
              </div>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">予定</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;