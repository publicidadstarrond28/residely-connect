import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface PaymentReceiptData {
  payment_id: string;
  user_name: string;
  user_email: string;
  residence_title: string;
  residence_address: string;
  room_number?: string;
  payment_method: string;
  amount: number;
  currency: string;
  months_paid: number;
  payment_date: string;
  reference_number?: string;
  bank?: string;
  phone?: string;
  cedula?: string;
  status: string;
}

export async function generatePaymentReceipt(data: PaymentReceiptData): Promise<void> {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // primary blue
  doc.text('RECIBO DE PAGO', 105, 20, { align: 'center' });
  
  // Status badge
  doc.setFontSize(12);
  const statusColor: [number, number, number] = data.status === 'confirmed' ? [34, 197, 94] : 
                     data.status === 'pending' ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Estado: ${data.status.toUpperCase()}`, 105, 30, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Payment Information
  let yPos = 45;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Información del Pago', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  const info = [
    ['ID de Pago:', data.payment_id],
    ['Fecha:', new Date(data.payment_date).toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })],
    ['Monto:', `${data.currency} ${data.amount.toFixed(2)}`],
    ['Meses Pagados:', `${data.months_paid}`],
    ['Método de Pago:', data.payment_method === 'pago_movil' ? 'Pago Móvil' : 'Efectivo'],
  ];
  
  if (data.reference_number) {
    info.push(['Nº Referencia:', data.reference_number]);
  }
  if (data.bank) {
    info.push(['Banco:', data.bank]);
  }
  if (data.phone) {
    info.push(['Teléfono:', data.phone]);
  }
  if (data.cedula) {
    info.push(['Cédula:', data.cedula]);
  }
  
  info.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(value, 70, yPos);
    yPos += 7;
  });
  
  // User Information
  yPos += 5;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Información del Residente', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  const userInfo = [
    ['Nombre:', data.user_name],
    ['Email:', data.user_email],
  ];
  
  userInfo.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(value, 70, yPos);
    yPos += 7;
  });
  
  // Residence Information
  yPos += 5;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Información de la Residencia', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  const residenceInfo = [
    ['Residencia:', data.residence_title],
    ['Dirección:', data.residence_address],
  ];
  
  if (data.room_number) {
    residenceInfo.push(['Habitación:', data.room_number]);
  }
  
  residenceInfo.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 20, yPos);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(value, 120);
    doc.text(lines, 70, yPos);
    yPos += 7 * lines.length;
  });
  
  // Generate QR Code with payment info
  try {
    const qrData = JSON.stringify({
      payment_id: data.payment_id,
      amount: data.amount,
      currency: data.currency,
      date: data.payment_date,
      status: data.status,
    });
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 150,
      margin: 1,
    });
    
    // Add QR code to PDF
    doc.addImage(qrCodeDataUrl, 'PNG', 140, 180, 50, 50);
    
    doc.setFontSize(8);
    doc.text('Código QR de verificación', 165, 235, { align: 'center' });
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Este recibo fue generado automáticamente', 105, 270, { align: 'center' });
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 105, 275, { align: 'center' });
  
  // Save PDF
  const fileName = `recibo_pago_${data.payment_id}.pdf`;
  doc.save(fileName);
}
