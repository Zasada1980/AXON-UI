# 🚩 Feature Flags Guide

**Version:** 1.0  
**Date:** October 10, 2025  
**Component:** FeatureFlagsManager.tsx  
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Use Cases](#use-cases)
3. [Flag Types](#flag-types)
4. [Creating Flags](#creating-flags)
5. [Managing Flags](#managing-flags)
6. [Best Practices](#best-practices)
7. [Integration Guide](#integration-guide)
8. [API Reference](#api-reference)
9. [Examples](#examples)

---

## Overview

The **Feature Flags Manager** is a comprehensive system for controlling feature rollouts, conducting experiments, and managing operational toggles without code deployments.

### Key Benefits

- **Zero-Downtime Rollouts**: Enable/disable features instantly
- **Risk Mitigation**: Gradual rollout prevents widespread issues
- **A/B Testing**: Run experiments with percentage-based rollouts
- **Emergency Control**: Kill switches for problematic features
- **Environment Isolation**: Different flags for dev/staging/prod

### Architecture

```
FeatureFlagsManager
├── Flag Storage (useKV)
├── Audit Log (useKV)
├── UI Components
│   ├── Flag List
│   ├── Filter/Search
│   ├── Create/Edit Dialog
│   └── Audit Tab
└── Export/Import
```

---

## Use Cases

### 1. New Feature Rollout

**Scenario**: Deploying a redesigned dashboard

```typescript
{
  name: "new-dashboard-ui",
  description: "Redesigned analytics dashboard with improved UX",
  status: "rollout",
  category: "feature",
  environment: "production",
  rolloutPercentage: 10, // Start with 10% of users
  tags: ["ui", "dashboard", "analytics"]
}
```

**Strategy**:
1. Deploy with flag at 0% (disabled)
2. Test internally (0% → 10%)
3. Monitor metrics
4. Gradually increase (10% → 25% → 50% → 100%)
5. Remove flag after stable

### 2. A/B Testing

**Scenario**: Testing two recommendation algorithms

**Flag A**:
```typescript
{
  name: "recommendation-algorithm-v2",
  status: "rollout",
  rolloutPercentage: 50,
  category: "experiment",
  tags: ["algorithm", "ab-test"]
}
```

**Implementation**:
- 50% get Algorithm V2
- 50% stay on Algorithm V1
- Track metrics for both groups
- Choose winner

### 3. Kill Switch

**Scenario**: Emergency disable of problematic feature

```typescript
{
  name: "third-party-chat-widget",
  status: "enabled", // Normally on
  category: "killswitch",
  environment: "production",
  description: "Emergency disable for chat widget if vendor has issues"
}
```

**Usage**:
- When vendor has outage → Switch to "disabled"
- Immediate effect, no deployment
- Re-enable when resolved

### 4. Operational Toggle

**Scenario**: Maintenance mode

```typescript
{
  name: "maintenance-mode",
  status: "disabled", // Normal operation
  category: "operational",
  environment: "all",
  description: "Enable during scheduled maintenance"
}
```

---

## Flag Types

### Status Types

#### 1. Enabled ✅
- Feature is ON for all users
- Use when: Feature is stable and ready for everyone

#### 2. Disabled ❌
- Feature is OFF for all users
- Use when: Feature is not ready or has issues

#### 3. Rollout 🔄
- Percentage-based gradual rollout
- Use when: Testing new features progressively

### Category Types

#### 1. Feature
- New functionality being rolled out
- Typical lifespan: Temporary (until fully rolled out)
- Example: `new-export-format`

#### 2. Experiment
- A/B tests or scientific experiments
- Typical lifespan: Duration of experiment
- Example: `recommendation-algo-v2`

#### 3. Kill Switch
- Emergency disable mechanism
- Typical lifespan: Permanent (insurance policy)
- Example: `external-api-integration`

#### 4. Operational
- System behavior control
- Typical lifespan: Permanent
- Example: `maintenance-mode`, `debug-logging`

### Environment Types

- **Development**: Local development only
- **Staging**: Staging/QA environment
- **Production**: Live production
- **All**: Applies to all environments

---

## Creating Flags

### Via UI

1. Navigate to **System → Feature Flags**
2. Click **"Add Flag"**
3. Fill in required fields:
   - **Flag Name**: Unique identifier (e.g., `enable-new-charts`)
   - **Description**: What the flag controls
   - **Status**: Enabled/Disabled/Rollout
   - **Category**: Feature/Experiment/Kill Switch/Operational
   - **Environment**: Target environment

4. Optional fields:
   - **Rollout Percentage**: 0-100% (for gradual rollout)
   - **Tags**: Comma-separated tags
   - **Owner**: Team or individual responsible
   - **JIRA Ticket**: Link to tracking issue
   - **Expires At**: Date when flag should be removed

5. Click **"Save"**

### Programmatically

```typescript
import { useKV } from '@github/spark/hooks';

const [flags, setFlags] = useKV<FeatureFlag[]>('feature-flags-projectId', []);

const newFlag: FeatureFlag = {
  id: `flag-${Date.now()}`,
  name: 'enable-new-analytics',
  description: 'New analytics dashboard with real-time updates',
  status: 'disabled',
  category: 'feature',
  environment: 'production',
  rolloutPercentage: 0,
  tags: ['analytics', 'dashboard'],
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user-id',
    owner: 'analytics-team'
  }
};

setFlags(prev => [...prev, newFlag]);
```

---

## Managing Flags

### Updating Flags

#### Toggle Status

Quick enable/disable via UI:
1. Find flag in list
2. Click eye icon (👁️ / 👁️‍🗨️)
3. Status changes instantly

#### Edit Configuration

Full editing:
1. Click **"Edit"** button
2. Modify any fields
3. Save changes
4. Audit log records change

### Filtering

**By Status**:
```
Filter dropdown → Enabled/Disabled/Rollout
```

**By Category**:
```
Filter dropdown → Feature/Experiment/Kill Switch/Operational
```

**By Environment**:
```
Filter dropdown → Development/Staging/Production/All
```

**By Search**:
```
Search box → Type flag name, description, or tag
```

### Export/Import

#### Export Configuration

1. Click **"Export"** button
2. Downloads JSON file with all flags and audit log
3. Use for:
   - Backup
   - Migration between environments
   - Version control

**Export Format**:
```json
{
  "flags": [
    {
      "id": "flag-123",
      "name": "new-feature",
      "status": "enabled",
      ...
    }
  ],
  "auditLog": [
    {
      "timestamp": "2025-10-10T10:00:00Z",
      "action": "create",
      "flagId": "flag-123",
      ...
    }
  ]
}
```

#### Import Configuration

1. Click **"Import"** button
2. Select JSON file
3. Flags are loaded (overwrites existing)

---

## Best Practices

### Naming Conventions

**Good Names** ✅:
- `enable-new-dashboard`
- `experiment-recommendation-algo-v2`
- `killswitch-third-party-integration`
- `operational-maintenance-mode`

**Bad Names** ❌:
- `flag1`
- `test`
- `temp`
- `new-feature` (too vague)

**Format**: `<category>-<feature>-<detail>`

### Flag Lifecycle

#### 1. Creation
- Start with status: `disabled`
- Set appropriate category
- Add description and owner
- Tag for organization

#### 2. Testing
- Enable in development first
- Test thoroughly
- Move to staging

#### 3. Rollout
- Start with low percentage (5-10%)
- Monitor metrics
- Increase gradually
- Watch for errors

#### 4. Full Rollout
- Once at 100% and stable for 1-2 weeks
- Flag becomes default behavior

#### 5. Cleanup
- Remove flag from code
- Delete flag from system
- Update documentation

### Expiration Policy

**Set expiration dates** for temporary flags:
- Feature flags: 30-90 days after 100% rollout
- Experiments: Duration of experiment + 30 days
- Kill switches: No expiration (permanent)
- Operational: No expiration (permanent)

### Documentation

**Required for each flag**:
- Clear description of what it controls
- Owner (team or individual)
- JIRA ticket or GitHub issue
- Expected removal date (if temporary)

### Monitoring

**Track**:
- Flag usage (which flags are checked)
- Error rates when flag is enabled
- Performance impact
- User feedback

**Alert on**:
- Flags older than expiration date
- Flags with no owner
- Flags that haven't been used in 90 days

---

## Integration Guide

### Checking Flags in Code

#### React Component

```typescript
import { useKV } from '@github/spark/hooks';
import { useMemo } from 'react';

function MyComponent({ projectId }: { projectId: string }) {
  const flagsKey = useMemo(() => `feature-flags-${projectId}`, [projectId]);
  const [flags] = useKV<FeatureFlag[]>(flagsKey, []);

  const isFeatureEnabled = (flagName: string): boolean => {
    const flag = flags?.find(f => f.name === flagName);
    if (!flag) return false;

    // Check environment (simplified)
    if (flag.environment !== 'all' && flag.environment !== getCurrentEnvironment()) {
      return false;
    }

    // Check status
    if (flag.status === 'enabled') return true;
    if (flag.status === 'disabled') return false;

    // Rollout: percentage-based
    if (flag.status === 'rollout') {
      // Implement percentage logic (e.g., based on user ID hash)
      return checkRolloutPercentage(flag.rolloutPercentage);
    }

    return false;
  };

  return (
    <div>
      {isFeatureEnabled('new-dashboard') ? (
        <NewDashboard />
      ) : (
        <OldDashboard />
      )}
    </div>
  );
}
```

#### Custom Hook

```typescript
function useFeatureFlag(flagName: string, projectId: string): boolean {
  const flagsKey = useMemo(() => `feature-flags-${projectId}`, [projectId]);
  const [flags] = useKV<FeatureFlag[]>(flagsKey, []);

  return useMemo(() => {
    const flag = flags?.find(f => f.name === flagName);
    if (!flag) return false;

    // Environment check
    const currentEnv = getCurrentEnvironment();
    if (flag.environment !== 'all' && flag.environment !== currentEnv) {
      return false;
    }

    // Status check
    switch (flag.status) {
      case 'enabled':
        return true;
      case 'disabled':
        return false;
      case 'rollout':
        return checkRolloutPercentage(flag.rolloutPercentage);
      default:
        return false;
    }
  }, [flags, flagName]);
}

// Usage
function App({ projectId }: { projectId: string }) {
  const showNewUI = useFeatureFlag('new-dashboard-ui', projectId);

  return showNewUI ? <NewUI /> : <OldUI />;
}
```

### Rollout Logic

```typescript
function checkRolloutPercentage(
  percentage: number,
  userId?: string
): boolean {
  if (percentage === 0) return false;
  if (percentage === 100) return true;

  // Consistent hash-based rollout
  const hash = hashString(userId || 'anonymous');
  return (hash % 100) < percentage;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
```

---

## API Reference

### Types

```typescript
type FlagStatus = 'enabled' | 'disabled' | 'rollout';
type FlagEnvironment = 'development' | 'staging' | 'production' | 'all';
type FlagCategory = 'feature' | 'experiment' | 'killswitch' | 'operational';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  status: FlagStatus;
  category: FlagCategory;
  environment: FlagEnvironment;
  rolloutPercentage?: number;
  enabledForUsers?: string[];
  metadata?: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    owner: string;
    jiraTicket?: string;
    expiresAt?: string;
  };
  dependencies?: string[];
  tags?: string[];
}
```

### Component Props

```typescript
interface FeatureFlagsManagerProps {
  projectId: string;
  locale?: 'en' | 'ru';
}
```

### Storage Keys

- **Flags**: `feature-flags-${projectId}`
- **Audit Log**: `feature-flags-audit-${projectId}`

---

## Examples

### Example 1: Progressive Rollout

```typescript
// Week 1: Internal testing
{
  name: "analytics-v2",
  status: "rollout",
  rolloutPercentage: 0,
  enabledForUsers: ["internal-team@company.com"]
}

// Week 2: Beta users (10%)
{
  rolloutPercentage: 10
}

// Week 3: Expand (25%)
{
  rolloutPercentage: 25
}

// Week 4: Half (50%)
{
  rolloutPercentage: 50
}

// Week 5: Most users (75%)
{
  rolloutPercentage: 75
}

// Week 6: Everyone (100%)
{
  status: "enabled",
  rolloutPercentage: 100
}

// Week 8: Remove flag (code cleanup)
// Delete flag from system
```

### Example 2: A/B Test

```typescript
// Control group: Current implementation
// (No flag check needed)

// Treatment group: New implementation
const showNewFeature = useFeatureFlag('new-recommendation-engine', projectId);

function RecommendationWidget() {
  if (showNewFeature) {
    // Track metric: "new-algo-clicks"
    return <NewRecommendations />;
  } else {
    // Track metric: "old-algo-clicks"
    return <OldRecommendations />;
  }
}

// Flag configuration
{
  name: "new-recommendation-engine",
  status: "rollout",
  rolloutPercentage: 50,
  category: "experiment",
  expiresAt: "2025-11-10", // 30-day experiment
  metadata: {
    jiraTicket: "ANALYTICS-456"
  }
}
```

### Example 3: Kill Switch

```typescript
// Normal operation
{
  name: "external-payment-provider",
  status: "enabled",
  category: "killswitch"
}

// Emergency: Provider has outage
// Change status to "disabled" via UI
// No code deployment needed

// In code:
function CheckoutPage() {
  const paymentEnabled = useFeatureFlag('external-payment-provider', projectId);

  if (!paymentEnabled) {
    return (
      <Alert variant="warning">
        Payment system temporarily unavailable.
        Please try again later.
      </Alert>
    );
  }

  return <PaymentForm />;
}
```

---

## Troubleshooting

### Flag Not Working

1. **Check Flag Exists**: Verify in UI
2. **Check Environment**: Ensure flag applies to current env
3. **Check Status**: Verify enabled/rollout status
4. **Check Code**: Confirm flag name matches exactly
5. **Check Storage**: Inspect `localStorage` or KV storage

### Audit Log Issues

- Audit log stored separately: `feature-flags-audit-${projectId}`
- Max 100 entries (oldest removed)
- Export regularly for long-term history

### Performance Impact

- Flags stored in memory (useKV)
- Check is synchronous and fast
- No network calls
- Minimal overhead (~0.1ms per check)

---

## Changelog

### Version 1.0 (2025-10-10)
- ✅ Initial release
- ✅ Full CRUD operations
- ✅ Rollout percentage support
- ✅ Audit logging
- ✅ Export/Import
- ✅ Multi-language (EN/RU)
- ✅ Comprehensive filtering

---

**Need Help?**

- Check [Quick Start Guide](QUICK_START.md)
- Review [Developer Guide](DEVELOPER_GUIDE.md)
- Open [GitHub Issue](https://github.com/Zasada1980/AXON-UI/issues)

*Last updated: October 10, 2025*
