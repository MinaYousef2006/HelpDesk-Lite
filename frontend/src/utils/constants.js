export const CATEGORIES = ['Technical', 'Hardware', 'Access Request', 'Other'];
export const URGENCY_LEVELS = ['Low', 'Medium', 'High'];
export const STATUSES = ['New', 'In Progress', 'Need Info', 'Resolved'];
export const ROLES = {
  CLIENT: 'Client',
  AGENT: 'Support_Agent',
  MANAGER: 'Manager',
};

export const STATUS_COLORS = {
  New: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Need Info': 'bg-orange-100 text-orange-700',
  Resolved: 'bg-green-100 text-green-700',
};

export const URGENCY_COLORS = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

export const FAQ_ITEMS = [
  {
    title: 'Reset Password',
    content:
      'Go to your account settings and click "Change Password". Enter your current password and set a new one. If locked out, contact IT support.',
  },
  {
    title: 'VPN Connection',
    content:
      'Ensure your VPN client is up to date. Check your internet connection, then try reconnecting. Contact support if issues persist after restarting the client.',
  },
  {
    title: 'Printer Problem',
    content:
      'Verify the printer is powered on and connected to the network. Check for paper jams and ensure the correct printer is selected in your print dialog.',
  },
  {
    title: 'Email Setup',
    content:
      'Use your company email and password in Outlook or your mail client. Server settings: IMAP/SMTP with your company domain. Contact IT for specific configuration.',
  },
  {
    title: 'Software Installation',
    content:
      'Submit a ticket with the software name and business justification. Approved software will be installed remotely by the IT team within 24-48 hours.',
  },
];
