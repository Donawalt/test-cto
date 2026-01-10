#!/bin/bash

# create-from-template.sh - Create a new project from a test-cto template
#
# Usage: pnpm create-from-template <template-name> <destination> [options]
#
# Examples:
#   pnpm create-from-template vite-react ../my-app
#   pnpm create-from-template astro my-site --standalone
#   pnpm create-from-template api-server ../my-api --monorepo
#
# Templates:
#   vite-react    - Modern React SPA with Vite
#   astro         - Static site generator with Astro
#   library       - NPM package template
#   api-server    - Express API backend
#   bedrock-sage  - WordPress with Bedrock + Sage
#   sanity-cms    - Sanity Studio (if available)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Template list
TEMPLATES=("vite-react" "astro" "library" "api-server" "bedrock-sage" "sanity-cms")

# Print colored message
print_msg() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Show usage
show_usage() {
    echo "Usage: pnpm create-from-template <template-name> <destination> [options]"
    echo ""
    echo "Arguments:"
    echo "  template-name    Name of the template to use"
    echo "  destination      Destination directory for the new project"
    echo ""
    echo "Options:"
    echo "  --standalone     Create as standalone project (default)"
    echo "  --monorepo       Create as monorepo workspace"
    echo "  --help, -h       Show this help message"
    echo ""
    echo "Available templates:"
    for t in "${TEMPLATES[@]}"; do
        echo "  - $t"
    done
}

# Check if template exists
check_template() {
    local template=$1
    if [ ! -d "templates/$template" ]; then
        print_error "Template '$template' not found!"
        echo ""
        show_usage
        exit 1
    fi
}

# Get template config
get_template_config() {
    local template=$1
    if [ -f "templates/$template/template.config.json" ]; then
        cat "templates/$template/template.config.json"
    else
        echo "{}"
    fi
}

# Parse template name
parse_template_name() {
    local input=$1
    # Handle "sanity-cms" as the full name for sanity
    if [ "$input" = "sanity" ] || [ "$input" = "sanity-cms" ]; then
        echo "sanity-cms"
    else
        echo "$input"
    fi
}

# Main function
main() {
    # Parse arguments
    if [ $# -eq 0 ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_usage
        exit 0
    fi

    local template_name=$(parse_template_name "$1")
    local destination="$2"
    local integration_mode="standalone"

    # Shift to parse remaining options
    shift 2

    while [ $# -gt 0 ]; do
        case "$1" in
            --standalone)
                integration_mode="standalone"
                shift
                ;;
            --monorepo)
                integration_mode="monorepo"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    # Validate template name
    if [ -z "$template_name" ]; then
        print_error "Template name is required!"
        show_usage
        exit 1
    fi

    # Validate destination
    if [ -z "$destination" ]; then
        print_error "Destination is required!"
        show_usage
        exit 1
    fi

    # Check template exists
    check_template "$template_name"

    # Resolve destination path
    if [[ "$destination" = /* ]]; then
        local abs_dest="$destination"
    else
        local abs_dest="$(pwd)/$destination"
    fi

    # Check if destination already exists
    if [ -e "$abs_dest" ]; then
        print_error "Destination '$abs_dest' already exists!"
        exit 1
    fi

    echo ""
    print_info "Creating project from template: $template_name"
    print_info "Destination: $abs_dest"
    print_info "Integration mode: $integration_mode"
    echo ""

    # Get template config
    local config=$(get_template_config "$template_name")
    local template_desc=$(echo "$config" | grep -o '"description": *"[^"]*"' | head -1 | sed 's/"description": *"\(.*\)"/\1/')
    local setup_time=$(echo "$config" | grep -o '"setupTime": *"[^"]*"' | head -1 | sed 's/"setupTime": *"\(.*\)"/\1/')

    if [ -n "$template_desc" ]; then
        print_info "Description: $template_desc"
    fi
    if [ -n "$setup_time" ]; then
        print_info "Estimated setup time: $setup_time"
    fi
    echo ""

    # Copy template
    print_msg "Copying template files..."
    cp -r "templates/$template_name" "$abs_dest"

    # Handle template-info.txt - move to correct location after copy
    if [ -f "$abs_dest/.template-info.txt" ]; then
        mv "$abs_dest/.template-info.txt" "$abs_dest/template-info.txt"
    fi

    # Handle standalone vs monorepo integration
    if [ "$integration_mode" = "monorepo" ]; then
        print_msg "Configuring for monorepo integration..."

        # Update package.json for monorepo workspace
        if [ -f "$abs_dest/package.json" ]; then
            # Add workspace protocol to dependencies
            sed -i 's/"dependencies": {/"dependencies": {\n    "@myapp\/types": "workspace:*",/' "$abs_dest/package.json" 2>/dev/null || true
            sed -i 's/"dependencies": {/"dependencies": {\n    "@myapp\/db": "workspace:*",/' "$abs_dest/package.json" 2>/dev/null || true
            sed -i 's/"dependencies": {/"dependencies": {\n    "@myapp\/server-utils": "workspace:*",/' "$abs_dest/package.json" 2>/dev/null || true
        fi

        # Add to pnpm-workspace.yaml if it exists
        if [ -f "pnpm-workspace.yaml" ]; then
            # Check if destination is already in workspaces
            if ! grep -q "$destination" "pnpm-workspace.yaml" 2>/dev/null; then
                print_info "You may want to add '$destination' to pnpm-workspace.yaml"
            fi
        fi

        print_msg "Monorepo configuration complete!"
    else
        print_msg "Configuring as standalone project..."

        # Remove workspace dependencies
        if [ -f "$abs_dest/package.json" ]; then
            # Remove workspace:* dependencies
            sed -i '/"workspace:\*"/d' "$abs_dest/package.json" 2>/dev/null || true
        fi

        print_msg "Standalone configuration complete!"
    fi

    echo ""
    print_msg "Project created successfully at: $abs_dest"
    echo ""

    # Show next steps
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Next Steps:"
    echo ""
    echo "  1. Navigate to your new project:"
    echo "     cd $abs_dest"
    echo ""
    echo "  2. Install dependencies:"
    echo "     pnpm install"
    echo ""
    echo "  3. Start development:"
    echo "     pnpm dev"
    echo ""
    echo "  4. Read the documentation:"
    if [ -f "$abs_dest/QUICK_START.md" ]; then
        echo "     - QUICK_START.md (get started quickly)"
    fi
    if [ -f "$abs_dest/INTEGRATION_CHECKLIST.md" ]; then
        echo "     - INTEGRATION_CHECKLIST.md (integration guide)"
    fi
    if [ -f "$abs_dest/SECURITY.md" ]; then
        echo "     - SECURITY.md (security best practices)"
    fi
    if [ -f "$abs_dest/README.md" ]; then
        echo "     - README.md (full documentation)"
    fi
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Additional template-specific notes
    case "$template_name" in
        vite-react)
            print_info "This template uses Vite + React. You may need to configure"
            print_info "your API URL in .env files for full functionality."
            ;;
        astro)
            print_info "This template uses Astro. Great for static sites and blogs!"
            print_info "Consider adding Sanity CMS for content management."
            ;;
        api-server)
            print_info "This template uses Express + Drizzle. Don't forget to:"
            print_info "  - Set DATABASE_URL in .env"
            print_info "  - Configure JWT_SECRET for authentication"
            print_info "  - Run database migrations: pnpm db:migrate"
            ;;
        bedrock-sage)
            print_info "This template requires PHP and Composer. See BEDROCK_SETUP.md"
            print_info "for detailed installation instructions."
            ;;
    esac

    echo ""
}

# Run main
main "$@"
