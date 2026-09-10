import { getSupabaseClient } from './supabase.js';

export const CACHE_VERSION = 'v2.6.0';
const STORAGE_KEY = 'portfolio_master_cache';
const VERSION_KEY = 'portfolio_cache_version';

export async function hashPassword(text) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Default initial database seed
export const DEFAULT_DATABASE = {
  profile: {
    name: 'Harkeerat Singh',
    role: 'Senior Full-Stack & AI Systems Architect',
    bio: 'Architecting ultra-low-latency distributed platforms, production LLM inference pipelines, and framework-less reactive interfaces. Passionate about systems engineering, real-time telemetry, and resilient cloud architectures.',
    location: 'San Francisco, CA & Remote',
    email: 'harkeerat.singh.dev@gmail.com',
    github: 'https://github.com/arnav-jain700',
    linkedin: 'https://linkedin.com/in/arnav-jain700',
    resumeUrl: '?print=resume',
    cvUrl: '?print=cv'
  },
  journey: [
    {
      id: 'j-1',
      role: 'Staff AI Systems Architect',
      company: 'NeuroMatrix AI Labs',
      date: '2023 — Present',
      type: 'experience',
      description: 'Engineered high-throughput distributed LLM inference clusters serving 15M+ requests/day. Implemented continuous batching and KV-cache optimization, reducing TTFT (Time-to-First-Token) by 42% while slicing cloud GPU spend by 35%.'
    },
    {
      id: 'j-2',
      role: 'Lead Full-Stack Infrastructure Engineer',
      company: 'AetherScale Technologies',
      date: '2021 — 2023',
      type: 'experience',
      description: 'Directed migration of monolithic services to resilient Kubernetes micro-frontends and event-driven Golang/Node.js backends. Built real-time collaboration engines using WebSockets and conflict-free replicated data types (CRDTs).'
    },
    {
      id: 'j-3',
      role: 'Senior Systems Engineer',
      company: 'Vanguard Cyber Systems',
      date: '2019 — 2021',
      type: 'experience',
      description: 'Designed low-latency financial telemetry ingestion pipelines handling 80,000 events/sec with Apache Kafka, ClickHouse, and high-performance WebGL dashboard visualizations.'
    },
    {
      id: 'j-4',
      role: 'B.Tech in Computer Science & Engineering',
      company: 'National Institute of Technology',
      date: '2015 — 2019',
      type: 'education',
      description: 'Graduated with Honors (Top 5%). Authored thesis on Distributed Consensus Algorithms under Network Partition Conditions. President of Open Source & Algorithmic Programming Society.'
    }
  ],
  skills: [
    { id: 's-1', name: 'TypeScript / JavaScript (ESNext)', category: 'Technical', icon: 'code' },
    { id: 's-2', name: 'Framework-less Vanilla Architecture & WebGL', category: 'Technical', icon: 'layers' },
    { id: 's-3', name: 'React, Next.js & Micro-Frontends', category: 'Technical', icon: 'code' },
    { id: 's-4', name: 'Modern CSS & Performance Profiling', category: 'Technical', icon: 'sparkles' },
    { id: 's-5', name: 'Node.js, Express & Fastify', category: 'Technical', icon: 'terminal' },
    { id: 's-6', name: 'Golang Distributed Microservices', category: 'Technical', icon: 'cpu' },
    { id: 's-7', name: 'Python (FastAPI, AsyncIO, PyTorch)', category: 'Technical', icon: 'terminal' },
    { id: 's-8', name: 'gRPC, WebSockets & Event-Driven APIs', category: 'Technical', icon: 'layers' },
    { id: 's-9', name: 'PostgreSQL & pgvector Optimization', category: 'Technical', icon: 'database' },
    { id: 's-10', name: 'Redis Cache & Pub/Sub Streams', category: 'Technical', icon: 'database' },
    { id: 's-11', name: 'Vector DBs (Qdrant, Milvus, Supabase)', category: 'Technical', icon: 'database' },
    { id: 's-12', name: 'Apache Kafka & Distributed Message Queues', category: 'Technical', icon: 'layers' },
    { id: 's-13', name: 'Docker, Podman & Container Sandboxing', category: 'Technical', icon: 'cloud' },
    { id: 's-14', name: 'Kubernetes (CKA), Helm & Service Mesh', category: 'Technical', icon: 'cloud' },
    { id: 's-15', name: 'AWS Cloud Infrastructure (ECS, Lambda, S3, RDS)', category: 'Technical', icon: 'cloud' },
    { id: 's-16', name: 'Terraform, CI/CD GitHub Actions & Observability', category: 'Technical', icon: 'shield' },
    { id: 's-17', name: 'Groq API, LLaMA 3.3 & vLLM High-Speed Serving', category: 'Technical', icon: 'sparkles' },
    { id: 's-18', name: 'RAG Systems, Semantic Search & Chunking', category: 'Technical', icon: 'target' },
    { id: 's-19', name: 'LLM Agentic Tool-Use & Prompt Engineering', category: 'Technical', icon: 'bot' },
    { id: 's-20', name: 'Model Evaluation, Fine-Tuning & Quantization', category: 'Technical', icon: 'cpu' },
    { id: 's-21', name: 'Engineering Mentorship & Technical Leadership', category: 'Non Technical', icon: 'award' },
    { id: 's-22', name: 'System Architecture RFCs & Tech Strategy', category: 'Non Technical', icon: 'layers' },
    { id: 's-23', name: 'Agile Delivery & Scrum Methodology', category: 'Non Technical', icon: 'activity' },
    { id: 's-24', name: 'Cross-Functional Product Collaboration', category: 'Non Technical', icon: 'target' },
    { id: 's-25', name: 'Technical Writing & Architecture Specs', category: 'Non Technical', icon: 'file-text' },
    { id: 's-26', name: 'Stakeholder Alignment & Executive Comms', category: 'Non Technical', icon: 'briefcase' }
  ],
  projects: [
    {
      id: 'p-1',
      title: 'NeuroFlow Distributed LLM Inference Router',
      category: 'AI & ML',
      featured: true,
      description: 'Ultra-low latency open-weights LLM orchestration engine with dynamic request batching, token-stream caching, and sub-10ms proxy overhead.',
      longDescription: 'NeuroFlow addresses the bottleneck of concurrent multi-tenant LLM serving. Built with Node.js/Go and Groq hardware acceleration protocols, it dynamically groups inference requests into contiguous compute batches, predicts token lengths to prevent buffer fragmentation, and features automatic failover across distributed GPU clusters.',
      tags: ['Groq LLaMA 3.3', 'Node.js', 'Redis', 'Docker', 'WebSockets'],
      demoUrl: 'https://neuroflow-demo.harkeerat.dev',
      githubUrl: 'https://github.com/arnav-jain700/neuroflow-inference',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'p-2',
      title: 'HyperScale Cloud Vector Indexer',
      category: 'Databases',
      featured: true,
      description: 'Distributed HNSW similarity search engine supporting 50M+ 1536-dimensional embeddings with p99 search latency under 4 milliseconds.',
      longDescription: 'Engineered from scratch to solve memory bottlenecks in standard vector search. HyperScale leverages SIMD vector operations, quantized centroid clustering, and asynchronous memory-mapped disk paging to sustain 50,000 QPS on commodity cloud instances with near-zero precision degradation.',
      tags: ['TypeScript', 'pgvector', 'SIMD', 'Distributed Systems', 'Supabase'],
      demoUrl: 'https://hyperscale-vector.harkeerat.dev',
      githubUrl: 'https://github.com/arnav-jain700/hyperscale-vector',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'p-3',
      title: 'PulseOS Real-Time Kernel Telemetry',
      category: 'Frontend',
      featured: true,
      description: 'Zero-overhead browser performance radar rendering 120 FPS hardware telemetry, CPU thread allocations, and memory bandwidth graphs via Canvas.',
      longDescription: 'PulseOS was built for kernel developers and distributed systems operators needing sub-millisecond hardware visualization without heavyweight browser DOM bloat. Features zero-garbage-collection ring buffers, WebAssembly metric decoders, and custom 60+ FPS chart renderers.',
      tags: ['Vanilla JS', 'HTML5 Canvas', 'WebSockets', 'WebAssembly', 'Performance'],
      demoUrl: 'https://pulseos.harkeerat.dev',
      githubUrl: 'https://github.com/arnav-jain700/pulseos-kernel-radar',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'p-4',
      title: 'Aether Micro-Kernel UI System',
      category: 'Frontend',
      featured: false,
      description: 'Framework-agnostic, zero-dependency modern component system built on web standards, CSS Custom Properties, and strict WCAG AAA contrast.',
      longDescription: 'Aether is a 9KB gzipped design system engineered for ultra-fast, framework-free web platforms. It incorporates a fluid typography scale, precision bento layout grids, accessible ARIA state management, and smooth hardware-accelerated animations.',
      tags: ['CSS3', 'ES6+ Modules', 'WCAG AAA', 'Zero Dependencies'],
      demoUrl: 'https://aether-ui.harkeerat.dev',
      githubUrl: 'https://github.com/arnav-jain700/aether-ui-system',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'p-5',
      title: 'KubeSentinel Autonomous Cluster Healer',
      category: 'DevOps & Cloud',
      featured: false,
      description: 'Operator controller that observes crash-looping microservices, analyzes pod core dumps, and orchestrates zero-downtime rollbacks.',
      longDescription: 'KubeSentinel monitors Kubernetes cluster event streams in real-time. When pod churn or memory leaks breach predictive thresholds, it safely routes ingress traffic to canary pods, extracts diagnostic heap dumps, and generates automated remediation patches.',
      tags: ['Go', 'Kubernetes Operator', 'Prometheus', 'Docker', 'AWS'],
      demoUrl: 'https://kubesentinel.harkeerat.dev',
      githubUrl: 'https://github.com/arnav-jain700/kubesentinel',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop'
    }
  ],
  certificates: [
    {
      id: 'c-1',
      title: 'AWS Certified Solutions Architect - Professional',
      issuer: 'Amazon Web Services (AWS)',
      year: '2024',
      skills: 'Distributed Systems, Multi-Region DR, VPC Peering, Cloud Architecture',
      verifyUrl: 'https://aws.amazon.com/verification',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'c-2',
      title: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      year: '2023',
      skills: 'Cluster Architecture, Storage Orchestration, Networking & Security',
      verifyUrl: 'https://www.cncf.io/certification/cka/',
      image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'c-3',
      title: 'Generative AI with Large Language Models',
      issuer: 'DeepLearning.AI & AWS',
      year: '2024',
      skills: 'LLM Fine-Tuning, RLHF, PEFT, Quantization, RAG Architectures',
      verifyUrl: 'https://coursera.org/verify/deeplearning-genai',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'c-4',
      title: 'Google Cloud Professional Cloud Architect',
      issuer: 'Google Cloud Platform (GCP)',
      year: '2023',
      skills: 'GKE, BigQuery, Global VPC, Cloud Security, Enterprise Migration',
      verifyUrl: 'https://cloud.google.com/certification',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop'
    }
  ],
  codingPlatforms: [
    {
      id: 'cp-1',
      platform: 'LeetCode',
      icon: 'leetcode',
      handle: 'Harkeerat2006',
      profileUrl: 'https://leetcode.com/u/Harkeerat2006/',
      rating: 1636,
      maxRating: 1641,
      badge: 'Active Solver',
      badgeColor: 'var(--accent-mint)',
      ranking: 'Top 19.9% (Global Rank #172,419)',
      totalSolved: 574,
      easySolved: 173,
      mediumSolved: 383,
      hardSolved: 18,
      contestsCount: 17,
      streakDays: 100,
      isLiveSynced: true
    },
    {
      id: 'cp-2',
      platform: 'Codeforces',
      icon: 'codeforces',
      handle: 'harkeerat_s',
      profileUrl: 'https://codeforces.com/profile/arnav-jain700',
      rating: 1945,
      maxRating: 1980,
      badge: 'Candidate Master',
      badgeColor: '#a855f7',
      ranking: 'Top 3.8% Globally',
      totalSolved: 720,
      easySolved: 240,
      mediumSolved: 360,
      hardSolved: 120,
      contestsCount: 54,
      streakDays: 180
    },
    {
      id: 'cp-3',
      platform: 'CodeChef',
      icon: 'codechef',
      handle: 'harkeerat_99',
      profileUrl: 'https://www.codechef.com/users/arnav-jain700',
      rating: 2130,
      maxRating: 2175,
      badge: '5★ Coder',
      badgeColor: 'var(--accent-mint)',
      ranking: 'Global Rank #1,840',
      totalSolved: 480,
      easySolved: 150,
      mediumSolved: 250,
      hardSolved: 80,
      contestsCount: 38,
      streakDays: 120
    },
    {
      id: 'cp-4',
      platform: 'Codolio',
      icon: 'codolio',
      handle: 'harkeerat_dev',
      profileUrl: 'https://codolio.com/profile/arnav-jain700',
      rating: 2350,
      maxRating: 2420,
      badge: 'Grandmaster (Top 0.5%)',
      badgeColor: 'var(--accent-indigo)',
      ranking: 'Global Rank #420 • Master Level',
      totalSolved: 2350,
      easySolved: 700,
      mediumSolved: 1250,
      hardSolved: 400,
      contestsCount: 160,
      streakDays: 365
    }
  ],
  messages: [
    {
      id: 'm-seed-1',
      name: 'Elena Rostova',
      email: 'elena.rostova@venturetech.io',
      subject: 'Inquiry: Founding Staff Architect Role',
      message: 'Hi Harkeerat, loved your work on NeuroFlow and the low-latency LLM serving benchmarks. We are building our next-gen autonomous agent compute cluster and would love to chat regarding our Staff Architect opening.',
      date: '2026-09-08 14:32',
      read: false
    }
  ],
  settings: {
    // SHA-256 for 'Harkeerat0904'
    adminPasswordHash: '5bf02a8662569dea9c6a7beaf51b2d21559b7311921832a588e36d44635b8865',
    groqApiKey: '',
    supabaseUrl: 'https://znlinbqdlixfsfytiqan.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubGluYnFkbGl4ZnNmeXRpcWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTEyMjgsImV4cCI6MjEwNDUyNzIyOH0.qfd-oNbdIx3TluvQRoktxSucTXBfwIInaOxDRkzdC-U',
    lastSyncTimestamp: null
  }
};

/**
 * Load database with automatic cache versioning and state sanitization
 */
export function loadData() {
  try {
    const cachedVersion = localStorage.getItem(VERSION_KEY);
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (!rawData || cachedVersion !== CACHE_VERSION) {
      console.info(`[DataLayer] Initializing or upgrading cache to ${CACHE_VERSION}`);
      let existingSettings = null;
      if (rawData) {
        try {
          const old = JSON.parse(rawData);
          if (old.settings) existingSettings = old.settings;
        } catch (e) {
          // ignore corrupted data
        }
      }

      const freshData = JSON.parse(JSON.stringify(DEFAULT_DATABASE));
      if (existingSettings) {
        freshData.settings = { ...freshData.settings, ...existingSettings };
        // If old settings had the previous default admin123 password, migrate to Harkeerat0904
        if (existingSettings.adminPasswordHash === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9') {
          freshData.settings.adminPasswordHash = DEFAULT_DATABASE.settings.adminPasswordHash;
        }
      }

      saveData(freshData, false);
      localStorage.setItem(VERSION_KEY, CACHE_VERSION);
      return freshData;
    }

    const parsed = JSON.parse(rawData);
    // Auto-migrate legacy default admin123 hash if present
    if (parsed.settings?.adminPasswordHash === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9') {
      parsed.settings.adminPasswordHash = DEFAULT_DATABASE.settings.adminPasswordHash;
      saveData(parsed, false);
    }
    // Auto-migrate legacy GeeksforGeeks platform to Codolio if present
    if (Array.isArray(parsed.codingPlatforms)) {
      let migrated = false;
      parsed.codingPlatforms = parsed.codingPlatforms.map(cp => {
        if (cp.platform?.toLowerCase() === 'geeksforgeeks' || cp.icon === 'geeksforgeeks') {
          migrated = true;
          const codolioDefault = DEFAULT_DATABASE.codingPlatforms.find(p => p.id === 'cp-4');
          return {
            ...codolioDefault,
            id: cp.id || 'cp-4'
          };
        }
        return cp;
      });
      if (migrated) {
        saveData(parsed, false);
      }
    }
    // Sanitize missing or empty arrays/objects
    parsed.profile = parsed.profile || DEFAULT_DATABASE.profile;
    parsed.journey = (Array.isArray(parsed.journey) && parsed.journey.length > 0) ? parsed.journey : DEFAULT_DATABASE.journey;
    parsed.skills = (Array.isArray(parsed.skills) && parsed.skills.length > 0) ? parsed.skills : DEFAULT_DATABASE.skills;
    parsed.skills = parsed.skills.map(s => ({
      ...s,
      category: s.category || 'Technical'
    }));
    const hasNonTech = parsed.skills.some(s => s.category === 'Non Technical');
    if (!hasNonTech) {
      const defaultNonTech = DEFAULT_DATABASE.skills.filter(s => s.category === 'Non Technical');
      parsed.skills.push(...defaultNonTech);
      saveData(parsed, false);
    }
    parsed.projects = (Array.isArray(parsed.projects) && parsed.projects.length > 0) ? parsed.projects : DEFAULT_DATABASE.projects;
    parsed.certificates = (Array.isArray(parsed.certificates) && parsed.certificates.length > 0) ? parsed.certificates : DEFAULT_DATABASE.certificates;
    parsed.codingPlatforms = (Array.isArray(parsed.codingPlatforms) && parsed.codingPlatforms.length > 0) ? parsed.codingPlatforms : DEFAULT_DATABASE.codingPlatforms;
    parsed.messages = Array.isArray(parsed.messages) ? parsed.messages : DEFAULT_DATABASE.messages;
    parsed.settings = parsed.settings || { ...DEFAULT_DATABASE.settings };
    if (!parsed.settings.supabaseUrl) {
      parsed.settings.supabaseUrl = DEFAULT_DATABASE.settings.supabaseUrl;
      parsed.settings.supabaseKey = DEFAULT_DATABASE.settings.supabaseKey;
      saveData(parsed, false);
    }

    return parsed;
  } catch (err) {
    console.error('[DataLayer] Error loading data from localStorage, falling back to seed:', err);
    return JSON.parse(JSON.stringify(DEFAULT_DATABASE));
  }
}

/**
 * Save data to fast-read localStorage and trigger background cloud sync
 */
export function saveData(data, triggerSync = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(VERSION_KEY, CACHE_VERSION);
    if (triggerSync) {
      backgroundCloudSync(data).catch(err => {
        console.warn('[DataLayer] Background cloud sync warning:', err.message);
      });
    }
    return true;
  } catch (err) {
    console.error('[DataLayer] Failed to save to localStorage:', err);
    return false;
  }
}

/**
 * Direct getters and CRUD operations
 */
export function getProfile() {
  const db = loadData();
  return db.profile;
}

export function updateProfile(newProfile) {
  const db = loadData();
  db.profile = { ...db.profile, ...newProfile };
  saveData(db);
  return db.profile;
}

export function getStats() {
  const db = loadData();
  const platforms = db.codingPlatforms || [];
  const totalSolved = platforms.reduce((acc, p) => acc + (Number(p.totalSolved) || 0), 0);
  return {
    projectsCount: db.projects ? db.projects.length : 0,
    skillsCount: db.skills ? db.skills.length : 0,
    certificatesCount: db.certificates ? db.certificates.length : 0,
    platformsCount: platforms.length,
    totalProblemsSolved: totalSolved
  };
}

export function getJourney() {
  return loadData().journey;
}

export function addJourneyItem(item) {
  const db = loadData();
  const newItem = {
    id: 'j-' + Date.now(),
    ...item
  };
  db.journey.unshift(newItem);
  saveData(db);
  return newItem;
}

export function deleteJourneyItem(id) {
  const db = loadData();
  db.journey = db.journey.filter(i => i.id !== id);
  saveData(db);
  return true;
}

export function updateJourneyItem(id, updatedFields) {
  const db = loadData();
  const index = (db.journey || []).findIndex(i => i.id === id);
  if (index === -1) return null;
  db.journey[index] = {
    ...db.journey[index],
    ...updatedFields
  };
  saveData(db);
  return db.journey[index];
}

export function getSkills() {
  return loadData().skills;
}

export function addSkill(skill) {
  const db = loadData();
  const newSkill = {
    id: 's-' + Date.now(),
    name: skill.name,
    category: skill.category || 'Technical',
    icon: skill.icon || 'code'
  };
  db.skills.push(newSkill);
  saveData(db);
  return newSkill;
}

export function deleteSkill(id) {
  const db = loadData();
  db.skills = db.skills.filter(s => s.id !== id);
  saveData(db);
  return true;
}

export function updateSkill(id, updatedFields) {
  const db = loadData();
  const index = (db.skills || []).findIndex(s => s.id === id);
  if (index === -1) return null;
  db.skills[index] = {
    ...db.skills[index],
    ...updatedFields
  };
  saveData(db);
  return db.skills[index];
}

export function getProjects() {
  return loadData().projects;
}

export function addProject(proj) {
  const db = loadData();
  const newProject = {
    id: 'p-' + Date.now(),
    title: proj.title,
    category: proj.category || 'Full-Stack',
    featured: Boolean(proj.featured),
    description: proj.description || '',
    longDescription: proj.longDescription || proj.description || '',
    tags: Array.isArray(proj.tags) ? proj.tags : (proj.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    demoUrl: proj.demoUrl || '',
    githubUrl: proj.githubUrl || '',
    image: proj.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop'
  };
  db.projects.unshift(newProject);
  saveData(db);
  return newProject;
}

export function deleteProject(id) {
  const db = loadData();
  db.projects = db.projects.filter(p => p.id !== id);
  saveData(db);
  return true;
}

export function updateProject(id, updatedFields) {
  const db = loadData();
  const index = (db.projects || []).findIndex(p => p.id === id);
  if (index === -1) return null;
  const current = db.projects[index];
  const tags = updatedFields.tags !== undefined
    ? (Array.isArray(updatedFields.tags) ? updatedFields.tags : (updatedFields.tags || '').split(',').map(t => t.trim()).filter(Boolean))
    : current.tags;

  db.projects[index] = {
    ...current,
    ...updatedFields,
    tags,
    featured: updatedFields.featured !== undefined ? Boolean(updatedFields.featured) : current.featured,
    longDescription: updatedFields.longDescription || updatedFields.description || current.longDescription
  };
  saveData(db);
  return db.projects[index];
}

export function getCertificates() {
  return loadData().certificates;
}

export function addCertificate(cert) {
  const db = loadData();
  const newCert = {
    id: 'c-' + Date.now(),
    title: cert.title,
    issuer: cert.issuer || '',
    year: cert.year || new Date().getFullYear().toString(),
    skills: cert.skills || '',
    verifyUrl: cert.verifyUrl || '#',
    image: cert.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop'
  };
  db.certificates.unshift(newCert);
  saveData(db);
  return newCert;
}

export function deleteCertificate(id) {
  const db = loadData();
  db.certificates = db.certificates.filter(c => c.id !== id);
  saveData(db);
  return true;
}

export function updateCertificate(id, updatedFields) {
  const db = loadData();
  const index = (db.certificates || []).findIndex(c => c.id === id);
  if (index === -1) return null;
  db.certificates[index] = {
    ...db.certificates[index],
    ...updatedFields
  };
  saveData(db);
  return db.certificates[index];
}

export function getCodingPlatforms() {
  return loadData().codingPlatforms || [];
}

export function addCodingPlatform(platform) {
  const db = loadData();
  const total = Number(platform.totalSolved) || 
    ((Number(platform.easySolved) || 0) + (Number(platform.mediumSolved) || 0) + (Number(platform.hardSolved) || 0));
  
  const newPlatform = {
    id: 'cp-' + Date.now(),
    platform: platform.platform || 'LeetCode',
    icon: (platform.icon || platform.platform || 'code').toLowerCase().replace(/\s+/g, ''),
    handle: platform.handle || 'developer',
    profileUrl: platform.profileUrl || '#',
    rating: Number(platform.rating) || 1800,
    maxRating: Number(platform.maxRating) || Number(platform.rating) || 1800,
    badge: platform.badge || 'Active Coder',
    badgeColor: platform.badgeColor || 'var(--accent-mint)',
    ranking: platform.ranking || 'Top 5%',
    totalSolved: total,
    easySolved: Number(platform.easySolved) || Math.floor(total * 0.3),
    mediumSolved: Number(platform.mediumSolved) || Math.floor(total * 0.5),
    hardSolved: Number(platform.hardSolved) || Math.floor(total * 0.2),
    contestsCount: Number(platform.contestsCount) || 20,
    streakDays: Number(platform.streakDays) || 100
  };

  db.codingPlatforms = db.codingPlatforms || [];
  db.codingPlatforms.unshift(newPlatform);
  saveData(db);
  return newPlatform;
}

export function deleteCodingPlatform(id) {
  const db = loadData();
  db.codingPlatforms = (db.codingPlatforms || []).filter(p => p.id !== id);
  saveData(db);
  return true;
}

export function updateCodingPlatform(id, updatedFields) {
  const db = loadData();
  const index = (db.codingPlatforms || []).findIndex(p => p.id === id);
  if (index === -1) return null;

  const current = db.codingPlatforms[index];
  const easy = updatedFields.easySolved !== undefined ? Number(updatedFields.easySolved) : current.easySolved;
  const medium = updatedFields.mediumSolved !== undefined ? Number(updatedFields.mediumSolved) : current.mediumSolved;
  const hard = updatedFields.hardSolved !== undefined ? Number(updatedFields.hardSolved) : current.hardSolved;
  const total = Number(updatedFields.totalSolved) || (easy + medium + hard) || current.totalSolved;

  db.codingPlatforms[index] = {
    ...current,
    ...updatedFields,
    totalSolved: total,
    easySolved: easy,
    mediumSolved: medium,
    hardSolved: hard,
    rating: Number(updatedFields.rating) || current.rating,
    maxRating: Number(updatedFields.maxRating) || Number(updatedFields.rating) || current.maxRating,
    contestsCount: updatedFields.contestsCount !== undefined ? Number(updatedFields.contestsCount) : current.contestsCount,
    streakDays: updatedFields.streakDays !== undefined ? Number(updatedFields.streakDays) : current.streakDays
  };
  saveData(db);
  return db.codingPlatforms[index];
}

export function getAggregatedCodingStats() {
  const platforms = getCodingPlatforms();
  let totalSolved = 0;
  let totalEasy = 0;
  let totalMedium = 0;
  let totalHard = 0;
  let totalContests = 0;
  let maxRating = 0;
  let maxStreak = 0;

  platforms.forEach(p => {
    totalSolved += Number(p.totalSolved) || 0;
    totalEasy += Number(p.easySolved) || 0;
    totalMedium += Number(p.mediumSolved) || 0;
    totalHard += Number(p.hardSolved) || 0;
    totalContests += Number(p.contestsCount) || 0;
    if (Number(p.maxRating) > maxRating) maxRating = Number(p.maxRating);
    if (Number(p.streakDays) > maxStreak) maxStreak = Number(p.streakDays);
  });

  return {
    totalSolved,
    totalEasy,
    totalMedium,
    totalHard,
    totalContests,
    maxRating,
    maxStreak: maxStreak || 365,
    platformsCount: platforms.length
  };
}

// Backward compatibility aliases
export const getHackathons = getCodingPlatforms;
export const addHackathon = addCodingPlatform;
export const deleteHackathon = deleteCodingPlatform;

export function getMessages() {
  return loadData().messages;
}

export function addMessage(msg) {
  const db = loadData();
  const newMsg = {
    id: 'm-' + Date.now(),
    name: msg.name || 'Anonymous',
    email: msg.email || '',
    subject: msg.subject || 'Portfolio Inquiry',
    message: msg.message || '',
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    read: false
  };
  db.messages.unshift(newMsg);
  saveData(db);
  return newMsg;
}

export function toggleMessageRead(id) {
  const db = loadData();
  const m = db.messages.find(x => x.id === id);
  if (m) {
    m.read = !m.read;
    saveData(db);
  }
  return m;
}

export function deleteMessage(id) {
  const db = loadData();
  db.messages = db.messages.filter(m => m.id !== id);
  saveData(db);
  return true;
}

export function getSettings() {
  return loadData().settings;
}

export function updateSettings(newSettings) {
  const db = loadData();
  db.settings = { ...db.settings, ...newSettings };
  saveData(db);
  return db.settings;
}

/**
 * Backup / Restore / Reset
 */
export function exportBackupJson() {
  const db = loadData();
  return JSON.stringify(db, null, 2);
}

export function importBackupJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON format');
    }
    // ensure structure
    if (!parsed.profile || !Array.isArray(parsed.skills)) {
      throw new Error('JSON backup missing required profile or skills data.');
    }
    saveData(parsed);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function resetToDefaults() {
  const fresh = JSON.parse(JSON.stringify(DEFAULT_DATABASE));
  saveData(fresh, false);
  return fresh;
}

/**
 * Background Cloud Synchronization with Supabase
 * Sanitizes data to only sync public showcase fields (protecting inbox messages and security hashes)
 */
export async function backgroundCloudSync(data) {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // Only upload public developer content — never expose private messages or security hashes
    const publicData = {
      profile: data.profile,
      journey: data.journey,
      skills: data.skills,
      projects: data.projects,
      certificates: data.certificates,
      codingPlatforms: data.codingPlatforms
    };

    const payload = {
      id: 'default_portfolio_snapshot',
      data: publicData,
      updated_at: new Date().toISOString()
    };

    const { error } = await client
      .from('portfolio_data')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync Error]', error.message);
      return false;
    }

    if (typeof localStorage !== 'undefined') {
      const currentDb = loadData();
      currentDb.settings.lastSyncTimestamp = new Date().toLocaleTimeString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDb));
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync Exception]', err);
    return false;
  }
}

export async function pullFromCloud() {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await client
      .from('portfolio_data')
      .select('data, updated_at')
      .eq('id', 'default_portfolio_snapshot')
      .single();

    if (error) {
      // If table is newly created and contains 0 rows, auto-seed with local database
      if (error.code === 'PGRST116') {
        const local = loadData();
        await backgroundCloudSync(local);
        return { success: true, message: 'Initialized cloud snapshot from portfolio defaults.' };
      }
      return { success: false, message: error.message };
    }

    if (data && data.data) {
      const current = loadData();
      const merged = {
        ...current,
        profile: data.data.profile || current.profile,
        journey: (Array.isArray(data.data.journey) && data.data.journey.length > 0) ? data.data.journey : current.journey,
        skills: (Array.isArray(data.data.skills) && data.data.skills.length > 0) ? data.data.skills : current.skills,
        projects: (Array.isArray(data.data.projects) && data.data.projects.length > 0) ? data.data.projects : current.projects,
        certificates: (Array.isArray(data.data.certificates) && data.data.certificates.length > 0) ? data.data.certificates : current.certificates,
        codingPlatforms: (Array.isArray(data.data.codingPlatforms) && data.data.codingPlatforms.length > 0) ? data.data.codingPlatforms : current.codingPlatforms,
        messages: current.messages || [],
        settings: {
          ...current.settings,
          lastSyncTimestamp: new Date().toLocaleTimeString()
        }
      };
      saveData(merged, false);
      return { success: true, message: `Synced from cloud (Updated: ${data.updated_at})` };
    }

    return { success: false, message: 'No cloud snapshot found.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
