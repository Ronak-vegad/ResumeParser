import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ParsedResume } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface ParsedDataScreenProps {
  data: ParsedResume;
  fileName: string;
  onReset: () => void;
  onSubmit: () => void;
}

export default function ParsedDataScreen({ data: initialData, fileName, onReset, onSubmit }: ParsedDataScreenProps) {
  const [data, setData] = useState<ParsedResume>(initialData);
  const [skillInput, setSkillInput] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Card entrance animations
  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll('.card-surface');
    if (!cards) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power2.out',
          delay: 0.3,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // Modal animation
  useEffect(() => {
    if (showConfirm && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [showConfirm]);

  const updateField = useCallback((section: string, field: string, value: string) => {
    setData((prev) => {
      const sectionData = prev[section as keyof ParsedResume];
      if (typeof sectionData === 'string' || Array.isArray(sectionData)) {
        return prev;
      }
      return {
        ...prev,
        [section]: {
          ...(sectionData as Record<string, string>),
          [field]: value,
        },
      };
    });
  }, []);

  const addSkill = useCallback(() => {
    if (!skillInput.trim()) return;
    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()],
    }));
    setSkillInput('');
  }, [skillInput]);

  const removeSkill = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }, []);

  const addWorkExperience = useCallback(() => {
    setData((prev) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        { company: '', role: '', startDate: '', endDate: '', description: '' },
      ],
    }));
  }, []);

  const removeWorkExperience = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }));
  }, []);

  const updateWorkExperience = useCallback((index: number, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  }, []);

  const addProject = useCallback(() => {
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, { name: '', link: '', description: '' }],
    }));
  }, []);

  const removeProject = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  }, []);

  const updateProject = useCallback((index: number, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj, i) =>
        i === index ? { ...proj, [field]: value } : proj
      ),
    }));
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    setShowConfirm(false);
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="min-h-screen relative z-10 parsed-neon">
      {/* Top Bar */}
      <div className="sticky top-0 z-[100] border-b border-[#2A2A2A]" style={{ background: 'rgba(15, 15, 15, 0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center justify-between px-4 lg:px-12 h-16 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7FB3FF]">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div>
              <span className="text-base font-semibold text-white">Resume Parser Pro</span>
              <span className="hidden sm:inline text-xs text-text-secondary ml-3">AI-Powered Extraction</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onReset} className="btn-ghost hidden sm:inline-flex">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Parse Another
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="h-9 px-5 text-sm rounded-lg font-semibold transition-all neon-cta"
              style={{
                background: 'linear-gradient(180deg, #3A4A64 0%, #2C3A52 100%)',
                color: '#FFFFFF',
              }}
            >
              Confirm &amp; Submit
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 lg:px-12 py-8 max-w-[1600px] mx-auto">
        {/* Status Row */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
            style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[13px] font-medium text-success">Parsed successfully</span>
          </div>
          <span className="text-[13px] text-text-secondary">{fileName}</span>
        </div>

        {/* Form Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Personal Info */}
          <div className="card-surface p-7">
            <h3 className="font-body text-2xl font-medium tracking-[-0.01em] text-white mb-5">
              Personal Info
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Jane Doe"
                  value={data.personalInfo.fullName}
                  onChange={(e) => updateField('personalInfo', 'fullName', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Job Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Software Engineer"
                  value={data.personalInfo.jobTitle}
                  onChange={(e) => updateField('personalInfo', 'jobTitle', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Location</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="City, Country"
                  value={data.personalInfo.location}
                  onChange={(e) => updateField('personalInfo', 'location', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card-surface p-7">
            <h3 className="font-body text-2xl font-medium tracking-[-0.01em] text-white mb-5">
              Contact
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="field-label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="jane@example.com"
                  value={data.contact.email}
                  onChange={(e) => updateField('contact', 'email', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+1 555 000 0000"
                  value={data.contact.phone}
                  onChange={(e) => updateField('contact', 'phone', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">LinkedIn / Portfolio</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="linkedin.com/in/jane"
                  value={data.contact.linkedIn}
                  onChange={(e) => updateField('contact', 'linkedIn', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Skills - Full Width */}
          <div className="card-surface p-7 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-body text-2xl font-medium tracking-[-0.01em] text-white">
                Skills
              </h3>
            </div>
            <div className="flex flex-wrap gap-2.5 items-center">
              {data.skills.map((skill, index) => (
                <div key={`${skill}-${index}`} className="skill-chip">
                  {skill}
                  <button
                    className="remove-btn"
                    onClick={() => removeSkill(index)}
                    aria-label={`Remove ${skill}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <div className="flex items-center">
                <input
                  type="text"
                  className="bg-transparent border border-dashed border-[#2A2A2A] rounded-full px-3.5 py-1.5 text-[13px] text-white placeholder-[#555555] outline-none focus:border-[#6AA7FF] focus:border-solid transition-all min-w-[140px]"
                  placeholder="Type and press Enter..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Professional Summary - Full Width */}
          <div className="card-surface p-7 lg:col-span-2">
            <h3 className="font-body text-2xl font-medium tracking-[-0.01em] text-white mb-5">
              Professional Summary
            </h3>
            <textarea
              className="input-field min-h-[120px] resize-y"
              placeholder="Brief overview of your professional background..."
              value={data.professionalSummary}
              onChange={(e) =>
                setData((prev) => ({ ...prev, professionalSummary: e.target.value }))
              }
            />
          </div>

          {/* Work Experience - Full Width */}
          <div className="card-surface p-7 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-body text-2xl font-medium tracking-[-0.01em] text-white">
                Work Experience
              </h3>
              <button
                onClick={addWorkExperience}
                className="text-[#7FB3FF] text-sm font-medium hover:text-[#A7C8FF] transition-colors"
              >
                + Add Experience
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {data.workExperience.map((exp, index) => (
                <div
                  key={index}
                  className="bg-surface-light border border-[#2A2A2A] rounded-xl p-5 relative"
                >
                  <button
                    onClick={() => removeWorkExperience(index)}
                    className="absolute top-4 right-4 text-xs text-[#7FB3FF] hover:text-[#A7C8FF] transition-colors"
                  >
                    Remove
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="field-label">Company</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Company name"
                        value={exp.company}
                        onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">Role / Title</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Job title"
                        value={exp.role}
                        onChange={(e) => updateWorkExperience(index, 'role', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">Start Date</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Jan 2020"
                        value={exp.startDate}
                        onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">End Date</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Present"
                        value={exp.endDate}
                        onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="field-label">Description</label>
                    <textarea
                      className="input-field min-h-[80px] resize-y"
                      placeholder="Describe your responsibilities and achievements..."
                      value={exp.description}
                      onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card-surface p-7">
            <h3 className="font-body text-2xl font-medium tracking-[-0.01em] text-white mb-5">
              Education
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="field-label">Degree</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="B.Tech Computer Science"
                  value={data.education.degree}
                  onChange={(e) => updateField('education', 'degree', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Institution</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="MIT"
                  value={data.education.institution}
                  onChange={(e) => updateField('education', 'institution', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Year</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="2022"
                  value={data.education.year}
                  onChange={(e) => updateField('education', 'year', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="card-surface p-7">
            <h3 className="font-body text-2xl font-medium tracking-[-0.01em] text-white mb-5">
              Additional Info
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="field-label">Languages</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="English, Hindi"
                  value={data.additionalInfo.languages}
                  onChange={(e) => updateField('additionalInfo', 'languages', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">GitHub / Portfolio</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="github.com/jane"
                  value={data.additionalInfo.github}
                  onChange={(e) => updateField('additionalInfo', 'github', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Certifications</label>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  placeholder="AWS Certified, Google Cloud..."
                  value={data.additionalInfo.certifications}
                  onChange={(e) => updateField('additionalInfo', 'certifications', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Projects - Full Width */}
          <div className="card-surface p-7 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-body text-2xl font-medium tracking-[-0.01em] text-white">
                Projects
              </h3>
              <button
                onClick={addProject}
                className="text-[#7FB3FF] text-sm font-medium hover:text-[#A7C8FF] transition-colors"
              >
                + Add Project
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {data.projects.map((proj, index) => (
                <div
                  key={index}
                  className="bg-surface-light border border-[#2A2A2A] rounded-xl p-5 relative"
                >
                  <button
                    onClick={() => removeProject(index)}
                    className="absolute top-4 right-4 text-xs text-[#7FB3FF] hover:text-[#A7C8FF] transition-colors"
                  >
                    Remove
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="field-label">Project Name</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Project name"
                        value={proj.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">Project Link</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="https://..."
                        value={proj.link}
                        onChange={(e) => updateProject(index, 'link', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="field-label">Description</label>
                    <textarea
                      className="input-field min-h-[60px] resize-y"
                      placeholder="Describe your project..."
                      value={proj.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 pb-12 mt-6 border-t border-[#2A2A2A]">
          <p className="text-[13px] text-text-secondary">
            Review all fields before submitting. You can edit any field above.
          </p>
          <button
            onClick={() => setShowConfirm(true)}
            className="h-12 px-6 rounded-lg font-semibold transition-all inline-flex items-center gap-2 neon-cta"
            style={{
              background: 'linear-gradient(180deg, #3A4A64 0%, #2C3A52 100%)',
              color: '#FFFFFF',
            }}
          >
            Confirm &amp; Submit
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            ref={modalRef}
            className="rounded-2xl p-8 max-w-[400px] w-[90%] mx-4"
            style={{
              background: 'rgba(20, 20, 20, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-white mb-2">Confirm Submission</h3>
            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to submit? Please review all fields before confirming.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="h-9 px-5 text-sm rounded-lg font-semibold transition-all neon-cta"
                style={{
                  background: 'linear-gradient(180deg, #3A4A64 0%, #2C3A52 100%)',
                  color: '#FFFFFF',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
