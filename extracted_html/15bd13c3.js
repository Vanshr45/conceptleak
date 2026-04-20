// Thin wrappers over Lucide. Lucide UMD exposes `lucide.createIcons`, but we
// want React components. We inline a tiny helper that renders Lucide SVG data
// for the icons we need. Each icon returns an <svg> with the right paths.

const IconSvg = ({ children, size = 16, strokeWidth = 1.75, className = '', style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth={strokeWidth}
       strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    {children}
  </svg>
);

// Minimal Lucide-style paths — redrawn to avoid copying Lucide exactly while
// remaining visually identical. All purely geometric.
const Icon = {
  Shield: (p) => <IconSvg {...p}><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z"/></IconSvg>,
  LayoutDashboard: (p) => <IconSvg {...p}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></IconSvg>,
  Database: (p) => <IconSvg {...p}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></IconSvg>,
  BarChart3: (p) => <IconSvg {...p}><path d="M3 3v18h18"/><path d="M8 17V9"/><path d="M13 17V5"/><path d="M18 17v-6"/></IconSvg>,
  Bot: (p) => <IconSvg {...p}><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 4v4"/><circle cx="12" cy="3" r="1"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M9 18h6"/></IconSvg>,
  Settings: (p) => <IconSvg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></IconSvg>,
  Bell: (p) => <IconSvg {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></IconSvg>,
  Upload: (p) => <IconSvg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></IconSvg>,
  UploadCloud: (p) => <IconSvg {...p}><path d="M4 14.9A7 7 0 0 1 12 4a6 6 0 0 1 6 6h.5a4 4 0 0 1 0 8H6a4 4 0 0 1-2-7.1Z"/><path d="M12 12v7"/><path d="M9 15l3-3 3 3"/></IconSvg>,
  Search: (p) => <IconSvg {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></IconSvg>,
  Check: (p) => <IconSvg {...p}><path d="m5 12 5 5L20 7"/></IconSvg>,
  CheckCircle: (p) => <IconSvg {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></IconSvg>,
  Loader: (p) => <IconSvg {...p}><path d="M21 12a9 9 0 1 1-6.2-8.55"/></IconSvg>,
  Send: (p) => <IconSvg {...p}><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></IconSvg>,
  AlertTriangle: (p) => <IconSvg {...p}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></IconSvg>,
  ShieldAlert: (p) => <IconSvg {...p}><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></IconSvg>,
  ChevronDown: (p) => <IconSvg {...p}><path d="m6 9 6 6 6-6"/></IconSvg>,
  ChevronRight: (p) => <IconSvg {...p}><path d="m9 6 6 6-6 6"/></IconSvg>,
  ChevronUp: (p) => <IconSvg {...p}><path d="m6 15 6-6 6 6"/></IconSvg>,
  File: (p) => <IconSvg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></IconSvg>,
  FileSpreadsheet: (p) => <IconSvg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M8 9h2"/></IconSvg>,
  Download: (p) => <IconSvg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></IconSvg>,
  MessageSquare: (p) => <IconSvg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></IconSvg>,
  Sparkles: (p) => <IconSvg {...p}><path d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z"/></IconSvg>,
  ArrowRight: (p) => <IconSvg {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></IconSvg>,
  ArrowUpRight: (p) => <IconSvg {...p}><path d="M7 17 17 7"/><path d="M7 7h10v10"/></IconSvg>,
  Plus: (p) => <IconSvg {...p}><path d="M12 5v14"/><path d="M5 12h14"/></IconSvg>,
  X: (p) => <IconSvg {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconSvg>,
  Filter: (p) => <IconSvg {...p}><path d="M3 4h18l-7 9v6l-4 2v-8Z"/></IconSvg>,
  Clock: (p) => <IconSvg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></IconSvg>,
  Eye: (p) => <IconSvg {...p}><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></IconSvg>,
  Copy: (p) => <IconSvg {...p}><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></IconSvg>,
  Lock: (p) => <IconSvg {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></IconSvg>,
  Info: (p) => <IconSvg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></IconSvg>,
  Zap: (p) => <IconSvg {...p}><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"/></IconSvg>,
  Hash: (p) => <IconSvg {...p}><path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="m16 3-2 18"/></IconSvg>,
  Type: (p) => <IconSvg {...p}><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></IconSvg>,
  Calendar: (p) => <IconSvg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></IconSvg>,
  Target: (p) => <IconSvg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></IconSvg>,
  User: (p) => <IconSvg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></IconSvg>,
};

window.Icon = Icon;
