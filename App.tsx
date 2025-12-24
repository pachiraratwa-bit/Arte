
import React, { useState, useRef } from 'react';
import { LayoutManager } from './components/LayoutManager';
import { TemplateType, ClinicContent } from './types';
import { generateMarketingCaption, generateAIDesign } from './services/gemini';
import { toPng } from 'html-to-image';

const FONT_OPTIONS = [
  { name: 'Prompt (มาตรฐาน)', value: "'Prompt', sans-serif" },
  { name: 'Kanit (ทันสมัย)', value: "'Kanit', sans-serif" },
  { name: 'Noto Sans Thai (ทางการ)', value: "'Noto Sans Thai', sans-serif" },
  { name: 'Montserrat (สากล)', value: "'Montserrat', sans-serif" },
  { name: 'Playfair (หรูหราไฮเอนด์)', value: "'Playfair Display', serif" },
  { name: 'Bodoni (แฟชั่นนิตยสาร)', value: "'Bodoni Moda', serif" },
  { name: 'Libre Baskerville (พรีเมียม)', value: "'Libre Baskerville', serif" },
];

const App: React.FC = () => {
  const [template, setTemplate] = useState<TemplateType>('STYLE_1');
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const [aiDescription, setAiDescription] = useState('');
  const [content, setContent] = useState<ClinicContent>({
    headline: 'หลังทำเหมือนได้หน้าใหม่',
    title: 'หน้าเด็กลง',
    subtitle: 'จนคนรอบตัวทัก',
    promotion: 'ช่วยเติมเต็มหน้าผากแบน ยุบบุ๋ม \nช่วยปรับหน้าผากที่ไม่เท่ากัน \nช่วยเติมเต็มร่องลึกและรอยย่น',
    mainImage: '',
    inset1: '',
    inset2: '',
    phone: '062-462-3635',
    lineId: '@artehouseclinic',
    registrationNo: 'ขสพ.สบ.4/2568',
  });
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingDesign, setLoadingDesign] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ClinicContent) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCaption = async () => {
    setLoadingAI(true);
    try {
      const text = await generateMarketingCaption(`${content.headline} ${content.title}`, content.promotion);
      alert(text);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAIDesignApply = async () => {
    if (!aiDescription.trim()) {
      alert("กรุณาระบุความต้องการเพื่อให้ AI ช่วยออกแบบ");
      return;
    }
    setLoadingDesign(true);
    try {
      const design = await generateAIDesign(aiDescription);
      if (design) {
        setContent(prev => ({
          ...prev,
          headline: design.headline,
          title: design.title,
          subtitle: design.subtitle,
          promotion: design.promotion
        }));
        setTemplate(design.template as TemplateType);
        
        const matchingFont = FONT_OPTIONS.find(f => f.name.includes(design.fontKeyword)) || FONT_OPTIONS[0];
        setSelectedFont(matchingFont.value);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDesign(false);
    }
  };

  const downloadImage = () => {
    if (previewRef.current === null) return;
    toPng(previewRef.current, { cacheBust: true, pixelRatio: 3 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `arte-review-${template.toLowerCase()}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Download failed', err);
      });
  };

  const FooterBar = () => (
    <div className="absolute bottom-4 inset-x-0 z-40 flex items-center justify-center pointer-events-none">
       <div className="bg-white/95 backdrop-blur-md px-6 py-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-white/50 flex items-center gap-5 pointer-events-auto">
          <div className="flex items-center gap-2">
             <span className="text-[#f05a28] text-[10px] font-bold uppercase tracking-widest">จองคิวได้ที่</span>
             <div className="flex items-center gap-1.5">
               <span className="text-[12px]">📞</span>
               <span className="text-[12px] font-black text-neutral-800 tracking-tight">{content.phone}</span>
             </div>
          </div>
          <div className="w-[1px] h-4 bg-neutral-200"></div>
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-[#06C755] rounded-full flex items-center justify-center text-[7px] text-white font-black shadow-sm">LINE</div>
             <span className="text-[12px] font-black text-neutral-800 tracking-tight">{content.lineId}</span>
          </div>
       </div>
    </div>
  );

  const placeholderImg = (id: string) => `https://images.unsplash.com/photo-1596462502278-27bfad450526?auto=format&fit=crop&q=80&w=800&id=${id}`;

  return (
    <LayoutManager>
      {/* Editor Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-neutral-200 p-6 overflow-y-auto max-h-[calc(100vh-72px)] shadow-inner">
        <div className="space-y-6">
          
          <section className="p-4 bg-gradient-to-br from-indigo-50 to-orange-50 rounded-2xl border border-indigo-100 shadow-sm space-y-3">
             <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
               <span className="text-lg">🤖</span> AI ช่วยออกแบบดีไซน์
             </h3>
             <textarea 
               value={aiDescription}
               onChange={(e) => setAiDescription(e.target.value)}
               placeholder="เช่น: ต้องการแบบหรูหรา ดูแพง โทนสีทอง สำหรับงานฟิลเลอร์ปาก"
               className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-200 min-h-[80px] resize-none"
             />
             <button 
               onClick={handleAIDesignApply}
               disabled={loadingDesign}
               className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
             >
               {loadingDesign ? 'กำลังวิเคราะห์...' : 'เริ่มออกแบบด้วย AI'}
             </button>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1">รูปแบบดีไซน์</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['STYLE_1', 'STYLE_2', 'STYLE_3', 'LIVE'] as TemplateType[]).map((t) => (
                <button 
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all border ${template === t ? 'bg-[#f05a28] text-white border-[#f05a28] shadow-lg shadow-[#f05a28]/20' : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'}`}
                >
                  {t === 'STYLE_1' ? 'ดีไซน์ 1' : t === 'STYLE_2' ? 'ดีไซน์ 2' : t === 'STYLE_3' ? 'ดีไซน์ 3' : 'โหมด LIVE'}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1">ข้อมูลในภาพ</h3>
            
            <div className="space-y-3">
               <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase">ฟอนต์แสดงผล</label>
                  <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none">
                    {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase">หัวข้อย่อย</label>
                  <input type="text" name="headline" value={content.headline} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase">หัวข้อหลัก</label>
                  <input type="text" name="title" value={content.title} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-black outline-none" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase">สโลแกนสั้น</label>
                  <input type="text" name="subtitle" value={content.subtitle} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase">โปรโมชั่น / รายละเอียด (Style 3)</label>
                  <textarea name="promotion" value={content.promotion} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none h-20" />
               </div>
            </div>
          </section>

          <section className="space-y-3 pt-2 border-t border-neutral-100">
             <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">อัปโหลดรูปภาพ (3 รูป)</h3>
             <div className="space-y-2">
                <input type="file" onChange={(e) => handleImageUpload(e, 'mainImage')} className="hidden" id="main-up" accept="image/*" />
                <label htmlFor="main-up" className="block w-full py-2 bg-[#f05a28] text-white rounded-lg text-[10px] font-bold text-center cursor-pointer hover:brightness-110 transition-all">1. ภาพหลัก (หลังทำ)</label>
                
                <div className="grid grid-cols-2 gap-2">
                   <input type="file" onChange={(e) => handleImageUpload(e, 'inset1')} className="hidden" id="in1-up" accept="image/*" />
                   <label htmlFor="in1-up" className="block w-full py-2 bg-neutral-100 text-neutral-600 rounded-lg text-[10px] font-bold text-center cursor-pointer hover:bg-neutral-200 transition-all">2. ก่อนทำ 1</label>
                   
                   <input type="file" onChange={(e) => handleImageUpload(e, 'inset2')} className="hidden" id="in2-up" accept="image/*" />
                   <label htmlFor="in2-up" className="block w-full py-2 bg-neutral-100 text-neutral-600 rounded-lg text-[10px] font-bold text-center cursor-pointer hover:bg-neutral-200 transition-all">3. ก่อนทำ 2</label>
                </div>
             </div>
          </section>

          <button onClick={handleGenerateCaption} disabled={loadingAI} className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all shadow-xl active:scale-95">
            {loadingAI ? 'กำลังประมวลผล...' : '✨ สร้างแคปชั่นสำหรับการตลาด'}
          </button>
        </div>
      </aside>

      {/* Preview Section */}
      <section className="flex-1 bg-neutral-100 p-8 flex flex-col items-center justify-center overflow-auto min-h-[700px]">
        <div className="relative group">
          <div 
            ref={previewRef}
            className="bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.35)] relative overflow-hidden w-[600px] h-[600px] select-none"
            style={{ fontFamily: selectedFont }}
          >
            {/* 1. Main Background Image */}
            <div className="absolute inset-0 z-0">
               <img src={content.mainImage || placeholderImg('main_ref')} className="w-full h-full object-cover" alt="Review Main" />
               <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10"></div>
            </div>

            {/* Registration Tag - Top Left */}
            <div className="absolute top-5 left-6 z-20 text-white text-[10px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] opacity-80 uppercase tracking-tight">
               {content.registrationNo}
            </div>

            {/* LOGO REMOVED FROM CANVAS AS REQUESTED */}

            {/* STYLE 1: Elegant Reveal */}
            {template === 'STYLE_1' && (
              <>
                <div className="absolute bottom-24 left-8 z-30 flex gap-4">
                  <div className="w-[145px] h-[185px] rounded-[28px] border-[5px] border-white shadow-2xl overflow-hidden relative transform -rotate-1">
                    <img src={content.inset1 || placeholderImg('side1')} className="w-full h-full object-cover" alt="Before 1" />
                  </div>
                  <div className="w-[145px] h-[185px] rounded-[28px] border-[5px] border-white shadow-2xl overflow-hidden relative transform rotate-1">
                    <img src={content.inset2 || placeholderImg('side2')} className="w-full h-full object-cover" alt="Before 2" />
                  </div>
                </div>
                
                <div className="absolute top-[48%] right-8 -translate-y-1/2 z-30 text-right max-w-[300px]">
                  <p className="text-white text-[21px] font-bold italic drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)] leading-none mb-1">
                    “{content.headline}”
                  </p>
                  <h2 className="text-white text-[80px] font-black drop-shadow-[0_6px_20px_rgba(0,0,0,1)] leading-[0.78] tracking-tighter mb-2">
                    {content.title}
                  </h2>
                  <p className="text-white text-[26px] font-black italic drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)] tracking-tight">
                    {content.subtitle}”
                  </p>
                </div>
              </>
            )}

            {/* STYLE 2: HI-END Glow */}
            {template === 'STYLE_2' && (
              <>
                <div className="absolute top-28 left-8 z-30 flex flex-col gap-4">
                  <div className="w-[170px] h-[190px] rounded-[20px] border-[5px] border-[#f05a28] shadow-[0_15px_35px_rgba(240,90,40,0.3)] overflow-hidden transform -rotate-[3deg]">
                    <img src={content.inset1 || placeholderImg('hi1')} className="w-full h-full object-cover" alt="Hi-End 1" />
                  </div>
                  <div className="w-[170px] h-[190px] rounded-[20px] border-[5px] border-[#f05a28] shadow-[0_15px_35px_rgba(240,90,40,0.3)] overflow-hidden transform rotate-[3deg]">
                    <img src={content.inset2 || placeholderImg('hi2')} className="w-full h-full object-cover" alt="Hi-End 2" />
                  </div>
                </div>
                
                <div className="absolute bottom-36 right-10 z-30 text-right">
                  <p className="text-white text-[24px] font-bold italic drop-shadow-lg mb-2 leading-none">“{content.headline}”</p>
                  <h2 className="text-white text-[62px] font-black italic tracking-tighter leading-none flex flex-wrap gap-3 items-baseline justify-end">
                    หน้า <span className="bg-gradient-to-r from-[#f05a28] via-orange-300 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(240,90,40,0.6)] animate-pulse">HI-END</span>
                  </h2>
                  <h2 className="text-white text-[62px] font-black italic tracking-tighter leading-none mt-1">ขึ้นอีกระดับ”</h2>
                </div>
              </>
            )}

            {/* STYLE 3: Focus List */}
            {template === 'STYLE_3' && (
              <>
                <div className="absolute top-16 left-10 z-30 text-white max-w-[420px]">
                   <h1 className="text-[84px] font-black italic drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)] leading-[0.7] tracking-tighter">
                      {content.headline || 'Program'}
                   </h1>
                   <h2 className="text-[72px] font-bold italic drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)] leading-[0.85] tracking-tighter mt-4 flex items-center gap-3">
                      {content.title} <span className="text-2xl mt-4 opacity-80 animate-ping">✦</span>
                   </h2>
                   
                   <div className="mt-8 space-y-2.5 opacity-100">
                      {content.promotion.split('\n').map((line, idx) => (
                        <p key={idx} className="text-[18px] font-medium italic drop-shadow-[0_4px_12px_rgba(0,0,0,1)] leading-tight border-l-[3px] border-[#f05a28] pl-4">
                           {line}
                        </p>
                      ))}
                   </div>
                </div>
                
                <div className="absolute bottom-28 left-10 z-30 flex gap-5">
                   <div className="w-[160px] h-[180px] rounded-[30px] border-[5px] border-white shadow-2xl overflow-hidden transform -rotate-1">
                      <img src={content.inset1 || placeholderImg('fore1')} className="w-full h-full object-cover" alt="Inset 1" />
                   </div>
                   <div className="w-[160px] h-[180px] rounded-[30px] border-[5px] border-white shadow-2xl overflow-hidden transform rotate-1">
                      <img src={content.inset2 || placeholderImg('fore2')} className="w-full h-full object-cover" alt="Inset 2" />
                   </div>
                </div>
              </>
            )}

            {/* LIVE MODE */}
            {template === 'LIVE' && (
              <div className="absolute inset-0 z-30 pointer-events-none">
                <div className="absolute top-10 left-10 bg-red-600 text-white px-5 py-2 rounded-xl text-[16px] font-black animate-pulse flex items-center gap-3 shadow-2xl border border-red-400">
                  <span className="w-3 h-3 bg-white rounded-full shadow-[0_0_12px_white]"></span> LIVE
                </div>
                <div className="absolute bottom-32 left-12 right-12 text-white pointer-events-auto">
                  <div className="bg-[#f05a28] text-white px-6 py-1.5 text-2xl font-black italic inline-block mb-4 shadow-[0_10px_30px_rgba(240,90,40,0.5)] skew-x-[-12deg] border-l-4 border-white">
                    {content.headline}
                  </div>
                  <h2 className="text-[82px] font-black italic drop-shadow-[0_15px_40px_rgba(0,0,0,0.95)] leading-[0.75] mb-3 tracking-tighter">
                    {content.title}
                  </h2>
                  <p className="text-white text-[28px] font-bold italic drop-shadow-[0_4px_15px_rgba(0,0,0,1)] tracking-tight">
                    {content.subtitle}
                  </p>
                </div>
              </div>
            )}

            <FooterBar />
          </div>

          <button onClick={downloadImage} className="absolute -bottom-24 left-1/2 -translate-x-1/2 bg-[#f05a28] hover:bg-black text-white px-14 py-5 rounded-full font-black text-[15px] uppercase tracking-widest shadow-[0_20px_45px_rgba(240,90,40,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-4 group">
            <svg className="w-6 h-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Save High Quality Review
          </button>
        </div>
      </section>
    </LayoutManager>
  );
};

export default App;
