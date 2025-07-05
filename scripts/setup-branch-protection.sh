#!/bin/bash

# 🛡️ Setup Branch Protection for Tactical Operator
# This script configures branch protection rules for the main branch

set -e

echo "🛡️ Setting up branch protection for main branch..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "📥 Install it from: https://cli.github.com/"
    echo "🔧 Or via Homebrew: brew install gh"
    exit 1
fi

# Check if user is logged in
if ! gh auth status &> /dev/null; then
    echo "🔐 Please login to GitHub CLI first:"
    echo "gh auth login"
    exit 1
fi

# Get repository information
REPO_OWNER=$(gh repo view --json owner --jq .owner.login)
REPO_NAME=$(gh repo view --json name --jq .name)

echo "📂 Repository: $REPO_OWNER/$REPO_NAME"

# Apply branch protection rules
echo "⚡ Applying branch protection rules..."

# Create the branch protection rule
gh api repos/$REPO_OWNER/$REPO_NAME/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test","docker-build","security-scan"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

echo "✅ Branch protection rules applied successfully!"

echo ""
echo "🔒 Protection Rules Summary:"
echo "  ✅ Require pull request reviews (1 reviewer)"
echo "  ✅ Dismiss stale reviews when new commits are pushed"
echo "  ✅ Require status checks to pass (test, docker-build, security-scan)"
echo "  ✅ Require branches to be up to date before merging"
echo "  ✅ Include administrators in restrictions"
echo "  ❌ Restrict force pushes"
echo "  ❌ Restrict deletions"

echo ""
echo "🚀 Next Steps:"
echo "1. Create a pull request to test the staging deployment"
echo "2. Add RAILWAY_STAGING_TOKEN to GitHub repository secrets"
echo "3. Set up Railway staging environment"

echo ""
echo "📝 To add GitHub secrets:"
echo "gh secret set RAILWAY_STAGING_TOKEN --body=\"your-railway-staging-token\""
