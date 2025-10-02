import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Filter,
  Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { apiService } from '../services/api';
import { cn } from '../lib/utils';

interface BusinessAnalyticsProps {
  clinicId: string;
  userRole: 'admin' | 'doctor';
}

export const BusinessAnalytics: React.FC<BusinessAnalyticsProps> = ({
  clinicId,
  userRole
}) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedMetric, setSelectedMetric] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [refreshKey, setRefreshKey] = useState(0);

  // 分析データの取得
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['analytics', clinicId, dateRange, selectedMetric, refreshKey],
    queryFn: () => apiService.getAnalytics(clinicId, {
      start_date: dateRange.start,
      end_date: dateRange.end,
      metric_type: selectedMetric
    }),
  });

  // リアルタイムデータの取得
  const { data: realtimeData } = useQuery({
    queryKey: ['realtime-analytics', clinicId],
    queryFn: () => apiService.getRealtimeAnalytics(clinicId),
    refetchInterval: 30000, // 30秒ごとに更新
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">分析データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              <BarChart3 className="inline-block w-6 h-6 mr-2" />
              経営分析ダッシュボード
            </h1>
            <p className="text-gray-600 mt-1">
              診療機関の運営状況をリアルタイムで確認できます
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              更新
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              レポート出力
            </Button>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <Label className="text-sm font-medium">期間</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-40"
              />
              <span className="text-gray-500">〜</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-40"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">集計単位</Label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="p-2 border rounded w-32"
            >
              <option value="daily">日別</option>
              <option value="weekly">週別</option>
              <option value="monthly">月別</option>
            </select>
          </div>
        </div>
      </div>

      {/* リアルタイム指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="今日の予約数"
          value={realtimeData?.today_bookings || 0}
          icon={<Calendar className="w-5 h-5" />}
          trend={realtimeData?.booking_trend || 0}
          color="blue"
        />
        <MetricCard
          title="進行中の診療"
          value={realtimeData?.active_consultations || 0}
          icon={<Activity className="w-5 h-5" />}
          trend={0}
          color="green"
        />
        <MetricCard
          title="今日の売上"
          value={`¥${(realtimeData?.today_revenue || 0).toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          trend={realtimeData?.revenue_trend || 0}
          color="purple"
        />
        <MetricCard
          title="待機患者数"
          value={realtimeData?.pending_bookings || 0}
          icon={<Clock className="w-5 h-5" />}
          trend={0}
          color="orange"
        />
      </div>

      {/* メイン分析エリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 売上推移 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">売上推移</h3>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              詳細
            </Button>
          </div>
          <RevenueChart data={analytics?.revenue_data} />
        </div>

        {/* 診療数推移 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">診療数推移</h3>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              詳細
            </Button>
          </div>
          <ConsultationChart data={analytics?.consultation_data} />
        </div>
      </div>

      {/* 詳細分析エリア */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 医師別診療数 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">医師別診療数</h3>
          <DoctorPerformanceChart data={analytics?.doctor_performance} />
        </div>

        {/* 診療形式別割合 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">診療形式別割合</h3>
          <ConsultationTypeChart data={analytics?.consultation_types} />
        </div>

        {/* 患者満足度 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">患者満足度</h3>
          <SatisfactionChart data={analytics?.satisfaction_scores} />
        </div>
      </div>

      {/* アラート・通知 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">アラート・通知</h3>
        <AlertsList alerts={analytics?.alerts} />
      </div>
    </div>
  );
};

// 指標カードコンポーネント
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== 0 && (
            <div className="flex items-center mt-1">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={cn(
                "text-sm",
                trend > 0 ? "text-green-500" : "text-red-500"
              )}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-full", colorClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// 売上推移チャート
const RevenueChart: React.FC<{ data: any }> = ({ data }) => {
  // 実際の実装ではChart.jsやRechartsなどのライブラリを使用
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <div className="text-center">
        <LineChart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600">売上推移グラフ</p>
        <p className="text-sm text-gray-500">データ: {data?.length || 0}件</p>
      </div>
    </div>
  );
};

// 診療数推移チャート
const ConsultationChart: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600">診療数推移グラフ</p>
        <p className="text-sm text-gray-500">データ: {data?.length || 0}件</p>
      </div>
    </div>
  );
};

// 医師別パフォーマンスチャート
const DoctorPerformanceChart: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="space-y-3">
      {data?.map((doctor: any, index: number) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium">{doctor.name}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold">{doctor.consultations}</span>
            <p className="text-xs text-gray-500">診療数</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// 診療形式別割合チャート
const ConsultationTypeChart: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
      <div className="text-center">
        <PieChart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600">診療形式別割合</p>
        <p className="text-sm text-gray-500">データ: {data?.length || 0}件</p>
      </div>
    </div>
  );
};

// 患者満足度チャート
const SatisfactionChart: React.FC<{ data: any }> = ({ data }) => {
  const averageScore = data?.reduce((sum: number, item: any) => sum + item.score, 0) / (data?.length || 1);
  
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-green-600 mb-2">
        {averageScore.toFixed(1)}
      </div>
      <div className="flex items-center justify-center mb-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-6 h-6 rounded-full mr-1",
              i < Math.floor(averageScore) ? "bg-yellow-400" : "bg-gray-200"
            )}
          />
        ))}
      </div>
      <p className="text-sm text-gray-600">
        平均満足度 ({data?.length || 0}件の評価)
      </p>
    </div>
  );
};

// アラートリスト
const AlertsList: React.FC<{ alerts: any[] }> = ({ alerts }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-3">
      {alerts?.map((alert, index) => (
        <div
          key={index}
          className={cn(
            "p-4 rounded-lg border",
            getAlertColor(alert.type)
          )}
        >
          <div className="flex items-start space-x-3">
            {getAlertIcon(alert.type)}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{alert.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(alert.created_at).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {(!alerts || alerts.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
          <p>現在、アラートはありません</p>
        </div>
      )}
    </div>
  );
};
