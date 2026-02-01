#!/bin/bash
# ZoneWise.AI 3D Envelope Skills Setup
# Run this script from the zonewise-desktop root directory

set -e

echo "🎯 Setting up Three.js skills for Claude Code..."

# Create skills directory
mkdir -p .claude/skills

# Clone threejs-skills repository
echo "📥 Cloning CloudAI-X/threejs-skills..."
if [ -d "/tmp/threejs-skills" ]; then
  rm -rf /tmp/threejs-skills
fi
git clone --depth 1 https://github.com/CloudAI-X/threejs-skills.git /tmp/threejs-skills

# Copy skills to project
echo "📁 Copying skills to .claude/skills/..."
cp -r /tmp/threejs-skills/skills/* .claude/skills/

# Cleanup
rm -rf /tmp/threejs-skills

# List installed skills
echo ""
echo "✅ Installed skills:"
ls -la .claude/skills/

echo ""
echo "🎉 Setup complete! The following Three.js skills are now available:"
echo "   - threejs-fundamentals"
echo "   - threejs-geometry"
echo "   - threejs-materials"
echo "   - threejs-lighting"
echo "   - threejs-interaction"
echo "   - threejs-animation"
echo "   - threejs-textures"
echo "   - threejs-loaders"
echo "   - threejs-shaders"
echo "   - threejs-postprocessing"
