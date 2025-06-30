
export interface ExerciseMedia {
  type: 'image' | 'gif' | 'video';
  url: string;
  thumbnail?: string;
  alt: string;
}

export interface MuscleGroup {
  primary: string[];
  secondary: string[];
  stabilizer: string[];
}

export interface ExerciseVisual {
  images: ExerciseMedia[];
  demonstration_gif?: string;
  muscle_diagram?: {
    front_view?: string;
    back_view?: string;
    side_view?: string;
  };
  difficulty_visualization?: 'beginner' | 'intermediate' | 'advanced';
}

export interface EnhancedExercise {
  name: string;
  muscle_groups: string[];
  sets: number;
  reps: string;
  rest_seconds: number;
  weight_guidance: string;
  instructions: string;
  form_cues: string[];
  progression_notes: string;
  visuals?: ExerciseVisual;
  muscle_anatomy?: MuscleGroup;
}
