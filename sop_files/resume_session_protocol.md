# Resume Session Protocol
*Never lose progress - Pick up exactly where you left off*

## 🎯 THE RESUME COMMAND

### When You Need to Resume:
```bash
cd ~/Desktop/SaaS_Projects
claude-code --files "_Framework/Master_Project_SOP.md,_Framework/Implementation_Guide.md,Current_Project/[PROJECT_NAME]_PRD.md,Current_Project/modules/*/[MODULE_NAME]_claude_memory.md"
```

### The Resume Prompt:
```markdown
# SESSION RESUME REQUEST

## Context Recovery
I'm resuming work on a project that was in progress. Please analyze the current state and continue where we left off.

## Files to Read (in this order):
1. **Master_Project_SOP.md** - The development framework
2. **Implementation_Guide.md** - The process guide  
3. **[PROJECT_NAME]_PRD.md** - The project requirements
4. **All *_claude_memory.md files** - Current progress status

## Your Resume Tasks:
1. **Analyze Current State:**
   - Read all memory files to understand what's been completed
   - Identify which modules are in progress vs completed
   - Check for any blockers or issues noted

2. **Assess Project Phase:**
   - Determine if we're in Foundation/Business/Experience phase
   - Identify what needs to happen next
   - Check if any integration testing is pending

3. **Resume Action Plan:**
   - Tell me exactly where we left off
   - Provide next steps in priority order
   - Identify any issues that need attention
   - Suggest which agent should be activated next

4. **Validate Continuity:**
   - Ensure no work conflicts with previous decisions
   - Maintain consistency with established patterns
   - Preserve all architectural decisions made

## Expected Output:
- **Current Status Summary:** What's done, what's in progress, what's pending
- **Next Action:** Specific next step with exact instructions
- **Agent Activation:** Which agent to activate and with what context

Please analyze the current state and tell me how to proceed.
```

---

## 🔄 AUTOMATIC RECOVERY PROCESS

### What Claude Will Do:
1. **Read Your Memory Files:** Understand exactly what each agent accomplished
2. **Assess Project State:** Know which phase you're in and what's complete
3. **Identify Next Steps:** Tell you exactly what to do next
4. **Maintain Continuity:** Ensure no conflicts with previous work

### What You'll Get Back:
```markdown
# SESSION RESUME ANALYSIS

## Current Project State
**Project:** [Name and tier]
**Phase:** [Foundation/Business/Experience - X% complete]
**Last Activity:** [What was being worked on when session ended]

## Completed Modules ✅
- [Module 1]: [Status and integration state]
- [Module 2]: [Status and integration state]

## In Progress Modules 🔄
- [Module X]: [Current status, next steps, any blockers]

## Pending Modules ⏳
- [Module Y]: [Waiting for dependencies]
- [Module Z]: [Scheduled for next phase]

## Immediate Next Action
**Priority 1:** [Specific task - complete [Module X] or start [Module Y]]
**Agent Needed:** [Which agent to activate]
**Context Required:** [Specific files and instructions for that agent]

## Integration Status
**Last Stable Point:** [Which modules are integrated and tested]
**Pending Integration:** [What needs to be connected]
**Testing Status:** [What's been tested, what needs testing]

## Issues/Blockers
**Critical:** [Anything that must be resolved before proceeding]
**Notes:** [Important context from previous session]

## Resume Instructions
[Exact command to continue work]
```

---

## 💾 MEMORY FILE MAINTENANCE

### Each Agent Should Update Their Memory File With:

```markdown
# [MODULE_NAME]_CLAUDE_MEMORY.md

## Last Updated: [Date/Time]

## Session Status
**Current Phase:** [What we're working on]
**Session Progress:** [What was accomplished this session]
**Next Session Priority:** [What to work on when we resume]

## Completed Work ✅
- [Feature/Task]: [Completion details and test results]

## In Progress Work 🔄  
- [Feature/Task]: [Current status, what's been done, what's left]

## Blockers/Issues ⚠️
- [Issue]: [Description, impact, suggested resolution]

## Integration Points
**Successfully Integrated:** [What's working with other modules]
**Pending Integration:** [What needs to be connected]
**Integration Notes:** [Important details for next session]

## Architecture Decisions
- [Decision]: [Rationale and implications for future work]

## Testing Status
**Completed Tests:** [What's been tested and is working]
**Pending Tests:** [What needs to be tested]
**Test Results:** [Any important findings]

## Handoff Readiness
**Documentation Status:** [API docs, integration guides, etc.]
**Ready for Handoff:** [Yes/No - what's missing if no]

## Next Session Notes
**Resume Priority:** [Most important thing to work on]
**Context Needed:** [Files/info required to continue effectively]
**Coordination Required:** [Other agents/modules to sync with]
```

---

## 🚀 QUICK RESUME EXAMPLES

### Example 1: Mid-Module Development
```bash
# Files show AUTH_SECURITY module 70% complete
claude-code --files "framework_files,project_files,auth_security_claude_memory.md"

Prompt: "Resume AUTH_SECURITY module development. Memory file shows login system complete, need to finish password reset functionality."
```

### Example 2: Between Phases
```bash
# Foundation complete, starting Business phase
claude-code --files "all_framework_and_memory_files"

Prompt: "Foundation phase complete and stable. Resume by starting Business phase - activate USER_MANAGEMENT agent based on current architecture."
```

### Example 3: Integration Issues
```bash
# Integration testing revealed problems
claude-code --files "all_relevant_files"

Prompt: "Resume from integration testing phase. Memory files show AUTH and DATA modules not connecting properly. Fix integration issues before proceeding."
```

---

## 🛡️ RECOVERY BEST PRACTICES

### Before Ending Any Session:
1. **Update Memory Files:** Ensure all progress is documented
2. **Note Next Steps:** Write clear instructions for resuming
3. **Document Issues:** Record any problems or blockers
4. **Save All Work:** Commit code and save documentation

### When Resuming:
1. **Read Everything:** Don't assume you remember the state
2. **Validate Current Code:** Test that everything still works
3. **Check Dependencies:** Ensure nothing has changed
4. **Plan Next Steps:** Know exactly what you're doing before starting

### Memory File Rules:
- **Update frequently** (every major change)
- **Be specific** (exact status, not vague descriptions)
- **Include context** (why decisions were made)
- **Note blockers** (anything preventing progress)

---

## ⚡ EMERGENCY RECOVERY

### If Memory Files Are Missing/Incomplete:
```markdown
# EMERGENCY RECOVERY REQUEST

## Situation
Memory files are incomplete/missing but project code exists. Need to analyze current state from code and reconstruct where we left off.

## Recovery Process
1. Analyze all existing code files
2. Identify current project structure and completed modules
3. Determine integration status and testing state
4. Reconstruct logical next steps
5. Create updated memory files for continued development

## Files Available
[List all files you can find]

Please analyze the code and tell me the current state and how to proceed.
```

---

## 🎯 SUCCESS INDICATORS

### You Know Resume Worked When:
- ✅ Clear understanding of current state
- ✅ Specific next steps provided
- ✅ No conflicts with previous work
- ✅ Smooth continuation of development
- ✅ All context properly restored

### Warning Signs:
- ❌ Confusion about current state
- ❌ Conflicting instructions
- ❌ Starting over instead of continuing
- ❌ Missing critical context
- ❌ Breaking existing functionality

**The key is: Good memory files = Perfect resumption every time.**