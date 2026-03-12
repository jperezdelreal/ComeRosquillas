import type { SquadConfig } from '@bradygaster/squad';

/**
 * Squad Configuration for ComeRosquillas
 * 
 */
const config: SquadConfig = {
  version: '1.0.0',
  
  models: {
    defaultModel: 'claude-sonnet-4.5',
    defaultTier: 'standard',
    fallbackChains: {
      premium: ['claude-opus-4.6', 'claude-opus-4.6-fast', 'claude-opus-4.5', 'claude-sonnet-4.5'],
      standard: ['claude-sonnet-4.5', 'gpt-5.2-codex', 'claude-sonnet-4', 'gpt-5.2'],
      fast: ['claude-haiku-4.5', 'gpt-5.1-codex-mini', 'gpt-4.1', 'gpt-5-mini']
    },
    preferSameProvider: true,
    respectTierCeiling: true,
    nuclearFallback: {
      enabled: false,
      model: 'claude-haiku-4.5',
      maxRetriesBeforeNuclear: 3
    }
  },
  
  routing: {
    rules: [
      {
        workType: 'game-engine',
        agents: ['@barney'],
        confidence: 'high'
      },
      {
        workType: 'game-logic',
        agents: ['@barney'],
        confidence: 'high'
      },
      {
        workType: 'rendering',
        agents: ['@barney'],
        confidence: 'high'
      },
      {
        workType: 'audio',
        agents: ['@barney'],
        confidence: 'high'
      },
      {
        workType: 'hud',
        agents: ['@lenny'],
        confidence: 'high'
      },
      {
        workType: 'touch-controls',
        agents: ['@lenny'],
        confidence: 'high'
      },
      {
        workType: 'responsive-layout',
        agents: ['@lenny'],
        confidence: 'high'
      },
      {
        workType: 'documentation',
        agents: ['@lenny'],
        confidence: 'high'
      },
      {
        workType: 'code-review',
        agents: ['@moe'],
        confidence: 'high'
      },
      {
        workType: 'architecture',
        agents: ['@moe'],
        confidence: 'high'
      },
      {
        workType: 'game-design',
        agents: ['@moe'],
        confidence: 'high'
      },
      {
        workType: 'testing',
        agents: ['@nelson'],
        confidence: 'high'
      },
      {
        workType: 'bug-fix',
        agents: ['@barney', '@lenny'],
        confidence: 'medium'
      },
      {
        workType: 'feature-dev',
        agents: ['@barney', '@lenny'],
        confidence: 'medium'
      },
      {
        workType: 'performance',
        agents: ['@nelson'],
        confidence: 'high'
      }
    ],
    governance: {
      eagerByDefault: true,
      scribeAutoRuns: true,
      allowRecursiveSpawn: false
    }
  },
  
  casting: {
    allowlistUniverses: [
      'The Simpsons',
      'The Usual Suspects',
      'Breaking Bad',
      'The Wire',
      'Firefly'
    ],
    overflowStrategy: 'diegetic-expansion',
    universeCapacity: {
      'The Simpsons': 20
    }
  },
  
  platforms: {
    vscode: {
      disableModelSelection: false,
      scribeMode: 'sync'
    }
  }
};

export default config;
