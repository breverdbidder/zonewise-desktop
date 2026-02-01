"""
ZoneWise.AI Skill Evaluations
=============================

Pydantic Evals for testing skill-based agent behavior.
Ensures the agent correctly loads and uses skills for different queries.

Based on Cole Medin's evaluation patterns from custom-agent-with-skills.

Usage:
    # Run all evals
    uv run pytest packages/agent/tests/test_skill_evals.py -v
    
    # Run specific eval
    uv run pytest packages/agent/tests/test_skill_evals.py::test_sun_analysis_skill -v
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any
from pathlib import Path

import pytest
from pydantic import BaseModel
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

# Import our agent
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from zonewise_agent import create_agent, AgentDependencies, load_manifest

# ============================================================================
# Eval Data Models
# ============================================================================

class SkillEvalCase(BaseModel):
    """A single evaluation case for skill loading"""
    name: str
    query: str
    expected_skills: list[str]  # Skills that SHOULD be loaded
    forbidden_skills: list[str] = []  # Skills that should NOT be loaded
    expected_in_response: list[str] = []  # Keywords expected in response
    description: str = ""

class SkillEvalResult(BaseModel):
    """Result of an evaluation"""
    case_name: str
    passed: bool
    skills_loaded: list[str]
    skills_missing: list[str]
    forbidden_loaded: list[str]
    response_keywords_found: list[str]
    response_keywords_missing: list[str]
    error: str | None = None

# ============================================================================
# Evaluation Cases
# ============================================================================

SKILL_EVAL_CASES: list[SkillEvalCase] = [
    # ========== Zoning Analysis ==========
    SkillEvalCase(
        name="zoning_query",
        query="What zoning district is RS-10 and what are its setbacks?",
        expected_skills=["zoning-analysis"],
        forbidden_skills=["sun-analysis", "property-valuation"],
        expected_in_response=["setback", "RS-10"],
        description="Should load zoning-analysis for zoning questions"
    ),
    
    # ========== Envelope Development ==========
    SkillEvalCase(
        name="envelope_query",
        query="Generate a 3D building envelope for an RS-10 lot",
        expected_skills=["envelope-development"],
        expected_in_response=["envelope", "height", "FAR"],
        description="Should load envelope-development for 3D generation"
    ),
    
    # ========== Sun Analysis ==========
    SkillEvalCase(
        name="sun_analysis_query",
        query="What time does the sun set on June 21 in Malabar, FL?",
        expected_skills=["sun-analysis"],
        forbidden_skills=["zoning-analysis", "envelope-development"],
        expected_in_response=["sunset", "June"],
        description="Should load sun-analysis for sun/shadow questions"
    ),
    SkillEvalCase(
        name="shadow_query",
        query="Analyze the shadow impact of this building throughout the day",
        expected_skills=["sun-analysis"],
        expected_in_response=["shadow", "sun"],
        description="Should load sun-analysis for shadow analysis"
    ),
    
    # ========== Property Valuation ==========
    SkillEvalCase(
        name="arv_query",
        query="What's the ARV for a 1,500 sqft house in Satellite Beach?",
        expected_skills=["property-valuation"],
        forbidden_skills=["zoning-analysis"],
        expected_in_response=["ARV", "value"],
        description="Should load property-valuation for ARV questions"
    ),
    SkillEvalCase(
        name="max_bid_query",
        query="Calculate the maximum bid for a property with ARV of $350,000 and $40,000 repairs",
        expected_skills=["property-valuation"],
        expected_in_response=["max bid", "70%"],
        description="Should load property-valuation for max bid calculation"
    ),
    SkillEvalCase(
        name="comps_query",
        query="Find comparable sales within 1 mile of this property",
        expected_skills=["property-valuation"],
        expected_in_response=["comparable", "sales"],
        description="Should load property-valuation for comp analysis"
    ),
    
    # ========== Permit Lookup ==========
    SkillEvalCase(
        name="permit_query",
        query="Check the permit history for this property",
        expected_skills=["permit-lookup"],
        forbidden_skills=["property-valuation"],
        expected_in_response=["permit"],
        description="Should load permit-lookup for permit questions"
    ),
    SkillEvalCase(
        name="violation_query",
        query="Are there any code violations on this parcel?",
        expected_skills=["permit-lookup"],
        expected_in_response=["violation", "code"],
        description="Should load permit-lookup for violation checks"
    ),
    
    # ========== Multi-Skill Queries ==========
    SkillEvalCase(
        name="investment_analysis",
        query="Analyze this foreclosure: zoning RS-10, 1500 sqft, needs $30k repairs. Is it worth bidding?",
        expected_skills=["zoning-analysis", "property-valuation"],
        expected_in_response=["zoning", "ARV", "bid"],
        description="Should load multiple skills for complex analysis"
    ),
    SkillEvalCase(
        name="development_feasibility",
        query="Can I build a 3-story building on this RS-10 lot and what would the shadow impact be?",
        expected_skills=["zoning-analysis", "envelope-development", "sun-analysis"],
        expected_in_response=["height", "envelope", "shadow"],
        description="Should load zoning + envelope + sun for development questions"
    ),
    
    # ========== No Skill Needed ==========
    SkillEvalCase(
        name="general_question",
        query="What is Brevard County?",
        expected_skills=[],  # No skill should be loaded
        forbidden_skills=["zoning-analysis", "property-valuation", "permit-lookup"],
        expected_in_response=["Florida", "county"],
        description="Should NOT load skills for general knowledge questions"
    ),
]

# ============================================================================
# Evaluation Runner
# ============================================================================

class SkillEvaluator:
    """Evaluates agent skill loading behavior"""
    
    def __init__(self, agent: Agent, deps: AgentDependencies):
        self.agent = agent
        self.deps = deps
    
    async def run_eval(self, case: SkillEvalCase) -> SkillEvalResult:
        """Run a single evaluation case"""
        # Reset loaded skills
        self.deps.loaded_skills = {}
        self.deps.loaded_references = {}
        
        try:
            # Run the agent
            result = await self.agent.run(case.query, deps=self.deps)
            response = result.data.lower() if result.data else ""
            
            # Check which skills were loaded
            skills_loaded = list(self.deps.loaded_skills.keys())
            
            # Check for missing expected skills
            skills_missing = [s for s in case.expected_skills if s not in skills_loaded]
            
            # Check for forbidden skills that were loaded
            forbidden_loaded = [s for s in case.forbidden_skills if s in skills_loaded]
            
            # Check for expected keywords in response
            response_keywords_found = [kw for kw in case.expected_in_response if kw.lower() in response]
            response_keywords_missing = [kw for kw in case.expected_in_response if kw.lower() not in response]
            
            # Determine if eval passed
            passed = (
                len(skills_missing) == 0 and
                len(forbidden_loaded) == 0 and
                len(response_keywords_missing) == 0
            )
            
            return SkillEvalResult(
                case_name=case.name,
                passed=passed,
                skills_loaded=skills_loaded,
                skills_missing=skills_missing,
                forbidden_loaded=forbidden_loaded,
                response_keywords_found=response_keywords_found,
                response_keywords_missing=response_keywords_missing
            )
            
        except Exception as e:
            return SkillEvalResult(
                case_name=case.name,
                passed=False,
                skills_loaded=[],
                skills_missing=case.expected_skills,
                forbidden_loaded=[],
                response_keywords_found=[],
                response_keywords_missing=case.expected_in_response,
                error=str(e)
            )
    
    async def run_all_evals(self) -> list[SkillEvalResult]:
        """Run all evaluation cases"""
        results = []
        for case in SKILL_EVAL_CASES:
            result = await self.run_eval(case)
            results.append(result)
        return results
    
    def print_report(self, results: list[SkillEvalResult]) -> None:
        """Print evaluation report"""
        passed = sum(1 for r in results if r.passed)
        total = len(results)
        
        print("\n" + "=" * 60)
        print("ZONEWISE SKILL EVALUATION REPORT")
        print("=" * 60)
        print(f"\nOverall: {passed}/{total} passed ({passed/total*100:.1f}%)\n")
        
        for result in results:
            status = "✅ PASS" if result.passed else "❌ FAIL"
            print(f"{status} | {result.case_name}")
            
            if not result.passed:
                if result.skills_missing:
                    print(f"   Missing skills: {result.skills_missing}")
                if result.forbidden_loaded:
                    print(f"   Forbidden skills loaded: {result.forbidden_loaded}")
                if result.response_keywords_missing:
                    print(f"   Missing keywords: {result.response_keywords_missing}")
                if result.error:
                    print(f"   Error: {result.error}")
        
        print("\n" + "=" * 60)

# ============================================================================
# Pytest Fixtures
# ============================================================================

@pytest.fixture
def skills_path():
    """Path to skills directory"""
    return Path(__file__).parent.parent.parent.parent / "zonewise" / "skills"

@pytest.fixture
def agent_deps(skills_path):
    """Create agent dependencies"""
    return AgentDependencies(skills_path=skills_path)

@pytest.fixture
def test_agent(skills_path):
    """Create agent with test model"""
    # Use TestModel for deterministic testing
    agent = create_agent(model=TestModel(), skills_path=skills_path)
    return agent

@pytest.fixture
def evaluator(test_agent, agent_deps):
    """Create skill evaluator"""
    return SkillEvaluator(test_agent, agent_deps)

# ============================================================================
# Pytest Test Cases
# ============================================================================

@pytest.mark.asyncio
async def test_zoning_skill(evaluator):
    """Test that zoning questions load zoning-analysis skill"""
    case = next(c for c in SKILL_EVAL_CASES if c.name == "zoning_query")
    result = await evaluator.run_eval(case)
    assert result.passed, f"Failed: {result.skills_missing or result.error}"

@pytest.mark.asyncio
async def test_envelope_skill(evaluator):
    """Test that envelope questions load envelope-development skill"""
    case = next(c for c in SKILL_EVAL_CASES if c.name == "envelope_query")
    result = await evaluator.run_eval(case)
    assert result.passed, f"Failed: {result.skills_missing or result.error}"

@pytest.mark.asyncio
async def test_sun_analysis_skill(evaluator):
    """Test that sun questions load sun-analysis skill"""
    case = next(c for c in SKILL_EVAL_CASES if c.name == "sun_analysis_query")
    result = await evaluator.run_eval(case)
    assert result.passed, f"Failed: {result.skills_missing or result.error}"

@pytest.mark.asyncio
async def test_property_valuation_skill(evaluator):
    """Test that ARV questions load property-valuation skill"""
    case = next(c for c in SKILL_EVAL_CASES if c.name == "arv_query")
    result = await evaluator.run_eval(case)
    assert result.passed, f"Failed: {result.skills_missing or result.error}"

@pytest.mark.asyncio
async def test_permit_skill(evaluator):
    """Test that permit questions load permit-lookup skill"""
    case = next(c for c in SKILL_EVAL_CASES if c.name == "permit_query")
    result = await evaluator.run_eval(case)
    assert result.passed, f"Failed: {result.skills_missing or result.error}"

@pytest.mark.asyncio
async def test_multi_skill_query(evaluator):
    """Test that complex queries load multiple skills"""
    case = next(c for c in SKILL_EVAL_CASES if c.name == "investment_analysis")
    result = await evaluator.run_eval(case)
    assert result.passed, f"Failed: {result.skills_missing or result.error}"

@pytest.mark.asyncio
async def test_no_skill_needed(evaluator):
    """Test that general questions don't load unnecessary skills"""
    case = next(c for c in SKILL_EVAL_CASES if c.name == "general_question")
    result = await evaluator.run_eval(case)
    # For this case, we only check that forbidden skills weren't loaded
    assert len(result.forbidden_loaded) == 0, f"Loaded unnecessary skills: {result.forbidden_loaded}"

@pytest.mark.asyncio
async def test_all_evals(evaluator):
    """Run all evaluation cases"""
    results = await evaluator.run_all_evals()
    evaluator.print_report(results)
    
    passed = sum(1 for r in results if r.passed)
    total = len(results)
    
    # Require at least 80% pass rate
    assert passed / total >= 0.8, f"Only {passed}/{total} evals passed"

# ============================================================================
# CLI Runner
# ============================================================================

async def main():
    """Run evaluations from command line"""
    from pathlib import Path
    
    skills_path = Path("./zonewise/skills")
    
    if not skills_path.exists():
        print(f"Skills path not found: {skills_path}")
        return
    
    # Create agent with real model (or TestModel for testing)
    agent = create_agent(skills_path=skills_path)
    deps = AgentDependencies(skills_path=skills_path)
    
    evaluator = SkillEvaluator(agent, deps)
    results = await evaluator.run_all_evals()
    evaluator.print_report(results)

if __name__ == "__main__":
    asyncio.run(main())
