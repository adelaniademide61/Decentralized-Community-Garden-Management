import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the Clarity contract environment
const mockContract = {
  admin: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  tasks: new Map(),
  workLogs: new Map(),
  memberContributions: new Map(),
  nextTaskId: 1,
  nextLogId: 1,
  
  // Mock contract functions
  addTask: vi.fn((name, description, points) => {
    const taskId = mockContract.nextTaskId
    
    mockContract.tasks.set(taskId, {
      name,
      description,
      points,
      active: true,
    })
    
    mockContract.nextTaskId++
    return { ok: taskId }
  }),
  
  logWork: vi.fn((taskId, hours, user = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG") => {
    // Check if task exists
    if (!mockContract.tasks.has(taskId)) {
      return { err: 2 }
    }
    
    const task = mockContract.tasks.get(taskId)
    
    // Check if task is active
    if (!task.active) {
      return { err: 3 }
    }
    
    // Check if hours is greater than 0
    if (hours <= 0) {
      return { err: 4 }
    }
    
    const logId = mockContract.nextLogId
    const points = hours * task.points
    
    // Create work log
    mockContract.workLogs.set(logId, {
      taskId,
      worker: user,
      hours,
      date: 100, // Mock block height
      verified: false,
    })
    
    // Update member contributions
    const memberStats = mockContract.memberContributions.get(user) || { totalHours: 0, totalPoints: 0 }
    mockContract.memberContributions.set(user, {
      totalHours: memberStats.totalHours + hours,
      totalPoints: memberStats.totalPoints + points,
    })
    
    mockContract.nextLogId++
    return { ok: logId }
  }),
  
  verifyWork: vi.fn((logId) => {
    // Check if work log exists
    if (!mockContract.workLogs.has(logId)) {
      return { err: 5 }
    }
    
    const workLog = mockContract.workLogs.get(logId)
    workLog.verified = true
    mockContract.workLogs.set(logId, workLog)
    
    return { ok: true }
  }),
  
  getTask: vi.fn((taskId) => {
    return mockContract.tasks.get(taskId) || null
  }),
  
  getWorkLog: vi.fn((logId) => {
    return mockContract.workLogs.get(logId) || null
  }),
  
  getMemberContributions: vi.fn((member) => {
    return mockContract.memberContributions.get(member) || null
  }),
}

describe("Work Contribution Contract", () => {
  beforeEach(() => {
    // Reset the mock state
    mockContract.tasks.clear()
    mockContract.workLogs.clear()
    mockContract.memberContributions.clear()
    mockContract.nextTaskId = 1
    mockContract.nextLogId = 1
    
    // Reset mock function calls
    mockContract.addTask.mockClear()
    mockContract.logWork.mockClear()
    mockContract.verifyWork.mockClear()
    mockContract.getTask.mockClear()
    mockContract.getWorkLog.mockClear()
    mockContract.getMemberContributions.mockClear()
  })
  
  describe("addTask", () => {
    it("should add a new task successfully", () => {
      const result = mockContract.addTask("Watering", "Water all plants in the garden", 5)
      
      expect(result).toEqual({ ok: 1 })
      expect(mockContract.tasks.has(1)).toBe(true)
      expect(mockContract.tasks.get(1)).toEqual({
        name: "Watering",
        description: "Water all plants in the garden",
        points: 5,
        active: true,
      })
      expect(mockContract.nextTaskId).toBe(2)
    })
    
    it("should increment task ID for each new task", () => {
      mockContract.addTask("Watering", "Water all plants", 5)
      mockContract.addTask("Weeding", "Remove weeds", 8)
      mockContract.addTask("Composting", "Turn compost pile", 3)
      
      expect(mockContract.tasks.size).toBe(3)
      expect(mockContract.tasks.has(1)).toBe(true)
      expect(mockContract.tasks.has(2)).toBe(true)
      expect(mockContract.tasks.has(3)).toBe(true)
      expect(mockContract.nextTaskId).toBe(4)
    })
  })
  
  describe("logWork", () => {
    it("should log work successfully", () => {
      mockContract.addTask("Watering", "Water all plants", 5)
      const user = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      
      const result = mockContract.logWork(1, 2, user)
      
      expect(result).toEqual({ ok: 1 })
      expect(mockContract.workLogs.has(1)).toBe(true)
      expect(mockContract.workLogs.get(1)).toEqual({
        taskId: 1,
        worker: user,
        hours: 2,
        date: 100,
        verified: false,
      })
      expect(mockContract.memberContributions.get(user)).toEqual({
        totalHours: 2,
        totalPoints: 10, // 2 hours * 5 points
      })
      expect(mockContract.nextLogId).toBe(2)
    })
    
    it("should fail if task does not exist", () => {
      const user = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      const result = mockContract.logWork(999, 2, user)
      
      expect(result).toEqual({ err: 2 })
      expect(mockContract.workLogs.size).toBe(0)
      expect(mockContract.memberContributions.size).toBe(0)
    })
    
    it("should fail if hours is not greater than 0", () => {
      mockContract.addTask("Watering", "Water all plants", 5)
      const user = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      
      const result = mockContract.logWork(1, 0, user)
      
      expect(result).toEqual({ err: 4 })
      expect(mockContract.workLogs.size).toBe(0)
      expect(mockContract.memberContributions.size).toBe(0)
    })
    
    it("should accumulate member contributions correctly", () => {
      mockContract.addTask("Watering", "Water all plants", 5)
      mockContract.addTask("Weeding", "Remove weeds", 8)
      const user = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      
      mockContract.logWork(1, 2, user) // 2 hours * 5 points = 10 points
      mockContract.logWork(2, 3, user) // 3 hours * 8 points = 24 points
      
      expect(mockContract.memberContributions.get(user)).toEqual({
        totalHours: 5, // 2 + 3
        totalPoints: 34, // 10 + 24
      })
    })
  })
  
  describe("verifyWork", () => {
    it("should verify work successfully", () => {
      mockContract.addTask("Watering", "Water all plants", 5)
      const user = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      mockContract.logWork(1, 2, user)
      
      const result = mockContract.verifyWork(1)
      
      expect(result).toEqual({ ok: true })
      expect(mockContract.workLogs.get(1).verified).toBe(true)
    })
    
    it("should fail if work log does not exist", () => {
      const result = mockContract.verifyWork(999)
      
      expect(result).toEqual({ err: 5 })
    })
  })
  
  describe("read-only functions", () => {
    it("should return task information correctly", () => {
      mockContract.addTask("Watering", "Water all plants", 5)
      
      const task = mockContract.getTask(1)
      
      expect(task).toEqual({
        name: "Watering",
        description: "Water all plants",
        points: 5,
        active: true,
      })
    })
    
    it("should return work log information correctly", () => {
      mockContract.addTask("Watering", "Water all plants", 5)
      const user = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      mockContract.logWork(1, 2, user)
      
      const workLog = mockContract.getWorkLog(1)
      
      expect(workLog).toEqual({
        taskId: 1,
        worker: user,
        hours: 2,
        date: 100,
        verified: false,
      })
    })
    
    it("should return member contributions correctly", () => {
      mockContract.addTask("Watering", "Water all plants", 5)
      const user = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      mockContract.logWork(1, 2, user)
      
      const contributions = mockContract.getMemberContributions(user)
      
      expect(contributions).toEqual({
        totalHours: 2,
        totalPoints: 10,
      })
    })
    
    it("should return null for non-existent task", () => {
      const task = mockContract.getTask(999)
      
      expect(task).toBe(null)
    })
    
    it("should return null for non-existent work log", () => {
      const workLog = mockContract.getWorkLog(999)
      
      expect(workLog).toBe(null)
    })
    
    it("should return null for member with no contributions", () => {
      const user = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      const contributions = mockContract.getMemberContributions(user)
      
      expect(contributions).toBe(null)
    })
  })
})

