import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Wand2, 
  FileText, 
  Download, 
  Copy, 
  RefreshCw, 
  Sparkles,
  Code,
  Eye,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface AIPageCreatorProps {
  clinicId: string;
}

interface GeneratedPage {
  id: string;
  title: string;
  content: string;
  html: string;
  css: string;
  createdAt: string;
  type: 'landing' | 'service' | 'contact' | 'about' | 'custom';
}

// プレースホルダーテキストを取得する関数
const getPlaceholderText = (type: string): string => {
  switch (type) {
    case 'landing':
      return 'ホームページの内容を説明してください...';
    case 'service':
      return '提供する診療サービスを説明してください...';
    case 'contact':
      return '連絡先情報やアクセス方法を説明してください...';
    case 'about':
      return 'クリニックの特徴や理念を説明してください...';
    default:
      return 'ページの内容を詳しく説明してください...';
  }
};

// 詳細なモックデータを生成する関数
const generateDetailedMockData = (type: string, prompt: string) => {
  const clinicNames = ['東京クリニック', '渋谷メディカルセンター', '新宿総合病院', '青山クリニック', '表参道診療所'];
  const doctorNames = ['田中 太郎', '佐藤 花子', '鈴木 一郎', '高橋 美咲', '山田 健太'];
  const specialties = ['内科', '外科', '小児科', '産婦人科', '眼科', '耳鼻咽喉科', '皮膚科', '整形外科'];
  const randomClinic = clinicNames[Math.floor(Math.random() * clinicNames.length)];
  const randomDoctor = doctorNames[Math.floor(Math.random() * doctorNames.length)];
  const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];

  return {
    landing: {
      title: `${randomClinic} - ホームページ`,
      content: `${randomClinic}は、患者様の健康と安心を第一に考えた医療サービスを提供しています。経験豊富な医師陣と最新の医療設備で、地域の皆様の健康をサポートいたします。`,
      clinicName: randomClinic,
      mainMessage: '患者様の健康と安心を第一に',
      subMessage: '経験豊富な医師陣と最新の医療設備で、地域の皆様の健康をサポート',
      services: [
        { name: '内科診療', description: '風邪、インフルエンザ、生活習慣病などの診断・治療' },
        { name: '小児科診療', description: '0歳から15歳までのお子様の健康管理' },
        { name: '予防接種', description: '各種ワクチン接種と健康管理' },
        { name: '健康診断', description: '定期健診と人間ドック' }
      ],
      features: [
        '24時間オンライン予約',
        'オンライン診療対応',
        '電子カルテシステム',
        '多言語対応'
      ]
    },
    service: {
      title: `${randomClinic} - 診療サービス`,
      content: `${randomClinic}では、幅広い診療科目に対応し、患者様一人ひとりに最適な医療サービスを提供しています。`,
      clinicName: randomClinic,
      services: [
        {
          name: '内科',
          description: '風邪、インフルエンザ、高血圧、糖尿病、脂質異常症などの内科疾患の診断・治療を行います。',
          features: ['一般内科', '生活習慣病', '感染症', 'アレルギー'],
          price: '初診: 3,000円 / 再診: 2,000円'
        },
        {
          name: '小児科',
          description: '0歳から15歳までのお子様の健康管理と治療を行います。',
          features: ['乳幼児健診', '予防接種', '小児感染症', '発達相談'],
          price: '初診: 3,500円 / 再診: 2,500円'
        },
        {
          name: '外科',
          description: '軽度の外傷、皮膚疾患、簡単な手術に対応しています。',
          features: ['外傷治療', '皮膚外科', '簡単な手術', '術後管理'],
          price: '初診: 4,000円 / 再診: 3,000円'
        },
        {
          name: '眼科',
          description: '目の健康診断、視力検査、眼疾患の治療を行います。',
          features: ['視力検査', '眼底検査', '眼圧測定', 'コンタクトレンズ処方'],
          price: '初診: 3,500円 / 再診: 2,500円'
        }
      ],
      equipment: ['レントゲン装置', '超音波検査装置', '血液検査機器', '心電図装置', '内視鏡装置']
    },
    contact: {
      title: `${randomClinic} - お問い合わせ`,
      content: `${randomClinic}へのご予約・お問い合わせは、お電話またはオンライン予約システムをご利用ください。`,
      clinicName: randomClinic,
      phone: '03-1234-5678',
      fax: '03-1234-5679',
      email: 'info@clinic-example.com',
      address: '東京都渋谷区○○1-2-3',
      postalCode: '150-0002',
      hours: {
        weekdays: '9:00 - 18:00',
        saturday: '9:00 - 13:00',
        sunday: '休診',
        holidays: '休診'
      },
      access: {
        train: 'JR山手線 渋谷駅 徒歩5分',
        bus: '都営バス 渋谷駅前 徒歩3分',
        car: '駐車場完備（30台収容）'
      },
      emergency: '夜間・休日は救急外来をご利用ください'
    },
    about: {
      title: `${randomClinic} - クリニックについて`,
      content: `${randomClinic}は、地域密着型の医療を心がけ、患者様の健康をサポートしています。`,
      clinicName: randomClinic,
      director: {
        name: randomDoctor,
        specialty: randomSpecialty,
        experience: '20年以上の臨床経験',
        education: '東京大学医学部卒業',
        message: '患者様一人ひとりに寄り添った医療を心がけています。'
      },
      history: {
        established: '2010年',
        milestones: [
          '2010年 - クリニック開院',
          '2015年 - オンライン診療開始',
          '2020年 - 電子カルテシステム導入',
          '2023年 - 新棟増築完成'
        ]
      },
      philosophy: '患者様の健康と安心を第一に考え、質の高い医療サービスを提供します。',
      staff: [
        { name: '田中 太郎', position: '院長', specialty: '内科' },
        { name: '佐藤 花子', position: '副院長', specialty: '小児科' },
        { name: '鈴木 一郎', position: '医師', specialty: '外科' },
        { name: '高橋 美咲', position: '看護師長', specialty: '看護' }
      ],
      facilities: [
        '診察室 5室',
        'レントゲン室',
        '検査室',
        '待合室（30席）',
        '駐車場（30台）'
      ]
    },
    custom: {
      title: prompt ? `${prompt} - ${randomClinic}` : `${randomClinic} - カスタムページ`,
      content: prompt || `${randomClinic}のカスタムページです。患者様に必要な情報をわかりやすくお伝えします。`,
      clinicName: randomClinic,
      customContent: prompt || 'このページは、AIが自動生成したカスタムページです。',
      sections: [
        {
          title: '概要',
          content: prompt || 'このページの概要を説明します。'
        },
        {
          title: '詳細情報',
          content: '詳細な情報や説明をここに記載します。'
        },
        {
          title: 'お問い合わせ',
          content: 'ご質問やお問い合わせがございましたら、お気軽にご連絡ください。'
        }
      ]
    }
  };
};

export const AIPageCreator: React.FC<AIPageCreatorProps> = ({ clinicId }) => {
  const [prompt, setPrompt] = useState('');
  const [pageType, setPageType] = useState<'landing' | 'service' | 'contact' | 'about' | 'custom'>('landing');
  const [generatedPages, setGeneratedPages] = useState<GeneratedPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<GeneratedPage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // AIページ生成のミューテーション
  const generatePageMutation = useMutation({
    mutationFn: async ({ prompt, type }: { prompt: string; type: string }) => {
      // モックデータとしてAI生成ページを返す
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒の遅延をシミュレート
      
      // 詳細なモックデータを生成
      const mockData = generateDetailedMockData(type, prompt);
      
      const mockPages: Record<string, GeneratedPage> = {
        landing: {
          id: `page-${Date.now()}`,
          title: mockData.landing.title,
          content: mockData.landing.content,
          html: generateLandingPageHTML(mockData.landing),
          css: generateLandingPageCSS(),
          createdAt: new Date().toISOString(),
          type: 'landing'
        },
        service: {
          id: `page-${Date.now()}`,
          title: mockData.service.title,
          content: mockData.service.content,
          html: generateServicePageHTML(mockData.service),
          css: generateServicePageCSS(),
          createdAt: new Date().toISOString(),
          type: 'service'
        },
        contact: {
          id: `page-${Date.now()}`,
          title: mockData.contact.title,
          content: mockData.contact.content,
          html: generateContactPageHTML(mockData.contact),
          css: generateContactPageCSS(),
          createdAt: new Date().toISOString(),
          type: 'contact'
        },
        about: {
          id: `page-${Date.now()}`,
          title: mockData.about.title,
          content: mockData.about.content,
          html: generateAboutPageHTML(mockData.about),
          css: generateAboutPageCSS(),
          createdAt: new Date().toISOString(),
          type: 'about'
        },
        custom: {
          id: `page-${Date.now()}`,
          title: mockData.custom.title,
          content: mockData.custom.content,
          html: generateCustomPageHTML(mockData.custom),
          css: generateCustomPageCSS(),
          createdAt: new Date().toISOString(),
          type: 'custom'
        }
      };

      return mockPages[type] || mockPages.custom;
    },
    onSuccess: (data) => {
      setGeneratedPages(prev => [data, ...prev]);
      setSelectedPage(data);
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim() && pageType === 'custom') {
      alert('カスタムページの場合はプロンプトを入力してください');
      return;
    }
    
    setIsGenerating(true);
    generatePageMutation.mutate({ prompt, type: pageType });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('コードをクリップボードにコピーしました');
  };

  const handleDownloadPage = (page: GeneratedPage) => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <style>${page.css}</style>
</head>
<body>
${page.html}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeletePage = (pageId: string) => {
    setGeneratedPages(prev => prev.filter(p => p.id !== pageId));
    if (selectedPage?.id === pageId) {
      setSelectedPage(null);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI ページ作成</h1>
              <p className="text-gray-600">AIが自動でクリニックのWebページを生成します</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: 生成フォーム */}
          <div className="lg:col-span-1">
            <div className="clinics-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                ページ生成
              </h2>
              
              <div className="space-y-6">
                {/* ページタイプ選択 */}
                <div>
                  <Label htmlFor="pageType" className="text-sm font-medium text-gray-700">
                    ページタイプ
                  </Label>
                  <select
                    id="pageType"
                    value={pageType}
                    onChange={(e) => setPageType(e.target.value as any)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="landing">ランディングページ</option>
                    <option value="service">診療サービス</option>
                    <option value="contact">お問い合わせ</option>
                    <option value="about">クリニック紹介</option>
                    <option value="custom">カスタムページ</option>
                  </select>
                </div>

                {/* プロンプト入力 */}
                <div>
                  <Label htmlFor="prompt" className="text-sm font-medium text-gray-700">
                    プロンプト {pageType === 'custom' && <span className="text-red-500">*</span>}
                  </Label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={getPlaceholderText(pageType)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                  />
                </div>

                {/* 生成ボタン */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || (!prompt.trim() && pageType === 'custom')}
                  className="w-full clinics-button-primary"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      AIでページを生成
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 生成履歴 */}
            {generatedPages.length > 0 && (
              <div className="clinics-card p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-500" />
                  生成履歴
                </h3>
                <div className="space-y-3">
                  {generatedPages.map((page) => (
                    <div
                      key={page.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPage?.id === page.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPage(page)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedPage(page);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{page.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(page.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(page.id);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右側: プレビューとコード */}
          <div className="lg:col-span-2">
            {selectedPage ? (
              <div className="space-y-6">
                {/* プレビュー */}
                <div className="clinics-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-green-500" />
                      プレビュー
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleDownloadPage(selectedPage)}
                        className="clinics-button-secondary"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        ダウンロード
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${selectedPage.title}</title>
    <style>${selectedPage.css}</style>
</head>
<body>
${selectedPage.html}
</body>
</html>`}
                      className="w-full h-96 border-0"
                      title="Page Preview"
                    />
                  </div>
                </div>

                {/* HTMLコード */}
                <div className="clinics-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Code className="w-5 h-5 mr-2 text-blue-500" />
                      HTMLコード
                    </h3>
                    <Button
                      onClick={() => handleCopyCode(selectedPage.html)}
                      className="clinics-button-secondary"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      コピー
                    </Button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{selectedPage.html}</code>
                  </pre>
                </div>

                {/* CSSコード */}
                <div className="clinics-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Code className="w-5 h-5 mr-2 text-pink-500" />
                      CSSコード
                    </h3>
                    <Button
                      onClick={() => handleCopyCode(selectedPage.css)}
                      className="clinics-button-secondary"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      コピー
                    </Button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{selectedPage.css}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="clinics-card p-12 text-center">
                <Wand2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">ページを生成してください</h3>
                <p className="text-gray-600">
                  左側のフォームからページタイプを選択し、AIでページを生成しましょう
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// HTML生成関数
function generateLandingPageHTML(data: any): string {
  return `
    <div class="hero">
      <div class="container">
        <h1>ようこそ、${data.clinicName}へ</h1>
        <p class="main-message">${data.mainMessage}</p>
        <p class="sub-message">${data.subMessage}</p>
        <div class="cta-buttons">
          <a href="#contact" class="btn btn-primary">お問い合わせ</a>
          <a href="#services" class="btn btn-secondary">診療サービス</a>
        </div>
      </div>
    </div>
    <section id="services" class="services">
      <div class="container">
        <h2>診療サービス</h2>
        <div class="service-grid">
          ${data.services.map((service: any) => `
            <div class="service-card">
              <h3>${service.name}</h3>
              <p>${service.description}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    <section class="features">
      <div class="container">
        <h2>クリニックの特徴</h2>
        <div class="feature-grid">
          ${data.features.map((feature: string) => `
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>${feature}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function generateServicePageHTML(data: any): string {
  return `
    <div class="page-header">
      <div class="container">
        <h1>${data.title}</h1>
        <p>${data.content}</p>
      </div>
    </div>
    <section class="services-list">
      <div class="container">
        ${data.services.map((service: any) => `
          <div class="service-item">
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <div class="service-features">
              <h4>対応内容</h4>
              <ul>
                ${service.features.map((feature: string) => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            <div class="service-price">
              <strong>料金: ${service.price}</strong>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="equipment">
      <div class="container">
        <h2>医療設備</h2>
        <div class="equipment-grid">
          ${data.equipment.map((item: string) => `
            <div class="equipment-item">
              <span class="equipment-icon">🔬</span>
              <span>${item}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function generateContactPageHTML(data: any): string {
  return `
    <div class="page-header">
      <div class="container">
        <h1>${data.title}</h1>
        <p>${data.content}</p>
      </div>
    </div>
    <section class="contact-info">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-item">
            <h3>診療時間</h3>
            <p>月曜日〜金曜日: ${data.hours.weekdays}</p>
            <p>土曜日: ${data.hours.saturday}</p>
            <p>日曜日・祝日: ${data.hours.sunday}</p>
          </div>
          <div class="contact-item">
            <h3>電話番号</h3>
            <p><a href="tel:${data.phone}">${data.phone}</a></p>
            <p>FAX: ${data.fax}</p>
          </div>
          <div class="contact-item">
            <h3>住所</h3>
            <p>〒${data.postalCode}</p>
            <p>${data.address}</p>
          </div>
          <div class="contact-item">
            <h3>アクセス</h3>
            <p>電車: ${data.access.train}</p>
            <p>バス: ${data.access.bus}</p>
            <p>車: ${data.access.car}</p>
          </div>
        </div>
        <div class="contact-form">
          <h3>お問い合わせフォーム</h3>
          <form>
            <input type="text" placeholder="お名前" required>
            <input type="email" placeholder="メールアドレス" required>
            <input type="tel" placeholder="電話番号">
            <textarea placeholder="お問い合わせ内容" required></textarea>
            <button type="submit">送信</button>
          </form>
        </div>
        <div class="emergency-info">
          <h3>緊急時について</h3>
          <p>${data.emergency}</p>
        </div>
      </div>
    </section>
  `;
}

function generateAboutPageHTML(data: any): string {
  return `
    <div class="page-header">
      <div class="container">
        <h1>${data.title}</h1>
        <p>${data.content}</p>
      </div>
    </div>
    <section class="about-content">
      <div class="container">
        <div class="director-section">
          <h2>院長挨拶</h2>
          <div class="director-info">
            <h3>${data.director.name} 院長</h3>
            <p><strong>専門分野:</strong> ${data.director.specialty}</p>
            <p><strong>経歴:</strong> ${data.director.experience}</p>
            <p><strong>学歴:</strong> ${data.director.education}</p>
            <div class="director-message">
              <p>"${data.director.message}"</p>
            </div>
          </div>
        </div>
        <div class="clinic-history">
          <h2>クリニックの歩み</h2>
          <p><strong>開院:</strong> ${data.history.established}</p>
          <ul class="milestones">
            ${data.history.milestones.map((milestone: string) => `<li>${milestone}</li>`).join('')}
          </ul>
        </div>
        <div class="philosophy-section">
          <h2>診療理念</h2>
          <p>${data.philosophy}</p>
        </div>
        <div class="staff-section">
          <h2>スタッフ紹介</h2>
          <div class="staff-grid">
            ${data.staff.map((member: any) => `
              <div class="staff-member">
                <h4>${member.name}</h4>
                <p><strong>役職:</strong> ${member.position}</p>
                <p><strong>専門:</strong> ${member.specialty}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="facilities-section">
          <h2>施設・設備</h2>
          <div class="facilities-grid">
            ${data.facilities.map((facility: string) => `
              <div class="facility-item">
                <span class="facility-icon">🏥</span>
                <span>${facility}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function generateCustomPageHTML(data: any): string {
  return `
    <div class="page-header">
      <div class="container">
        <h1>${data.title}</h1>
        <p>${data.content}</p>
      </div>
    </div>
    <section class="custom-content">
      <div class="container">
        ${data.sections.map((section: any) => `
          <div class="content-block">
            <h2>${section.title}</h2>
            <p>${section.content}</p>
          </div>
        `).join('')}
        <div class="clinic-info">
          <h2>${data.clinicName}について</h2>
          <p>${data.customContent}</p>
        </div>
      </div>
    </section>
  `;
}

// CSS生成関数
function generateLandingPageCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; text-align: center; }
    .hero h1 { font-size: 3rem; margin-bottom: 20px; }
    .hero p { font-size: 1.2rem; margin-bottom: 30px; }
    .cta-buttons { display: flex; gap: 20px; justify-content: center; }
    .btn { padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .btn-primary { background: #ff6b6b; color: white; }
    .btn-secondary { background: transparent; color: white; border: 2px solid white; }
    .services { padding: 80px 0; }
    .services h2 { text-align: center; font-size: 2.5rem; margin-bottom: 50px; }
    .service-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
    .service-card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
    .service-card h3 { font-size: 1.5rem; margin-bottom: 15px; color: #333; }
  `;
}

function generateServicePageCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .page-header { background: #f8f9fa; padding: 60px 0; text-align: center; }
    .page-header h1 { font-size: 2.5rem; margin-bottom: 15px; }
    .services-list { padding: 60px 0; }
    .service-item { margin-bottom: 40px; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
    .service-item h3 { font-size: 1.8rem; margin-bottom: 15px; color: #2c3e50; }
    .service-item ul { margin-top: 15px; padding-left: 20px; }
    .service-item li { margin-bottom: 5px; }
  `;
}

function generateContactPageCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .page-header { background: #e8f4fd; padding: 60px 0; text-align: center; }
    .page-header h1 { font-size: 2.5rem; margin-bottom: 15px; }
    .contact-info { padding: 60px 0; }
    .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-bottom: 50px; }
    .contact-item { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
    .contact-item h3 { font-size: 1.5rem; margin-bottom: 15px; color: #2c3e50; }
    .contact-form { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
    .contact-form h3 { font-size: 1.8rem; margin-bottom: 25px; }
    .contact-form input, .contact-form textarea { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .contact-form button { background: #3498db; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; }
  `;
}

function generateAboutPageCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .page-header { background: #f0f8ff; padding: 60px 0; text-align: center; }
    .page-header h1 { font-size: 2.5rem; margin-bottom: 15px; }
    .about-content { padding: 60px 0; }
    .about-text, .clinic-info { margin-bottom: 50px; }
    .about-text h2, .clinic-info h2 { font-size: 2rem; margin-bottom: 25px; color: #2c3e50; }
    .about-text p { margin-bottom: 15px; font-size: 1.1rem; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; }
    .info-item { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
    .info-item h3 { font-size: 1.3rem; margin-bottom: 10px; color: #2c3e50; }
  `;
}

function generateCustomPageCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .page-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 0; text-align: center; }
    .page-header h1 { font-size: 2.5rem; margin-bottom: 15px; }
    .custom-content { padding: 60px 0; }
    .content-block { background: white; padding: 40px; margin-bottom: 30px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
    .content-block h2 { font-size: 1.8rem; margin-bottom: 20px; color: #2c3e50; }
    .content-block p { font-size: 1.1rem; margin-bottom: 15px; }
  `;
}
