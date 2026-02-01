"""
ZoneWise.AI Skill-Based Agent
============================

Pydantic AI agent implementing progressive disclosure for zoning analysis.
Based on Cole Medin's "custom-agent-with-skills" pattern.

Three-Layer Architecture:
- Level 1 (5%): Brief descriptions in system prompt (~100 tokens/skill)
- Level 2 (30%): Full SKILL.md loaded on-demand (500-2000 tokens)
- Level 3 (65%): Reference documents loaded on-demand (1000-5000 tokens)

Usage:
    from zonewise_agent import create_agent, AgentDependencies
    
    agent = create_agent()
    deps = AgentDependencies(skills_path="./zonewise/skills")
    
    result = await agent.run("Analyze zoning for this parcel", deps=deps)
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext

# ============================================================================
# Data Models
# ============================================================================

class SkillMetadata(BaseModel):
    """Level 1: Skill metadata for system prompt"""
    name: str
    description: str
    path: str
    category: str
    priority: int
    tokens_estimate: int
    references: list[str] = []

class LoadedSkill(BaseModel):
    """Level 2: Full skill content"""
    name: str
    content: str
    front_matter: dict[str, Any] = {}

class SkillReference(BaseModel):
    """Level 3: Reference document"""
    name: str
    skill_name: str
    content: str

class SkillsManifest(BaseModel):
    """Skills manifest structure"""
    version: str
    updated: str
    total_skills: int
    skills: list[SkillMetadata]

# ============================================================================
# Agent Dependencies
# ============================================================================

@dataclass
class AgentDependencies:
    """Dependencies injected into the agent"""
    skills_path: Path = field(default_factory=lambda: Path("./zonewise/skills"))
    manifest: SkillsManifest | None = None
    loaded_skills: dict[str, LoadedSkill] = field(default_factory=dict)
    loaded_references: dict[str, SkillReference] = field(default_factory=dict)
    
    def __post_init__(self):
        if isinstance(self.skills_path, str):
            self.skills_path = Path(self.skills_path)

# ============================================================================
# Skill Loader Functions
# ============================================================================

def load_manifest(skills_path: Path) -> SkillsManifest:
    """Load skills manifest from YAML file"""
    manifest_path = skills_path / "skills-manifest.yaml"
    
    if not manifest_path.exists():
        raise FileNotFoundError(f"Skills manifest not found: {manifest_path}")
    
    with open(manifest_path) as f:
        data = yaml.safe_load(f)
    
    return SkillsManifest(**data)

def get_skill_descriptions(manifest: SkillsManifest) -> str:
    """Generate Level 1 skill descriptions for system prompt"""
    lines = [
        "# Available Skills",
        "",
        "You have access to the following skills. Use load_skill when needed:",
        ""
    ]
    
    for skill in manifest.skills:
        lines.append(f"## {skill.name}")
        lines.append(skill.description.strip())
        lines.append(f"Category: {skill.category} | Priority: {skill.priority}")
        lines.append("")
    
    return "\n".join(lines)

def parse_front_matter(content: str) -> tuple[dict[str, Any], str]:
    """Parse YAML front matter from markdown"""
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            try:
                metadata = yaml.safe_load(parts[1])
                body = parts[2].strip()
                return metadata or {}, body
            except yaml.YAMLError:
                pass
    return {}, content

def load_skill_content(skills_path: Path, skill_name: str, manifest: SkillsManifest) -> LoadedSkill:
    """Load Level 2: Full skill content"""
    # Find skill in manifest
    skill_meta = next((s for s in manifest.skills if s.name == skill_name), None)
    if not skill_meta:
        raise ValueError(f"Skill not found: {skill_name}")
    
    # Load SKILL.md
    skill_path = skills_path.parent / skill_meta.path
    if not skill_path.exists():
        raise FileNotFoundError(f"Skill file not found: {skill_path}")
    
    content = skill_path.read_text()
    front_matter, body = parse_front_matter(content)
    
    return LoadedSkill(
        name=skill_name,
        content=body,
        front_matter=front_matter
    )

def load_reference_content(
    skills_path: Path, 
    skill_name: str, 
    reference_name: str,
    manifest: SkillsManifest
) -> SkillReference:
    """Load Level 3: Reference document"""
    # Find skill in manifest
    skill_meta = next((s for s in manifest.skills if s.name == skill_name), None)
    if not skill_meta:
        raise ValueError(f"Skill not found: {skill_name}")
    
    # Construct reference path
    skill_dir = skills_path.parent / skill_meta.path.replace("/SKILL.md", "")
    ref_path = skill_dir / "references" / reference_name
    
    if not ref_path.exists():
        raise FileNotFoundError(f"Reference not found: {ref_path}")
    
    content = ref_path.read_text()
    
    return SkillReference(
        name=reference_name,
        skill_name=skill_name,
        content=content
    )

# ============================================================================
# System Prompt
# ============================================================================

SYSTEM_PROMPT = """
You are ZoneWise.AI, an expert assistant for zoning analysis and 3D building 
envelope visualization in Brevard County, Florida.

## Your Capabilities

You can help users with:
- Analyzing zoning codes and regulations
- Calculating development intensity metrics (DIMS)
- Generating 3D building envelopes
- Sun/shadow analysis for properties
- Property data from BCPAO

## Progressive Disclosure

You have access to specialized skills. When you need detailed instructions:
1. Use `load_skill` to load the full skill content
2. If the skill references a document, use `read_reference` to load it
3. Only load what you actually need

{skill_descriptions}

## Important Guidelines

- Always verify zoning codes against municipal sources
- Use Malabar Land Development Code for Malabar properties
- Calculations should use proper setbacks, FAR, and height limits
- For sun analysis, default location is Malabar, FL (28.004, -80.5687)
"""

# ============================================================================
# Tool Definitions
# ============================================================================

async def load_skill_tool(ctx: RunContext[AgentDependencies], skill_name: str) -> str:
    """
    Load the full instructions for a skill.
    
    Call this when you need detailed guidance on using a specific capability.
    The skill content will provide step-by-step instructions.
    
    Args:
        skill_name: Name of the skill (e.g., "envelope-development", "sun-analysis")
    
    Returns:
        The full skill instructions
    """
    deps = ctx.deps
    
    # Check cache
    if skill_name in deps.loaded_skills:
        return f"[Skill '{skill_name}' already loaded]\n\n{deps.loaded_skills[skill_name].content}"
    
    # Load manifest if not loaded
    if deps.manifest is None:
        deps.manifest = load_manifest(deps.skills_path)
    
    # Load skill
    try:
        skill = load_skill_content(deps.skills_path, skill_name, deps.manifest)
        deps.loaded_skills[skill_name] = skill
        return f"# {skill_name} Skill\n\n{skill.content}"
    except (FileNotFoundError, ValueError) as e:
        return f"Error loading skill: {e}"

async def read_reference_tool(
    ctx: RunContext[AgentDependencies], 
    skill_name: str, 
    reference_name: str
) -> str:
    """
    Load a reference document mentioned in a skill's instructions.
    
    Only call this if the skill instructions explicitly mention a reference document
    that you need to complete the task.
    
    Args:
        skill_name: Name of the skill that owns the reference
        reference_name: Name of the reference file (e.g., "api_reference.md")
    
    Returns:
        The reference document content
    """
    deps = ctx.deps
    cache_key = f"{skill_name}:{reference_name}"
    
    # Check cache
    if cache_key in deps.loaded_references:
        return f"[Reference already loaded]\n\n{deps.loaded_references[cache_key].content}"
    
    # Load manifest if not loaded
    if deps.manifest is None:
        deps.manifest = load_manifest(deps.skills_path)
    
    # Load reference
    try:
        ref = load_reference_content(deps.skills_path, skill_name, reference_name, deps.manifest)
        deps.loaded_references[cache_key] = ref
        return f"# Reference: {reference_name}\n\n{ref.content}"
    except (FileNotFoundError, ValueError) as e:
        return f"Error loading reference: {e}"

# ============================================================================
# Agent Factory
# ============================================================================

def create_agent(
    model: str = "anthropic:claude-sonnet-4-20250514",
    skills_path: str | Path = "./zonewise/skills"
) -> Agent[AgentDependencies, str]:
    """
    Create a ZoneWise.AI agent with progressive disclosure skills.
    
    Args:
        model: LLM model to use (default: Claude Sonnet 4)
        skills_path: Path to skills directory
    
    Returns:
        Configured Pydantic AI agent
    
    Example:
        agent = create_agent()
        deps = AgentDependencies(skills_path="./zonewise/skills")
        result = await agent.run("What zoning applies to this parcel?", deps=deps)
    """
    skills_path = Path(skills_path)
    
    # Load manifest for system prompt
    manifest = load_manifest(skills_path)
    skill_descriptions = get_skill_descriptions(manifest)
    
    # Create system prompt
    system_prompt = SYSTEM_PROMPT.format(skill_descriptions=skill_descriptions)
    
    # Create agent
    agent = Agent(
        model,
        system_prompt=system_prompt,
        deps_type=AgentDependencies,
        result_type=str
    )
    
    # Register tools
    agent.tool(load_skill_tool)
    agent.tool(read_reference_tool)
    
    return agent

# ============================================================================
# CLI Interface
# ============================================================================

async def main():
    """CLI interface for testing the agent"""
    from rich.console import Console
    from rich.prompt import Prompt
    
    console = Console()
    console.print("[bold blue]ZoneWise.AI Agent[/bold blue]")
    console.print("Type 'exit' to quit\n")
    
    agent = create_agent()
    deps = AgentDependencies(skills_path=Path("./zonewise/skills"))
    
    while True:
        try:
            user_input = Prompt.ask("[green]You[/green]")
            
            if user_input.lower() in ("exit", "quit"):
                break
            
            result = await agent.run(user_input, deps=deps)
            console.print(f"\n[blue]ZoneWise[/blue]: {result.data}\n")
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            console.print(f"[red]Error[/red]: {e}\n")
    
    console.print("\nGoodbye!")

if __name__ == "__main__":
    asyncio.run(main())
