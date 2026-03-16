// Shared utility functions for admin pages

export const getFormTypeLabel = (formType: string): string => {
  const labels: Record<string, string> = {
    form4: 'Form 4',
    form6: 'Form 6',
    collegeTranscript: 'College Transcript',
    collegeAttestation: 'College Attestation',
    stateDiploma: 'State Diploma',
    bachelorDiploma: 'Bachelor Diploma',
    highSchoolAttestation: 'High School Attestation',
    stateExamAttestation: 'State Exam Attestation',
    generalDocument: 'General Document',
  };
  return labels[formType] || formType;
};

export const formatDate = (dateString: string): string =>
  dateString
    ? new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

export const formatDateLong = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);

export const timeAgo = (dateString: string): string => {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
};

export const getActionStyle = (action: string) => {
  if (action.startsWith('user.create')) return { label: 'Created user', color: 'text-blue-400', bg: 'bg-blue-500/10' };
  if (action.startsWith('user.roleChange')) return { label: 'Changed role', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
  if (action.startsWith('user.deactivate')) return { label: 'Deactivated user', color: 'text-red-400', bg: 'bg-red-500/10' };
  if (action.startsWith('user.reactivate')) return { label: 'Reactivated user', color: 'text-green-400', bg: 'bg-green-500/10' };
  if (action.startsWith('partner.create')) return { label: 'Created partner', color: 'text-purple-400', bg: 'bg-purple-500/10' };
  if (action.startsWith('partner.update')) return { label: 'Updated partner', color: 'text-purple-400', bg: 'bg-purple-500/10' };
  if (action.startsWith('document.delete')) return { label: 'Deleted document', color: 'text-red-400', bg: 'bg-red-500/10' };
  if (action.startsWith('settings')) return { label: 'Updated settings', color: 'text-slate-400', bg: 'bg-slate-500/10' };
  return { label: action, color: 'text-slate-400', bg: 'bg-slate-500/10' };
};
