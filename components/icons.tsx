
import * as React from 'react';

const iconProps = {
  className: "w-6 h-6",
  strokeWidth: 1.5,
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
    <path d="M9 22V12h6v10"></path>
  </svg>
);

export const DashboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path d="M4 4h6v8H4zM4 16h6v4H4zM14 12h6v8h-6zM14 4h6v4h-6z"></path>
  </svg>
);

export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
  </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path d="M12 4.5v15m7.5-7.5h-15"></path>
  </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24" >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

export const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 2l4 4-4 4" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12a9 9 0 019-9h9" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 22l-4-4 4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9H3" />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M19 17v4m-2-2h4M14 5l2-2 2 2M10 19l-2 2-2-2" />
    </svg>
);

export const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 13h10M7 17h5" />
  </svg>
);

export const WalletIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

export const DatabaseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const TargetIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

export const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const DocumentAddIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.083A6.002 6.002 0 0112 5a6 6 0 015.917 5H18v2.833A6.002 6.002 0 0112 19a6 6 0 01-5.917-5H6v-2.833A6.002 6.002 0 0111 5.083z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19v2m-4-6.833V19M16 12.167V19" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 100 4h8a2 2 0 100-4H8z" />
  </svg>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export const DuplicateIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);
