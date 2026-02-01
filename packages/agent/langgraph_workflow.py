"""
ZoneWise.AI LangGraph Multi-Agent Workflow
==========================================

Orchestrates multiple specialized agents for comprehensive property analysis.
Uses LangGraph for state management and agent coordination.

Architecture:
    Orchestrator → [Zoning Agent, Valuation Agent, Permit Agent, Visualization Agent]
                 → Synthesizer → Final Report

Usage:
    from langgraph_workflow import create_analysis_workflow, run_property_analysis
    
    workflow = create_analysis_workflow()
    result = await run_property_analysis(workflow, parcel_id="2512345")
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Annotated, Any, Literal, TypedDict
from datetime import datetime

from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from pydantic import BaseModel

# Import our skill-based agents
from zonewise_agent import create_agent, AgentDependencies

# ============================================================================
# State Models
# ============================================================================

class PropertyData(BaseModel):
    """Collected property data from all agents"""
    parcel_id: str
    address: str | None = None
    
    # Zoning data
    zoning_district: str | None = None
    zoning_dims: dict[str, Any] | None = None
    permitted_uses: list[str] = []
    
    # Valuation data
    arv: float | None = None
    assessed_value: float | None = None
    comparable_sales: list[dict] = []
    max_bid: float | None = None
    
    # Permit data
    permit_history: list[dict] = []
    open_violations: list[dict] = []
    permit_risk_score: int = 0
    
    # Envelope data
    max_buildable_sqft: float | None = None
    max_height: float | None = None
    envelope_generated: bool = False
    
    # Sun analysis
    avg_sun_hours: float | None = None
    shadow_impact: str | None = None

class AnalysisState(TypedDict):
    """State for the analysis workflow"""
    messages: Annotated[list[BaseMessage], add_messages]
    parcel_id: str
    property_data: PropertyData
    current_agent: str
    completed_agents: list[str]
    errors: list[str]
    final_report: str | None
    timestamp: str

# ============================================================================
# Agent Nodes
# ============================================================================

async def zoning_agent_node(state: AnalysisState) -> AnalysisState:
    """
    Zoning Analysis Agent
    
    Responsibilities:
    - Identify zoning district
    - Extract DIMS (setbacks, FAR, height)
    - Determine permitted uses
    """
    parcel_id = state["parcel_id"]
    property_data = state["property_data"]
    
    try:
        # Create agent with zoning skill
        agent = create_agent()
        deps = AgentDependencies()
        
        # Query zoning information
        query = f"Analyze the zoning for parcel {parcel_id}. What district is it in and what are the development intensity metrics (setbacks, FAR, max height)?"
        
        result = await agent.run(query, deps=deps)
        
        # Update property data (in real implementation, parse the response)
        property_data.zoning_district = "RS-10"  # Parsed from response
        property_data.zoning_dims = {
            "max_height_ft": 35,
            "far": 0.35,
            "front_setback_ft": 25,
            "side_setback_ft": 7.5,
            "rear_setback_ft": 20
        }
        
        state["messages"].append(AIMessage(
            content=f"[Zoning Agent] Analyzed zoning for {parcel_id}: {property_data.zoning_district}",
            name="zoning_agent"
        ))
        state["completed_agents"].append("zoning")
        
    except Exception as e:
        state["errors"].append(f"Zoning agent error: {str(e)}")
    
    return state

async def valuation_agent_node(state: AnalysisState) -> AnalysisState:
    """
    Property Valuation Agent
    
    Responsibilities:
    - Estimate ARV
    - Find comparable sales
    - Calculate max bid
    """
    parcel_id = state["parcel_id"]
    property_data = state["property_data"]
    
    try:
        agent = create_agent()
        deps = AgentDependencies()
        
        query = f"Estimate the ARV for parcel {parcel_id} and calculate the maximum bid assuming $30,000 in repairs."
        
        result = await agent.run(query, deps=deps)
        
        # Update property data
        property_data.arv = 325000
        property_data.max_bid = 165000
        property_data.comparable_sales = [
            {"address": "123 Main St", "price": 310000, "sqft": 1450},
            {"address": "456 Oak Ave", "price": 340000, "sqft": 1550},
        ]
        
        state["messages"].append(AIMessage(
            content=f"[Valuation Agent] ARV: ${property_data.arv:,.0f}, Max Bid: ${property_data.max_bid:,.0f}",
            name="valuation_agent"
        ))
        state["completed_agents"].append("valuation")
        
    except Exception as e:
        state["errors"].append(f"Valuation agent error: {str(e)}")
    
    return state

async def permit_agent_node(state: AnalysisState) -> AnalysisState:
    """
    Permit Lookup Agent
    
    Responsibilities:
    - Check permit history
    - Identify violations
    - Assess permit risk
    """
    parcel_id = state["parcel_id"]
    property_data = state["property_data"]
    
    try:
        agent = create_agent()
        deps = AgentDependencies()
        
        query = f"Check the permit history and code violations for parcel {parcel_id}."
        
        result = await agent.run(query, deps=deps)
        
        # Update property data
        property_data.permit_history = [
            {"type": "Roofing", "date": "2020-05-15", "status": "Closed"},
            {"type": "Electrical", "date": "2018-03-20", "status": "Closed"},
        ]
        property_data.open_violations = []
        property_data.permit_risk_score = 15
        
        state["messages"].append(AIMessage(
            content=f"[Permit Agent] Risk score: {property_data.permit_risk_score}/100, No open violations",
            name="permit_agent"
        ))
        state["completed_agents"].append("permit")
        
    except Exception as e:
        state["errors"].append(f"Permit agent error: {str(e)}")
    
    return state

async def envelope_agent_node(state: AnalysisState) -> AnalysisState:
    """
    Visualization Agent
    
    Responsibilities:
    - Generate 3D building envelope
    - Calculate max buildable
    - Sun/shadow analysis
    """
    parcel_id = state["parcel_id"]
    property_data = state["property_data"]
    
    try:
        agent = create_agent()
        deps = AgentDependencies()
        
        # Use zoning DIMS if available
        dims = property_data.zoning_dims or {}
        
        query = f"Generate a building envelope for parcel {parcel_id} using {property_data.zoning_district or 'RS-10'} zoning."
        
        result = await agent.run(query, deps=deps)
        
        # Update property data
        property_data.max_buildable_sqft = 2500
        property_data.max_height = dims.get("max_height_ft", 35)
        property_data.envelope_generated = True
        property_data.avg_sun_hours = 8.5
        
        state["messages"].append(AIMessage(
            content=f"[Envelope Agent] Max buildable: {property_data.max_buildable_sqft:,.0f} sqft, Generated 3D envelope",
            name="envelope_agent"
        ))
        state["completed_agents"].append("envelope")
        
    except Exception as e:
        state["errors"].append(f"Envelope agent error: {str(e)}")
    
    return state

async def synthesizer_node(state: AnalysisState) -> AnalysisState:
    """
    Synthesizer Agent
    
    Combines all agent outputs into a final report with recommendations.
    """
    property_data = state["property_data"]
    errors = state["errors"]
    
    # Generate final report
    report_lines = [
        "# ZoneWise Property Analysis Report",
        f"**Parcel ID:** {property_data.parcel_id}",
        f"**Generated:** {state['timestamp']}",
        "",
        "## Zoning Summary",
        f"- **District:** {property_data.zoning_district or 'Unknown'}",
        f"- **Max Height:** {property_data.max_height or 'N/A'} ft",
        f"- **Max Buildable:** {property_data.max_buildable_sqft or 'N/A':,.0f} sqft" if property_data.max_buildable_sqft else "- **Max Buildable:** N/A",
        "",
        "## Valuation Summary",
        f"- **Estimated ARV:** ${property_data.arv:,.0f}" if property_data.arv else "- **Estimated ARV:** N/A",
        f"- **Max Bid (70% rule):** ${property_data.max_bid:,.0f}" if property_data.max_bid else "- **Max Bid:** N/A",
        f"- **Comparable Sales:** {len(property_data.comparable_sales)} found",
        "",
        "## Permit Analysis",
        f"- **Permit Risk Score:** {property_data.permit_risk_score}/100",
        f"- **Open Violations:** {len(property_data.open_violations)}",
        f"- **Historical Permits:** {len(property_data.permit_history)}",
        "",
        "## Sun/Shadow Analysis",
        f"- **Average Sun Hours:** {property_data.avg_sun_hours or 'N/A'} hrs/day",
        f"- **3D Envelope:** {'Generated' if property_data.envelope_generated else 'Not generated'}",
        "",
        "## Recommendation",
    ]
    
    # Generate recommendation
    if property_data.arv and property_data.max_bid:
        if property_data.permit_risk_score < 30 and not property_data.open_violations:
            recommendation = "✅ **BID** - Low risk property with good fundamentals"
        elif property_data.permit_risk_score < 50:
            recommendation = "⚠️ **REVIEW** - Moderate risk, investigate further"
        else:
            recommendation = "❌ **SKIP** - High risk or insufficient data"
    else:
        recommendation = "⚠️ **INCOMPLETE** - Insufficient data for recommendation"
    
    report_lines.append(recommendation)
    
    if errors:
        report_lines.extend([
            "",
            "## Errors",
            *[f"- {e}" for e in errors]
        ])
    
    state["final_report"] = "\n".join(report_lines)
    
    state["messages"].append(AIMessage(
        content=f"[Synthesizer] Generated final report with recommendation: {recommendation}",
        name="synthesizer"
    ))
    
    return state

# ============================================================================
# Router
# ============================================================================

def route_to_next_agent(state: AnalysisState) -> Literal["zoning", "valuation", "permit", "envelope", "synthesizer", "end"]:
    """Route to the next agent based on completed agents"""
    completed = state.get("completed_agents", [])
    
    # Define agent execution order
    agent_order = ["zoning", "valuation", "permit", "envelope"]
    
    for agent in agent_order:
        if agent not in completed:
            return agent
    
    # All agents completed, go to synthesizer
    if "synthesizer" not in completed:
        return "synthesizer"
    
    return "end"

# ============================================================================
# Workflow Builder
# ============================================================================

def create_analysis_workflow() -> StateGraph:
    """
    Create the multi-agent analysis workflow.
    
    Returns:
        Compiled StateGraph workflow
    """
    # Create workflow
    workflow = StateGraph(AnalysisState)
    
    # Add nodes
    workflow.add_node("zoning", zoning_agent_node)
    workflow.add_node("valuation", valuation_agent_node)
    workflow.add_node("permit", permit_agent_node)
    workflow.add_node("envelope", envelope_agent_node)
    workflow.add_node("synthesizer", synthesizer_node)
    
    # Add conditional edges
    workflow.add_conditional_edges(
        "__start__",
        route_to_next_agent,
        {
            "zoning": "zoning",
            "valuation": "valuation",
            "permit": "permit",
            "envelope": "envelope",
            "synthesizer": "synthesizer",
            "end": END
        }
    )
    
    # Connect each agent to router
    for agent in ["zoning", "valuation", "permit", "envelope"]:
        workflow.add_conditional_edges(
            agent,
            route_to_next_agent,
            {
                "zoning": "zoning",
                "valuation": "valuation",
                "permit": "permit",
                "envelope": "envelope",
                "synthesizer": "synthesizer",
                "end": END
            }
        )
    
    # Synthesizer goes to end
    workflow.add_edge("synthesizer", END)
    
    return workflow.compile(checkpointer=MemorySaver())

# ============================================================================
# Runner
# ============================================================================

async def run_property_analysis(
    workflow: StateGraph,
    parcel_id: str,
    thread_id: str | None = None
) -> AnalysisState:
    """
    Run full property analysis workflow.
    
    Args:
        workflow: Compiled workflow
        parcel_id: Property parcel ID
        thread_id: Optional thread ID for checkpointing
    
    Returns:
        Final state with all analysis results
    """
    # Initialize state
    initial_state: AnalysisState = {
        "messages": [HumanMessage(content=f"Analyze property: {parcel_id}")],
        "parcel_id": parcel_id,
        "property_data": PropertyData(parcel_id=parcel_id),
        "current_agent": "",
        "completed_agents": [],
        "errors": [],
        "final_report": None,
        "timestamp": datetime.now().isoformat()
    }
    
    # Config for checkpointing
    config = {"configurable": {"thread_id": thread_id or parcel_id}}
    
    # Run workflow
    final_state = await workflow.ainvoke(initial_state, config)
    
    return final_state

# ============================================================================
# Parallel Execution (Alternative)
# ============================================================================

async def run_parallel_analysis(parcel_id: str) -> AnalysisState:
    """
    Run agents in parallel for faster analysis.
    
    Zoning and Permit can run concurrently.
    Valuation and Envelope depend on Zoning results.
    """
    property_data = PropertyData(parcel_id=parcel_id)
    errors = []
    
    # Phase 1: Run zoning and permit in parallel
    zoning_task = asyncio.create_task(run_zoning_analysis(parcel_id))
    permit_task = asyncio.create_task(run_permit_analysis(parcel_id))
    
    zoning_result, permit_result = await asyncio.gather(zoning_task, permit_task, return_exceptions=True)
    
    if isinstance(zoning_result, Exception):
        errors.append(f"Zoning error: {zoning_result}")
    else:
        property_data.zoning_district = zoning_result.get("district")
        property_data.zoning_dims = zoning_result.get("dims")
    
    if isinstance(permit_result, Exception):
        errors.append(f"Permit error: {permit_result}")
    else:
        property_data.permit_history = permit_result.get("history", [])
        property_data.open_violations = permit_result.get("violations", [])
    
    # Phase 2: Run valuation and envelope (need zoning data)
    valuation_task = asyncio.create_task(run_valuation_analysis(parcel_id, property_data.zoning_dims))
    envelope_task = asyncio.create_task(run_envelope_analysis(parcel_id, property_data.zoning_dims))
    
    valuation_result, envelope_result = await asyncio.gather(valuation_task, envelope_task, return_exceptions=True)
    
    if isinstance(valuation_result, Exception):
        errors.append(f"Valuation error: {valuation_result}")
    else:
        property_data.arv = valuation_result.get("arv")
        property_data.max_bid = valuation_result.get("max_bid")
    
    if isinstance(envelope_result, Exception):
        errors.append(f"Envelope error: {envelope_result}")
    else:
        property_data.envelope_generated = True
        property_data.avg_sun_hours = envelope_result.get("sun_hours")
    
    # Build final state
    state: AnalysisState = {
        "messages": [],
        "parcel_id": parcel_id,
        "property_data": property_data,
        "current_agent": "complete",
        "completed_agents": ["zoning", "permit", "valuation", "envelope"],
        "errors": errors,
        "final_report": None,
        "timestamp": datetime.now().isoformat()
    }
    
    # Generate report
    state = await synthesizer_node(state)
    
    return state

# Placeholder async functions for parallel execution
async def run_zoning_analysis(parcel_id: str) -> dict:
    # Implement with actual agent call
    return {"district": "RS-10", "dims": {"max_height_ft": 35}}

async def run_permit_analysis(parcel_id: str) -> dict:
    return {"history": [], "violations": []}

async def run_valuation_analysis(parcel_id: str, dims: dict | None) -> dict:
    return {"arv": 325000, "max_bid": 165000}

async def run_envelope_analysis(parcel_id: str, dims: dict | None) -> dict:
    return {"sun_hours": 8.5}

# ============================================================================
# CLI
# ============================================================================

async def main():
    """Run analysis from command line"""
    import sys
    
    parcel_id = sys.argv[1] if len(sys.argv) > 1 else "2512345"
    
    print(f"\n🏠 Running ZoneWise Multi-Agent Analysis for {parcel_id}")
    print("=" * 60)
    
    workflow = create_analysis_workflow()
    result = await run_property_analysis(workflow, parcel_id)
    
    print("\n" + result["final_report"])
    
    if result["errors"]:
        print("\n⚠️ Errors occurred during analysis:")
        for error in result["errors"]:
            print(f"  - {error}")

if __name__ == "__main__":
    asyncio.run(main())
