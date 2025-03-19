import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity contract environment
const mockContract = {
  admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  cropTypes: new Map(),
  harvests: new Map(),
  nextCropId: 1,
  nextHarvestId: 1,
  
  // Mock contract functions
  addCropType: vi.fn((name, category) => {
    const cropId = mockContract.nextCropId;
    
    mockContract.cropTypes.set(cropId, {
      name,
      category
    });
    
    mockContract.nextCropId++;
    return { ok: cropId };
  }),
  
  recordHarvest: vi.fn((plotId, cropId, quantity, user = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG') => {
    // Check if crop exists
    if (!mockContract.cropTypes.has(cropId)) {
      return { err: 2 };
    }
    
    const harvestId = mockContract.nextHarvestId;
    
    mockContract.harvests.set(harvestId, {
      plotId,
      cropId,
      gardener: user,
      quantity,
      harvestDate: 100 // Mock block height
    });
    
    mockContract.nextHarvestId++;
    return { ok: harvestId };
  }),
  
  getCropType: vi.fn((cropId) => {
    return mockContract.cropTypes.get(cropId) || null;
  }),
  
  getHarvest: vi.fn((harvestId) => {
    return mockContract.harvests.get(harvestId) || null;
  }),
  
  getNextCropId: vi.fn(() => {
    return mockContract.nextCropId;
  }),
  
  getNextHarvestId: vi.fn(() => {
    return mockContract.nextHarvestId;
  })
};

describe('Harvest Tracking Contract', () => {
  beforeEach(() => {
    // Reset the mock state
    mockContract.cropTypes.clear();
    mockContract.harvests.clear();
    mockContract.nextCropId = 1;
    mockContract.nextHarvestId = 1;
    
    // Reset mock function calls
    mockContract.addCropType.mockClear();
    mockContract.recordHarvest.mockClear();
    mockContract.getCropType.mockClear();
    mockContract.getHarvest.mockClear();
    mockContract.getNextCropId.mockClear();
    mockContract.getNextHarvestId.mockClear();
  });
  
  describe('addCropType', () => {
    it('should add a new crop type successfully', () => {
      const result = mockContract.addCropType('Tomato', 'Vegetable');
      
      expect(result).toEqual({ ok: 1 });
      expect(mockContract.cropTypes.has(1)).toBe(true);
      expect(mockContract.cropTypes.get(1)).toEqual({
        name: 'Tomato',
        category: 'Vegetable'
      });
      expect(mockContract.nextCropId).toBe(2);
    });
    
    it('should increment crop ID for each new crop', () => {
      mockContract.addCropType('Tomato', 'Vegetable');
      mockContract.addCropType('Basil', 'Herb');
      mockContract.addCropType('Strawberry', 'Fruit');
      
      expect(mockContract.cropTypes.size).toBe(3);
      expect(mockContract.cropTypes.has(1)).toBe(true);
      expect(mockContract.cropTypes.has(2)).toBe(true);
      expect(mockContract.cropTypes.has(3)).toBe(true);
      expect(mockContract.nextCropId).toBe(4);
    });
  });
  
  describe('recordHarvest', () => {
    it('should record a harvest successfully', () => {
      mockContract.addCropType('Tomato', 'Vegetable');
      const user = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
      
      const result = mockContract.recordHarvest(1, 1, 5, user);
      
      expect(result).toEqual({ ok: 1 });
      expect(mockContract.harvests.has(1)).toBe(true);
      expect(mockContract.harvests.get(1)).toEqual({
        plotId: 1,
        cropId: 1,
        gardener: user,
        quantity: 5,
        harvestDate: 100
      });
      expect(mockContract.nextHarvestId).toBe(2);
    });
    
    it('should fail if crop does not exist', () => {
      const user = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
      const result = mockContract.recordHarvest(1, 999, 5, user);
      
      expect(result).toEqual({ err: 2 });
      expect(mockContract.harvests.size).toBe(0);
      expect(mockContract.nextHarvestId).toBe(1);
    });
    
    it('should record multiple harvests correctly', () => {
      mockContract.addCropType('Tomato', 'Vegetable');
      mockContract.addCropType('Basil', 'Herb');
      const user = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
      
      mockContract.recordHarvest(1, 1, 5, user);
      mockContract.recordHarvest(1, 2, 3, user);
      mockContract.recordHarvest(2, 1, 7, user);
      
      expect(mockContract.harvests.size).toBe(3);
      expect(mockContract.harvests.get(1).cropId).toBe(1);
      expect(mockContract.harvests.get(1).quantity).toBe(5);
      expect(mockContract.harvests.get(2).cropId).toBe(2);
      expect(mockContract.harvests.get(2).quantity).toBe(3);
      expect(mockContract.harvests.get(3).cropId).toBe(1);
      expect(mockContract.harvests.get(3).quantity).toBe(7);
      expect(mockContract.nextHarvestId).toBe(4);
    });
  });
  
  describe('read-only functions', () => {
    it('should return crop type information correctly', () => {
      mockContract.addCropType('Tomato', 'Vegetable');
      
      const cropType = mockContract.getCropType(1);
      
      expect(cropType).toEqual({
        name: 'Tomato',
        category: 'Vegetable'
      });
    });
    
    it('should return harvest information correctly', () => {
      mockContract.addCropType('Tomato', 'Vegetable');
      const user = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
      mockContract.recordHarvest(1, 1, 5, user);
      
      const harvest = mockContract.getHarvest(1);
      
      expect(harvest).toEqual({
        plotId: 1,
        cropId: 1,
        gardener: user,
        quantity: 5,
        harvestDate: 100
      });
    });
    
    it('should return null for non-existent crop type', () => {
      const cropType = mockContract.getCropType(999);
      
      expect(cropType).toBe(null);
    });
    
    it('should return null for non-existent harvest', () => {
      const harvest = mockContract.getHarvest(999);
      
      expect(harvest).toBe(null);
    });
  });
});
