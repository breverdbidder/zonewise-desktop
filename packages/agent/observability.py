"""
ZoneWise.AI Observability with Logfire
======================================

Production-grade observability for skill-based agents.
Integrates Pydantic Logfire for tracing, metrics, and debugging.

Features:
- Skill loading traces
- Agent execution spans
- Token usage metrics
- Error tracking
- Performance dashboards

Usage:
    from observability import init_logfire, trace_skill_load, trace_agent_run
    
    init_logfire()
    
    with trace_skill_load("zoning-analysis"):
        skill = await loader.load_skill("zoning-analysis")
    
    with trace_agent_run("property-analysis", parcel_id="123"):
        result = await agent.run(query, deps=deps)
"""

from __future__ import annotations

import os
import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable

# Conditional import - graceful fallback if logfire not installed
try:
    import logfire
    LOGFIRE_AVAILABLE = True
except ImportError:
    LOGFIRE_AVAILABLE = False
    logfire = None

# ============================================================================
# Configuration
# ============================================================================

@dataclass
class LogfireConfig:
    """Logfire configuration"""
    project_name: str = "zonewise-ai"
    service_name: str = "skill-agent"
    environment: str = "development"
    send_to_logfire: bool = True
    console_output: bool = True
    
    @classmethod
    def from_env(cls) -> "LogfireConfig":
        return cls(
            project_name=os.getenv("LOGFIRE_PROJECT", "zonewise-ai"),
            service_name=os.getenv("LOGFIRE_SERVICE", "skill-agent"),
            environment=os.getenv("LOGFIRE_ENV", "development"),
            send_to_logfire=os.getenv("LOGFIRE_ENABLED", "true").lower() == "true",
            console_output=os.getenv("LOGFIRE_CONSOLE", "true").lower() == "true"
        )

# ============================================================================
# Initialization
# ============================================================================

_initialized = False

def init_logfire(config: LogfireConfig | None = None) -> bool:
    """
    Initialize Logfire observability.
    
    Args:
        config: Optional configuration (defaults to environment variables)
    
    Returns:
        True if initialized successfully, False otherwise
    """
    global _initialized
    
    if _initialized:
        return True
    
    if not LOGFIRE_AVAILABLE:
        print("[Observability] Logfire not installed. Run: pip install logfire")
        return False
    
    config = config or LogfireConfig.from_env()
    
    try:
        logfire.configure(
            service_name=config.service_name,
            send_to_logfire=config.send_to_logfire,
            console=config.console_output
        )
        
        # Set up Pydantic AI instrumentation
        logfire.instrument_pydantic_ai()
        
        _initialized = True
        logfire.info(
            "ZoneWise observability initialized",
            project=config.project_name,
            environment=config.environment
        )
        return True
        
    except Exception as e:
        print(f"[Observability] Failed to initialize Logfire: {e}")
        return False

# ============================================================================
# Skill Tracing
# ============================================================================

@dataclass
class SkillTrace:
    """Trace data for a skill load"""
    skill_name: str
    started_at: datetime
    ended_at: datetime | None = None
    duration_ms: float = 0
    success: bool = True
    error: str | None = None
    tokens_estimated: int = 0
    references_loaded: list[str] = field(default_factory=list)

@contextmanager
def trace_skill_load(skill_name: str, tokens_estimated: int = 0):
    """
    Context manager to trace skill loading.
    
    Usage:
        with trace_skill_load("zoning-analysis", tokens_estimated=1500):
            skill = await loader.load_skill("zoning-analysis")
    """
    trace = SkillTrace(
        skill_name=skill_name,
        started_at=datetime.now(),
        tokens_estimated=tokens_estimated
    )
    start_time = time.perf_counter()
    
    if LOGFIRE_AVAILABLE and _initialized:
        with logfire.span(
            f"skill.load.{skill_name}",
            skill_name=skill_name,
            tokens_estimated=tokens_estimated
        ) as span:
            try:
                yield trace
                trace.success = True
            except Exception as e:
                trace.success = False
                trace.error = str(e)
                span.set_attribute("error", str(e))
                raise
            finally:
                trace.ended_at = datetime.now()
                trace.duration_ms = (time.perf_counter() - start_time) * 1000
                span.set_attribute("duration_ms", trace.duration_ms)
                span.set_attribute("success", trace.success)
    else:
        # Fallback without Logfire
        try:
            yield trace
            trace.success = True
        except Exception as e:
            trace.success = False
            trace.error = str(e)
            raise
        finally:
            trace.ended_at = datetime.now()
            trace.duration_ms = (time.perf_counter() - start_time) * 1000

@contextmanager
def trace_reference_load(skill_name: str, reference_name: str):
    """Trace reference document loading"""
    start_time = time.perf_counter()
    
    if LOGFIRE_AVAILABLE and _initialized:
        with logfire.span(
            f"reference.load.{skill_name}.{reference_name}",
            skill_name=skill_name,
            reference_name=reference_name
        ):
            yield
    else:
        yield
    
    duration_ms = (time.perf_counter() - start_time) * 1000
    if LOGFIRE_AVAILABLE and _initialized:
        logfire.debug(
            "Reference loaded",
            skill_name=skill_name,
            reference_name=reference_name,
            duration_ms=duration_ms
        )

# ============================================================================
# Agent Tracing
# ============================================================================

@dataclass
class AgentTrace:
    """Trace data for an agent run"""
    agent_name: str
    query: str
    started_at: datetime
    ended_at: datetime | None = None
    duration_ms: float = 0
    success: bool = True
    error: str | None = None
    skills_loaded: list[str] = field(default_factory=list)
    tokens_input: int = 0
    tokens_output: int = 0
    metadata: dict[str, Any] = field(default_factory=dict)

@contextmanager
def trace_agent_run(agent_name: str, query: str = "", **metadata):
    """
    Context manager to trace agent execution.
    
    Usage:
        with trace_agent_run("property-analysis", parcel_id="123") as trace:
            result = await agent.run(query, deps=deps)
            trace.skills_loaded = deps.loaded_skills.keys()
    """
    trace = AgentTrace(
        agent_name=agent_name,
        query=query,
        started_at=datetime.now(),
        metadata=metadata
    )
    start_time = time.perf_counter()
    
    if LOGFIRE_AVAILABLE and _initialized:
        with logfire.span(
            f"agent.run.{agent_name}",
            agent_name=agent_name,
            query=query[:100] if query else "",
            **metadata
        ) as span:
            try:
                yield trace
                trace.success = True
            except Exception as e:
                trace.success = False
                trace.error = str(e)
                span.set_attribute("error", str(e))
                logfire.error(
                    f"Agent {agent_name} failed",
                    error=str(e),
                    agent_name=agent_name
                )
                raise
            finally:
                trace.ended_at = datetime.now()
                trace.duration_ms = (time.perf_counter() - start_time) * 1000
                span.set_attribute("duration_ms", trace.duration_ms)
                span.set_attribute("success", trace.success)
                span.set_attribute("skills_loaded", trace.skills_loaded)
                span.set_attribute("tokens_input", trace.tokens_input)
                span.set_attribute("tokens_output", trace.tokens_output)
    else:
        try:
            yield trace
            trace.success = True
        except Exception as e:
            trace.success = False
            trace.error = str(e)
            raise
        finally:
            trace.ended_at = datetime.now()
            trace.duration_ms = (time.perf_counter() - start_time) * 1000

# ============================================================================
# Metrics
# ============================================================================

class SkillMetrics:
    """Aggregated metrics for skill usage"""
    
    def __init__(self):
        self.skill_loads: dict[str, int] = {}
        self.skill_durations: dict[str, list[float]] = {}
        self.skill_errors: dict[str, int] = {}
        self.total_tokens: int = 0
    
    def record_load(self, skill_name: str, duration_ms: float, success: bool, tokens: int = 0):
        """Record a skill load event"""
        self.skill_loads[skill_name] = self.skill_loads.get(skill_name, 0) + 1
        
        if skill_name not in self.skill_durations:
            self.skill_durations[skill_name] = []
        self.skill_durations[skill_name].append(duration_ms)
        
        if not success:
            self.skill_errors[skill_name] = self.skill_errors.get(skill_name, 0) + 1
        
        self.total_tokens += tokens
        
        if LOGFIRE_AVAILABLE and _initialized:
            logfire.metric_counter("skill_loads_total", 1, skill_name=skill_name)
            logfire.metric_histogram("skill_load_duration_ms", duration_ms, skill_name=skill_name)
            if not success:
                logfire.metric_counter("skill_errors_total", 1, skill_name=skill_name)
    
    def get_stats(self, skill_name: str) -> dict[str, Any]:
        """Get statistics for a skill"""
        durations = self.skill_durations.get(skill_name, [])
        return {
            "loads": self.skill_loads.get(skill_name, 0),
            "errors": self.skill_errors.get(skill_name, 0),
            "avg_duration_ms": sum(durations) / len(durations) if durations else 0,
            "min_duration_ms": min(durations) if durations else 0,
            "max_duration_ms": max(durations) if durations else 0
        }
    
    def get_summary(self) -> dict[str, Any]:
        """Get overall metrics summary"""
        return {
            "total_loads": sum(self.skill_loads.values()),
            "total_errors": sum(self.skill_errors.values()),
            "total_tokens": self.total_tokens,
            "skills_used": list(self.skill_loads.keys()),
            "most_used": max(self.skill_loads, key=self.skill_loads.get) if self.skill_loads else None
        }

# Global metrics instance
metrics = SkillMetrics()

# ============================================================================
# Logging Helpers
# ============================================================================

def log_skill_decision(query: str, skills_selected: list[str], reasoning: str = ""):
    """Log which skills were selected for a query"""
    if LOGFIRE_AVAILABLE and _initialized:
        logfire.info(
            "Skill selection",
            query=query[:100],
            skills_selected=skills_selected,
            reasoning=reasoning
        )

def log_workflow_phase(workflow_id: str, phase: str, status: str, **data):
    """Log a workflow phase transition"""
    if LOGFIRE_AVAILABLE and _initialized:
        logfire.info(
            f"Workflow phase: {phase}",
            workflow_id=workflow_id,
            phase=phase,
            status=status,
            **data
        )

def log_error(message: str, **context):
    """Log an error with context"""
    if LOGFIRE_AVAILABLE and _initialized:
        logfire.error(message, **context)
    else:
        print(f"[ERROR] {message} | {context}")

def log_warning(message: str, **context):
    """Log a warning with context"""
    if LOGFIRE_AVAILABLE and _initialized:
        logfire.warn(message, **context)
    else:
        print(f"[WARN] {message} | {context}")

# ============================================================================
# Dashboard Queries
# ============================================================================

DASHBOARD_QUERIES = {
    "skill_usage_24h": """
        SELECT skill_name, COUNT(*) as loads, AVG(duration_ms) as avg_duration
        FROM spans
        WHERE span_name LIKE 'skill.load.%'
        AND timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY skill_name
        ORDER BY loads DESC
    """,
    
    "agent_performance_24h": """
        SELECT agent_name, 
               COUNT(*) as runs,
               AVG(duration_ms) as avg_duration,
               SUM(CASE WHEN success THEN 0 ELSE 1 END) as errors
        FROM spans
        WHERE span_name LIKE 'agent.run.%'
        AND timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY agent_name
    """,
    
    "errors_by_skill": """
        SELECT skill_name, COUNT(*) as error_count, 
               array_agg(DISTINCT error) as errors
        FROM spans
        WHERE span_name LIKE 'skill.load.%'
        AND success = false
        AND timestamp > NOW() - INTERVAL '7 days'
        GROUP BY skill_name
        ORDER BY error_count DESC
    """
}

# ============================================================================
# Instrumented Agent Wrapper
# ============================================================================

def instrument_agent(agent_class):
    """
    Decorator to add observability to an agent class.
    
    Usage:
        @instrument_agent
        class MyAgent:
            async def run(self, query, deps):
                ...
    """
    original_run = agent_class.run
    
    async def instrumented_run(self, query: str, deps=None, **kwargs):
        with trace_agent_run(agent_class.__name__, query=query):
            result = await original_run(self, query, deps=deps, **kwargs)
            return result
    
    agent_class.run = instrumented_run
    return agent_class

# ============================================================================
# Test/Demo
# ============================================================================

async def demo():
    """Demo the observability features"""
    init_logfire()
    
    # Trace skill load
    with trace_skill_load("zoning-analysis", tokens_estimated=1500) as trace:
        await asyncio.sleep(0.1)  # Simulate load
        trace.references_loaded = ["malabar-zoning.md"]
    
    metrics.record_load(
        "zoning-analysis",
        trace.duration_ms,
        trace.success,
        tokens=1500
    )
    
    # Trace agent run
    with trace_agent_run("property-analysis", parcel_id="2512345") as trace:
        await asyncio.sleep(0.2)  # Simulate agent work
        trace.skills_loaded = ["zoning-analysis", "property-valuation"]
        trace.tokens_input = 500
        trace.tokens_output = 1200
    
    # Print summary
    print("\n=== Metrics Summary ===")
    print(metrics.get_summary())

if __name__ == "__main__":
    import asyncio
    asyncio.run(demo())
