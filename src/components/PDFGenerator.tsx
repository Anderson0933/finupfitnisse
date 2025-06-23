
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
      element.style.width = '794px'; // A4 width em pixels (210mm)
      element.style.padding = '40px';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.backgroundColor = 'white';
      document.body.appendChild(element);

      // Gerar conteúdo HTML para o PDF
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px;">
            <div style="width: 40px; height: 40px; background: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: bold;">💪</span>
            </div>
            <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: bold;">FitAI Pro</h1>
          </div>
          <p style="color: #64748b; margin: 0; font-size: 14px;">Plano Personalizado Gerado por IA</p>
          <div style="margin-top: 15px; padding: 10px; background: #f1f5f9; border-radius: 8px;">
            <p style="margin: 0; color: #475569; font-size: 12px;">
              ⚠️ Este plano foi criado exclusivamente para <strong>${userName}</strong> • Todos os direitos reservados FitAI Pro © ${new Date().getFullYear()}
            </p>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #1e40af; font-size: 24px; margin-bottom: 10px;">${plan.title}</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.5;">${plan.description}</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
            <div style="padding: 15px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <strong style="color: #1e40af;">Nível:</strong> ${plan.difficulty_level.charAt(0).toUpperCase() + plan.difficulty_level.slice(1)}
            </div>
            <div style="padding: 15px; background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
              <strong style="color: #16a34a;">Duração:</strong> ${plan.duration_weeks} semanas
            </div>
            ${plan.total_workouts ? `
            <div style="padding: 15px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px;">
              <strong style="color: #ca8a04;">Total de Treinos:</strong> ${plan.total_workouts}
            </div>
            ` : ''}
          </div>
        </div>

        ${plan.workouts && plan.workouts.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #1e40af; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">📋 Treinos Detalhados</h3>
          ${plan.workouts.slice(0, 6).map((workout, index) => `
            <div style="margin-bottom: 20px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fafafa;">
              <h4 style="color: #2563eb; font-size: 16px; margin-bottom: 8px;">${workout.title}</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px; font-size: 12px;">
                <span><strong>Semana:</strong> ${workout.week}</span>
                <span><strong>Dia:</strong> ${workout.day}</span>
                <span><strong>Duração:</strong> ~${workout.estimated_duration} min</span>
                <span><strong>Foco:</strong> ${workout.focus}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <h5 style="color: #dc2626; font-size: 14px; margin-bottom: 8px;">🔥 Aquecimento (${workout.warm_up.duration} min)</h5>
                ${workout.warm_up.exercises.slice(0, 2).map(ex => `
                  <div style="margin-bottom: 8px; padding: 8px; background: #fef2f2; border-radius: 4px; font-size: 11px;">
                    <strong>${ex.name}</strong> - ${Math.floor(ex.duration / 60)}:${(ex.duration % 60).toString().padStart(2, '0')} min
                    <p style="margin: 4px 0 0 0; color: #64748b;">${ex.instructions.substring(0, 100)}...</p>
                  </div>
                `).join('')}
              </div>

              <div style="margin-bottom: 15px;">
                <h5 style="color: #2563eb; font-size: 14px; margin-bottom: 8px;">💪 Exercícios Principais</h5>
                ${workout.main_exercises.slice(0, 3).map(ex => `
                  <div style="margin-bottom: 12px; padding: 10px; background: #f8fafc; border-radius: 4px; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                      <strong style="color: #1e40af;">${ex.name}</strong>
                      <span style="color: #64748b;">${ex.sets} séries × ${ex.reps}</span>
                    </div>
                    <div style="margin-bottom: 6px;">
                      <strong>Músculos:</strong> ${ex.muscle_groups.join(', ')}
                    </div>
                    <div style="margin-bottom: 6px;">
                      <strong>Descanso:</strong> ${Math.floor(ex.rest_seconds / 60)}:${(ex.rest_seconds % 60).toString().padStart(2, '0')} min | 
                      <strong>Carga:</strong> ${ex.weight_guidance}
                    </div>
                    <p style="margin: 6px 0 0 0; color: #64748b;">${ex.instructions.substring(0, 120)}...</p>
                  </div>
                `).join('')}
              </div>

              <div>
                <h5 style="color: #16a34a; font-size: 14px; margin-bottom: 8px;">🧘 Relaxamento (${workout.cool_down.duration} min)</h5>
                ${workout.cool_down.exercises.slice(0, 2).map(ex => `
                  <div style="margin-bottom: 8px; padding: 8px; background: #f0fdf4; border-radius: 4px; font-size: 11px;">
                    <strong>${ex.name}</strong> - ${Math.floor(ex.duration / 60)}:${(ex.duration % 60).toString().padStart(2, '0')} min
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
          ${plan.workouts.length > 6 ? `
            <div style="text-align: center; padding: 15px; background: #f1f5f9; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                ℹ️ Este PDF mostra os primeiros 6 treinos. O plano completo com todos os ${plan.workouts.length} treinos está disponível na plataforma.
              </p>
            </div>
          ` : ''}
        </div>
        ` : ''}

        ${plan.nutrition_tips && plan.nutrition_tips.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #1e40af; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">🥗 Dicas Nutricionais</h3>
          ${plan.nutrition_tips.slice(0, 4).map((tip, index) => `
            <div style="margin-bottom: 10px; padding: 12px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af; font-size: 12px; line-height: 1.4;">${tip}</p>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
          <div style="margin-bottom: 15px;">
            <p style="margin: 0; color: #64748b; font-size: 12px;">
              📱 Continue acompanhando sua evolução em <strong>app.fitaipro.com</strong>
            </p>
          </div>
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 0; color: #dc2626; font-size: 11px; font-weight: bold;">
              ⚠️ AVISO LEGAL: Este plano é personalizado e protegido por direitos autorais. 
              É proibida a reprodução, distribuição ou comercialização sem autorização da FitAI Pro.
            </p>
          </div>
          <p style="margin: 0; color: #9ca3af; font-size: 10px;">
            Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} • 
            FitAI Pro © ${new Date().getFullYear()} • Todos os direitos reservados
          </p>
        </div>
      `;

      // Capturar como imagem e converter para PDF
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Remover elemento temporário
      document.body.removeChild(element);

      // Criar PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Nome do arquivo personalizado
      const fileName = `FitAI_Pro_${plan.title.replace(/[^a-zA-Z0-9]/g, '_')}_${userName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
      
      pdf.save(fileName);

      toast({
        title: "PDF Gerado com Sucesso! 🎉",
        description: "Seu plano personalizado foi baixado.",
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
