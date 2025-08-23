import { useState, useEffect, useCallback } from 'react';
import { careLevelApiService, CareLevelDto, CreateCareLevelDto } from '@/services/care-level-api';
import { CareLevelUtils } from '@/types/care-level';
import { useToast } from '@/hooks/use-toast';

export interface CareLevelHookResult {
  careLevels: CareLevelDto[];
  loading: boolean;
  error: string | null;
  createCareLevel: (name: string, color: string) => Promise<CareLevelDto | null>;
  refreshCareLevels: () => Promise<void>;
  isValidating: boolean;
}

/**
 * Hook for managing care levels with API integration
 */
export function useCareLevels(): CareLevelHookResult {
  const [careLevels, setCareLevels] = useState<CareLevelDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load care levels from API
  const loadCareLevels = useCallback(async () => {
    try {
      setError(null);
      const levels = await careLevelApiService.getAllCareLevels();
      setCareLevels(levels);
    } catch (err) {
      console.error('Failed to load care levels:', err);
      setError('Failed to load care levels');
      
      // Initialize with defaults if no care levels exist
      try {
        console.log('Attempting to initialize default care levels...');
        await careLevelApiService.initializeDefaultCareLevels();
        const defaultLevels = await careLevelApiService.getAllCareLevels();
        setCareLevels(defaultLevels);
        setError(null);
        toast({
          title: "Care Levels Initialized",
          description: "Default care levels have been created for your center.",
        });
      } catch (initError) {
        console.error('Failed to initialize default care levels:', initError);
        setError('Failed to initialize care levels');
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Refresh care levels (for external updates)
  const refreshCareLevels = useCallback(async () => {
    setIsValidating(true);
    await loadCareLevels();
    setIsValidating(false);
  }, [loadCareLevels]);

  // Create new care level
  const createCareLevel = useCallback(async (name: string, color: string): Promise<CareLevelDto | null> => {
    try {
      setIsValidating(true);
      
      // Validate input
      const formattedName = CareLevelUtils.formatCareLevelName(name);
      if (!CareLevelUtils.isValidHexColor(color)) {
        toast({
          title: "Invalid Color",
          description: "Please provide a valid hex color (e.g., #FF5733)",
          variant: "destructive"
        });
        return null;
      }

      // Check if care level already exists
      const exists = await careLevelApiService.checkCareLevelExists(formattedName);
      if (exists) {
        toast({
          title: "Care Level Exists",
          description: `Care level '${formattedName}' already exists in your center.`,
          variant: "destructive"
        });
        return null;
      }

      // Create the care level
      const newCareLevel = await careLevelApiService.createCareLevel({
        careLevel: formattedName,
        careLevelColor: color
      });

      // Update local state
      setCareLevels(prev => [...prev, newCareLevel]);
      
      toast({
        title: "Care Level Created",
        description: `Successfully created '${newCareLevel.careLevel}' care level.`,
      });

      return newCareLevel;
    } catch (err: any) {
      console.error('Failed to create care level:', err);
      toast({
        title: "Creation Failed",
        description: err.message || "Failed to create care level. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  // Load care levels on mount
  useEffect(() => {
    loadCareLevels();
  }, [loadCareLevels]);

  return {
    careLevels,
    loading,
    error,
    createCareLevel,
    refreshCareLevels,
    isValidating
  };
}

/**
 * Legacy format converter for backwards compatibility
 */
export function useCareLevelsLegacyFormat() {
  const { careLevels, loading, error, createCareLevel, refreshCareLevels, isValidating } = useCareLevels();

  // Convert to legacy format for existing components
  const legacyCareLevels = careLevels.map(level => ({
    name: level.careLevel,
    color: level.careLevelColor
  }));

  const createLegacyCareLevel = async (name: string, color: string) => {
    const result = await createCareLevel(name, color);
    return result ? { name: result.careLevel, color: result.careLevelColor } : null;
  };

  return {
    careLevels: legacyCareLevels,
    loading,
    error,
    createCareLevel: createLegacyCareLevel,
    refreshCareLevels,
    isValidating
  };
}

