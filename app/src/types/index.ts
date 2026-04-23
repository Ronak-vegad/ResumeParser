export interface ParsedResume {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    location: string;
  };
  contact: {
    email: string;
    phone: string;
    linkedIn: string;
  };
  skills: string[];
  professionalSummary: string;
  workExperience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: {
    degree: string;
    institution: string;
    year: string;
  };
  additionalInfo: {
    languages: string;
    certifications: string;
    github: string;
  };
  projects: Array<{
    name: string;
    link: string;
    description: string;
  }>;
}

export type Screen = 'upload' | 'parsed' | 'success';

export interface UploadState {
  file: File | null;
  status: 'idle' | 'selected' | 'analyzing' | 'parsed';
  fileName: string;
  fileSize: string;
}
