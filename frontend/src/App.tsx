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
  CheckCircle,
  Wand2
} from 'lucide-react';
import logoImage from './PC.png';
import { WebBooking } from './components/WebBooking';
import { WebQuestionnaire } from './components/WebQuestionnaire';
import { OnlineConsultation } from './components/OnlineConsultation';
import { ElectronicMedicalRecord } from './components/ElectronicMedicalRecord';
import { BusinessAnalytics } from './components/BusinessAnalytics';
import { AIPageCreator } from './components/AIPageCreator';
import './index.css';

// クライアント作成（React Query設定）
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // リトライ回数
      staleTime: 5 * 60 * 1000, // 5分間のキャッシュ
      gcTime: 10 * 60 * 1000, // 10分間のガベージコレクション時間（cacheTimeは非推奨）
    },
  },
});

function App() {
  // 状態管理
  const [activeTab, setActiveTab] = useState('dashboard'); // アクティブなタブ
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // サイドバーの開閉状態
  const [userRole] = useState<'admin' | 'doctor' | 'patient'>('doctor'); // デモ用ユーザーロール
  const [clinicId] = useState('clinic-001'); // デモ用クリニックID
  const [patientId] = useState('patient-001'); // デモ用患者ID

  // メニューアイテム定義
  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: BarChart3, color: 'text-blue-600' },
    { id: 'booking', label: 'Web予約', icon: Calendar, color: 'text-green-600' },
    { id: 'questionnaire', label: 'Web問診', icon: FileText, color: 'text-purple-600' },
    { id: 'consultation', label: 'オンライン診療', icon: Video, color: 'text-orange-600' },
    { id: 'medical-record', label: '電子カルテ', icon: Stethoscope, color: 'text-red-600' },
    { id: 'analytics', label: '経営分析', icon: Activity, color: 'text-indigo-600' },
    { id: 'ai-page-creator', label: 'AI ページ作成', icon: Wand2, color: 'text-pink-600' },
  ];

  const renderContent = () => {
    // アクティブなタブに応じてコンテンツを切り替え
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
      case 'ai-page-creator':
        return <AIPageCreator clinicId={clinicId} />;
      default:
        return <DashboardContent onNavigateToAI={() => setActiveTab('ai-page-creator')} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー - Dr.JOYスタイル */}
        <header className="clinics-header">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* サイドバー開閉ボタン */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md hover:bg-orange-50 transition-colors duration-200"
              >
                {isSidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
              </button>
              {/* ロゴとタイトル */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img 
                    src={logoImage} 
                    alt="CLINICS Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CLINICS</h1>
                  <p className="text-sm text-gray-600">クラウド診療支援システム</p>
                </div>
              </div>
            </div>
            
            {/* ユーザー情報とログアウトボタン */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">田中 太郎 医師</p>
                <p className="text-xs text-gray-600">東京クリニック</p>
              </div>
              <button className="p-2 rounded-md hover:bg-orange-50 transition-colors duration-200">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* サイドバー - Dr.JOYスタイル */}
          {isSidebarOpen && (
            <aside className="clinics-sidebar">
              <nav className="clinics-sidebar-nav">
                <ul className="space-y-2">
                  {/* メニューアイテムの動的生成 */}
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`clinics-sidebar-item ${
                            activeTab === item.id
                              ? 'clinics-sidebar-item-active'
                              : 'clinics-sidebar-item-inactive'
                          }`}
                        >
                          <Icon className={`clinics-sidebar-icon ${
                            activeTab === item.id 
                              ? 'clinics-sidebar-icon-active' 
                              : 'clinics-sidebar-icon-inactive'
                          }`} />
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

// ダッシュボードコンテンツ - Dr.JOYスタイル
const DashboardContent = ({ onNavigateToAI }: { onNavigateToAI: () => void }) => {
  // 統計データの定義
  const stats = [
    { label: '今日の予約数', value: '12', icon: Calendar, color: 'bg-orange-500' },
    { label: '進行中の診療', value: '3', icon: Video, color: 'bg-green-500' },
    { label: '待機患者数', value: '5', icon: Clock, color: 'bg-yellow-500' },
    { label: '完了した診療', value: '8', icon: CheckCircle, color: 'bg-blue-500' },
  ];

  return (
    <div className="p-1">
      {/* ヒーローセクション - 斬新的デザイン */}
      <div className="clinics-hero rounded-3xl p-3 mb-4 clinics-fade-in relative">
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-3">
            <div className="space-y-2">
              {/* メインタイトル */}
                <h4 className="text-2xl font-bold text-white mb-2 leading-tight">
                <span className="block">今日から、</span>
                <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  CLINICSで！
                </span>
              </h4>
              {/* サブタイトル */}
              <p className="text-white text-base opacity-90 leading-relaxed">
                14万人の医療従事者が使っている<br />
                <span className="font-semibold">次世代業務効率化ソリューション</span>
              </p>
            </div>
            {/* アクションボタン */}
            <div className="flex space-x-3">
              <button className="clinics-button-primary text-sm py-2 px-4">
                今すぐ始める
              </button>
              <button 
                onClick={onNavigateToAI}
                className="clinics-button-secondary text-sm py-2 px-4"
              >
                デモを見る
              </button>
            </div>
          </div>
          {/* ロゴ表示（大画面のみ） */}
          <div className="hidden lg:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm animate-float">
              <img 
                src={logoImage} 
                alt="CLINICS Logo" 
                className="w-16 h-16 object-cover hover:scale-110 transition-transform duration-300 shadow-lg rounded-full"
              />
            </div>
          </div>
        </div>
        
        {/* 装飾的な要素 */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white to-transparent opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-cyan-400 to-transparent opacity-20 rounded-full blur-2xl"></div>
      </div>

      {/* 統計カード - 斬新的デザイン */}
      <div className="clinics-feature-grid mb-12">
        {/* 統計データの動的表示 */}
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="clinics-stat-card clinics-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.color} shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 機能紹介 - 斬新的デザイン */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="clinics-card clinics-fade-in">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              システム機能
            </h3>
            <div className="clinics-feature-grid">
              {/* Web予約機能 */}
              <div className="clinics-feature-card">
                <div className="clinics-feature-icon">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Web予約</h4>
                <p className="text-gray-600 mt-2">患者のオンライン予約システム</p>
              </div>
              {/* Web問診機能 */}
              <div className="clinics-feature-card">
                <div className="clinics-feature-icon">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Web問診</h4>
                <p className="text-gray-600 mt-2">AI分析付き事前問診</p>
              </div>
              {/* オンライン診療機能 */}
              <div className="clinics-feature-card">
                <div className="clinics-feature-icon">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">オンライン診療</h4>
                <p className="text-gray-600 mt-2">高品質ビデオ通話診療</p>
              </div>
              {/* 電子カルテ機能 */}
              <div className="clinics-feature-card">
                <div className="clinics-feature-icon">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">電子カルテ</h4>
                <p className="text-gray-600 mt-2">包括的記録管理システム</p>
              </div>
              {/* 経営分析機能 */}
              <div className="clinics-feature-card">
                <div className="clinics-feature-icon">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">経営分析</h4>
                <p className="text-gray-600 mt-2">リアルタイムデータ分析</p>
              </div>
            </div>
          </div>
        </div>

        <div className="clinics-card clinics-fade-in">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              今日の予定
            </h3>
            <div className="space-y-4">
              {/* 予約済みの診療 */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-gray-900">09:00 - 山田 花子</span>
                    <p className="text-sm text-gray-600">初診・内科</p>
                  </div>
                </div>
                <span className="clinics-status-badge clinics-status-pending px-4 py-2">予約済み</span>
              </div>
              {/* 進行中の診療 */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-gray-900">10:30 - 佐藤 太郎</span>
                    <p className="text-sm text-gray-600">オンライン診療</p>
                  </div>
                </div>
                <span className="clinics-status-badge clinics-status-active px-4 py-2">診療中</span>
              </div>
              {/* 予定の診療 */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-gray-900">14:00 - 鈴木 美咲</span>
                    <p className="text-sm text-gray-600">定期検診</p>
                  </div>
                </div>
                <span className="clinics-status-badge clinics-status-completed px-4 py-2">予定</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;