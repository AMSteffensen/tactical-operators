#!/bin/bash

# 📊 Platform Migration Comparison Tool
# Helps evaluate migration options with detailed analysis

echo "🔍 Platform Migration Analysis for Tactical Operator"
echo "===================================================="
echo ""

# Function to display option details
show_option() {
    local title="$1"
    local effort="$2" 
    local cost="$3"
    local benefits="$4"
    local challenges="$5"
    
    echo "📋 $title"
    echo "   ⏱️  Migration Effort: $effort"
    echo "   💰 Monthly Cost: $cost"
    echo "   ✅ Key Benefits: $benefits"
    echo "   ⚠️  Main Challenges: $challenges"
    echo ""
}

echo "🎯 Migration Options Analysis:"
echo ""

# Option 1: Fix Current Setup
show_option \
    "Option 1: Fix Current React + Express Setup" \
    "1-2 hours (Railway environment variables)" \
    "\$25/month (Vercel Pro + Railway)" \
    "Minimal risk, known architecture, immediate fix" \
    "Continued complexity, two platforms, higher cost"

# Option 2: Next.js Migration  
show_option \
    "Option 2: Migrate to Next.js Full-Stack" \
    "4-6 hours (framework migration)" \
    "\$0-20/month (Vercel Hobby/Pro)" \
    "Single platform, cost savings, modern stack" \
    "Framework migration, WebGL SSR concerns"

# Option 3: Railway Full-Stack
show_option \
    "Option 3: Migrate to Railway Full-Stack" \
    "2-3 hours (deployment migration)" \
    "\$5/month (Railway only)" \
    "Lowest cost, single platform, minimal changes" \
    "Less reliable than Vercel, smaller ecosystem"

# Option 4: Other Platforms
show_option \
    "Option 4: Migrate to Render.com" \
    "3-4 hours (platform migration)" \
    "\$14/month (Web Service + PostgreSQL)" \
    "Good balance of cost/reliability, Docker support" \
    "New platform learning curve, migration effort"

echo "💡 Detailed Analysis:"
echo ""

echo "🔧 Current Issues to Solve:"
echo "   • Railway JWT_SECRET missing/invalid"
echo "   • CORS complexity with dual platforms"  
echo "   • Environment variable configuration"
echo "   • Authentication flow debugging"
echo ""

echo "📊 Effort vs Reward Matrix:"
echo ""
printf "%-25s %-15s %-15s %-20s\n" "Option" "Effort" "Monthly Cost" "Risk Level"
echo "----------------------------------------------------------------"
printf "%-25s %-15s %-15s %-20s\n" "Fix Current Setup" "Low (1-2h)" "\$25" "Very Low"
printf "%-25s %-15s %-15s %-20s\n" "Next.js Migration" "Medium (4-6h)" "\$0-20" "Low"
printf "%-25s %-15s %-15s %-20s\n" "Railway Full-Stack" "Low (2-3h)" "\$5" "Medium"
printf "%-25s %-15s %-15s %-20s\n" "Render.com" "Medium (3-4h)" "\$14" "Medium"
echo ""

echo "🏆 Recommendations by Priority:"
echo ""

echo "1️⃣ IMMEDIATE (Fix Authentication):"
echo "   → Fix Railway JWT_SECRET environment variable"
echo "   → Cost: \$0 (no migration needed)"
echo "   → Time: 30 minutes"
echo "   → Gets authentication working immediately"
echo ""

echo "2️⃣ SHORT-TERM (Cost Optimization):"
echo "   → Migrate to Next.js full-stack on Vercel"
echo "   → Cost savings: \$5-25/month"
echo "   → Time: 4-6 hours over weekend"
echo "   → Modern, scalable architecture"
echo ""

echo "3️⃣ ALTERNATIVE (Budget-First):"
echo "   → Migrate to Railway full-stack"
echo "   → Lowest cost: \$5/month"
echo "   → Time: 2-3 hours"
echo "   → Keep current React + Express architecture"
echo ""

echo "🎯 Recommended Action Plan:"
echo ""

echo "Phase 1 (This Week): Fix Current Issues"
echo "   1. Fix Railway JWT_SECRET → Get auth working"
echo "   2. Test end-to-end authentication flow"
echo "   3. Document working configuration"
echo ""

echo "Phase 2 (Next Weekend): Strategic Migration"
echo "   1. Choose migration target (Next.js recommended)"
echo "   2. Run migration script: ./scripts/migrate-to-nextjs.sh"
echo "   3. Test migrated application"
echo "   4. Deploy and switch over"
echo ""

echo "Phase 3 (Ongoing): Optimization"
echo "   1. Monitor performance and costs"
echo "   2. Optimize bundle sizes and loading"
echo "   3. Add advanced Next.js features"
echo ""

echo "🚀 Quick Start Commands:"
echo ""

echo "Fix Current Setup:"
echo "   # Fix Railway environment variables"
echo "   railway login"
echo "   railway variables set JWT_SECRET=your-secret-key"
echo ""

echo "Next.js Migration:"
echo "   # Run automated migration"
echo "   ./scripts/migrate-to-nextjs.sh"
echo "   cd tactical-operator-nextjs"
echo "   npm run dev"
echo ""

echo "Railway Full-Stack Migration:" 
echo "   # Use existing migration script"
echo "   ./scripts/migrate-to-railway-fullstack.sh"
echo ""

echo "📈 Cost Projection (12 months):"
echo ""
printf "%-25s %-15s %-15s %-15s\n" "Option" "Monthly" "Annual" "2-Year"
echo "-------------------------------------------------------------"
printf "%-25s %-15s %-15s %-15s\n" "Current Setup" "\$25" "\$300" "\$600"
printf "%-25s %-15s %-15s %-15s\n" "Next.js (Hobby)" "\$0" "\$0" "\$0"
printf "%-25s %-15s %-15s %-15s\n" "Next.js (Pro)" "\$20" "\$240" "\$480"
printf "%-25s %-15s %-15s %-15s\n" "Railway Full-Stack" "\$5" "\$60" "\$120"
printf "%-25s %-15s %-15s %-15s\n" "Render.com" "\$14" "\$168" "\$336"
echo ""

echo "💰 Potential Savings with Next.js Migration:"
echo "   • Year 1: \$60-300 saved"
echo "   • Year 2: \$120-600 saved"
echo "   • ROI: 1500-7500% (based on 4-6 hour investment)"
echo ""

echo "✅ Decision Matrix:"
echo ""
echo "Choose Next.js if:"
echo "   ✓ Want modern development experience"
echo "   ✓ Planning to scale the application"
echo "   ✓ Value single-platform simplicity" 
echo "   ✓ Can invest 4-6 hours for migration"
echo ""

echo "Choose Railway Full-Stack if:"
echo "   ✓ Want minimal migration effort"
echo "   ✓ Prioritize lowest possible cost"
echo "   ✓ Comfortable with current architecture"
echo "   ✓ Need quick cost reduction"
echo ""

echo "Choose Fix Current if:"
echo "   ✓ Need immediate authentication fix"
echo "   ✓ No time for migration right now"
echo "   ✓ Current setup works for your needs"
echo "   ✓ Planning migration for later"
echo ""

echo "🎉 Conclusion:"
echo "   The Next.js migration offers the best long-term value with"
echo "   moderate effort and significant cost savings. Start with"
echo "   fixing the current auth issue, then migrate when ready."
