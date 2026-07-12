export const capitalizeSkill = (str: string): string => {
  if (!str) return ''
  const specialCases: Record<string, string> = {
    react: 'React',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    html: 'HTML',
    css: 'CSS',
    springboot: 'Spring Boot',
    mysql: 'MySQL',
    restapi: 'REST API',
    nodejs: 'Node.js',
    mongodb: 'MongoDB',
    express: 'Express',
    flutter: 'Flutter',
    dart: 'Dart',
    firebase: 'Firebase',
    ios: 'iOS',
    android: 'Android',
    docker: 'Docker',
    kubernetes: 'Kubernetes',
    aws: 'AWS',
    cicd: 'CI/CD',
    python: 'Python',
    sql: 'SQL',
    tableau: 'Tableau',
    excel: 'Excel',
    selenium: 'Selenium',
    cypress: 'Cypress',
    testing: 'Testing',
    automation: 'Automation',
    figma: 'Figma',
    sketch: 'Sketch',
    adobexd: 'Adobe XD',
    design: 'Design',
    linux: 'Linux',
    networking: 'Networking',
    bash: 'Bash',
    windowsserver: 'Windows Server',
    tensorflow: 'TensorFlow',
    pytorch: 'PyTorch',
    machinelearning: 'Machine Learning',
    swift: 'Swift',
    objectivec: 'Objective-C',
    xcode: 'Xcode',
    kotlin: 'Kotlin',
    golang: 'Golang',
    postgresql: 'PostgreSQL',
    redis: 'Redis',
    microservices: 'Microservices',
    vuejs: 'Vue.js',
    tailwind: 'Tailwind',
    azure: 'Azure',
    architecture: 'Architecture',
    systemdesign: 'System Design',
    scikitlearn: 'Scikit-Learn',
    keras: 'Keras',
    datascience: 'Data Science',
    oracle: 'Oracle',
    sqlserver: 'SQL Server',
    performancetuning: 'Performance Tuning',
    cybersecurity: 'Cybersecurity',
    penetrationtesting: 'Penetration Testing',
    owasp: 'OWASP',
    agile: 'Agile',
    scrum: 'Scrum',
    leadership: 'Leadership',
    productstrategy: 'Product Strategy',
    r: 'R',
    statistics: 'Statistics',
    datamining: 'Data Mining',
  }
  const key = str.toLowerCase()
  if (specialCases[key]) return specialCases[key]
  return str.charAt(0).toUpperCase() + str.slice(1)
}

import { Award, Code, Cpu, Database, Layers, Terminal, Shield, LucideIcon } from 'lucide-react'

export interface SkillIconConfig {
  icon: LucideIcon
  colorClass: string
}

const iconMappings = [
  {
    keywords: ['react', 'vue', 'typescript', 'js', 'native', 'frontend', 'html', 'css', 'javascript'],
    icon: Code,
    colorClass: 'text-blue-600 dark:text-blue-400'
  },
  {
    keywords: ['go', 'golang', 'python', 'java', 'spring', 'backend', 'c#', 'c++', 'php', 'ruby', 'kotlin', 'swift'],
    icon: Terminal,
    colorClass: 'text-indigo-650 dark:text-indigo-400'
  },
  {
    keywords: ['devops', 'kubernetes', 'docker', 'aws', 'cloud', 'azure', 'cicd', 'linux', 'git'],
    icon: Cpu,
    colorClass: 'text-teal-650 dark:text-teal-400'
  },
  {
    keywords: ['db', 'sql', 'postgres', 'database', 'mongo', 'redis', 'mysql', 'oracle', 'nosql'],
    icon: Database,
    colorClass: 'text-amber-600 dark:text-amber-400'
  },
  {
    keywords: ['design', 'architecture', 'system', 'ui', 'ux', 'figma', 'photoshop', 'illustrator'],
    icon: Layers,
    colorClass: 'text-purple-650 dark:text-purple-400'
  },
  {
    keywords: ['network', 'security', 'shield', 'cyber', 'auth', 'firewall'],
    icon: Shield,
    colorClass: 'text-rose-650 dark:text-rose-455'
  }
]

export const getSkillIconConfig = (name: string): SkillIconConfig => {
  const n = name.toLowerCase()
  const match = iconMappings.find(mapping =>
    mapping.keywords.some(keyword => n.includes(keyword))
  )
  return {
    icon: match ? match.icon : Award,
    colorClass: match ? match.colorClass : 'text-emerald-600 dark:text-emerald-450'
  }
}

