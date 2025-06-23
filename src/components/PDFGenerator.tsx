
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

interface Workout {
  week: number;
  day: number;
  title: string;
  focus: string;
  estimated_duration: number;
  warm_up: {
    duration: number;
    exercises: Array<{
      name: string;
      duration: number;
      instructions: string;
    }>;
  };
  main_exercises: Array<{
    name: string;
    muscle_groups: string[];
    sets: number;
    reps: string;
    rest_seconds: number;
    weight_guidance: string;
    instructions: string;
    form_cues: string[];
    progression_notes: string;
  }>;
  cool_down: {
    duration: number;
    exercises: Array<{
      name: string;
      duration: number;
      instructions: string;
    }>;
  };
}

interface WorkoutPlan {
  title: string;
  description: string;
  difficulty_level: string;
  duration_weeks: number;
  total_workouts?: number;
  workouts?: Workout[];
  nutrition_tips?: string[];
  progression_schedule?: any;
}

interface PDFGeneratorProps {
  plan: WorkoutPlan;
  userName: string;
  hasAccess: boolean;
}

const PDFGenerator = ({ plan, userName, hasAccess }: PDFGeneratorProps) => {
  const { toast } = useToast();

  const generatePDF = async () => {
    if (!hasAccess) {
      toast({
        title: "Acesso Restrito",
        description: "Você precisa ser assinante para baixar o PDF do plano.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Criar elemento temporário para renderizar o PDF
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.width = '210mm'; // A4 width
      element.style.minHeight = '297mm'; // A4 height
      element.style.padding = '20mm';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.backgroundColor = 'white';
      element.style.fontSize = '14px';
      element.style.lineHeight = '1.5';
      element.style.color = '#333';
      document.body.appendChild(element);

      // Gerar conteúdo HTML para o PDF com tamanhos maiores
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 15px;">
            <div style="width: 60px; height: 60px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 36px; font-weight: bold;">💪</span>
            </div>
            <h1 style="color: #2563eb; margin: 0; font-size: 36px; font-weight: bold;">FitAI Pro</h1>
          </div>
          <p style="color: #64748b; margin: 0; font-size: 18px;">Plano Personalizado Gerado por IA</p>
          <div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 12px;">
            <p style="margin: 0; color: #475569; font-size: 16px;">
              ⚠️ Este plano foi criado exclusivamente para <strong>${userName}</strong><br>
              Todos os direitos reservados FitAI Pro © ${new Date().getFullYear()}
            </p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #1e40af; font-size: 28px; margin-bottom: 15px;">${plan.title}</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${plan.description}</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 25px;">
            <div style="padding: 20px; background: #eff6ff; border-left: 6px solid #3b82f6; border-radius: 8px;">
              <strong style="color: #1e40af; font-size: 16px;">Nível:</strong><br>
              <span style="font-size: 18px;">${plan.difficulty_level.charAt(0).toUpperCase() + plan.difficulty_level.slice(1)}</span>
            </div>
            <div style="padding: 20px; background: #f0fdf4; border-left: 6px solid #22c55e; border-radius: 8px;">
              <strong style="color: #16a34a; font-size: 16px;">Duração:</strong><br>
              <span style="font-size: 18px;">${plan.duration_weeks} semanas</span>
            </div>
            ${plan.total_workouts ? `
            <div style="padding: 20px; background: #fefce8; border-left: 6px solid #eab308; border-radius: 8px;">
              <strong style="color: #ca8a04; font-size: 16px;">Total de Treinos:</strong><br>
              <span style="font-size: 18px;">${plan.total_workouts}</span>
            </div>
            ` : ''}
          </div>
        </div>

        ${plan.workouts && plan.workouts.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e40af; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">📋 Treinos Detalhados</h3>
          ${plan.workouts.slice(0, 4).map((workout, index) => `
            <div style="margin-bottom: 25px; padding: 25px; border: 2px solid #e2e8f0; border-radius: 12px; background: #fafafa; page-break-inside: avoid;">
              <h4 style="color: #2563eb; font-size: 20px; margin-bottom: 12px;">${workout.title}</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; font-size: 14px;">
                <span><strong>Semana:</strong> ${workout.week}</span>
                <span><strong>Dia:</strong> ${workout.day}</span>
                <span><strong>Duração:</strong> ~${workout.estimated_duration} min</span>
                <span><strong>Foco:</strong> ${workout.focus}</span>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h5 style="color: #dc2626; font-size: 18px; margin-bottom: 12px;">🔥 Aquecimento (${workout.warm_up.duration} min)</h5>
                ${workout.warm_up.exercises.slice(0, 2).map(ex => `
                  <div style="margin-bottom: 12px; padding: 12px; background: #fef2f2; border-radius: 6px; font-size: 14px;">
                    <strong style="font-size: 16px;">${ex.name}</strong> - ${Math.floor(ex.duration / 60)}:${(ex.duration % 60).toString().padStart(2, '0')} min
                    <p style="margin: 8px 0 0 0; color: #64748b; line-height: 1.4;">${ex.instructions.substring(0, 150)}...</p>
                  </div>
                `).join('')}
              </div>

              <div style="margin-bottom: 20px;">
                <h5 style="color: #2563eb; font-size: 18px; margin-bottom: 12px;">💪 Exercícios Principais</h5>
                ${workout.main_exercises.slice(0, 3).map(ex => `
                  <div style="margin-bottom: 15px; padding: 15px; background: #f8fafc; border-radius: 6px; font-size: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                      <strong style="color: #1e40af; font-size: 16px;">${ex.name}</strong>
                      <span style="color: #64748b; font-size: 16px;">${ex.sets} séries × ${ex.reps}</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                      <strong>Músculos:</strong> ${ex.muscle_groups.join(', ')}
                    </div>
                    <div style="margin-bottom: 8px;">
                      <strong>Descanso:</strong> ${Math.floor(ex.rest_seconds / 60)}:${(ex.rest_seconds % 60).toString().padStart(2, '0')} min | 
                      <strong>Carga:</strong> ${ex.weight_guidance}
                    </div>
                    <p style="margin: 8px 0 0 0; color: #64748b; line-height: 1.4;">${ex.instructions.substring(0, 180)}...</p>
                  </div>
                `).join('')}
              </div>

              <div>
                <h5 style="color: #16a34a; font-size: 18px; margin-bottom: 12px;">🧘 Relaxamento (${workout.cool_down.duration} min)</h5>
                ${workout.cool_down.exercises.slice(0, 2).map(ex => `
                  <div style="margin-bottom: 12px; padding: 12px; background: #f0fdf4; border-radius: 6px; font-size: 14px;">
                    <strong style="font-size: 16px;">${ex.name}</strong> - ${Math.floor(ex.duration / 60)}:${(ex.duration % 60).toString().padStart(2, '0')} min
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
          ${plan.workouts.length > 4 ? `
            <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 12px; margin-top: 20px;">
              <p style="margin: 0; color: #64748b; font-size: 16px;">
                ℹ️ Este PDF mostra os primeiros 4 treinos. O plano completo com todos os ${plan.workouts.length} treinos está disponível na plataforma.
              </p>
            </div>
          ` : ''}
        </div>
        ` : ''}

        ${plan.nutrition_tips && plan.nutrition_tips.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e40af; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">🥗 Dicas Nutricionais</h3>
          ${plan.nutrition_tips.slice(0, 4).map((tip, index) => `
            <div style="margin-bottom: 15px; padding: 15px; background: #eff6ff; border-left: 6px solid #3b82f6; border-radius: 6px;">
              <p style="margin: 0; color: #1e40af; font-size: 15px; line-height: 1.5;">${tip}</p>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div style="margin-top: 40px; padding-top: 25px; border-top: 3px solid #e2e8f0; text-align: center; page-break-inside: avoid;">
          <div style="margin-bottom: 20px;">
            <p style="margin: 0; color: #64748b; font-size: 16px;">
              📱 Continue acompanhando sua evolução em <strong>app.fitaipro.com</strong>
            </p>
          </div>
          <div style="background: #fee2e2; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <p style="margin: 0; color: #dc2626; font-size: 14px; font-weight: bold; line-height: 1.4;">
              ⚠️ AVISO LEGAL: Este plano é personalizado e protegido por direitos autorais. 
              É proibida a reprodução, distribuição ou comercialização sem autorização da FitAI Pro.
            </p>
          </div>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} • 
            FitAI Pro © ${new Date().getFullYear()} • Todos os direitos reservados
          </p>
        </div>
      `;

      // Capturar como imagem com configurações otimizadas
      const canvas = await html2canvas(element, {
        scale: 1.5, // Reduzido de 2 para 1.5
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: false,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Remover elemento temporário
      document.body.removeChild(element);

      // Criar PDF com configurações otimizadas
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 0.8); // JPEG com qualidade 80% em vez de PNG
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calcular dimensões para ocupar toda a página
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // Centralizar na página
      const imgX = (pdfWidth - finalWidth) / 2;
      const imgY = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'JPEG', imgX, imgY, finalWidth, finalHeight);

      // Nome do arquivo personalizado
      const fileName = `FitAI_Pro_${plan.title.replace(/[^a-zA-Z0-9]/g, '_')}_${userName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
      
      pdf.save(fileName);

      toast({
        title: "PDF Gerado com Sucesso! 🎉",
        description: "Seu plano personalizado foi baixado com tamanho otimizado.",
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao Gerar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <FileText className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">PDF disponível apenas para assinantes</span>
      </div>
    );
  }

  return (
    <Button
      onClick={generatePDF}
      variant="outline"
      className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
    >
      <Download className="h-4 w-4" />
      Baixar PDF Personalizado
    </Button>
  );
};

export default PDFGenerator;
