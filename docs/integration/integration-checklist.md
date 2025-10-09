# ✅ AXON Integration Checklist

**Date:** 9 октября 2025 г.  
**Project:** AXON-UI  
**Purpose:** Step-by-step guide for safe AXON component integration

---

## 📋 Pre-Integration Checklist

### **Step 1: Clean AXON Repository**
**Critical: Must complete BEFORE any file transfers!**

- [ ] Locate main AXON repository (usually `d:\AXON`)
- [ ] **Run cleanup script** (automatically removes all development debris):
  ```powershell
  cd d:\AXON-UI\scripts
  .\cleanup-axon-repo.ps1 -AxonRepoPath "d:\AXON"
  ```
- [ ] Review cleanup results - should delete:
  - ✅ `backups/` directories
  - ✅ `__pycache__/` folders
  - ✅ `pytest-run-*.log` files
  - ✅ `.venv/` virtual environments
  - ✅ `*.db` database files
  - ✅ `project_dirs.txt` artifacts

- [ ] **Verify cleanup success:**
  ```powershell
  cd d:\AXON
  git status
  # Should show clean working tree or only legitimate changes
  ```

---

### **Step 2: Prepare AXON-UI Environment**

- [ ] **Verify current AXON-UI state:**
  ```powershell
  cd d:\AXON-UI
  git status
  npm test
  npm run lint
  ```
  All should pass before integration!

- [ ] **Create integration branch:**
  ```powershell
  git checkout -b feature/axon-integration
  ```

- [ ] **Create directory structure:**
  ```powershell
  mkdir src\providers -Force
  mkdir src\api -Force
  ```

- [ ] **Install new dependencies:**
  ```powershell
  npm install axios zod winston
  npm install --save-dev @types/node
  ```

---

## 🚀 Phase 1: AI Providers Integration

### **Step 3: Transfer Base Provider**

- [ ] **Locate source file:**
  ```
  FROM: d:\AXON\src\providers\base.py
  ```

- [ ] **Create TypeScript version:**
  ```
  TO: d:\AXON-UI\src\providers\base_provider.ts
  ```

- [ ] **Key elements to adapt:**
  - [ ] Abstract class structure
  - [ ] Retry logic with exponential backoff
  - [ ] Error handling types
  - [ ] Configuration interfaces

- [ ] **Test base provider:**
  ```powershell
  npm run test:unit -- base_provider
  ```

---

### **Step 4: Transfer OpenAI Provider**

- [ ] **Locate source:**
  ```
  FROM: d:\AXON\src\providers\openai_provider.py
  TO:   d:\AXON-UI\src\providers\openai_provider.ts
  ```

- [ ] **Adaptation checklist:**
  - [ ] Replace `httpx` with `axios`
  - [ ] Environment variable handling
  - [ ] Chat completion implementation
  - [ ] Error response parsing

- [ ] **Create environment template:**
  ```bash
  # Add to .env.example
  OPENAI_API_KEY=sk-...
  OPENAI_BASE_URL=https://api.openai.com/v1
  OPENAI_MODEL=gpt-4o-mini
  ```

- [ ] **Test OpenAI provider:**
  ```powershell
  npm run test:integration -- openai
  ```

---

### **Step 5: Transfer Ollama Provider**

- [ ] **Locate source:**
  ```
  FROM: d:\AXON\src\providers\ollama_provider.py
  TO:   d:\AXON-UI\src\providers\ollama_provider.ts
  ```

- [ ] **Key adaptations:**
  - [ ] Local endpoint configuration
  - [ ] Model availability check
  - [ ] Streaming response handling (if needed)

- [ ] **Test Ollama provider:**
  ```powershell
  npm run test:integration -- ollama
  ```

---

### **Step 6: Transfer Gemini Provider**

- [ ] **Locate source:**
  ```
  FROM: d:\AXON\src\providers\gemini_provider.py
  TO:   d:\AXON-UI\src\providers\gemini_provider.ts
  ```

- [ ] **Adaptation notes:**
  - [ ] Google Generative AI SDK integration
  - [ ] API key configuration
  - [ ] Response format handling

---

### **Step 7: Transfer Copilot Provider**

- [ ] **Locate source:**
  ```
  FROM: d:\AXON\src\providers\copilot_provider.py
  TO:   d:\AXON-UI\src\providers\copilot_provider.ts
  ```

- [ ] **OpenAI-compatible endpoint adaptation**

---

### **Step 8: Provider Factory**

- [ ] **Locate source:**
  ```
  FROM: d:\AXON\src\providers\factory.py
  TO:   d:\AXON-UI\src\providers\provider_factory.ts
  ```

- [ ] **Implementation:**
  - [ ] Provider registry
  - [ ] Dynamic provider instantiation
  - [ ] Configuration validation

---

## 🔌 Phase 2: API Endpoints Integration

### **Step 9: Models API**

- [ ] **Transfer and adapt:**
  ```
  FROM: d:\AXON\src\api\models_api.py
  TO:   d:\AXON-UI\src\api\models_api.ts
  ```

- [ ] **Implement endpoint:**
  - [ ] `GET /v1/models` - List available models
  - [ ] Filter by provider availability
  - [ ] OpenAI-compatible response format

---

### **Step 10: Chat API**

- [ ] **Transfer and adapt:**
  ```
  FROM: d:\AXON\src\api\chat_api.py
  TO:   d:\AXON-UI\src\api\chat_api.ts
  ```

- [ ] **Implement endpoint:**
  - [ ] `POST /v1/chat/completions`
  - [ ] SSE streaming support (if needed)
  - [ ] Error handling and fallback

---

### **Step 11: Integration with Existing Backend**

- [ ] **Update backend adapter:**
  ```
  File: d:\AXON-UI\src\services\axon-backend-adapter.ts
  ```

- [ ] **Add new endpoints to adapter**
- [ ] **Test API integration:**
  ```powershell
  npm run test:api
  ```

---

## 🎨 Phase 3: UI Components (Optional)

### **Step 12: Review UI Components**

- [ ] **Examine AXON UI components:**
  ```
  Location: d:\AXON\ui\next\components\
  ```

- [ ] **Identify candidates for transfer:**
  - [ ] DebatePanel.tsx (if debate feature needed)
  - [ ] ChatPanel.tsx (if enhanced chat needed)
  - [ ] ConnectionBadge.tsx (provider status)

- [ ] **Decision:** Transfer only if adds value to AXON-UI

---

### **Step 13: Adapt UI Components (if selected)**

- [ ] **Convert Next.js patterns:**
  - [ ] Replace Next.js router with React Router
  - [ ] Replace Next.js Image with standard img
  - [ ] Adapt server-side patterns

- [ ] **Match AXON-UI styling:**
  - [ ] Use existing Tailwind theme
  - [ ] Integrate with Radix UI components
  - [ ] Add to Storybook

---

## ✅ Phase 4: Testing & Validation

### **Step 14: Unit Tests**

- [ ] **Run all unit tests:**
  ```powershell
  npm run test:unit
  ```

- [ ] **Expected results:**
  - [ ] All existing tests pass
  - [ ] New provider tests pass
  - [ ] Code coverage maintained

---

### **Step 15: Integration Tests**

- [ ] **Run integration tests:**
  ```powershell
  npm run test:integration
  ```

- [ ] **Test scenarios:**
  - [ ] Provider initialization
  - [ ] Chat completions
  - [ ] Error handling
  - [ ] Fallback mechanisms

---

### **Step 16: E2E Tests**

- [ ] **Run end-to-end tests:**
  ```powershell
  npm run test:e2e
  ```

- [ ] **Verify:**
  - [ ] UI integration works
  - [ ] API endpoints respond correctly
  - [ ] User workflows complete successfully

---

### **Step 17: Linting & Type Checking**

- [ ] **Run linter:**
  ```powershell
  npm run lint
  ```
  Should have 0 errors (warnings acceptable if minimal)

- [ ] **Type check:**
  ```powershell
  npx tsc --noEmit
  ```
  Should pass without errors

---

### **Step 18: Build Verification**

- [ ] **Build production bundle:**
  ```powershell
  npm run build
  ```

- [ ] **Verify build output:**
  - [ ] No build errors
  - [ ] Bundle size reasonable (check dist/)
  - [ ] Source maps generated

---

## 📝 Phase 5: Documentation & Finalization

### **Step 19: Update Documentation**

- [ ] **Update README.md:**
  - [ ] Document new AI providers
  - [ ] Add configuration examples
  - [ ] Update feature list

- [ ] **Create/update:**
  - [ ] API documentation
  - [ ] Provider usage examples
  - [ ] Troubleshooting guide

---

### **Step 20: Changelog**

- [ ] **Update CHANGELOG.md:**
  ```markdown
  ## [Unreleased]
  
  ### Added
  - 🚀 AI Providers: OpenAI, Ollama, Gemini, Copilot, JSONAgent
  - 🔌 OpenAI-compatible API endpoints
  - 🔄 Retry logic with exponential backoff
  - ⚡ Comprehensive error handling
  
  ### Changed
  - Enhanced backend adapter with AI provider support
  
  ### Technical
  - Added dependencies: axios, zod, winston
  ```

---

### **Step 21: Git Commit**

- [ ] **Review changes:**
  ```powershell
  git status
  git diff
  ```

- [ ] **Stage changes:**
  ```powershell
  git add .
  ```

- [ ] **Commit with descriptive message:**
  ```powershell
  git commit -m "feat: Integrate AI providers from AXON

  - Add OpenAI, Ollama, Gemini, Copilot providers
  - Implement OpenAI-compatible API endpoints
  - Add retry logic and error handling
  - Update documentation

  Ref: INTEGRATION_PLAN.md"
  ```

---

### **Step 22: Create Pull Request**

- [ ] **Push branch:**
  ```powershell
  git push origin feature/axon-integration
  ```

- [ ] **Create PR on GitHub:**
  - Title: `feat: Integrate AI providers from AXON`
  - Description: Reference `INTEGRATION_PLAN.md`
  - Link related issues

- [ ] **Request review**

---

## 🎯 Post-Integration Checklist

### **Step 23: Clean Up Main AXON Repository (Again)**

- [ ] **Verify AXON repo is clean:**
  ```powershell
  cd d:\AXON
  git status
  ```

- [ ] **If needed, run cleanup again:**
  ```powershell
  cd d:\AXON-UI\scripts
  .\cleanup-axon-repo.ps1 -AxonRepoPath "d:\AXON"
  ```

- [ ] **Commit AXON cleanup (if changes made):**
  ```powershell
  cd d:\AXON
  git add .
  git commit -m "chore: Clean development artifacts"
  git push
  ```

---

### **Step 24: Monitor Production**

- [ ] **After merge, monitor:**
  - [ ] Application startup
  - [ ] Provider initialization
  - [ ] API endpoint responses
  - [ ] Error logs

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **Build Errors:**
```powershell
# Clear cache and rebuild
rm -r node_modules, dist
npm install
npm run build
```

#### **Test Failures:**
```powershell
# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- <test-file-name>
```

#### **Provider Errors:**
```powershell
# Check environment variables
cat .env

# Verify provider availability
# (Add debugging to provider initialization)
```

---

## 📊 Success Criteria

### **Integration is successful when:**

✅ All phases completed  
✅ All tests passing  
✅ Build successful  
✅ No linting errors  
✅ Documentation updated  
✅ PR merged  
✅ AXON repository cleaned  
✅ Zero development debris in AXON-UI  

---

## 📞 Help & Support

**Questions?** 
- Review `INTEGRATION_PLAN.md` for detailed context
- Check GitHub Issues for similar problems
- Create new issue with `integration` label

---

**Last Updated:** 9 октября 2025 г.  
**Version:** 1.0  
**Status:** ✅ Ready for Use
