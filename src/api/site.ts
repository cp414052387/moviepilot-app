/**
 * Site (Download Site) API
 *
 * Handles download site management, configuration, and testing
 */

import { apiClient } from './client';
import type { Site, SiteStats, SiteTestResult, SiteRule } from '@/types/site';

/**
 * Get all sites
 * GET /site/
 */
export async function getSites(): Promise<Site[]> {
  const response = await apiClient.get<Site[]>('/site/');
  return response.data;
}

/**
 * Get site details
 * GET /site/{siteId}
 */
export async function getSiteDetails(siteId: string): Promise<Site> {
  const response = await apiClient.get<Site>(`/site/${siteId}`);
  return response.data;
}

/**
 * Create site
 * POST /site/
 */
export async function createSite(site: Omit<Site, 'id' | 'created_at' | 'updated_at'>): Promise<Site> {
  const response = await apiClient.post<Site>('/site/', site);
  return response.data;
}

/**
 * Update site
 * PUT /site/{siteId}
 */
export async function updateSite(siteId: string, site: Partial<Site>): Promise<Site> {
  const response = await apiClient.put<Site>(`/site/${siteId}`, site);
  return response.data;
}

/**
 * Delete site
 * DELETE /site/{siteId}
 */
export async function deleteSite(siteId: string): Promise<void> {
  await apiClient.delete(`/site/${siteId}`);
}

/**
 * Test site connection
 * POST /site/{siteId}/test
 */
export async function testSite(siteId: string): Promise<SiteTestResult> {
  const response = await apiClient.post<SiteTestResult>(`/site/${siteId}/test`);
  return response.data;
}

/**
 * Enable site
 * POST /site/{siteId}/enable
 */
export async function enableSite(siteId: string): Promise<void> {
  await apiClient.post(`/site/${siteId}/enable`);
}

/**
 * Disable site
 * POST /site/{siteId}/disable
 */
export async function disableSite(siteId: string): Promise<void> {
  await apiClient.post(`/site/${siteId}/disable`);
}

/**
 * Get site statistics
 * GET /site/stats
 */
export async function getSiteStats(): Promise<SiteStats> {
  const response = await apiClient.get<SiteStats>('/site/stats');
  return response.data;
}

/**
 * Get site rules
 * GET /site/{siteId}/rules
 */
export async function getSiteRules(siteId: string): Promise<SiteRule[]> {
  const response = await apiClient.get<SiteRule[]>(`/site/${siteId}/rules`);
  return response.data;
}

/**
 * Create site rule
 * POST /site/{siteId}/rules
 */
export async function createSiteRule(siteId: string, rule: Omit<SiteRule, 'id' | 'site_id'>): Promise<SiteRule> {
  const response = await apiClient.post<SiteRule>(`/site/${siteId}/rules`, rule);
  return response.data;
}

/**
 * Update site rule
 * PUT /site/{siteId}/rules/{ruleId}
 */
export async function updateSiteRule(siteId: string, ruleId: string, rule: Partial<SiteRule>): Promise<SiteRule> {
  const response = await apiClient.put<SiteRule>(`/site/${siteId}/rules/${ruleId}`, rule);
  return response.data;
}

/**
 * Delete site rule
 * DELETE /site/{siteId}/rules/{ruleId}
 */
export async function deleteSiteRule(siteId: string, ruleId: string): Promise<void> {
  await apiClient.delete(`/site/${siteId}/rules/${ruleId}`);
}
