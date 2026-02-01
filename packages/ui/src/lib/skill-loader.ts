/**
 * ZoneWise.AI Skill Loader
 * 
 * Implements Progressive Disclosure pattern for AI agent skills.
 * Based on Cole Medin's "custom-agent-with-skills" architecture.
 * 
 * Three-Layer Architecture:
 * - Level 1 (5%): Brief description in manifest (~100 tokens/skill)
 * - Level 2 (30%): Full SKILL.md instructions (500-2000 tokens)
 * - Level 3 (65%): Reference documents (1000-5000 tokens each)
 * 
 * @module skill-loader
 * @version 1.0.0
 */

import YAML from 'yaml';

// ============================================================================
// Types
// ============================================================================

/**
 * Skill metadata from manifest (Level 1)
 */
export interface SkillMetadata {
  name: string;
  description: string;
  path: string;
  category: 'zoning' | 'visualization' | 'analysis' | 'data';
  priority: number;
  tokens_estimate: number;
  references?: string[];
}

/**
 * Full skill with loaded content (Level 2)
 */
export interface LoadedSkill extends SkillMetadata {
  content: string;
  loadedAt: Date;
  frontMatter?: Record<string, unknown>;
}

/**
 * Reference document (Level 3)
 */
export interface SkillReference {
  name: string;
  content: string;
  skillName: string;
  loadedAt: Date;
}

/**
 * Skills manifest structure
 */
export interface SkillsManifest {
  version: string;
  updated: string;
  total_skills: number;
  skills: SkillMetadata[];
  categories: Record<string, string>;
  disclosure_levels: Record<string, {
    name: string;
    description: string;
    tokens: string;
    loaded: string;
  }>;
}

/**
 * Skill loader state
 */
export interface SkillLoaderState {
  manifest: SkillsManifest | null;
  loadedSkills: Map<string, LoadedSkill>;
  loadedReferences: Map<string, SkillReference>;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Skill Loader Class
// ============================================================================

/**
 * Progressive Disclosure Skill Loader
 * 
 * @example
 * ```typescript
 * const loader = new SkillLoader('/zonewise/skills');
 * await loader.initialize();
 * 
 * // Level 1: Get all skill descriptions for system prompt
 * const descriptions = loader.getSkillDescriptions();
 * 
 * // Level 2: Load full skill when needed
 * const skill = await loader.loadSkill('envelope-development');
 * 
 * // Level 3: Load reference when skill instructions reference it
 * const ref = await loader.loadReference('envelope-development', 'envelope-algorithm.md');
 * ```
 */
export class SkillLoader {
  private basePath: string;
  private state: SkillLoaderState;
  private fetchFn: typeof fetch;

  constructor(basePath: string = '/zonewise/skills', fetchFn: typeof fetch = fetch) {
    this.basePath = basePath;
    this.fetchFn = fetchFn;
    this.state = {
      manifest: null,
      loadedSkills: new Map(),
      loadedReferences: new Map(),
      isLoading: false,
      error: null
    };
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize the skill loader by loading the manifest
   */
  async initialize(): Promise<void> {
    this.state.isLoading = true;
    this.state.error = null;

    try {
      const manifestPath = `${this.basePath}/skills-manifest.yaml`;
      const response = await this.fetchFn(manifestPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.status}`);
      }
      
      const yamlContent = await response.text();
      this.state.manifest = YAML.parse(yamlContent) as SkillsManifest;
      
      console.log(`[SkillLoader] Loaded ${this.state.manifest.total_skills} skills from manifest`);
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      this.state.isLoading = false;
    }
  }

  // ==========================================================================
  // Level 1: Skill Metadata (System Prompt)
  // ==========================================================================

  /**
   * Get all skill names and descriptions for system prompt injection
   * This is Level 1 - only ~100 tokens per skill
   */
  getSkillDescriptions(): string {
    if (!this.state.manifest) {
      throw new Error('Manifest not loaded. Call initialize() first.');
    }

    const lines: string[] = [
      '# Available Skills',
      '',
      'The following skills are available. Load them when needed:',
      ''
    ];

    for (const skill of this.state.manifest.skills) {
      lines.push(`## ${skill.name}`);
      lines.push(skill.description.trim());
      lines.push(`Path: ${skill.path}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Get skill metadata by name (Level 1)
   */
  getSkillMetadata(skillName: string): SkillMetadata | undefined {
    return this.state.manifest?.skills.find(s => s.name === skillName);
  }

  /**
   * Get all skills in a category
   */
  getSkillsByCategory(category: string): SkillMetadata[] {
    return this.state.manifest?.skills.filter(s => s.category === category) || [];
  }

  /**
   * Get skills sorted by priority
   */
  getSkillsByPriority(): SkillMetadata[] {
    return [...(this.state.manifest?.skills || [])].sort((a, b) => a.priority - b.priority);
  }

  // ==========================================================================
  // Level 2: Full Skill Instructions
  // ==========================================================================

  /**
   * Load full skill content (Level 2)
   * Only call this when the agent determines the skill is needed
   */
  async loadSkill(skillName: string): Promise<LoadedSkill> {
    // Check cache
    const cached = this.state.loadedSkills.get(skillName);
    if (cached) {
      console.log(`[SkillLoader] Using cached skill: ${skillName}`);
      return cached;
    }

    // Get metadata
    const metadata = this.getSkillMetadata(skillName);
    if (!metadata) {
      throw new Error(`Skill not found: ${skillName}`);
    }

    // Load SKILL.md
    const response = await this.fetchFn(metadata.path);
    if (!response.ok) {
      throw new Error(`Failed to load skill ${skillName}: ${response.status}`);
    }

    const content = await response.text();
    
    // Parse YAML front matter if present
    const frontMatter = this.parseFrontMatter(content);

    const loadedSkill: LoadedSkill = {
      ...metadata,
      content: frontMatter.body,
      loadedAt: new Date(),
      frontMatter: frontMatter.metadata
    };

    // Cache
    this.state.loadedSkills.set(skillName, loadedSkill);
    
    console.log(`[SkillLoader] Loaded skill: ${skillName} (${content.length} chars)`);
    return loadedSkill;
  }

  /**
   * Check if a skill is already loaded
   */
  isSkillLoaded(skillName: string): boolean {
    return this.state.loadedSkills.has(skillName);
  }

  // ==========================================================================
  // Level 3: Reference Documents
  // ==========================================================================

  /**
   * Load a reference document for a skill (Level 3)
   * Only call when skill instructions explicitly reference a document
   */
  async loadReference(skillName: string, referenceName: string): Promise<SkillReference> {
    const cacheKey = `${skillName}:${referenceName}`;
    
    // Check cache
    const cached = this.state.loadedReferences.get(cacheKey);
    if (cached) {
      console.log(`[SkillLoader] Using cached reference: ${cacheKey}`);
      return cached;
    }

    // Construct path
    const skillDir = this.getSkillMetadata(skillName)?.path.replace('/SKILL.md', '');
    if (!skillDir) {
      throw new Error(`Skill not found: ${skillName}`);
    }

    const refPath = `${skillDir}/references/${referenceName}`;
    
    const response = await this.fetchFn(refPath);
    if (!response.ok) {
      throw new Error(`Failed to load reference ${referenceName}: ${response.status}`);
    }

    const content = await response.text();

    const reference: SkillReference = {
      name: referenceName,
      content,
      skillName,
      loadedAt: new Date()
    };

    // Cache
    this.state.loadedReferences.set(cacheKey, reference);
    
    console.log(`[SkillLoader] Loaded reference: ${cacheKey} (${content.length} chars)`);
    return reference;
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  /**
   * Parse YAML front matter from markdown
   */
  private parseFrontMatter(content: string): { metadata: Record<string, unknown> | undefined; body: string } {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);
    
    if (match) {
      try {
        const metadata = YAML.parse(match[1]);
        return { metadata, body: match[2].trim() };
      } catch {
        return { metadata: undefined, body: content };
      }
    }
    
    return { metadata: undefined, body: content };
  }

  /**
   * Get current state (for debugging)
   */
  getState(): SkillLoaderState {
    return { ...this.state };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.state.loadedSkills.clear();
    this.state.loadedReferences.clear();
    console.log('[SkillLoader] Cache cleared');
  }

  /**
   * Estimate total tokens for loaded context
   */
  estimateLoadedTokens(): number {
    let total = 0;
    
    // Manifest descriptions (always loaded)
    if (this.state.manifest) {
      total += this.state.manifest.skills.reduce((sum, s) => sum + s.tokens_estimate, 0);
    }
    
    // Loaded skills (rough estimate: 1 token ≈ 4 chars)
    for (const skill of this.state.loadedSkills.values()) {
      total += Math.ceil(skill.content.length / 4);
    }
    
    // Loaded references
    for (const ref of this.state.loadedReferences.values()) {
      total += Math.ceil(ref.content.length / 4);
    }
    
    return total;
  }
}

// ============================================================================
// React Hook (Optional)
// ============================================================================

/**
 * React hook for skill loading
 * 
 * @example
 * ```tsx
 * function AgentChat() {
 *   const { skills, loadSkill, loadReference, isLoading } = useSkillLoader();
 *   
 *   // Load skill when agent requests it
 *   const handleSkillRequest = async (skillName: string) => {
 *     const skill = await loadSkill(skillName);
 *     // Inject skill.content into conversation
 *   };
 * }
 * ```
 */
export function createSkillLoaderHook(basePath: string = '/zonewise/skills') {
  const loader = new SkillLoader(basePath);
  
  return {
    loader,
    initialize: () => loader.initialize(),
    getDescriptions: () => loader.getSkillDescriptions(),
    loadSkill: (name: string) => loader.loadSkill(name),
    loadReference: (skill: string, ref: string) => loader.loadReference(skill, ref),
    isLoaded: (name: string) => loader.isSkillLoaded(name),
    estimateTokens: () => loader.estimateLoadedTokens(),
    clearCache: () => loader.clearCache()
  };
}

// ============================================================================
// Tool Definitions (for AI Agent)
// ============================================================================

/**
 * Tool definition for load_skill
 * Agent calls this when it needs full skill instructions
 */
export const LOAD_SKILL_TOOL = {
  name: 'load_skill',
  description: `Load the full instructions for a skill. Call this ONLY when you need to use 
a specific skill's capabilities. The skill content will be added to your context.

Available skills: zoning-analysis, envelope-development, threejs-fundamentals, 
threejs-geometry, threejs-materials, threejs-lighting, threejs-interaction, 
sun-analysis, bcpao-integration, mapbox-integration`,
  parameters: {
    type: 'object',
    properties: {
      skill_name: {
        type: 'string',
        description: 'Name of the skill to load (e.g., "envelope-development")'
      }
    },
    required: ['skill_name']
  }
};

/**
 * Tool definition for read_reference
 * Agent calls this when skill instructions reference a document
 */
export const READ_REFERENCE_TOOL = {
  name: 'read_reference',
  description: `Load a reference document mentioned in a skill's instructions. 
Only call this if the skill instructions explicitly mention a reference document.`,
  parameters: {
    type: 'object',
    properties: {
      skill_name: {
        type: 'string',
        description: 'Name of the skill that owns the reference'
      },
      reference_name: {
        type: 'string',
        description: 'Name of the reference file (e.g., "api_reference.md")'
      }
    },
    required: ['skill_name', 'reference_name']
  }
};

export default SkillLoader;
