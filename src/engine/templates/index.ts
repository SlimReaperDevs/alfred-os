import type { TrackTemplateType, TrackPhase } from '../../types';
import type { TemplateDefinition } from './genericTemplates';
import { hyroxPhases, hyroxResources } from './hyrox';
import { pmpPhases, pmpResources } from './pmp';
import { productOwnerPhases, productOwnerResources } from './productOwner';
import { TEMPLATE_LIBRARY } from './genericTemplates';

export type { TemplateDefinition };

export const ALL_TEMPLATES: Record<TrackTemplateType, TemplateDefinition> = {
  hyrox: {
    type: 'hyrox',
    name: 'Hyrox Training',
    description: 'Full Hyrox race preparation — 5 phases from foundation to race day.',
    popular: true,
    emoji: '⚔',
    phases: hyroxPhases,
    resources: hyroxResources,
  },
  pmp: {
    type: 'pmp',
    name: 'PMP Certification',
    description: 'Complete PMP exam preparation — curriculum, mock exams, and strategy.',
    popular: true,
    emoji: '📚',
    phases: pmpPhases,
    resources: pmpResources,
  },
  product_owner: {
    type: 'product_owner',
    name: 'Technical Product Owner',
    description: 'Frontend coding skills + Agile product ownership. Build and ship.',
    popular: true,
    emoji: '🎯',
    phases: productOwnerPhases,
    resources: productOwnerResources,
  },
  ...TEMPLATE_LIBRARY,
};

export function getTemplate(type: TrackTemplateType): TemplateDefinition {
  return ALL_TEMPLATES[type] ?? ALL_TEMPLATES['custom'];
}

export function getPhasesForTemplate(type: TrackTemplateType): TrackPhase[] {
  return getTemplate(type).phases;
}

export function getPopularTemplates(): TemplateDefinition[] {
  return Object.values(ALL_TEMPLATES).filter(t => t.popular);
}

export function getAllTemplates(): TemplateDefinition[] {
  return Object.values(ALL_TEMPLATES);
}
