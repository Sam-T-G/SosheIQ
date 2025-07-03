interface EnvironmentConfig {
  GOOGLE_AI_API_KEY: string;
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_APP_NAME?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class EnvironmentValidator {
  private requiredVars: (keyof EnvironmentConfig)[] = [
    'GOOGLE_AI_API_KEY',
    'NODE_ENV'
  ];

  private optionalVars: (keyof EnvironmentConfig)[] = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_APP_NAME'
  ];

  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required environment variables
    for (const varName of this.requiredVars) {
      const value = process.env[varName];
      
      if (!value) {
        errors.push(`Missing required environment variable: ${varName}`);
        continue;
      }

      // Validate specific variables
      switch (varName) {
        case 'GOOGLE_AI_API_KEY':
          if (!this.isValidApiKey(value)) {
            errors.push('Invalid GOOGLE_AI_API_KEY format');
          }
          break;
        case 'NODE_ENV':
          if (!['development', 'production', 'test'].includes(value)) {
            errors.push('NODE_ENV must be one of: development, production, test');
          }
          break;
      }
    }

    // Check optional environment variables
    for (const varName of this.optionalVars) {
      const value = process.env[varName];
      
      if (value) {
        // Validate optional variables
        switch (varName) {
          case 'NEXT_PUBLIC_APP_URL':
            if (!this.isValidUrl(value)) {
              warnings.push('NEXT_PUBLIC_APP_URL appears to be invalid');
            }
            break;
        }
      } else {
        warnings.push(`Optional environment variable not set: ${varName}`);
      }
    }

    // Security checks
    this.performSecurityChecks(errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private isValidApiKey(apiKey: string): boolean {
    // Basic validation for Google AI API key format
    return apiKey.length > 0 && apiKey.startsWith('AIza');
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private performSecurityChecks(errors: string[], warnings: string[]): void {
    const env = process.env;

    // Check for common security issues
    if (env.NODE_ENV === 'production') {
      // Production-specific checks
      if (env.GOOGLE_AI_API_KEY && env.GOOGLE_AI_API_KEY.length < 10) {
        errors.push('API key appears to be too short for production');
      }

      if (!env.NEXT_PUBLIC_APP_URL) {
        warnings.push('NEXT_PUBLIC_APP_URL not set in production');
      }
    }

    // Check for development-only variables in production
    if (env.NODE_ENV === 'production') {
      const devOnlyVars = ['DEBUG', 'NODE_ENV_DEBUG'];
      for (const varName of devOnlyVars) {
        if (env[varName]) {
          warnings.push(`Development variable ${varName} should not be set in production`);
        }
      }
    }

    // Check for exposed sensitive variables
    const sensitiveVars = ['GOOGLE_AI_API_KEY', 'DATABASE_URL', 'JWT_SECRET'];
    for (const varName of sensitiveVars) {
      if (env[varName] && varName.startsWith('NEXT_PUBLIC_')) {
        errors.push(`Sensitive variable ${varName} should not be exposed to client`);
      }
    }
  }

  getConfig(): EnvironmentConfig {
    const validation = this.validate();
    
    if (!validation.isValid) {
      throw new Error(`Environment validation failed:\n${validation.errors.join('\n')}`);
    }

    return {
      GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY!,
      NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME
    };
  }

  // Utility method to check if we're in a specific environment
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  // Get safe config for client-side (only public variables)
  getClientConfig(): Partial<EnvironmentConfig> {
    return {
      NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME
    };
  }
}

// Export singleton instance
export const envValidator = new EnvironmentValidator();

// Export utility functions
export function validateEnvironment(): ValidationResult {
  return envValidator.validate();
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return envValidator.getConfig();
}

export function getClientConfig(): Partial<EnvironmentConfig> {
  return envValidator.getClientConfig();
}

// Export environment check utilities
export const isDevelopment = () => envValidator.isDevelopment();
export const isProduction = () => envValidator.isProduction();
export const isTest = () => envValidator.isTest(); 