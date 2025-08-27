/**
 * Building Intent Analyzer
 * Analyzes user prompts to understand what they want to build
 */

export interface BuildIntent {
  type: BuildIntentType;
  confidence: number;
  components: string[];
  features: string[];
  keywords: string[];
  projectFocus: string;
  suggestedApproach: string;
}

export enum BuildIntentType {
  ADD_COMPONENT = 'ADD_COMPONENT',
  ADD_PAGE = 'ADD_PAGE', 
  ADD_FEATURE = 'ADD_FEATURE',
  STYLE_UPDATE = 'STYLE_UPDATE',
  DATA_INTEGRATION = 'DATA_INTEGRATION',
  INTERACTIVE_ELEMENT = 'INTERACTIVE_ELEMENT',
  LAYOUT_CHANGE = 'LAYOUT_CHANGE',
  CONTENT_UPDATE = 'CONTENT_UPDATE',
  COMPLETE_BUILD = 'COMPLETE_BUILD' // For initial project creation
}

interface BuildPattern {
  patterns: RegExp[];
  type: BuildIntentType;
  componentSuggestions: string[];
  featureSuggestions: string[];
}

const buildIntentPatterns: BuildPattern[] = [
  {
    patterns: [
      /add|create|build|make\s+(?:a\s+)?(.+)\s+component/i,
      /(?:new|another)\s+component/i,
      /component\s+(?:for|to|that)/i
    ],
    type: BuildIntentType.ADD_COMPONENT,
    componentSuggestions: ['functional component', 'reusable component'],
    featureSuggestions: ['props handling', 'state management', 'event handlers']
  },
  {
    patterns: [
      /add|create\s+(?:a\s+)?(.+)\s+page/i,
      /(?:new|another)\s+page/i,
      /page\s+(?:for|to|that)/i,
      /route|routing|navigation/i
    ],
    type: BuildIntentType.ADD_PAGE,
    componentSuggestions: ['Page component', 'Layout wrapper'],
    featureSuggestions: ['routing', 'navigation', 'page structure']
  },
  {
    patterns: [
      /implement|add|build\s+(.+)\s+functionality/i,
      /feature\s+(?:for|to|that)/i,
      /functionality|capability|ability/i,
      /(?:user can|users can|allow)/i
    ],
    type: BuildIntentType.ADD_FEATURE,
    componentSuggestions: ['Feature component', 'Logic handler'],
    featureSuggestions: ['user interaction', 'business logic', 'data handling']
  },
  {
    patterns: [
      /style|design|theme|look|appearance/i,
      /color|colors|styling|css/i,
      /make it look|visual|aesthetic/i,
      /beautiful|attractive|modern/i
    ],
    type: BuildIntentType.STYLE_UPDATE,
    componentSuggestions: ['styled components'],
    featureSuggestions: ['responsive design', 'visual hierarchy', 'color scheme']
  },
  {
    patterns: [
      /connect|fetch|api|database|data/i,
      /integration|integrate/i,
      /(?:from|with)\s+(?:api|database|server)/i,
      /real.time|live.data/i
    ],
    type: BuildIntentType.DATA_INTEGRATION,
    componentSuggestions: ['Data provider', 'API client'],
    featureSuggestions: ['data fetching', 'state management', 'error handling']
  },
  {
    patterns: [
      /button|form|modal|dropdown|menu/i,
      /click|interactive|hover/i,
      /(?:user\s+)?(?:can\s+)?(?:click|tap|select|choose)/i,
      /interactive|clickable/i
    ],
    type: BuildIntentType.INTERACTIVE_ELEMENT,
    componentSuggestions: ['Button', 'Form', 'Modal', 'Dropdown'],
    featureSuggestions: ['event handling', 'user feedback', 'form validation']
  },
  {
    patterns: [
      /layout|structure|organize|arrange/i,
      /grid|flex|responsive|mobile/i,
      /(?:re)?arrange|reorganize|restructure/i,
      /sidebar|header|footer|navigation/i
    ],
    type: BuildIntentType.LAYOUT_CHANGE,
    componentSuggestions: ['Layout component', 'Grid system'],
    featureSuggestions: ['responsive design', 'component arrangement', 'navigation structure']
  },
  {
    patterns: [
      /text|copy|content|heading|description/i,
      /write|update.*(?:text|content)/i,
      /(?:add|change|update)\s+(?:the\s+)?(?:text|content|copy)/i,
      /title|heading|paragraph/i
    ],
    type: BuildIntentType.CONTENT_UPDATE,
    componentSuggestions: ['Text component', 'Content section'],
    featureSuggestions: ['dynamic content', 'content management', 'typography']
  },
  {
    patterns: [
      /build\s+(?:a\s+|an\s+)?(?:complete|full|entire)/i,
      /create\s+(?:a\s+|an\s+)?(?:complete|full|entire)/i,
      /(?:todo|calculator|dashboard|landing)/i,
      /app|application|website|platform/i
    ],
    type: BuildIntentType.COMPLETE_BUILD,
    componentSuggestions: ['App', 'Main components', 'Layout'],
    featureSuggestions: ['full application', 'component architecture', 'user flow']
  }
];

export function analyzeBuildIntent(prompt: string, projectType?: string): BuildIntent {
  const lowerPrompt = prompt.toLowerCase();
  
  let bestMatch: BuildPattern | null = null;
  let highestConfidence = 0;
  let matchedKeywords: string[] = [];
  
  // Check each pattern
  for (const pattern of buildIntentPatterns) {
    let patternConfidence = 0;
    let patternKeywords: string[] = [];
    
    for (const regex of pattern.patterns) {
      const match = regex.exec(prompt);
      if (match) {
        patternConfidence += 0.3;
        if (match[1]) {
          patternKeywords.push(match[1].trim());
        }
      }
    }
    
    // Boost confidence for project type alignment
    if (projectType) {
      if (projectType === 'dashboard' && pattern.type === BuildIntentType.DATA_INTEGRATION) {
        patternConfidence += 0.2;
      }
      if (projectType === 'landing-page' && pattern.type === BuildIntentType.STYLE_UPDATE) {
        patternConfidence += 0.2;
      }
      if (projectType === 'react-app' && pattern.type === BuildIntentType.INTERACTIVE_ELEMENT) {
        patternConfidence += 0.2;
      }
    }
    
    if (patternConfidence > highestConfidence) {
      highestConfidence = patternConfidence;
      bestMatch = pattern;
      matchedKeywords = patternKeywords;
    }
  }
  
  // Default to complete build if no specific pattern matches
  if (!bestMatch || highestConfidence < 0.3) {
    bestMatch = buildIntentPatterns.find(p => p.type === BuildIntentType.COMPLETE_BUILD)!;
    highestConfidence = 0.5; // Moderate confidence for complete build
  }
  
  // Extract additional context
  const components = extractComponents(prompt, bestMatch);
  const features = extractFeatures(prompt, bestMatch);
  const projectFocus = determineProjectFocus(prompt, projectType);
  const suggestedApproach = generateApproachSuggestion(bestMatch, components, features);
  
  return {
    type: bestMatch.type,
    confidence: Math.min(highestConfidence, 1.0),
    components,
    features,
    keywords: matchedKeywords,
    projectFocus,
    suggestedApproach
  };
}

function extractComponents(prompt: string, pattern: BuildPattern): string[] {
  const components: string[] = [];
  
  // Add pattern-suggested components
  components.push(...pattern.componentSuggestions);
  
  // Extract component-related words from prompt
  const componentKeywords = [
    'header', 'footer', 'sidebar', 'navigation', 'nav', 'menu',
    'hero', 'banner', 'card', 'modal', 'popup', 'form', 'button',
    'table', 'list', 'grid', 'chart', 'graph', 'dashboard',
    'profile', 'settings', 'search', 'filter', 'pagination'
  ];
  
  componentKeywords.forEach(keyword => {
    if (prompt.toLowerCase().includes(keyword)) {
      const componentName = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      if (!components.some(c => c.toLowerCase().includes(keyword))) {
        components.push(componentName);
      }
    }
  });
  
  return components.slice(0, 5); // Limit to 5 most relevant components
}

function extractFeatures(prompt: string, pattern: BuildPattern): string[] {
  const features: string[] = [];
  
  // Add pattern-suggested features
  features.push(...pattern.featureSuggestions);
  
  // Extract feature-related words from prompt
  const featureKeywords = [
    'authentication', 'login', 'signup', 'user management',
    'search', 'filter', 'sort', 'pagination', 'infinite scroll',
    'real-time', 'live updates', 'notifications', 'messaging',
    'drag and drop', 'upload', 'download', 'export', 'import',
    'responsive', 'mobile', 'dark mode', 'theme', 'accessibility',
    'analytics', 'tracking', 'reporting', 'dashboard', 'metrics'
  ];
  
  featureKeywords.forEach(keyword => {
    if (prompt.toLowerCase().includes(keyword.toLowerCase())) {
      if (!features.some(f => f.toLowerCase().includes(keyword.toLowerCase()))) {
        features.push(keyword);
      }
    }
  });
  
  return features.slice(0, 5); // Limit to 5 most relevant features
}

function determineProjectFocus(prompt: string, projectType?: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Business/domain focus
  if (lowerPrompt.includes('e-commerce') || lowerPrompt.includes('shop')) return 'E-commerce';
  if (lowerPrompt.includes('blog') || lowerPrompt.includes('article')) return 'Content Management';
  if (lowerPrompt.includes('social') || lowerPrompt.includes('community')) return 'Social Platform';
  if (lowerPrompt.includes('finance') || lowerPrompt.includes('budget')) return 'Financial Tools';
  if (lowerPrompt.includes('education') || lowerPrompt.includes('learning')) return 'Educational Platform';
  if (lowerPrompt.includes('health') || lowerPrompt.includes('fitness')) return 'Health & Wellness';
  if (lowerPrompt.includes('productivity') || lowerPrompt.includes('task')) return 'Productivity Tools';
  
  // Project type defaults
  if (projectType === 'dashboard') return 'Data & Analytics';
  if (projectType === 'landing-page') return 'Marketing & Conversion';
  if (projectType === 'react-app') return 'User Interaction';
  
  return 'General Application';
}

function generateApproachSuggestion(
  pattern: BuildPattern, 
  components: string[], 
  features: string[]
): string {
  switch (pattern.type) {
    case BuildIntentType.ADD_COMPONENT:
      return `Create a reusable ${components[0] || 'component'} with proper props and state management`;
    case BuildIntentType.ADD_PAGE:
      return `Build a new page with proper routing and ${components.join(', ')} components`;
    case BuildIntentType.ADD_FEATURE:
      return `Implement ${features[0] || 'the requested functionality'} with proper user interaction flow`;
    case BuildIntentType.STYLE_UPDATE:
      return `Update styling with modern design patterns and responsive layout`;
    case BuildIntentType.DATA_INTEGRATION:
      return `Set up data fetching and state management for ${features.join(', ')}`;
    case BuildIntentType.INTERACTIVE_ELEMENT:
      return `Create interactive ${components.join(' and ')} with proper event handling`;
    case BuildIntentType.LAYOUT_CHANGE:
      return `Restructure layout using modern CSS Grid/Flexbox patterns`;
    case BuildIntentType.CONTENT_UPDATE:
      return `Update content with proper typography and information hierarchy`;
    case BuildIntentType.COMPLETE_BUILD:
      return `Build complete application with ${components.join(', ')} and ${features.join(', ')}`;
    default:
      return 'Create a well-structured, modern React application';
  }
}