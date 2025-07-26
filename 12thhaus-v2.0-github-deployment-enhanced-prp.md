# 12THHAUS v2.0 GitHub Deployment - Enhanced PRP Template
**Created:** 2025-07-26 | **Project:** 12thhaus-v2 | **Agent Type:** devops-infrastructure-specialist

---

## **📋 EXECUTIVE SUMMARY**
**Objective:** [Brief description of what this PRP accomplishes]  
**Expected Duration:** [Time estimate]  
**Prerequisites:** [Required conditions, tools, or setup]  
**Success Criteria:** [Specific measurable outcomes]

---

## **🔍 PRE-EXECUTION STATE ASSESSMENT**

### **Expected Starting State**
```
[Describe what the environment/system should look like before starting]
- File structure: [expected files/directories]
- Git status: [expected repository state]
- Services: [expected running services]
- Dependencies: [required tools/packages]
```

### **State Discovery Protocol**
```bash
# Execute these commands to assess current state
echo "=== ENVIRONMENT DISCOVERY ==="
pwd
ls -la
git status 2>/dev/null || echo "No git repository"
git remote -v 2>/dev/null || echo "No git remotes"
[ADD SPECIFIC DISCOVERY COMMANDS FOR YOUR TASK]

echo "=== TOOL AVAILABILITY ==="
which [tool1] || echo "[tool1] not available"
which [tool2] || echo "[tool2] not available"

echo "=== SYSTEM STATE ==="
[ADD SYSTEM-SPECIFIC CHECKS]
```

### **State Validation Checklist**
- [ ] Current directory confirmed: `[expected_directory]`
- [ ] Required files present: `[list_key_files]`
- [ ] Git repository status: `[expected_git_state]`
- [ ] Required tools available: `[list_required_tools]`
- [ ] Environment variables set: `[list_env_vars]`
- [ ] Services running: `[list_required_services]`

### **Deviation Handling**
| **If Found** | **Expected** | **Recovery Action** |
|--------------|--------------|-------------------|
| [unexpected_state_1] | [expected_state_1] | [specific_recovery_steps] |
| [unexpected_state_2] | [expected_state_2] | [specific_recovery_steps] |
| No git repository | Existing git repo | `git init` |
| Wrong git remote | Correct remote | `git remote remove origin && git remote add origin [correct_url]` |

---

## **🛠 EXECUTION STRATEGY**

### **Tool Inventory & Priority**
1. **Primary Tools (Use These First):**
   - `[mcp_tool_1]` - For [specific_purpose]
   - `[mcp_tool_2]` - For [specific_purpose]
   - `[system_tool]` - For [specific_purpose]

2. **Fallback Tools (If Primary Fails):**
   - `[alternative_tool_1]` - Alternative for [purpose]
   - `[alternative_tool_2]` - Manual method for [purpose]

3. **Tool Selection Logic:**
   ```
   IF [condition] THEN use [tool_1]
   ELSE IF [condition] THEN use [tool_2]  
   ELSE [fallback_action]
   ```

### **Execution Phases**

#### **Phase 1: [PHASE_NAME]**
```bash
# Commands to execute
[specific_commands]
```
**Success Indicators:** [how to verify this phase succeeded]  
**Failure Recovery:** [what to do if this phase fails]

#### **Phase 2: [PHASE_NAME]**
```bash
# Commands to execute
[specific_commands]
```
**Success Indicators:** [how to verify this phase succeeded]  
**Failure Recovery:** [what to do if this phase fails]

#### **Phase 3: [PHASE_NAME]**
```bash
# Commands to execute
[specific_commands]
```
**Success Indicators:** [how to verify this phase succeeded]  
**Failure Recovery:** [what to do if this phase fails]

---

## **⚠️ CONTINGENCY MANAGEMENT**

### **Common Failure Scenarios**
| **Scenario** | **Detection** | **Recovery Action** | **Prevention** |
|--------------|---------------|-------------------|----------------|
| [failure_1] | [how_to_detect] | [recovery_steps] | [prevention_method] |
| [failure_2] | [how_to_detect] | [recovery_steps] | [prevention_method] |
| Tool not available | `which [tool]` returns error | Use fallback tool or install | Check tool availability in pre-execution |
| Permission denied | Command fails with permission error | Use `sudo` or fix permissions | Verify user permissions beforehand |
| Network issues | Timeout or connection errors | Retry with different endpoint | Test connectivity before execution |

### **Rollback Procedures**
```bash
# If everything goes wrong, these commands restore the original state
[rollback_commands]
```

### **Emergency Contacts/Resources**
- **Documentation:** [relevant_docs_url]
- **Support:** [where_to_get_help]
- **Escalation:** [who_to_contact_if_stuck]

---

## **✅ VALIDATION & SUCCESS CRITERIA**

### **Execution Validation Checklist**
- [ ] All phases completed successfully
- [ ] No error messages in output
- [ ] Expected files/changes present
- [ ] Services responding correctly
- [ ] Security checks passed
- [ ] Performance within acceptable limits

### **Success Testing Protocol**
```bash
# Commands to verify successful completion
echo "=== SUCCESS VALIDATION ==="
[validation_commands]

# Expected outputs:
# [expected_output_1]
# [expected_output_2]
```

### **Final State Documentation**
After successful execution, the system should have:
- **Files:** [list_of_files_created_or_modified]
- **Services:** [services_that_should_be_running]
- **Configuration:** [configuration_changes_made]
- **Access:** [new_endpoints_or_interfaces_available]

---

## **📊 COMPLETION REPORT TEMPLATE**

```markdown
## 12THHAUS v2.0 GitHub Deployment - Execution Report

**Status:** ✅ SUCCESS / ❌ FAILED / ⚠️ PARTIAL  
**Duration:** [actual_time_taken]  
**Agent:** [agent_type_used]  

### Execution Summary
- **Phases Completed:** [X/Y]
- **Deviations from Expected:** [list_any_deviations]
- **Tools Used:** [actual_tools_used]
- **Contingencies Triggered:** [any_recovery_actions_taken]

### State Changes
**Before:** [initial_state_summary]  
**After:** [final_state_summary]  

### Issues Encountered
[describe_any_problems_and_resolutions]

### Lessons Learned
[improvements_for_future_executions]

### Next Phase Readiness
- [ ] Current phase objectives met
- [ ] Next phase prerequisites satisfied  
- [ ] Handoff documentation complete
```

---

## **🔄 CONTINUOUS IMPROVEMENT**

### **Template Enhancement Log**
| **Date** | **Change** | **Reason** | **Impact** |
|----------|------------|------------|------------|
| [date] | [change_description] | [why_needed] | [benefit_gained] |

### **Agent Performance Tracking**
- **Success Rate:** [track_over_time]
- **Common Failure Points:** [identify_patterns]
- **Tool Effectiveness:** [which_tools_work_best]
- **Execution Time:** [track_performance_improvements]

---

## **📝 CUSTOMIZATION NOTES**

**To use this template:**
1. Replace all `[placeholder_text]` with specific values
2. Add task-specific commands and validation steps
3. Update tool lists based on available MCP tools
4. Customize contingency scenarios for your specific task
5. Test the PRP with a non-critical execution first

**Template Version:** 1.0  
**Last Updated:** 2025-07-26  
**Compatible With:** Claude Code, MCP Tools, Multi-Agent Systems