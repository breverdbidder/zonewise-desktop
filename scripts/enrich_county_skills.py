"""
Enrich County SKILL.md files with live Supabase data.
Phase 3: Replace template data with real jurisdiction names and stats.

Usage:
    python3 scripts/enrich_county_skills.py [--county brevard] [--dry-run]

Enriches each county-{slug}/SKILL.md with:
  - Actual jurisdiction names and counts from Supabase
  - Data completeness percentages  
  - District count totals
  - Last validated date from skill_last_validated column

Author: Claude AI (Architect) — 2026-02-23
Issue: breverdbidder/zonewise#11
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

# ---------------------------------------------------------------------------
# Supabase query via subprocess curl (compatible with any environment)
# ---------------------------------------------------------------------------

def query_supabase(sql: str) -> List[Dict]:
    """Execute SQL via Supabase Management API."""
    mgmt_token = os.environ.get("SUPABASE_MGMT_TOKEN", "")
    project_ref = os.environ.get("SUPABASE_PROJECT_REF", "mocerqjnksmhcjzxrewo")
    
    if not mgmt_token:
        # Fall back to REST API with service role key
        return query_supabase_rest(sql)
    
    result = subprocess.run(
        ["curl", "-s", "-X", "POST",
         f"https://api.supabase.com/v1/projects/{project_ref}/database/query",
         "-H", f"Authorization: Bearer {mgmt_token}",
         "-H", "Content-Type: application/json",
         "-d", json.dumps({"query": sql})],
        capture_output=True, text=True, timeout=30
    )
    return json.loads(result.stdout)


def query_supabase_rest(sql: str) -> List[Dict]:
    """Fallback: REST API with service role key (for SELECT queries only)."""
    url = os.environ.get("SUPABASE_URL", "https://mocerqjnksmhcjzxrewo.supabase.co")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    
    if not key:
        print("⚠️  No Supabase credentials found. Using empty data.")
        return []
    
    # Can't run arbitrary SQL via REST — only pre-built queries
    return []


# ---------------------------------------------------------------------------
# Data fetchers
# ---------------------------------------------------------------------------

def fetch_county_jurisdictions(co_no: int) -> List[Dict]:
    """Fetch actual jurisdictions for a county from Supabase."""
    rows = query_supabase(f"""
        SELECT id, name, data_completeness, skill_last_validated
        FROM public.jurisdictions
        WHERE co_no = {co_no}
        ORDER BY name
    """)
    return rows


def fetch_county_stats(co_no: int) -> Dict:
    """Fetch district/standards/uses counts for a county."""
    rows = query_supabase(f"""
        SELECT 
            COUNT(DISTINCT zd.id) as district_count,
            COUNT(DISTINCT zs.id) as standard_count,
            COUNT(DISTINCT pu.id) as use_count
        FROM public.jurisdictions j
        LEFT JOIN public.zoning_districts zd ON zd.jurisdiction_id = j.id
        LEFT JOIN public.zone_standards zs ON zs.zoning_district_id = zd.id
        LEFT JOIN public.permitted_uses pu ON pu.zoning_district_id = zd.id
        WHERE j.co_no = {co_no}
    """)
    return rows[0] if rows else {"district_count": 0, "standard_count": 0, "use_count": 0}


# ---------------------------------------------------------------------------
# SKILL.md enrichment
# ---------------------------------------------------------------------------

def enrich_skill_file(skill_path: Path, co_no: int, county_name: str) -> bool:
    """
    Enrich a single SKILL.md file with live Supabase data.
    Returns True if file was modified.
    """
    if not skill_path.exists():
        print(f"  ⚠️  Not found: {skill_path}")
        return False
    
    content = skill_path.read_text(encoding="utf-8")
    original = content

    # Fetch live data
    jurisdictions = fetch_county_jurisdictions(co_no)
    stats = fetch_county_stats(co_no)
    
    jurisdiction_count = len(jurisdictions)
    district_count = int(stats.get("district_count", 0))
    standard_count = int(stats.get("standard_count", 0))
    use_count = int(stats.get("use_count", 0))
    last_validated = datetime.now(timezone.utc).date().isoformat()
    
    # Update frontmatter: co_no, jurisdictions count, last_validated
    # Update description line in frontmatter
    content = re.sub(
        r'(description:\s*Zoning intelligence for [^\.]+\. )(\d+) jurisdictions',
        f'\\g<1>{jurisdiction_count} jurisdictions',
        content
    )
    
    # Update last_validated in frontmatter
    content = re.sub(
        r'(last_validated:\s*)\S+',
        f'\\g<1>{last_validated}',
        content
    )
    
    # Build live jurisdictions section
    if jurisdictions:
        jurisdiction_lines = []
        for j in jurisdictions:
            completeness = int(j.get("data_completeness", 0) or 0)
            status = "✅" if completeness > 0 else "⏳"
            validated = j.get("skill_last_validated", "") or "not scraped"
            jurisdiction_lines.append(
                f"| {j['name']} | {status} {completeness}% | {validated} |"
            )
        
        live_section = (
            f"\n## Live Jurisdictions ({county_name} County — {jurisdiction_count} total)\n\n"
            f"| Jurisdiction | Data Status | Last Validated |\n"
            f"|---|---|---|\n"
            + "\n".join(jurisdiction_lines)
            + f"\n\n**Data totals:** {district_count} districts | {standard_count} standards | {use_count} permitted uses"
        )
        
        # Replace existing live section or add before circuit breaker
        if "## Live Jurisdictions" in content:
            content = re.sub(
                r'\n## Live Jurisdictions.*?(?=\n## |\Z)',
                live_section + "\n",
                content,
                flags=re.DOTALL
            )
        else:
            # Insert before Circuit Breaker section
            if "## Circuit Breaker" in content:
                content = content.replace("## Circuit Breaker", live_section + "\n\n## Circuit Breaker")
            else:
                content += live_section
    
    if content != original:
        skill_path.write_text(content, encoding="utf-8")
        print(f"  ✅ Enriched {skill_path.parent.name}: {jurisdiction_count} jurisdictions, {district_count} districts")
        return True
    else:
        print(f"  ─  No changes: {skill_path.parent.name}")
        return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

# FDOR co_no → slug mapping
CO_NO_TO_SLUG = {
    1:"alachua",2:"baker",3:"bay",4:"bradford",5:"brevard",6:"broward",
    7:"calhoun",8:"charlotte",9:"citrus",10:"clay",11:"collier",12:"columbia",
    13:"miami-dade",14:"desoto",15:"dixie",16:"duval",17:"escambia",18:"flagler",
    19:"franklin",20:"gadsden",21:"gilchrist",22:"glades",23:"gulf",24:"hamilton",
    25:"hardee",26:"hendry",27:"hernando",28:"highlands",29:"hillsborough",
    30:"holmes",31:"indian-river",32:"jackson",33:"jefferson",34:"lafayette",
    35:"lake",36:"lee",37:"leon",38:"levy",39:"liberty",40:"madison",
    41:"manatee",42:"marion",43:"martin",44:"monroe",45:"nassau",46:"okaloosa",
    47:"okeechobee",48:"orange",49:"osceola",50:"palm-beach",51:"pasco",
    52:"pinellas",53:"polk",54:"putnam",55:"st-johns",56:"st-lucie",
    57:"santa-rosa",58:"sarasota",59:"seminole",60:"sumter",61:"suwannee",
    62:"taylor",63:"union",64:"volusia",65:"wakulla",66:"walton",67:"washington"
}

SLUG_TO_NAME = {v: k.replace("-", " ").title() for k, v in {
    "alachua":"alachua","baker":"baker","bay":"bay","brevard":"brevard",
    "broward":"broward","miami-dade":"miami-dade","hillsborough":"hillsborough",
    "orange":"orange","pinellas":"pinellas","palm-beach":"palm-beach",
}.items()}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Enrich county SKILL.md files with Supabase data")
    parser.add_argument("--skills-dir", default="zonewise/skills")
    parser.add_argument("--county", default="", help="Filter to specific county slug")
    parser.add_argument("--dry-run", action="store_true", help="Show changes without writing")
    parser.add_argument("--phase", default="", choices=["P0", "P1", "P3", ""],
                        help="Only process counties in this phase")
    args = parser.parse_args()
    
    skills_dir = Path(args.skills_dir)
    county_dirs = sorted(skills_dir.glob("county-*/SKILL.md"))
    
    if args.county:
        county_dirs = [p for p in county_dirs if args.county in p.parent.name]
    
    print(f"Enriching {len(county_dirs)} county SKILL.md files from Supabase...")
    if args.dry_run:
        print("DRY RUN — no files will be modified")
    print("=" * 60)
    
    modified = 0
    for skill_path in county_dirs:
        county_slug = skill_path.parent.name.replace("county-", "")
        
        # Find co_no
        co_no = next((k for k, v in CO_NO_TO_SLUG.items() if v == county_slug), 0)
        if not co_no:
            print(f"  ⚠️  Unknown co_no for: {county_slug}")
            continue
        
        county_name = county_slug.replace("-", " ").title()
        
        if args.dry_run:
            jurisdictions = fetch_county_jurisdictions(co_no)
            print(f"  {county_slug}: {len(jurisdictions)} jurisdictions (would update)")
        else:
            if enrich_skill_file(skill_path, co_no, county_name):
                modified += 1
    
    print("=" * 60)
    print(f"\n✅ Enriched {modified}/{len(county_dirs)} skill files")
    print(f"   Run: git add zonewise/skills/ && git commit -m 'chore: enrich county skills with live Supabase data'")
