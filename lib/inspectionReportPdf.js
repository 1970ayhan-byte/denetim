import { toast as sonnerToast } from 'sonner'

/**
 * Denetim raporu için html2pdf ile PDF indirir (admin rapor API yanıtı ile uyumlu).
 * @param {{ inspection: object }} fullReportData - GET /api/admin/inspection/:id/report yanıtındaki inspection + üst seviye meta
 */
export async function downloadInspectionReportPdf(fullReportData) {
  if (!fullReportData?.inspection) return

  const html2pdf = (await import('html2pdf.js')).default
  const inspection = fullReportData.inspection

  const reportDate = new Date(inspection.completedAt || inspection.createdAt)
  const formattedDate = reportDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const issueAnswers = (inspection.answers || []).filter((a) => a.answer !== 'uygun')

  const htmlContent = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
          <style>
            * { 
              font-family: Arial, Helvetica, 'Segoe UI', Tahoma, sans-serif;
              -webkit-font-smoothing: antialiased;
              box-sizing: border-box;
            }
            body { 
              padding: 20px; 
              color: #333; 
              font-size: 12px; 
              line-height: 1.5;
            }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
            .header h1 { color: #1e40af; margin: 0 0 5px 0; font-size: 22px; font-weight: bold; }
            .header p { margin: 3px 0; color: #666; font-size: 11px; }
            .info-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .info-box h3 { margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: bold; }
            .info-grid { display: flex; flex-wrap: wrap; gap: 8px; }
            .info-item { font-size: 11px; width: 48%; }
            .info-item strong { color: #1e40af; font-weight: bold; }
            .intro-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
            .intro-box p { margin: 0 0 10px 0; font-size: 11px; }
            .intro-box .support { color: #92400e; font-style: italic; }
            .section-title { color: #dc2626; font-size: 16px; font-weight: bold; margin: 20px 0 15px 0; }
            .issue-card { background: #fff; border: 1px solid #e5e7eb; border-left: 4px solid #dc2626; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
            .issue-title { color: #dc2626; font-weight: bold; font-size: 13px; margin-bottom: 10px; }
            .issue-number { background: #fee2e2; color: #dc2626; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; margin-right: 8px; }
            .regulation-box { background: #eff6ff; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 11px; }
            .regulation-box strong { color: #1e40af; font-weight: bold; }
            .note-box { background: #f3f4f6; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 11px; }
            .penalty-box { background: #fef2f2; border: 1px solid #fecaca; padding: 8px 12px; border-radius: 6px; margin-top: 10px; font-size: 11px; }
            .penalty-box strong { color: #991b1b; font-weight: bold; }
            .success-box { background: #dcfce7; padding: 30px; border-radius: 8px; text-align: center; color: #166534; }
            .success-box h3 { margin: 0; font-size: 16px; font-weight: bold; }
            .legal-box { background: #fefce8; border: 1px solid #fde047; padding: 15px; border-radius: 8px; margin-top: 25px; font-size: 10px; }
            .legal-box strong { color: #854d0e; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 9px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DENETİM RAPORU</h1>
            <p><strong>SARIMEŞE DANIŞMANLIK</strong></p>
            <p>Eğitim ve Bilişim Teknolojileri Sanayi Ticaret Ltd. Şti.</p>
          </div>
          
          <div class="info-box">
            <h3>KURUM BİLGİLERİ</h3>
            <div class="info-grid">
              <div class="info-item"><strong>Okul Adı:</strong> ${inspection.schoolName || ''}</div>
              <div class="info-item"><strong>İl / İlçe:</strong> ${inspection.city?.name || ''} / ${inspection.district || ''}</div>
              <div class="info-item"><strong>Paket:</strong> ${inspection.package?.name || ''}</div>
              <div class="info-item"><strong>Danışman:</strong> ${inspection.inspector?.name || 'Belirtilmemiş'}</div>
              <div class="info-item"><strong>Rapor Tarihi:</strong> ${formattedDate}</div>
            </div>
          </div>
          
          <div class="intro-box">
            <p><strong>${formattedDate}</strong> tarihinde <strong>${inspection.schoolName || ''}</strong> kurumu yetkilisi <strong>${inspection.schoolContact || 'kurum yetkilisi'}</strong> talebi üzerine yapılan özel denetleme hizmetimiz çerçevesinde aşağıda belirtilen detaylar tespit edilmiştir.</p>
            <p class="support">Eksiklerin en kısa sürede giderilmesi noktasında danışmanlık almak isterseniz sizlere destek olmaktan mutluluk duyarız.</p>
          </div>
          
          ${
            issueAnswers.length > 0
              ? `
            <div class="section-title">TESPİT EDİLEN EKSİKLER</div>
            ${issueAnswers
              .map(
                (answer, index) => `
              <div class="issue-card">
                <div class="issue-title">
                  <span class="issue-number">${index + 1}</span>
                  ${answer.question?.question || ''}
                </div>
                ${
                  answer.question?.regulationText
                    ? `
                  <div class="regulation-box">
                    <strong>Yönetmelik:</strong><br/>
                    ${answer.question.regulationText}
                  </div>
                `
                    : ''
                }
                ${
                  answer.note
                    ? `
                  <div class="note-box">
                    <strong>Not:</strong><br/>
                    ${answer.note}
                  </div>
                `
                    : ''
                }
                ${
                  answer.question?.penaltyType
                    ? `
                  <div class="penalty-box">
                    <strong>Ceza:</strong> ${answer.question.penaltyType}
                  </div>
                `
                    : ''
                }
              </div>
            `
              )
              .join('')}
          `
              : `
            <div class="success-box">
              <h3>Tüm kontroller uygun bulunmuştur!</h3>
            </div>
          `
          }
          
          <div class="legal-box">
            <strong>HUKUKİ UYARI:</strong>
            <p style="margin: 8px 0 0 0;">Bu rapor yalnızca öneri niteliğindedir ve kurumun yasal sorumluluklarını ortadan kaldırmaz. Raporun yasal bir değeri bulunmamaktadır. Sadece bilgilendirme amaçlıdır.</p>
            <p style="margin: 8px 0 0 0;"><strong>SARIMEŞE DANIŞMANLIK</strong></p>
          </div>
          
          <div class="footer">
            <p>Oluşturulma: ${new Date().toLocaleString('tr-TR')} | SARIMEŞE DANIŞMANLIK</p>
          </div>
        </body>
        </html>
      `

  const element = document.createElement('div')
  element.innerHTML = htmlContent
  element.style.width = '210mm'
  document.body.appendChild(element)

  try {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `denetim_raporu_${(inspection.schoolName || 'rapor').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        windowWidth: 794,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }

    await html2pdf().set(opt).from(element).save()
    sonnerToast.success('PDF rapor indirildi')
  } catch (error) {
    console.error('PDF Error:', error)
    sonnerToast.error('PDF oluşturma hatası')
    throw error
  } finally {
    document.body.removeChild(element)
  }
}
