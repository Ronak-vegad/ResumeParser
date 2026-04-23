import { useState, useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import UploadScreen from '@/components/UploadScreen';
import ParsedDataScreen from '@/components/ParsedDataScreen';
import SuccessScreen from '@/components/SuccessScreen';
import { API_BASE, authHeaders, clearToken } from '@/lib/api';
import type { ParsedResume, Screen } from '@/types';

gsap.registerPlugin(ScrollTrigger);

type BackendParsedResume = {
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  location?: string | null;
  professional_summary?: string | null;
  technical_skills?: {
    languages?: string[];
    developer_tools?: string[];
    frameworks?: string[];
    databases?: string[];
    soft_skills?: string[];
    coursework?: string[];
    areas_of_interest?: string[];
  } | null;
  education?: Array<{
    degree?: string | null;
    institution?: string | null;
    year?: string | null;
  }> | null;
  work_experience?: Array<{
    job_title?: string | null;
    company?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    responsibilities?: string | null;
  }> | null;
  projects?: Array<{
    title?: string | null;
    description?: string | null;
    technologies?: string[] | string | null;
  }> | null;
  achievements?: string[] | null;
};

const toText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const toArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((v) => toText(v)).filter(Boolean);
};

const mapBackendToFrontend = (data: BackendParsedResume): ParsedResume => {
  const skillSections = [
    data.technical_skills?.languages,
    data.technical_skills?.developer_tools,
    data.technical_skills?.frameworks,
    data.technical_skills?.databases,
    data.technical_skills?.soft_skills,
    data.technical_skills?.coursework,
    data.technical_skills?.areas_of_interest,
  ];

  const uniqueSkills = Array.from(
    new Set(skillSections.flatMap((s) => toArray(s)))
  );

  const education0 = data.education?.[0];

  return {
    personalInfo: {
      fullName: toText(data.full_name),
      jobTitle: toText(data.work_experience?.[0]?.job_title),
      location: toText(data.location),
    },
    contact: {
      email: toText(data.email),
      phone: toText(data.phone_number),
      linkedIn: '',
    },
    skills: uniqueSkills,
    professionalSummary: toText(data.professional_summary),
    workExperience: (data.work_experience ?? []).map((exp) => ({
      company: toText(exp.company),
      role: toText(exp.job_title),
      startDate: toText(exp.start_date),
      endDate: toText(exp.end_date),
      description: toText(exp.responsibilities),
    })),
    education: {
      degree: toText(education0?.degree),
      institution: toText(education0?.institution),
      year: toText(education0?.year),
    },
    additionalInfo: {
      languages: toArray(data.technical_skills?.languages).join(', '),
      certifications: toArray(data.achievements).join(', '),
      github: '',
    },
    projects: (data.projects ?? []).map((proj) => ({
      name: toText(proj.title),
      link: '',
      description: toText(proj.description) || (Array.isArray(proj.technologies) ? proj.technologies.join(', ') : toText(proj.technologies)),
    })),
  };
};

const isParsedResumeEmpty = (parsed: ParsedResume): boolean =>
  !parsed.personalInfo.fullName &&
  !parsed.contact.email &&
  !parsed.professionalSummary &&
  parsed.skills.length === 0 &&
  parsed.workExperience.length === 0 &&
  parsed.projects.length === 0;

export default function ResumeParserApp() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [fileName, setFileName] = useState('');
  const uploadRef = useRef<HTMLDivElement>(null);
  const parsedRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [screen]);

  const transitionTo = useCallback(
    (targetScreen: Screen) => {
      const currentRef =
        screen === 'upload' ? uploadRef : screen === 'parsed' ? parsedRef : successRef;
      const targetRef =
        targetScreen === 'upload' ? uploadRef : targetScreen === 'parsed' ? parsedRef : successRef;

      if (!currentRef.current || !targetRef.current) {
        setScreen(targetScreen);
        return;
      }

      const tl = gsap.timeline();

      if (screen === 'upload' && targetScreen === 'parsed') {
        tl.to(currentRef.current, { opacity: 0, y: -40, duration: 0.4, ease: 'power2.in' });
        tl.set(targetRef.current, { opacity: 0, x: 60, display: 'flex' });
        tl.to(targetRef.current, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
      } else if (screen === 'parsed' && targetScreen === 'success') {
        tl.to(currentRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' });
        tl.set(targetRef.current, { opacity: 0, scale: 0.85, display: 'flex' });
        tl.to(targetRef.current, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)' });
      } else {
        tl.to(currentRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' });
        tl.set(targetRef.current, { opacity: 0, x: -40, display: 'flex' });
        tl.to(targetRef.current, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' });
      }

      tl.call(() => {
        setScreen(targetScreen);
        if (currentRef.current) {
          gsap.set(currentRef.current, { display: 'none' });
        }
      });
    },
    [screen]
  );

  const handleAnalyze = useCallback(
    async (file: File) => {
      setFileName(file.name);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/parse-resume`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });

      if (response.status === 401) {
        clearToken();
        throw new Error('Session expired. Please log in again to upload and parse your resume.');
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.detail || 'Failed to parse resume.';
        throw new Error(
          Array.isArray(message) ? 'Failed to parse resume.' : String(message)
        );
      }

      const backendData = (await response.json()) as BackendParsedResume;
      const mapped = mapBackendToFrontend(backendData);

      if (isParsedResumeEmpty(mapped)) {
        throw new Error('Unable to extract enough data from this file. Please upload a clearer resume PDF/DOCX.');
      }

      setParsedData(mapped);
      transitionTo('parsed');
    },
    [transitionTo]
  );

  const handleSubmit = useCallback(() => {
    transitionTo('success');
  }, [transitionTo]);

  const handleReset = useCallback(() => {
    setParsedData(null);
    setFileName('');
    transitionTo('upload');
  }, [transitionTo]);

  return (
    <div className="relative min-h-screen bg-app-bg overflow-hidden">
      <div
        ref={uploadRef}
        className={`screen ${screen === 'upload' ? 'active' : ''}`}
        style={{ display: screen === 'upload' ? 'block' : 'none' }}
      >
        <UploadScreen onAnalyze={handleAnalyze} />
      </div>

      <div
        ref={parsedRef}
        className={`screen ${screen === 'parsed' ? 'active' : ''}`}
        style={{ display: screen === 'parsed' ? 'block' : 'none' }}
      >
        {parsedData && (
          <ParsedDataScreen
            data={parsedData}
            fileName={fileName}
            onReset={handleReset}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      <div
        ref={successRef}
        className={`screen ${screen === 'success' ? 'active' : ''}`}
        style={{ display: screen === 'success' ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}
      >
        <SuccessScreen onReset={handleReset} />
      </div>
    </div>
  );
}
