# 🚀 AXON-UI Quick Start Guide

**Version:** 2.0  
**Date:** October 10, 2025  
**Status:** ✅ Complete

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [First Steps](#first-steps)
5. [Core Features](#core-features)
6. [Advanced Features](#advanced-features)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

**AXON-UI** is a comprehensive intelligence analysis platform built with React 19 + TypeScript + Vite 6. It implements the **IKR (Intelligence-Knowledge-Reasoning)** directive and **Kipling Protocol** for systematic analysis.

### Key Features

- **🧠 IKR Directive**: Intelligence gathering, Knowledge synthesis, Reasoning analysis
- **📊 Kipling Protocol**: Who/What/When/Where/Why/How dimensions
- **🤖 AI Orchestration**: Multi-agent debate and collaboration
- **📈 Monitoring & Optimization**: Real-time performance tracking
- **🔐 Security**: Authentication, API key management, access control
- **🔗 Integrations**: External APIs, webhooks, cross-module communication
- **🚩 Feature Flags**: Controlled feature rollouts and experiments

---

## Prerequisites

### Required Software

- **Node.js**: >= 18.x (recommended: 20.x)
- **npm**: >= 9.x
- **Git**: Latest version

### Recommended IDE

- **VS Code** with extensions:
  - ES Lint
  - Prettier
  - TypeScript and JavaScript Language Features

### System Requirements

- **RAM**: Minimum 4GB (recommended: 8GB+)
- **Disk Space**: 500MB for dependencies
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

---

## Installation

### 1. Clone the Repository

```bash
# SSH (recommended)
git clone git@github.com:Zasada1980/AXON-UI.git

# HTTPS
git clone https://github.com/Zasada1980/AXON-UI.git

cd AXON-UI
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19
- Vite 6
- Tailwind CSS 4
- Vitest 3
- TypeScript 5.x

### 3. Configure Environment

Create `.env` file (optional):

```bash
# AXON Backend Configuration (if using real backend)
VITE_AXON_BASE_URL=http://localhost:8787
VITE_AXON_PROXY_TARGET=http://localhost:8787

# Feature Flags
VITE_ENABLE_EXPERIMENTAL_FEATURES=false
```

### 4. Start Development Server

```bash
npm run dev
```

The application will open at: **http://localhost:5173**

---

## First Steps

### Creating Your First Project

1. **Click "Create New Analysis"** on the welcome screen
2. **Enter Project Details**:
   - **Title**: e.g., "Market Research Q4 2025"
   - **Description**: Brief overview of what you're analyzing
3. **Click "Create Project"**

### Understanding the Interface

#### Navigation Bar (Top)
- **AXON Logo**: Return to overview
- **System Health**: Real-time health indicator
- **Language Toggle**: Switch between EN/RU
- **Navigation Button**: Open main menu

#### Main Menu Categories

1. **Core Features**
   - Overview
   - Kipling Analysis
   - Intelligence Gathering
   - Files & Data

2. **AI & Agents**
   - Debate System
   - Agent Memory
   - AI Orchestrator
   - Debate Logs

3. **System**
   - Performance Monitor
   - System Optimizer
   - Monitoring Dashboard
   - Feature Flags ⭐ NEW
   - Diagnostics

4. **Advanced**
   - Project Journal
   - Micro Tasks
   - Integration

---

## Core Features

### 1. Kipling Analysis (Six Dimensions)

Navigate to: **Navigation → Core → Kipling Analysis**

The Kipling Protocol breaks down analysis into six dimensions:

#### **Who?**
- Identify stakeholders, actors, decision-makers
- Map relationships and hierarchies
- Track responsibilities and authorities

#### **What?**
- Define the subject matter
- List components, elements, features
- Document facts and observations

#### **When?**
- Timeline analysis
- Sequence of events
- Critical dates and deadlines

#### **Where?**
- Geographic context
- Physical locations
- Virtual spaces and platforms

#### **Why?**
- Motivations and drivers
- Cause-effect relationships
- Strategic objectives

#### **How?**
- Methods and processes
- Technical implementation
- Operational procedures

**Usage:**
1. Select a dimension tab
2. Fill in the question field
3. Add content and insights
4. Rate priority (High/Medium/Low)
5. Track completeness percentage

---

### 2. IKR Directive

Navigate to: **Navigation → Core → IKR Directive**

#### Intelligence (Разведка)
- Gather raw data
- Collect facts and observations
- Document sources

#### Knowledge (Знание)
- Synthesize information
- Identify patterns
- Build understanding

#### Reasoning (Рассуждение)
- Draw conclusions
- Make recommendations
- Formulate action plans

**Best Practices:**
- Start with Intelligence (data collection)
- Move to Knowledge (synthesis)
- End with Reasoning (conclusions)
- Iterate as needed

---

### 3. Agent Debate System

Navigate to: **Navigation → AI & Agents → Debate System**

**Purpose**: Multi-agent collaborative analysis using AI

#### Creating a Debate Session

1. **Click "New Session"**
2. **Configure:**
   - **Topic**: e.g., "Best approach to market entry"
   - **Participants**: Add 2-5 agents
   - **Max Rounds**: Typically 3-5
   - **Turns per Round**: Usually 1-3

3. **Define Agents:**
   - **Name**: e.g., "Analyst", "Critic", "Optimist"
   - **Role**: Agent's perspective
   - **Instructions**: Behavior guidelines

4. **Start Debate**

#### Managing Debates

- **View Transcript**: See all messages
- **Generate Turn**: Let AXON generate next response
- **Export**: Save debate as JSON
- **Analyze**: Review conclusions

---

## Advanced Features

### 1. Performance Monitoring

Navigate to: **Navigation → System → Performance Monitor**

#### Features:
- **Real-time Metrics**: CPU, Memory, Network, Disk I/O
- **Bottleneck Detection**: Automatic identification of slow components
- **Alerts System**: Configurable thresholds
- **Historical Trends**: Track performance over time

#### Using Performance Monitor:

1. **View Current Metrics**:
   - Check resource utilization
   - Identify spikes or anomalies

2. **Configure Alerts**:
   - Set CPU threshold (e.g., 80%)
   - Set memory limit (e.g., 90%)
   - Enable notifications

3. **Analyze Bottlenecks**:
   - Review detected issues
   - View recommendations
   - Track resolution

---

### 2. System Optimizer

Navigate to: **Navigation → System → System Optimizer**

#### Optimization Types:

1. **Cache Optimization**
   - Clear unused cache
   - Optimize cache size
   - Configure TTL

2. **Database Optimization**
   - Index management
   - Query optimization
   - Data cleanup

3. **Code Optimization**
   - Bundle size reduction
   - Lazy loading
   - Tree shaking

4. **Infrastructure**
   - Resource allocation
   - Scaling strategies
   - Load balancing

#### Running Optimizations:

1. **Select Optimization Type**
2. **Click "Analyze"**
3. **Review Recommendations**
4. **Apply Selected Optimizations**
5. **Verify Improvements**

---

### 3. Feature Flags Manager ⭐ NEW

Navigate to: **Navigation → System → Feature Flags**

#### Purpose:
Control feature rollouts without code changes

#### Creating a Feature Flag:

1. **Click "Add Flag"**
2. **Configure:**
   - **Name**: e.g., `new-dashboard-ui`
   - **Description**: What the flag controls
   - **Status**: Enabled/Disabled/Rollout
   - **Category**: Feature/Experiment/Kill Switch/Operational
   - **Environment**: Development/Staging/Production/All

3. **Advanced Options:**
   - **Rollout Percentage**: For gradual rollout (0-100%)
   - **Tags**: For organization
   - **Owner**: Team or individual
   - **JIRA Ticket**: Link to tracking

#### Flag Status Types:

- **Enabled** ✅: Feature is ON for all users
- **Disabled** ❌: Feature is OFF for all users
- **Rollout** 🔄: Gradual rollout (percentage-based)

#### Use Cases:

1. **New Features**: Gradual rollout to monitor stability
2. **Experiments**: A/B testing different implementations
3. **Kill Switches**: Emergency feature disable
4. **Operational**: Control system behavior

#### Best Practices:

- Use descriptive names: `enable-new-analytics-dashboard`
- Set expiration dates for temporary flags
- Tag flags for organization: `ui`, `api`, `experiment`
- Document in JIRA or similar tracking
- Remove obsolete flags regularly

---

### 4. Authentication & Security

Navigate to: **Navigation → System → Global Settings → Security**

#### Authentication System:

1. **User Management**:
   - Create users
   - Assign roles: Admin/Analyst/Viewer/Guest
   - Manage sessions

2. **Access Control**:
   - Role-based permissions
   - Resource access rules
   - Audit logging

#### API Key Management:

1. **Add Provider**:
   - OpenAI
   - Anthropic (Claude)
   - Google (Gemini)
   - Azure OpenAI

2. **Configure Keys**:
   - Enter API key
   - Validate format
   - Test connection

3. **Security**:
   - AES-256 encryption
   - Secure storage
   - Auto-validation

---

### 5. External API Integration

Navigate to: **Navigation → Advanced → External API Integrator**

#### Supported Types:

1. **REST APIs**:
   - GET/POST/PUT/DELETE
   - Custom headers
   - Authentication

2. **GraphQL**:
   - Query/Mutation
   - Schema introspection

3. **Webhooks**:
   - Incoming webhooks
   - Event triggers
   - Payload validation

#### Creating an Integration:

1. **Select Provider** (or add custom)
2. **Configure Endpoint**:
   - URL
   - Method
   - Headers
   - Body

3. **Test Connection**
4. **Save Configuration**
5. **Monitor Requests**

#### Features:

- **Rate Limiting**: Prevent API abuse
- **Caching**: Reduce redundant calls
- **Retry Logic**: Handle failures gracefully
- **Monitoring**: Track usage and errors

---

## Configuration

### Global Project Settings

Navigate to: **Navigation → System → Global Settings**

#### Tabs:

1. **Project**:
   - Name, type, description
   - Resource limits
   - Storage settings

2. **Agents**:
   - Max active agents
   - Hierarchy depth
   - Agent permissions

3. **Knowledge**:
   - Models configuration
   - Internet access
   - Per-agent overrides

4. **Terminal**:
   - Auto-start terminal
   - Default shell
   - Environment variables

5. **Analytics**:
   - Tracking preferences
   - Data retention
   - Export settings

6. **Utilities**:
   - File upload settings
   - Search configuration
   - Notification preferences

7. **Security**:
   - Authentication
   - API keys
   - Access control

---

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

**Symptom**: `npm run dev` fails

**Solutions**:
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be >= 18.x

# Try different port
npm run dev -- --port 3000
```

#### 2. TypeScript Errors

**Symptom**: Red squiggly lines, build fails

**Solutions**:
```bash
# Regenerate types
npm run typecheck

# Restart TS server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### 3. Tests Failing

**Symptom**: `npm test` has failures

**Solutions**:
```bash
# Run tests in watch mode
npm test

# Run specific test
npm test -- FeatureFlagsManager

# Update snapshots (if appropriate)
npm test -- -u
```

#### 4. Build Errors

**Symptom**: `npm run build` fails

**Solutions**:
```bash
# Check for unused imports
npm run lint

# Try clean build
rm -rf dist
npm run build
```

#### 5. Performance Issues

**Symptoms**: Slow loading, lag

**Solutions**:
1. Check Performance Monitor
2. Run System Optimizer
3. Clear browser cache
4. Check for bottlenecks
5. Monitor network requests

---

## Next Steps

### Learn More

- **[Developer Guide](DEVELOPER_GUIDE.md)**: In-depth development documentation
- **[Feature Flags Guide](FEATURE_FLAGS_GUIDE.md)**: Complete feature flags documentation
- **[IKR Checkpoints](../IKR_CHECKPOINTS.md)**: Project milestones and progress

### Join the Community

- **GitHub**: [github.com/Zasada1980/AXON-UI](https://github.com/Zasada1980/AXON-UI)
- **Issues**: Report bugs or request features
- **Pull Requests**: Contribute improvements

### Need Help?

1. Check [Troubleshooting](#troubleshooting)
2. Search [GitHub Issues](https://github.com/Zasada1980/AXON-UI/issues)
3. Create new issue with:
   - Environment details
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests
npm run test:ui          # Interactive test UI
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # TypeScript check
npm run format           # Format code (if Prettier configured)
```

### Keyboard Shortcuts

- **Ctrl/Cmd + K**: Open navigation menu
- **Ctrl/Cmd + S**: Save current work
- **Ctrl/Cmd + /**: Toggle search
- **Esc**: Close dialogs/modals

### File Structure

```
AXON-UI/
├── src/
│   ├── components/       # React components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   ├── types/            # TypeScript types
│   └── __tests__/        # Test files
├── docs/                 # Documentation
├── public/               # Static assets
└── dist/                 # Build output
```

---

**Happy Analyzing! 🚀**

*Last updated: October 10, 2025*
